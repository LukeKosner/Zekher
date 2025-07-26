// lib/tools/testimony.ts
// Provides the testimonyTool for searching Holocaust survivor testimonies using unified hybrid search.

import { tool } from "ai";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { testimonyEmbeddings, testimonySources } from "../database/schema";
import { generateTestimonyEmbeddings } from "../ingestion/embeddings";
import { hybridSearch } from "../search/hybrid-search";
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

    const limitedTerms = searchTerms.slice(0, 2);
    const searchResults = [];

    for (const term of limitedTerms) {
      const query = term.trim();
      if (!query) continue;

      try {
        const hybridResults = await hybridSearch({
          query,
          embedFn: generateTestimonyEmbeddings,
          table: testimonyEmbeddings,
          embeddingColumn: sql`${testimonyEmbeddings.embedding}`,
          contentColumn: sql`${testimonyEmbeddings.content}`,
          joinTable: testimonySources,
          joinCondition: eq(
            testimonyEmbeddings.testimonyId,
            testimonySources.id
          ),
          additionalColumns: {
            survivor_name: sql`${testimonySources.survivor_name}`,
            interviewer: sql`${testimonySources.interviewer}`,
            date: sql`${testimonySources.date}`,
            location: sql`${testimonySources.location}`,
            filename: sql`${testimonySources.filename}`,
            testimonyId: sql`${testimonySources.id}`,
            fullContent: sql`${testimonySources.content}`,
            url: sql`${testimonySources.url}`
          },
          exactMatchColumns: [
            sql`${testimonySources.survivor_name}`,
            sql`${testimonySources.filename}`
          ],
          exactMatchBoost: 5.0,
          semanticThreshold: 0.2,
          textSearchLimit: 15,
          semanticSearchLimit: 15
        });

        const formattedResults = hybridResults.slice(0, 3).map((result) => ({
          id: (result.metadata as any).testimonyId, // Use testimonyId (testimonySources.id) not embedding id
          survivorName: (result.metadata as any).survivor_name,
          content: (result.metadata as any).fullContent,
          relevanceScore: result.rrfScore,
          interviewer: (result.metadata as any).interviewer,
          date: (result.metadata as any).date,
          location: (result.metadata as any).location,
          filename: (result.metadata as any).filename,
          url: (result.metadata as any).url
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

    const deduplicatedResults = searchResults
      .filter(
        (result, index, arr) =>
          arr.findIndex((r) => r.id === result.id) === index
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);

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
          survivorName: result.survivorName,
          excerpt: result.content,
          timeReference: result.date || undefined,
          location: result.location || undefined,
          citation: `[${result.survivorName}](${sourceUrl})`,
          filename: result.id, // Use ID instead of processed filename
          url: result.url || undefined
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
