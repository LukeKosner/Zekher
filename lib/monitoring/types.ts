/**
 * Monitoring and telemetry type definitions
 */

/**
 * Error types for monitoring and tracking
 */
export enum ErrorType {
  AUDIO_LOADING = "AUDIO_LOADING",
  CITATION_URL_GENERATION = "CITATION_URL_GENERATION",
  URL_VALIDATION = "URL_VALIDATION",
  SPEAKER_MAPPING = "SPEAKER_MAPPING",
  BLOB_URL_CONFIG = "BLOB_URL_CONFIG",
  NETWORK = "NETWORK",
  CONFIGURATION = "CONFIGURATION"
}

/**
 * Severity levels for monitoring events
 */
export enum Severity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

/**
 * Audio loading metrics interface
 */
export interface AudioLoadingMetrics {
  speakerName: string;
  audioFilename: string;
  success: boolean;
  loadTimeMs?: number;
  errorType?: ErrorType;
  errorMessage?: string;
  fallbackUsed: boolean;
  urlSource: "blob" | "gcs" | "fallback";
}

/**
 * Citation URL generation metrics interface
 */
export interface CitationUrlMetrics {
  pageType: "lexicon" | "testimony";
  filename: string;
  success: boolean;
  errorType?: ErrorType;
  errorMessage?: string;
  generatedUrl?: string;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enableMetrics: boolean;
  enableErrorTracking: boolean;
  enableAlerts: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  sensitiveDataPatterns: RegExp[];
}

/**
 * Monitoring context for tracking operations
 */
export interface MonitoringContext {
  operationName: string;
  startTime: number;
  metadata: Record<string, any>;
}
