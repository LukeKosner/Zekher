/**
 * Search and hybrid search type definitions
 */

import {sql, SQL} from 'drizzle-orm';
import {PgTable} from 'drizzle-orm/pg-core';

export interface HybridSearchOptions<T> {
  query: string;
  embedFn: (queries: string[]) => Promise<Array<{embedding: number[]}>>;
  table: PgTable<any>;
  embeddingColumn: SQL;
  contentColumn: SQL;
  joinTable?: PgTable<any>;
  joinCondition?: SQL;
  additionalColumns?: Record<string, SQL>;
  semanticThreshold?: number;
  textSearchLimit?: number;
  semanticSearchLimit?: number;
  exactMatchColumns?: SQL[];
  exactMatchBoost?: number;
}

export interface HybridSearchResult<T = any> {
  id: string;
  content: string;
  similarity: number;
  textRank: number;
  rrfScore: number;
  sources: ('semantic' | 'fulltext' | 'exact')[];
  isExactMatch: boolean;
  metadata: T;
}