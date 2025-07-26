/**
 * Monitoring, telemetry and error handling constants
 */

/** OpenTelemetry tracer configurations */
export const TELEMETRY_CONFIG = {
  /** Application version for tracers */
  APP_VERSION: '1.0.0',
  /** Tracer names for different components */
  TRACER_NAMES: {
    API: 'holocaust-education-api',
    LEXICON: 'lexicon-tool', 
    TESTIMONY: 'testimony-tool',
    DATABASE: 'database',
    SEARCH: 'search',
  },
} as const;

/** Monitoring configuration defaults */
export const MONITORING_CONFIG = {
  /** Default log levels by environment */
  LOG_LEVELS: {
    PRODUCTION: 'warn' as const,
    DEVELOPMENT: 'debug' as const,
  },
  /** Alert thresholds */
  THRESHOLDS: {
    /** Minimum success rate before alerting */
    MIN_SUCCESS_RATE: 80,
    /** Minimum operations before calculating success rate */
    MIN_OPERATIONS_FOR_RATE: 5,
  },
  /** Sensitive data patterns for sanitization */
  SENSITIVE_PATTERNS: [
    /https:\/\/storage\.googleapis\.com\/[^/]+\/[^/]+\/[^/]+/g, // GCS URLs
    /blob:[^/]+\/[^/]+/g, // Blob URLs  
    /DATABASE_URL=.*/g, // Database URLs
    /API_KEY=.*/g, // API keys
    /SECRET=.*/g, // Secrets
  ],
} as const;

/** Error type constants */
export const ERROR_TYPES = {
  AUDIO_LOADING: "AUDIO_LOADING",
  CITATION_URL_GENERATION: "CITATION_URL_GENERATION", 
  URL_VALIDATION: "URL_VALIDATION",
  SPEAKER_MAPPING: "SPEAKER_MAPPING",
  BLOB_URL_CONFIG: "BLOB_URL_CONFIG",
  NETWORK: "NETWORK",
  CONFIGURATION: "CONFIGURATION",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SEARCH_ERROR: "SEARCH_ERROR", 
  SYSTEM_ERROR: "SYSTEM_ERROR",
  NOT_FOUND: "NOT_FOUND",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
} as const;

/** Severity levels for monitoring */
export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium", 
  HIGH: "high",
  CRITICAL: "critical",
} as const;

/** System error indicators for error classification */
export const SYSTEM_ERROR_INDICATORS = [
  "Database connection failed",
  "Search service unavailable", 
  "connection",
  "ECONNREFUSED",
  "timeout", 
  "unavailable",
  "service",
] as const;