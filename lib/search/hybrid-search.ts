import {sql, SQL, eq} from 'drizzle-orm';
import {PgTable} from 'drizzle-orm/pg-core';
import {db} from '../database';
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

import { HybridSearchOptions, HybridSearchResult } from "./types";

/**
 * Unified hybrid search implementation combining semantic vector search,
 * full-text search, and exact matching with RRF scoring
 */
export async function hybridSearch<T extends {id: string}>(
  options: HybridSearchOptions<T>,
): Promise<HybridSearchResult<T>[]> {
  const {
    query,
    embedFn,
    table,
    embeddingColumn,
    contentColumn,
    joinTable,
    joinCondition,
    additionalColumns = {},
    semanticThreshold = 0.3,
    textSearchLimit = 15,
    semanticSearchLimit = 15,
    exactMatchColumns = [],
    exactMatchBoost = 3.0,
  } = options;

  if (!query.trim()) {
    return [];
  }

  // Generate embedding for semantic search
  const [embedding] = await embedFn([query]);
  const embeddingVector = JSON.stringify(embedding.embedding);

  // Build column selections
  const baseColumns = {
    id: sql`${table}.id`,
    content: contentColumn,
    ...additionalColumns,
  };

  // Execute all three search types in parallel with error handling
  try {
    const [exactResults, semanticResults, fulltextResults] = await Promise.all([
      // Exact match search (if columns specified)
      exactMatchColumns.length > 0
        ? executeExactSearch(
            query,
            baseColumns,
            table,
            joinTable,
            joinCondition,
            exactMatchColumns,
          )
        : Promise.resolve([]),

      // Semantic vector search
      executeSemanticSearch(
        embeddingVector,
        baseColumns,
        table,
        embeddingColumn,
        semanticThreshold,
        semanticSearchLimit,
        joinTable,
        joinCondition,
      ),

      // Full-text search with multiple strategies
      executeFullTextSearch(
        query,
        baseColumns,
        table,
        contentColumn,
        textSearchLimit,
        joinTable,
        joinCondition,
      ),
    ]);

    // Apply RRF scoring and combine results
    const combinedResults = applyRRFScoring<T>(
      exactResults,
      semanticResults,
      fulltextResults,
      exactMatchBoost,
    );

    return combinedResults;
  } catch (error) {
    logger.error("Hybrid search error", {
      error: error instanceof Error ? error.message : String(error),
      query,
      table: table._.name
    });
    
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { 
        component: "hybrid-search", 
        operation: "executeSearch" 
      },
      extra: { 
        query,
        tableName: table._.name 
      }
    });
    
    // Return empty array on database error
    return [];
  }
}

async function executeExactSearch(
  query: string,
  columns: Record<string, SQL>,
  table: PgTable<any>,
  joinTable?: PgTable<any>,
  joinCondition?: SQL,
  exactMatchColumns: SQL[] = [],
): Promise<any[]> {
  const conditions = exactMatchColumns.map(
    col => sql`LOWER(${col}) = LOWER(${query})`,
  );

  const whereClause =
    conditions.length > 1
      ? sql`(${sql.join(conditions, sql` OR `)})`
      : conditions[0];

  let query1 = db.select(columns).from(table);

  if (joinTable && joinCondition) {
    query1 = query1.innerJoin(joinTable, joinCondition) as any;
  }

  return await query1.where(whereClause).limit(5);
}

async function executeSemanticSearch(
  embeddingVector: string,
  columns: Record<string, SQL>,
  table: PgTable<any>,
  embeddingColumn: SQL,
  threshold: number,
  limit: number,
  joinTable?: PgTable<any>,
  joinCondition?: SQL,
): Promise<any[]> {
  const similarityExpr = sql`1 - (${embeddingColumn} <=> ${embeddingVector}::vector)`;

  const enhancedColumns = {
    ...columns,
    similarity: similarityExpr.as('similarity'),
  };

  let query1 = db.select(enhancedColumns).from(table);

  if (joinTable && joinCondition) {
    query1 = query1.innerJoin(joinTable, joinCondition) as any;
  }

  return await query1
    .where(sql`${similarityExpr} > ${threshold}`)
    .orderBy(sql`${embeddingColumn} <=> ${embeddingVector}::vector`)
    .limit(limit);
}

