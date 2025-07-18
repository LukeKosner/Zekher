// lib/tools/searchUtils.ts
// Shared utilities for hybrid search, deduplication, RRF scoring, and result formatting.

/**
 * Deduplicates an array of results by a key, sorts by a score, and limits the output.
 * @param arr Array of results
 * @param key Unique key to deduplicate by (e.g., 'id')
 * @param scoreKey Key to sort by (e.g., 'hybridScore')
 * @param max Maximum number of results
 */
export function deduplicateResults<T>(
  arr: T[],
  key: keyof T,
  scoreKey: keyof T,
  max: number
): T[] {
  return arr
    .filter(
      (result, index, self) =>
        self.findIndex((r) => r[key] === result[key]) === index
    )
    .sort((a, b) => (b[scoreKey] as any) - (a[scoreKey] as any))
    .slice(0, max);
}

/**
 * Reciprocal Rank Fusion (RRF) scoring function.
 * @param rank Zero-based rank
 * @param k RRF constant (default 60)
 */
export function rrfScore(rank: number, k: number = 60): number {
  return 1.0 / (k + rank);
}

// Removed formatLexiconResults function to prevent conflicts with updated lexicon tool formatting
// Each tool now handles its own formatting to ensure consistency
