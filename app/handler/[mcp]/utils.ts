/**
 * MCP (Model Context Protocol) utilities backed by Convex.
 */

import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { errorMessages, nextStepsInstructions } from "./config";

function isRateLimitError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("rate_limit:") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes(" 429")
  );
}

export const searchLexicon = async (
  searchTerms: string[],
  options?: { ip?: string; clientSessionId?: string; token?: string }
) => {
  try {
    if (!searchTerms?.length) {
      return {
        error: errorMessages.noTerms,
        entries: [],
        formattedText: errorMessages.noTerms,
        nextSteps: nextStepsInstructions.noSearchTerms,
      };
    }

    const result = await fetchAction(
      api.mcp.searchLexiconForMcp,
      {
        terms: searchTerms,
        ip: options?.ip,
        clientSessionId: options?.clientSessionId,
      },
      { token: options?.token }
    );

    return {
      error: result.error,
      entries: result.entries.map((entry) => ({
        ...entry,
        filename: entry.filename ?? "",
      })),
      formattedText: result.formattedText,
      nextSteps: result.nextSteps,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isRateLimit = isRateLimitError(message);
    return {
      error: isRateLimit ? "Rate limited" : errorMessages.systemError,
      entries: [],
      formattedText: isRateLimit ? "Rate limited" : errorMessages.systemError,
      nextSteps: nextStepsInstructions.noResults,
    };
  }
};
