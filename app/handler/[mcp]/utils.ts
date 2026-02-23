/**
 * MCP (Model Context Protocol) utilities backed by Convex.
 */

import { fetchAction, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { errorMessages, nextStepsInstructions } from "./config";
import type { ToolLexiconEntry } from "@/lib/shared/types";

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

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://zekher.com";
}

export const getLexiconEntryDetail = async (
  sourceId: string,
  options?: { token?: string }
): Promise<{ entry?: ToolLexiconEntry & { citationUrl: string }; error?: string }> => {
  try {
    const trimmedId = sourceId?.trim();
    if (!trimmedId) {
      return { error: "Missing sourceId" };
    }

    const entry = await fetchQuery(
      api.sources.getLexiconEntryBySourceId,
      { sourceId: trimmedId },
      { token: options?.token }
    );

    if (!entry) {
      return { error: "Entry not found" };
    }

    const baseUrl = getBaseUrl();
    const title = entry.title ?? `Entry ${entry.sourceId}`;
    const citationUrl = `${baseUrl}/sources/lexicon/${entry.sourceId}`;

    return {
      entry: {
        id: entry.sourceId,
        title,
        content: entry.content,
        citation: `[${title}](${citationUrl})`,
        filename: entry.filename ?? "",
        pdfUrl: entry.pdfUrl ?? undefined,
        txtUrl: entry.txtUrl ?? undefined,
        redirectUrl: entry.redirectUrl ?? undefined,
        citationUrl,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to load entry detail",
    };
  }
};
