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

// Sources page types
export interface LexiconSource {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  featured?: boolean;
}

export interface TestimonySource {
  id: string;
  filename: string;
  survivor_name?: string;
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  featured?: boolean;
  testimony_language?: string;
  interviewer?: string;
  location?: string;
  url?: string;
}

// Interactive card component props
export interface LexiconCardProps {
  source: LexiconSource;
  className?: string;
}

export interface TestimonyCardProps {
  source: TestimonySource;
  className?: string;
}

// API response types for sources
export interface SourcesApiResponse {
  sources: (LexiconSource | TestimonySource)[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SourcesApiErrorResponse {
  error: string;
  errorType: "VALIDATION_ERROR" | "NOT_FOUND" | "SYSTEM_ERROR";
  metadata: {
    timestamp: string;
    type?: string;
    id?: string;
  };
}