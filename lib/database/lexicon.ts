/**
 * Database-backed lexicon utilities
 * Uses the authoritative lexicon database instead of JSON files
 */

import { db } from '@/lib/database';
import { lexiconSources } from '@/lib/database/schema';
import { asc, eq, sql } from 'drizzle-orm';
import type { LexiconEntry } from '@/lib/shared';

/**
 * Get lexicon entry by ID (now used as slug for URLs)
 */
export async function getLexiconEntryBySlug(id: string): Promise<LexiconEntry | null> {
  try {
    console.log('getLexiconEntryBySlug: Searching for ID:', id);
    const results = await db.select()
      .from(lexiconSources)
      .where(eq(lexiconSources.id, id));
    
    console.log('getLexiconEntryBySlug: Query results:', results.length, 'entries found');
    
    const entry = results[0];
    if (!entry) {
      console.log('getLexiconEntryBySlug: No entry found for ID:', id);
      return null;
    }
    
    console.log('getLexiconEntryBySlug: Found entry:', {
      id: entry.id,
      title: entry.title,
      hasRedirectUrl: !!entry.redirectUrl,
      hasTxtUrl: !!entry.txtUrl,
      hasPdfUrl: !!entry.pdfUrl
    });
    
    return {
      ...entry,
      slug: entry.id, // Use ID as slug
      citation: "Yad Vashem's Holocaust Lexicon" // Standard citation for all Lexicon entries
    };
  } catch (error) {
    console.error('Error fetching Lexicon entry:', error);
    return null;
  }
}

/**
 * Get lexicon entry by ID (alias for consistency)
 */
export async function getLexiconEntryById(id: string): Promise<LexiconEntry | null> {
  return getLexiconEntryBySlug(id);
}

/**
 * Get all lexicon entries for cards/carousels
 */
export async function getAllLexiconEntries(limit?: number): Promise<LexiconEntry[]> {
  try {
    const baseQuery = db.select().from(lexiconSources).orderBy(asc(lexiconSources.title));
    const finalQuery = limit ? baseQuery.limit(limit) : baseQuery;
    
    const results = await finalQuery;
    
    return results.map(entry => ({
      ...entry,
      slug: entry.id, // Use ID as slug
      citation: "Yad Vashem's Holocaust Lexicon" // Standard citation for all Lexicon entries
    }));
  } catch (error) {
    console.error('Error fetching Lexicon entries:', error);
    return [];
  }
}

/**
 * Convert title to URL-safe slug (for consistency)
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Search Lexicon entries by title (deprecated - use hybrid search in tools/lexicon.ts)
 * @deprecated Use hybridSearch via lexiconTool for better search results
 */
export async function searchLexiconEntries(query: string, limit = 20): Promise<LexiconEntry[]> {
  console.warn('searchLexiconEntries is deprecated. Use hybridSearch via lexiconTool for better results.');
  try {
    // Use a simple ILIKE search for backward compatibility
    const results = await db.select()
      .from(lexiconSources)
      .where(sql`${lexiconSources.title} ILIKE ${`%${query}%`}`)
      .limit(limit);
    
    return results.map(entry => ({
      ...entry,
      slug: entry.id, // Use ID as slug
      citation: "Yad Vashem's Holocaust Lexicon" // Standard citation for all Lexicon entries
    }));
  } catch (error) {
    console.error('Error searching Lexicon entries:', error);
    return [];
  }
}