async function executeFullTextSearch(
  query: string,
  columns: Record<string, SQL>,
  table: PgTable<any>,
  contentColumn: SQL,
  limit: number,
  joinTable?: PgTable<any>,
  joinCondition?: SQL,
): Promise<any[]> {
  // Create safe prefix query
  const safePrefixQuery = query
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => `${word}:*`)
    .join(' & ');

  const rankExpr = sql`
    GREATEST(
      ts_rank_cd(to_tsvector('english', ${contentColumn}), plainto_tsquery('english', ${query})),
      CASE 
        WHEN ${safePrefixQuery} != '' 
        THEN ts_rank_cd(to_tsvector('english', ${contentColumn}), to_tsquery('english', ${safePrefixQuery}))
        ELSE 0
      END,
      CASE WHEN ${contentColumn} ILIKE '%' || ${query} || '%' THEN 0.1 ELSE 0 END
    )
  `;

  const enhancedColumns = {
    ...columns,
    textRank: rankExpr.as('text_rank'),
  };

  let query1 = db.select(enhancedColumns).from(table);

  if (joinTable && joinCondition) {
    query1 = query1.innerJoin(joinTable, joinCondition) as any;
  }

  const whereConditions = [
    sql`plainto_tsquery('english', ${query}) @@ to_tsvector('english', ${contentColumn})`,
    safePrefixQuery
      ? sql`to_tsquery('english', ${safePrefixQuery}) @@ to_tsvector('english', ${contentColumn})`
      : null,
    sql`${contentColumn} ILIKE '%' || ${query} || '%'`,
  ].filter(Boolean) as SQL[];

  return await query1
    .where(sql`(${sql.join(whereConditions, sql` OR `)})`)
    .orderBy(sql`${rankExpr} DESC`)
    .limit(limit);
}

function applyRRFScoring<T>(
  exactResults: any[],
  semanticResults: any[],
  fulltextResults: any[],
  exactMatchBoost: number,
): HybridSearchResult<T>[] {
  const resultMap = new Map<string, HybridSearchResult<T>>();

  // Process exact matches with boost
  exactResults.forEach((result, index) => {
    const rrfScore = (1.0 / (index + 1 + 10)) * exactMatchBoost;
    resultMap.set(result.id, {
      id: result.id,
      content: result.content,
      similarity: 1.0,
      textRank: 1.0,
      rrfScore,
      sources: ['exact'],
      isExactMatch: true,
      metadata: result as T,
    });
  });

  // Process semantic results
  semanticResults.forEach((result, index) => {
    const rrfScore = 1.0 / (index + 1 + 60);
    const existing = resultMap.get(result.id);

    if (existing) {
      existing.rrfScore += rrfScore;
      existing.sources.push('semantic');
      existing.similarity = Math.max(
        existing.similarity,
        result.similarity || 0,
      );
    } else {
      resultMap.set(result.id, {
        id: result.id,
        content: result.content,
        similarity: result.similarity || 0,
        textRank: 0,
        rrfScore,
        sources: ['semantic'],
        isExactMatch: false,
        metadata: result as T,
      });
    }
  });

  // Process fulltext results
  fulltextResults.forEach((result, index) => {
    const rrfScore = 1.0 / (index + 1 + 60);
    const existing = resultMap.get(result.id);

    if (existing) {
      existing.rrfScore += rrfScore;
      existing.sources.push('fulltext');
      existing.textRank = Math.max(existing.textRank, result.text_rank || 0);
    } else {
      resultMap.set(result.id, {
        id: result.id,
        content: result.content,
        similarity: 0,
        textRank: result.text_rank || 0,
        rrfScore,
        sources: ['fulltext'],
        isExactMatch: false,
        metadata: result as T,
      });
    }
  });

  // Sort by RRF score and return
  return Array.from(resultMap.values()).sort((a, b) => b.rrfScore - a.rrfScore);
}

/**
 * Utility to calculate RRF score independently
 */
export function rrfScore(rank: number, k: number = 60): number {
  return 1.0 / (k + rank);
}
