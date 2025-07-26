import { describe, test, expect } from 'bun:test';
import {
  TOOL_LIMITS,
  SEARCH_CONFIG,
  DATABASE_CONFIG
} from './index';

describe('Search Constants', () => {
  test('TOOL_LIMITS has expected values', () => {
    expect(TOOL_LIMITS.LEXICON_MAX_TERMS).toBe(6);
    expect(TOOL_LIMITS.TESTIMONY_MAX_TERMS).toBe(3);
    expect(TOOL_LIMITS.MAX_AUDIO_SEGMENTS).toBe(3);
    expect(TOOL_LIMITS.MAX_TOOL_RESULTS).toBe(6);
  });

  test('SEARCH_CONFIG has expected values', () => {
    expect(SEARCH_CONFIG.SEMANTIC_THRESHOLD).toBe(0.3);
    expect(SEARCH_CONFIG.TEXT_SEARCH_LIMIT).toBe(15);
    expect(SEARCH_CONFIG.SEMANTIC_SEARCH_LIMIT).toBe(15);
    expect(SEARCH_CONFIG.EXACT_MATCH_BOOST).toBe(3.0);
    expect(SEARCH_CONFIG.LEXICON_EXACT_MATCH_BOOST).toBe(5.0);
    expect(SEARCH_CONFIG.EXACT_MATCH_LIMIT).toBe(5);
    expect(SEARCH_CONFIG.TEXT_STRATEGIES_LIMIT).toBe(10);
    expect(SEARCH_CONFIG.RRF_K_VALUE).toBe(60);
  });

  test('DATABASE_CONFIG has expected values', () => {
    expect(DATABASE_CONFIG.EMBEDDING_DIMENSIONS).toBe(1536);
    expect(DATABASE_CONFIG.DEFAULT_SIMILARITY_THRESHOLD).toBe(0.3);
  });

  test('constants maintain their expected types', () => {
    // Verify TypeScript as const typing works as expected
    expect(typeof TOOL_LIMITS.LEXICON_MAX_TERMS).toBe('number');
    expect(typeof SEARCH_CONFIG.SEMANTIC_THRESHOLD).toBe('number');
    expect(typeof DATABASE_CONFIG.EMBEDDING_DIMENSIONS).toBe('number');
  });
});