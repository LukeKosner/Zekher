/**
 * Search and AI tool configuration constants
 */

/** Tool search limits and parameters */
export const TOOL_LIMITS = {
  /** Maximum search terms for lexicon tool */
  LEXICON_MAX_TERMS: 6,
  /** Maximum search terms for testimony tool */
  TESTIMONY_MAX_TERMS: 3,
  /** Maximum audio segments to show users */
  MAX_AUDIO_SEGMENTS: 3,
  /** Maximum results per tool search */
  MAX_TOOL_RESULTS: 6,
} as const;

/** Hybrid search configuration */
export const SEARCH_CONFIG = {
  /** Default semantic similarity threshold */
  SEMANTIC_THRESHOLD: 0.3,
  /** Text search result limit */
  TEXT_SEARCH_LIMIT: 15,
  /** Semantic search result limit */
  SEMANTIC_SEARCH_LIMIT: 15,
  /** Boost factor for exact matches */
  EXACT_MATCH_BOOST: 3.0,
  /** Lexicon-specific exact match boost */
  LEXICON_EXACT_MATCH_BOOST: 5.0,
  /** Exact match search limit */
  EXACT_MATCH_LIMIT: 5,
  /** Text search strategies limit */
  TEXT_STRATEGIES_LIMIT: 10,
  /** RRF scoring constant */
  RRF_K_VALUE: 60,
} as const;

/** Database and embedding configuration */
export const DATABASE_CONFIG = {
  /** Vector embedding dimensions */
  EMBEDDING_DIMENSIONS: 1536,
  /** Default vector similarity operator threshold */
  DEFAULT_SIMILARITY_THRESHOLD: 0.3,
} as const;