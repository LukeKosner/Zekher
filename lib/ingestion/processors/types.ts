/**
 * Ingestion processor type definitions
 */

/**
 * Testimony entry interface for processing
 */
export interface TestimonyEntry {
  title: string;
  interviewee: string;
  interviewer: string;
  date: string;
  location: string;
  url?: string;
  mediaFile?: string;
  transcriptionFile?: string;
  description?: string;
  exportDate?: string;
  content: string;
  txtFile: string;
}

/**
 * Metadata extracted from testimony content
 */
export interface TestimonyMetadata {
  title: string;
  interviewer: string;
  interviewee: string;
  date: string;
  location: string;
  description?: string;
}

/**
 * Processing options for testimony files
 */
export interface ProcessingOptions {
  cleanContent?: boolean;
  extractMetadata?: boolean;
  validateFormat?: boolean;
}
