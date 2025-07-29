/**
 * Shared configuration constants
 */

/** Environment configuration */
export const ENV_CONFIG = {
  /** Default environment */
  DEFAULT_ENV: "development" as const,
  /** Default base URL */
  DEFAULT_BASE_URL: "https://zekher.com",
  /** Local development URL */
  LOCAL_BASE_URL: "http://localhost:3000"
} as const;

/** Node environments */
export const NODE_ENVIRONMENTS = {
  DEVELOPMENT: "development",
  TEST: "test",
  PRODUCTION: "production"
} as const;

/** Database table and column defaults */
export const DB_DEFAULTS = {
  /** Default ID length for varchar fields */
  ID_LENGTH: 191,
  /** Default filename length */
  FILENAME_LENGTH: 255,
  /** Default title length */
  TITLE_LENGTH: 255,
  /** Default URL length */
  URL_LENGTH: 500
} as const;

/** OpenTelemetry tracer configurations */
export const TELEMETRY_CONFIG = {
  /** Application version for tracers */
  APP_VERSION: "1.0.0",
  /** Tracer names for different components */
  TRACER_NAMES: {
    API: "holocaust-education-api",
    LEXICON: "lexicon-tool",
    TESTIMONY: "testimony-tool",
    DATABASE: "database",
    SEARCH: "search"
  }
} as const;

/** Monitoring configuration defaults */
export const MONITORING_CONFIG = {
  /** Default log levels by environment */
  LOG_LEVELS: {
    PRODUCTION: "warn" as const,
    DEVELOPMENT: "debug" as const
  },
  /** Alert thresholds */
  THRESHOLDS: {
    /** Minimum success rate before alerting */
    MIN_SUCCESS_RATE: 80,
    /** Minimum operations before calculating success rate */
    MIN_OPERATIONS_FOR_RATE: 5
  },
  /** Sensitive data patterns for sanitization */
  SENSITIVE_PATTERNS: [
    /https:\/\/storage\.googleapis\.com\/[^/]+\/[^/]+\/[^/]+/g, // GCS URLs
    /blob:[^/]+\/[^/]+/g, // Blob URLs
    /DATABASE_URL=.*/g, // Database URLs
    /API_KEY=.*/g, // API keys
    /SECRET=.*/g, // Secrets
  ]
} as const;

/**
 * Default URL configuration
 */
export const DEFAULT_URL_CONFIG: import("./types").UrlConfig = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://zekher.com",
  GOOGLE_CLOUD_STORAGE_BASE: "https://storage.googleapis.com/zekher-storage",
  AUDIO_PATH: "/audio",
  LEXICON_PATH: "/lexicon/pdf",
  TESTIMONY_PATH: "/testimony"
};
