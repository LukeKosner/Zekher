/**
 * Shared type definitions used across multiple features
 */

// Core data structure types
export interface LexiconEntry {
  title: string;
  content: string;
  citation: string;
  filename: string;
}

export interface TestimonyEntry {
  survivorName: string;
  excerpt: string;
  timeReference?: string;
  location?: string;
  citation: string;
  filename: string;
}

export interface LexiconResponse {
  entries: LexiconEntry[];
  nextSteps: string;
}

export interface TestimonyResponse {
  entries: TestimonyEntry[];
  nextSteps: string;
}

export interface ToolErrorResponse {
  error: string;
  errorType: "VALIDATION_ERROR" | "SEARCH_ERROR" | "SYSTEM_ERROR";
  metadata: {
    timestamp: string;
    searchTerms?: string[];
  };
}

export type ToolResponse =
  | LexiconResponse
  | TestimonyResponse
  | ToolErrorResponse;