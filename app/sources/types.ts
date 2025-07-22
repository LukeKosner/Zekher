/**
 * @file This file defines the TypeScript types and interfaces for the sources page feature.
 * These types are used to ensure data consistency between the server-side data fetching and the client-side components.
 */

// Sources page data types
export interface LexiconSource {
  id: string;
  filename: string;
  title?: string;
  content?: string;
  pdfFile?: string;
  pdfUrl?: string;
  txtUrl?: string;
  created_at?: string;
  updated_at?: string;
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
