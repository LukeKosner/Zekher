/**
 * MCP (Model Context Protocol) business logic and utilities
 */

import { eq, sql } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;

// Import shared utilities and types
import { generateLexiconEmbeddings } from "@/lib/ingestion/embeddings";
import { hybridSearch } from "@/lib/search/hybrid-search";
import { lexiconEmbeddings, lexiconSources } from "@/lib/database/schema";
import { generateSourceUrl } from "@/lib";
import type { ToolLexiconEntry } from "@/lib/shared";
import {
  mcpConstants,
  errorMessages,
  nextStepsInstructions
} from "./constants";

/**
 * Search the Holocaust Lexicon for historical information
 * @param searchTerms Array of search terms to query
 * @returns Promise resolving to search results with entries and metadata
 */
export const searchLexicon = async (searchTerms: string[]) => {
  try {
    if (!searchTerms?.length) {
      return {
        error: errorMessages.noTerms,
        entries: [],
        formattedText: errorMessages.noTerms,
        nextSteps: nextStepsInstructions.noSearchTerms
      };
    }

    const limitedTerms = searchTerms.slice(0, mcpConstants.maxTerms);
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
            filename: sql`${lexiconSources.filename}`
          },
          exactMatchColumns: [sql`${lexiconSources.title}`],
          exactMatchBoost: 5.0,
          semanticThreshold: 0.3,
          textSearchLimit: 10,
          semanticSearchLimit: 10
        });

        const formattedResults = hybridResults.slice(0, 6).map((result) => ({
          id: result.id,
          title: (result.metadata as any).title,
          filename: (result.metadata as any).filename,
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
        error: errorMessages.noResults,
        entries: [],
        formattedText: errorMessages.noResults,
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
          filename: result.id // Use ID instead of processed filename
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
    return {
      error: errorMessages.systemError,
      entries: [],
      formattedText: errorMessages.systemError,
      nextSteps: nextStepsInstructions.noResults
    };
  }
};
