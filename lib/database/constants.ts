/**
 * Database schema constants
 *
 * This module contains all hardcoded values used in database schema definitions
 * to ensure consistency and maintainability across the database layer.
 */

/** Database field length constants */
export const DB_FIELD_LENGTHS = {
  /** Standard ID field length (nanoid) */
  ID_LENGTH: 191,
  /** Standard filename field length */
  FILENAME_LENGTH: 255,
  /** Standard title field length */
  TITLE_LENGTH: 255,
  /** Standard URL field length */
  URL_LENGTH: 500,
  /** Standard short text field length */
  SHORT_TEXT_LENGTH: 100
} as const;

/** Database embedding configuration */
export const EMBEDDING_CONFIG = {
  /** Vector embedding dimensions for OpenAI embeddings */
  DIMENSIONS: 1536,
  /** Vector similarity operator for cosine similarity */
  SIMILARITY_OPERATOR: "vector_cosine_ops",
  /** Index type for vector search */
  INDEX_TYPE: "hnsw"
} as const;

/** Database index names */
export const INDEX_NAMES = {
  /** Lexicon embeddings index */
  LEXICON_EMBEDDING: "embeddingIndex",
  /** Testimony embeddings index */
  TESTIMONY_EMBEDDING: "testimonyEmbeddingIndex"
} as const;

/** Database table names */
export const TABLE_NAMES = {
  /** Lexicon sources table */
  LEXICON_SOURCES: "lexiconSources",
  /** Lexicon embeddings table */
  LEXICON_EMBEDDINGS: "lexiconEmbeddings",
  /** Testimony sources table */
  TESTIMONY_SOURCES: "testimonySources",
  /** Testimony embeddings table */
  TESTIMONY_EMBEDDINGS: "testimonyEmbeddings"
} as const;

/** Database column names */
export const COLUMN_NAMES = {
  /** Standard ID column */
  ID: "id",
  /** Resource ID column for embeddings */
  RESOURCE_ID: "resource_id",
  /** Testimony ID column */
  TESTIMONY_ID: "testimony_id",
  /** Created at timestamp column */
  CREATED_AT: "created_at",
  /** Updated at timestamp column */
  UPDATED_AT: "updated_at"
} as const;

/** Database cascade options */
export const CASCADE_OPTIONS = {
  /** Delete cascade option */
  DELETE: "cascade"
} as const;

/** Database operation constants */
export const DB_OPERATION_CONFIG = {
  /** Default search limit for lexicon entries */
  DEFAULT_LEXICON_SEARCH_LIMIT: 20,
  /** Sample limit for debugging queries */
  SAMPLE_ENTRIES_LIMIT: 5,
  /** Default limit for getting all entries */
  DEFAULT_ALL_ENTRIES_LIMIT: 100
} as const;

/** Citation constants */
export const CITATIONS = {
  /** Standard citation for Yad Vashem lexicon entries */
  YAD_VASHEM_LEXICON: "Yad Vashem's Holocaust Lexicon"
} as const;

/** Logging constants */
export const LOG_MESSAGES = {
  /** Lexicon search prefix */
  LEXICON_SEARCH_PREFIX: "🔍 Looking for Lexicon entry with ID:",
  /** Results found message */
  RESULTS_FOUND: "📊 Found",
  /** Results for ID message */
  RESULTS_FOR_ID: "results for ID",
  /** Sample entries message */
  SAMPLE_ENTRIES: "📝 Sample Lexicon entries in database:",
  /** Found entry message */
  FOUND_ENTRY: "✅ Found Lexicon entry:",
  /** Error fetching lexicon entry */
  ERROR_FETCHING_LEXICON: "Error fetching Lexicon entry:",
  /** Error fetching lexicon entries */
  ERROR_FETCHING_LEXICON_ENTRIES: "Error fetching Lexicon entries:",
  /** Deprecated function warning */
  DEPRECATED_SEARCH_WARNING:
    "searchLexiconEntries is deprecated. Use hybridSearch via lexiconTool for better results."
} as const;
