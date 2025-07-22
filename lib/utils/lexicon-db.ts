/**
 * Database-backed lexicon utilities
 * Uses the authoritative lexicon database instead of JSON files
 */

import { db } from '@/lib/db';
import { lexiconSources } from '@/lib/db/schema';
import { asc, eq, sql } from 'drizzle-orm';

export interface LexiconEntry {
  id: string;
  title: string;
  slug: string;
  filename: string;
  pdfUrl: string;
  txtUrl: string;
  content: string;
}

/**
 * Get lexicon entry by slug from database
 * Since we don't store slugs, we find by matching title-to-slug conversion
 */
export async function getLexiconEntryBySlug(slug: string): Promise<LexiconEntry | null> {
  try {
    // Get all entries and find the one whose title converts to this slug
    const results = await db.select()
      .from(lexiconSources);
    
    // Find entry where title converts to the requested slug
    const entry = results.find(e => e.title && titleToSlug(e.title) === slug);
    
    if (!entry) {
      return null;
    }
    
    return {
      id: entry.id,
      title: entry.title || '',
      slug: titleToSlug(entry.title || ''),
      filename: entry.filename || '',
      pdfUrl: entry.pdfUrl || '',
      txtUrl: entry.txtUrl || '',
      content: entry.content || ''
    };
  } catch (error) {
    console.error('Error fetching lexicon entry:', error);
    return null;
  }
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
      id: entry.id,
      title: entry.title || '',
      slug: titleToSlug(entry.title || ''),
      filename: entry.filename || '',
      pdfUrl: entry.pdfUrl || '',
      txtUrl: entry.txtUrl || '',
      content: entry.content || ''
    }));
  } catch (error) {
    console.error('Error fetching lexicon entries:', error);
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
 * Search lexicon entries by title
 */
export async function searchLexiconEntries(query: string, limit = 20): Promise<LexiconEntry[]> {
  try {
    // Use a simple ILIKE search for now
    const results = await db.select()
      .from(lexiconSources)
      .where(sql`${lexiconSources.title} ILIKE ${`%${query}%`}`)
      .limit(limit);
    
    return results.map(entry => ({
      id: entry.id,
      title: entry.title || '',
      slug: titleToSlug(entry.title || ''),
      filename: entry.filename || '',
      pdfUrl: entry.pdfUrl || '',
      txtUrl: entry.txtUrl || '',
      content: entry.content || ''
    }));
  } catch (error) {
    console.error('Error searching lexicon entries:', error);
    return [];
  }
}