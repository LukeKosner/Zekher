// Type definitions for Holocaust education tool responses
// Provides structured data format while maintaining LLM compatibility

export interface LexiconEntry {
  title: string;
  content: string;
  citation: string;
  filename: string;
}

export interface LexiconResponse {
  entries: LexiconEntry[];
  formattedText: string;
  nextSteps: string;
}

export interface TestimonyEntry {
  survivorName: string;
  excerpt: string;
  timeReference?: string;
  location?: string;
  citation: string;
  filename: string;
}

export interface TestimonyResponse {
  entries: TestimonyEntry[];
  formattedText: string;
  nextSteps: string;
}

export interface ToolErrorResponse {
  error: string;
  errorType: "VALIDATION_ERROR" | "SEARCH_ERROR" | "SYSTEM_ERROR";
  formattedText: string;
  metadata: {
    timestamp: string;
    searchTerms?: string[];
  };
}

export type ToolResponse =
  | LexiconResponse
  | TestimonyResponse
  | ToolErrorResponse;
