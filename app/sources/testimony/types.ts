/**
 * Testimony page type definitions
 */

/**
 * Timestamp segment for testimony navigation
 */
export interface TimestampSegment {
  timestamp: string;
  text: string;
  startTimeSeconds: number;
}

/**
 * Testimony data structure
 */
export interface TestimonyData {
  id: string;
  survivor_name: string;
  filename: string;
  content: string;
  testimony_language?: string;
  interviewer?: string;
  date?: string;
  location?: string;
  description?: string;
  createdAt?: string;
}

/**
 * Props for the TestimonyPageClient component
 */
export interface TestimonyPageClientProps {
  testimony: TestimonyData;
}
