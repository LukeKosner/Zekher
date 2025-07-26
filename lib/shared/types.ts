/**
 * Shared type definitions used across multiple domains
 */

import type { SelectLexiconSource, SelectTestimonySource } from "@/lib/database/schema";

// =============================================================================
// API AND TOOL RESPONSE TYPES
// =============================================================================

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
  url?: string;
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

// =============================================================================
// DATABASE TYPES WITH UI EXTENSIONS
// =============================================================================

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

// =============================================================================
// GENERIC API TYPES
// =============================================================================

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

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Parameters for generating source URLs
 */
export interface SourceUrlParams {
  pageType: "lexicon" | "testimony";
  filename: string;
  baseUrl?: string;
}

/**
 * Parameters for generating audio URLs
 */
export interface AudioUrlParams {
  speakerName: string;
  fallbackFilename?: string;
}

/**
 * Configuration for URL generation
 */
export interface UrlConfig {
  NEXT_PUBLIC_BASE_URL: string;
  GOOGLE_CLOUD_STORAGE_BASE: string;
  AUDIO_PATH: string;
  LEXICON_PATH: string;
  TESTIMONY_PATH: string;
}

/**
 * Speaker name to filename mapping for consistent audio file resolution
 */
export interface SpeakerMapping {
  fullName: string;
  audioFilename: string;
  testimonyFilename: string;
}

/**
 * Orchestrator scenario types and planning
 */
export type OrchestratorScenario = "personal" | "factual" | "unclear";

export interface StepPlan {
  stepNumber: number;
  stepName: string;
  description: string;
  toolName?: string;
}

/**
 * Blob URL configuration interface
 */
export interface BlobUrls {
  audio: Record<string, string>;
  lexicon: Record<string, string>;
  testimony: Record<string, string>;
}