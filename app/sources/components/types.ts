/**
 * Sources components type definitions
 */

import type { LexiconEntry, TestimonyEntry } from "@/lib/shared";
import type { LexiconSource, TestimonySource } from "../types";

/**
 * Props for the LexiconCard component
 */
export interface LexiconCardProps {
  entry: LexiconEntry;
  className?: string;
}

/**
 * Props for the TestimonyCard component
 */
export interface TestimonyCardProps {
  entry: TestimonyEntry;
  className?: string;
}

/**
 * Props for the SourcesPageContent component
 */
export interface SourceLibraryProps {
  lexiconSources: LexiconSource[];
  testimonySources: TestimonySource[];
}
