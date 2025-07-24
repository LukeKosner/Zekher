/**
 * Shared type definitions used across multiple features
 */

// Core data structure types for API tool responses
export interface ToolLexiconEntry {
  title: string;
  content: string;
  citation: string;
  filename: string;
  pdfUrl?: string | null;
}

export interface ToolTestimonyEntry {
  survivorName: string;
  excerpt: string;
  timeReference?: string;
  location?: string;
  citation: string;
  filename: string;
}

export interface LexiconResponse {
  entries: ToolLexiconEntry[];
  nextSteps: string;
}

export interface TestimonyResponse {
  entries: ToolTestimonyEntry[];
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

/**
 * Extended database types with computed fields for UI components
 */

import type { SelectLexiconSource, SelectTestimonySource } from "@/lib/db/schema";

/** 
 * Lexicon entry with computed fields for UI display.
 * Extends database schema with slug and UI-specific metadata.
 */
export interface LexiconEntry extends SelectLexiconSource {
  /** URL-safe slug computed from ID */
  slug: string;
  /** Citation for the source */
  citation: string;
  /** UI description for display */
  description?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Whether this entry is featured */
  featured?: boolean;
}

/**
 * Testimony entry with computed fields for UI display.
 * Extends database schema with title and UI-specific metadata.
 */
export interface TestimonyEntry extends SelectTestimonySource {
  /** Computed title from survivor_name for display */
  title?: string;
  /** Survivor name (computed from survivor_name for API compatibility) */
  survivorName?: string;
  /** Excerpt of the testimony */
  excerpt?: string;
  /** Citation for the source */
  citation?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Whether this entry is featured */
  featured?: boolean;
}

/**
 * API response types for sources endpoints
 */

/** Pagination information for API responses */
export interface ApiPagination {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Whether there are more pages available */
  hasMore: boolean;
}

/** Generic API response structure */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Pagination information (if applicable) */
  pagination?: ApiPagination;
  /** Response metadata */
  metadata?: {
    timestamp: string;
    version?: string;
  };
}

/** Generic API error response structure */
export interface ApiErrorResponse {
  /** Error message */
  error: string;
  /** Specific error type for programmatic handling */
  errorType: "VALIDATION_ERROR" | "NOT_FOUND" | "SYSTEM_ERROR" | "AUTHENTICATION_ERROR";
  /** Additional error metadata */
  metadata: {
    /** Error timestamp */
    timestamp: string;
    /** Resource type that caused the error */
    type?: string;
    /** Resource ID that caused the error */
    id?: string;
    /** Field that caused validation error */
    field?: string;
  };
}