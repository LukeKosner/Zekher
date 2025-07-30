/**
 * MCP (Model Context Protocol) business logic and utilities
 */

import { eq, sql } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;

// Import shared utilities and types
import { generateLexiconEmbeddings } from "@/lib/ingestion/embeddings";
import { searchSources } from "@/lib/search/searchUtils";
import { lexiconEmbeddings, lexiconSources } from "@/lib/database/schema";
import { generateSourceUrl } from "@/lib";
import type { ToolLexiconEntry } from "@/lib/shared";
import {
  mcpConstants,
  errorMessages,
  nextStepsInstructions
} from "./config";

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
