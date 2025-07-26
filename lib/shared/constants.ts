/**
 * Shared constants used across multiple domains
 */

/** Environment configuration */
export const ENV_CONFIG = {
  /** Default environment */
  DEFAULT_ENV: "development" as const,
  /** Default base URL */
  DEFAULT_BASE_URL: "https://zekher.com",
  /** Local development URL */
  LOCAL_BASE_URL: "http://localhost:3000",
} as const;

/** Node environments */
export const NODE_ENVIRONMENTS = {
  DEVELOPMENT: "development",
  TEST: "test",
  PRODUCTION: "production", 
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
  URL_LENGTH: 500,
} as const;