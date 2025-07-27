/**
 * Shared utility functions used across domains
 */

// =============================================================================
// SHARED UTILS CONSTANTS
// =============================================================================

/** Environment configuration */
const ENV_CONFIG = {
  /** Default environment */
  DEFAULT_ENV: "development" as const,
  /** Default base URL */
  DEFAULT_BASE_URL: "https://zekher.com",
  /** Local development URL */
  LOCAL_BASE_URL: "http://localhost:3000"
} as const;

/** Node environments */
const NODE_ENVIRONMENTS = {
  DEVELOPMENT: "development",
  TEST: "test",
  PRODUCTION: "production"
} as const;

/** Database table and column defaults */
const DB_DEFAULTS = {
  /** Default ID length for varchar fields */
  ID_LENGTH: 191,
  /** Default filename length */
  FILENAME_LENGTH: 255,
  /** Default title length */
  TITLE_LENGTH: 255,
  /** Default URL length */
  URL_LENGTH: 500
} as const;

// =============================================================================
// MONITORING CONSTANTS
// =============================================================================

/** OpenTelemetry tracer configurations */
const TELEMETRY_CONFIG = {
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
const MONITORING_CONFIG = {
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
    /SECRET=.*/g // Secrets
  ]
} as const;

/** Helper to get environment-specific values */
export const getEnvValue = <T>(
  prodValue: T,
  devValue: T,
  env: string = process.env.NODE_ENV || ENV_CONFIG.DEFAULT_ENV
): T => {
  return env === NODE_ENVIRONMENTS.PRODUCTION ? prodValue : devValue;
};

/** Helper to check if environment is production */
export const isProduction = (
  env: string = process.env.NODE_ENV || ENV_CONFIG.DEFAULT_ENV
): boolean => {
  return env === NODE_ENVIRONMENTS.PRODUCTION;
};

/** Helper to get monitoring config based on environment */
export const getMonitoringConfig = (
  env: string = process.env.NODE_ENV || ENV_CONFIG.DEFAULT_ENV
) => ({
  enableMetrics: isProduction(env),
  enableErrorTracking: true,
  enableAlerts: isProduction(env),
  logLevel: getEnvValue(
    MONITORING_CONFIG.LOG_LEVELS.PRODUCTION,
    MONITORING_CONFIG.LOG_LEVELS.DEVELOPMENT,
    env
  ),
  sensitiveDataPatterns: MONITORING_CONFIG.SENSITIVE_PATTERNS
});
