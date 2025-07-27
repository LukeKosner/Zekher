import { tool } from "ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;
import { eq, sql } from "drizzle-orm";
import { lexiconEmbeddings, lexiconSources } from "../database/schema";
import { generateLexiconEmbeddings } from "../ingestion/embeddings";
import { hybridSearch } from "../search/hybrid-search";
import type { ToolLexiconEntry } from "../shared";
import { generateSourceUrl } from "@/lib";
import {
  nextStepsInstructions,
  errorMessages,
  toolDescriptions
} from "./prompts";

export const searchLexicon = async (searchTerms: string[]) => {
  try {
    if (!searchTerms?.length) {
      return {
        error: errorMessages.lexicon.noTerms,
        entries: [],
        formattedText: errorMessages.lexicon.noTerms,
        nextSteps: nextStepsInstructions.noSearchTerms
      };
    }

    const limitedTerms = searchTerms.slice(0, 6);
    const searchResults = [];

    for (const term of limitedTerms) {
      const query = term.trim();
      if (!query) continue;

      try {
        const hybridResults = await hybridSearch({
          query,
          embedFn: generateLexiconEmbeddings,
          table: lexiconEmbeddings,
          embeddingColumn: sql`${lexiconEmbeddings.embedding}`,
          contentColumn: sql`${lexiconEmbeddings.content}`,
          joinTable: lexiconSources,
          joinCondition: eq(lexiconEmbeddings.resourceId, lexiconSources.id),
          additionalColumns: {
            title: sql`${lexiconSources.title}`,
            filename: sql`${lexiconSources.filename}`,
            pdfUrl: sql`${lexiconSources.pdfUrl}`,
            sourceId: sql`${lexiconSources.id}`
          },
          exactMatchColumns: [sql`${lexiconSources.title}`],
          exactMatchBoost: 5.0,
          semanticThreshold: 0.3,
          textSearchLimit: 10,
          semanticSearchLimit: 10
        });

        const formattedResults = hybridResults.slice(0, 6).map((result) => ({
          id: (result.metadata as any).sourceId, // Use the actual lexiconSources.id
          title: (result.metadata as any).title,
          filename: (result.metadata as any).filename,
          pdfUrl: (result.metadata as any).pdfUrl,
          content: result.content,
          relevanceScore: result.rrfScore
        }));

        searchResults.push(...formattedResults);
      } catch (termError) {
        logger.error("Error processing term", { error: termError });
        // If this looks like a system failure (database connection, etc.),
        // we should fail immediately rather than continuing
        if (
          termError instanceof Error &&
          (termError.message.includes("Database connection failed") ||
            termError.message.includes("Search service unavailable") ||
            termError.message.includes("connection") ||
            termError.message.includes("ECONNREFUSED") ||
            termError.message.includes("timeout") ||
            termError.message.includes("unavailable") ||
            termError.message.includes("service"))
        ) {
          throw termError; // Re-throw system errors to be caught by outer try-catch
        }
        // For other errors (validation, etc.), continue processing other terms
      }
    }

    if (!searchResults.length) {
      return {
        error: errorMessages.lexicon.noResults,
        entries: [],
        formattedText: errorMessages.lexicon.noResults,
        nextSteps: nextStepsInstructions.noResultsLexicon
      };
    }

    const deduplicatedResults = searchResults
      .filter(
        (result, index, arr) =>
          arr.findIndex((r) => r.id === result.id) === index
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);

    // Simplified formatted text - just basic entries
    const generateFormattedText = (uniqueResults: any[]): string => {
      let formattedResults = "";

      for (const result of uniqueResults) {
        const title = result.title || `Entry ${result.id}`;
        formattedResults += `**${title}**\n${result.content}\n\n`;
      }

      return formattedResults.trim();
    };

    const lexiconEntries: ToolLexiconEntry[] = deduplicatedResults.map(
      (result) => {
        // Use ID directly as the URL identifier
        const sourceUrl = generateSourceUrl({
          pageType: "lexicon",
          filename: result.id
        });

        const fullTitle = result.title || `Entry ${result.id}`;

        return {
          title: fullTitle,
          content: result.content,
          citation: `[${fullTitle}](${sourceUrl})`,
          filename: result.id, // This is now the correct lexiconSources.id
          pdfUrl: result.pdfUrl // Include PDF URL from database
        };
      }
    );

    const displayText = generateFormattedText(deduplicatedResults);

    return {
      entries: lexiconEntries,
      formattedText: displayText,
      nextSteps: nextStepsInstructions.lexicon
    };
  } catch (error) {
    logger.error("Lexicon tool error:", { error });
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        tags: {
          component: "lexicon-search",
          operation: "searchLexicon"
        }
      }
    );
    return {
      error: errorMessages.lexicon.systemError,
      entries: [],
      formattedText: errorMessages.lexicon.systemError,
      nextSteps: nextStepsInstructions.noResults
    };
  }
};

// Tool definition
export const lexiconTool = tool({
  description: toolDescriptions.lexiconTool.description,
  inputSchema: z.object({
    terms: z
      .array(z.string())
      .max(toolDescriptions.lexiconTool.maxTerms)
      .describe(toolDescriptions.lexiconTool.inputDescription)
  }),
  execute: async ({ terms }) => {
    const startTime = Date.now();
    logger.info("Lexicon tool called", {
      terms,
      component: "lexicon-tool"
    });

    try {
      const result = await searchLexicon(terms);
      const duration = Date.now() - startTime;

      logger.info("Lexicon tool completed", {
        terms,
        resultCount: result.entries?.length || 0,
        duration,
        component: "lexicon-tool"
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Lexicon tool error", {
        terms,
        error: error instanceof Error ? error : new Error(String(error)),
        duration,
        component: "lexicon-tool"
      });

      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: {
            component: "lexicon-tool",
            operation: "execute"
          },
          extra: { terms, duration }
        }
      );

      throw error;
    }
  }
});
