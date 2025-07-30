// lib/tools/testimony.ts
// Provides the testimonyTool for searching Holocaust survivor testimonies using unified hybrid search.

import { tool } from "ai";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { testimonyEmbeddings, testimonySources } from "../database/schema";
import { generateTestimonyEmbeddings } from "../ingestion/embeddings";
import { searchSources } from "../search/searchUtils";
import { db } from "../database";
import * as Sentry from "@sentry/nextjs";
import type { ToolTestimonyEntry } from "../shared";
import { generateSourceUrl } from "@/lib";
import {
  nextStepsInstructions,
  errorMessages,
  toolDescriptions
} from "./prompts";
const { logger } = Sentry;

/**
 * Performs a hybrid search (semantic + full-text) on Holocaust survivor testimonies.
 * Returns formatted results with RRF scoring and citation instructions.
 * @param terms Array of search terms (max 3)
 */
export const searchTestimonies = async (searchTerms: string[]) => {
  try {
    if (!searchTerms?.length) {
      return {
        error: errorMessages.testimony.noTerms,
        entries: [],
        formattedText: errorMessages.testimony.noTerms,
        nextSteps: nextStepsInstructions.noSearchTermsTestimony
      };
    }

    const deduplicatedResults = await searchSources(searchTerms, "testimony");

    if (!deduplicatedResults.length) {
      return {
        error: errorMessages.testimony.noResults,
        entries: [],
        formattedText: errorMessages.testimony.noResults,
        nextSteps: nextStepsInstructions.noResultsTestimony
      };
    }

    const testimonyEntries: ToolTestimonyEntry[] = deduplicatedResults.map(
      (result) => {
        // Use ID directly as the URL identifier
        const sourceUrl = generateSourceUrl({
          pageType: "testimony",
          filename: result.id
        });
        return {
          id: result.id,
          survivorName: result.survivorName,
          excerpt: result.content,
          timeReference: result.date || undefined,
          location: result.location || undefined,
          citation: `[${result.survivorName}](${sourceUrl})`,
          filename: result.id, // Use ID instead of processed filename
          url: result.url || undefined,
          language: (result as any).testimony_language || undefined
        };
      }
    );

    const displayText = deduplicatedResults
      .map((r) => `**${r.survivorName}**\n${r.content}`)
      .join("\n\n");

    return {
      entries: testimonyEntries,
      formattedText: displayText,
      nextSteps: nextStepsInstructions.testimony
    };
  } catch (error) {
    logger.error("Testimony tool error:", { error });
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        tags: {
          component: "testimony-search",
          operation: "searchTestimonies"
        }
      }
    );
    return {
      error:
        error instanceof Error
          ? error.message
          : errorMessages.testimony.systemError,
      entries: [],
      formattedText:
        error instanceof Error
          ? error.message
          : errorMessages.testimony.systemError,
      nextSteps: nextStepsInstructions.noResults
    };
  }
};

// Tool definition
export const testimonyTool = tool({
  name: "testimonyTool",
  description: toolDescriptions.testimonyTool.description,
  inputSchema: z.object({
    terms: z
      .array(z.string())
      .max(toolDescriptions.testimonyTool.maxTerms)
      .describe(toolDescriptions.testimonyTool.inputDescription)
  }),
  execute: async ({ terms }) => {
    const startTime = Date.now();
    logger.info("Testimony tool called", {
      terms,
      component: "testimony-tool"
    });

    try {
      const result = await searchTestimonies(terms);
      const duration = Date.now() - startTime;

      logger.info("Testimony tool completed", {
        terms,
        resultCount: result.entries?.length || 0,
        duration,
        component: "testimony-tool"
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Testimony tool error", {
        terms,
        error: error instanceof Error ? error : new Error(String(error)),
        duration,
        component: "testimony-tool"
      });

      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: {
            component: "testimony-tool",
            operation: "execute"
          },
          extra: { terms, duration }
        }
      );

      throw error;
    }
  }
});
