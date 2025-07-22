/**
 * @fileoverview Types and interfaces for the sources page feature.
 * Re-exports shared types from lib/types.ts and defines component-specific interfaces.
 */

import type { LexiconEntry, TestimonyEntry } from "@/lib/types";

// Re-export shared types for convenience
export type LexiconSource = LexiconEntry;
export type TestimonySource = TestimonyEntry;

/**
 * Component props for interactive card components.
 */

/** Props for LexiconCard component */
export interface LexiconCardProps {
  /** The lexicon source data to display */
  source: LexiconSource;
  /** Optional CSS class for styling */
  className?: string;
}

/** Props for TestimonyCard component */
export interface TestimonyCardProps {
  /** The testimony source data to display */
  source: TestimonySource;
  /** Optional CSS class for styling */
  className?: string;
}
