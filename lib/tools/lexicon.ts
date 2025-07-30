import { tool } from "ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;
import { eq, sql } from "drizzle-orm";
import { lexiconEmbeddings, lexiconSources } from "../database/schema";
import { generateLexiconEmbeddings } from "../ingestion/embeddings";
import { searchSources } from "../search/searchUtils";
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

    const deduplicatedResults = await searchSources(searchTerms, "lexicon");

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
          id: result.id,
          title: fullTitle,
          content: result.content,
          citation: `[${fullTitle}](${sourceUrl})`,
          filename: result.filename,
          pdfUrl: result.pdfUrl,
          txtUrl: result.txtUrl,
          redirectUrl: result.redirectUrl
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
  name: "lexiconTool",
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
