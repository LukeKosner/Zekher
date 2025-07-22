/**
 * MCP (Model Context Protocol) feature types
 */

import type { ToolLexiconEntry } from "@/lib/types";

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