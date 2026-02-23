/**
 * MCP (Model Context Protocol) feature types
 */

import type { ToolLexiconEntry } from "@/lib/shared";

// MCP-specific response interface
export interface McpLexiconResponse {
  sources: ToolLexiconEntry[];
  usageInstructions: {
    disclaimer: string;
    citationGuidelines: string;
    additionalResources: string;
  };
  nextSteps: string;
}

export interface McpLexiconAppSource extends ToolLexiconEntry {
  citationUrl: string;
  previewImageUrl?: string;
}

export interface McpLexiconSearchStructuredContent
  extends Record<string, unknown> {
  type: "lexicon_search";
  queryTerms: string[];
  resultCount: number;
  sources: McpLexiconAppSource[];
  nextSteps: string;
}

export interface McpLexiconDetailStructuredContent
  extends Record<string, unknown> {
  type: "lexicon_entry_detail";
  entry: McpLexiconAppSource;
}
