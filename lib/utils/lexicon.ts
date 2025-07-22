/**
 * Lexicon utilities for handling title and slug conversions
 */

interface LexiconEntry {
  title: string;
  content: string;
  txtFile: string;
  pdfFile: string;
}

interface LexiconData {
  generated: string;
  totalEntries: number;
  entries: LexiconEntry[];
}

// Cache for lexicon data
let lexiconDataCache: LexiconData | null = null;

// Static slug-to-title mapping for synchronous lookups
// This will be populated when lexicon data is first loaded
export const slugToTitleMap = new Map<string, string>();

/**
 * Load lexicon data from JSON file and populate slug mapping
 */
export async function loadLexiconData(): Promise<LexiconData> {
  if (lexiconDataCache) {
    return lexiconDataCache;
  }

  try {
    // Check if we're in a server environment
    if (typeof window === 'undefined') {
      // Server-side: read from file system
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public/data/lexicon.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      lexiconDataCache = JSON.parse(fileContent);
    } else {
      // Client-side: use fetch
      const response = await fetch('/data/lexicon.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch lexicon data: ${response.statusText}`);
      }
      lexiconDataCache = await response.json();
    }
    
    // Populate the slug-to-title mapping
    if (lexiconDataCache) {
      lexiconDataCache.entries.forEach(entry => {
        const slug = titleToSlug(entry.title);
        slugToTitleMap.set(slug, entry.title);
      });
    }
    
    return lexiconDataCache!;
  } catch (error) {
    console.error('Error loading lexicon data:', error);
    throw error;
  }
}

/**
 * Convert title to URL-safe slug
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
 * Get the original title from a URL slug by looking up in lexicon data
 */
export async function getOriginalTitle(slug: string): Promise<string | null> {
  try {
    const lexiconData = await loadLexiconData();
    
    // Find the entry that matches the slug
    const entry = lexiconData.entries.find(entry => 
      titleToSlug(entry.title) === slug
    );
    
    return entry ? entry.title : null;
  } catch (error) {
    console.error('Error getting original title:', error);
    return null;
  }
}

/**
 * Get the original title from a URL slug synchronously (for client components)
 * Note: This will only work if the slug mapping has been populated first
 */
export function getTitleFromSlug(slug: string): string | null {
  return slugToTitleMap.get(slug) || null;
}

/**
 * Get lexicon entry by slug
 */
export async function getLexiconEntry(slug: string): Promise<LexiconEntry | null> {
  try {
    const lexiconData = await loadLexiconData();
    
    // Find the entry that matches the slug
    const entry = lexiconData.entries.find(entry => 
      titleToSlug(entry.title) === slug
    );
    
    return entry || null;
  } catch (error) {
    console.error('Error getting lexicon entry:', error);
    return null;
  }
}