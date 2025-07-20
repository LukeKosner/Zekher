/**
 * MCP (Model Context Protocol) feature types
 */

import type { LexiconEntry } from "@/lib/types";

// MCP-specific response interface
export interface McpLexiconResponse {
  sources: LexiconEntry[];
  usageInstructions: {
    disclaimer: string;
    citationGuidelines: string;
    additionalResources: string;
  };
  nextSteps: string;
}