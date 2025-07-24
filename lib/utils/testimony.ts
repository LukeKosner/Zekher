// lib/utils/testimony.ts

import { db } from "@/lib/db";
import { testimonySources } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { TestimonyEntry } from "@/lib/types";
import { logger } from "@/lib/utils/logger";

/**
 * Convert survivor name to URL-safe slug (for consistency with lexicon)
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * STANDARDIZED TESTIMONY DATABASE FUNCTIONS
 * All testimony queries should use these functions to ensure consistency
 */

/**
 * Get testimony by ID - Primary function for all testimony lookups
 * @param id The testimony ID (nanoid from database)
 * @returns Testimony record or null if not found
 */
export async function getTestimonyById(id: string) {
  if (!id || typeof id !== 'string') {
    logger.warn('Invalid testimony ID provided', { id });
    return null;
  }

  try {
    logger.debug('Fetching testimony by ID', { id });
    
    const results = await db
      .select()
      .from(testimonySources)
      .where(eq(testimonySources.id, id));

    const testimony = results[0] || null;
    
    if (!testimony) {
      logger.warn('Testimony not found', { id });
    } else {
      logger.debug('Testimony found', { id, survivorName: testimony.survivor_name });
    }

    return testimony;
  } catch (error) {
    logger.error('Database error fetching testimony', { 
      id, 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return null;
  }
}

/**
 * Get testimony by slug/ID - Alias for URL routing compatibility
 * @param slug The testimony ID used in URLs
 * @returns Testimony record or null if not found
 */
export async function getTestimonyBySlug(slug: string) {
  return getTestimonyById(slug);
}

/**
 * Get all testimonies - Used for sources page listing
 * @returns Array of testimony entries with computed fields
 */
export async function getAllTestimonies(): Promise<TestimonyEntry[]> {
  try {
    logger.debug('Fetching all testimonies');
    
    const testimonies = await db
      .select()
      .from(testimonySources)
      .orderBy(testimonySources.createdAt);

    logger.debug('Retrieved testimonies', { count: testimonies.length });

    return testimonies.map(testimony => ({
      ...testimony,
      title: testimony.survivor_name,
      survivorName: testimony.survivor_name,
      excerpt: testimony.content.slice(0, 200) + (testimony.content.length > 200 ? "..." : ""),
      citation: "Dr. David P. Boder Collection"
    }));
  } catch (error) {
    logger.error('Database error fetching all testimonies', { 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

/**
 * Get multiple testimonies by IDs - Batch lookup for efficiency
 * @param ids Array of testimony IDs
 * @returns Array of testimony records (may be fewer than requested if some not found)
 */
export async function getTestimoniesByIds(ids: string[]): Promise<any[]> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    logger.warn('Invalid testimony IDs array provided', { ids });
    return [];
  }

  try {
    logger.debug('Fetching testimonies by IDs', { ids, count: ids.length });
    
    const results = await db
      .select()
      .from(testimonySources)
      .where(sql`${testimonySources.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);

    logger.debug('Retrieved testimonies by IDs', { 
      requestedCount: ids.length, 
      foundCount: results.length,
      foundIds: results.map(r => r.id)
    });

    return results;
  } catch (error) {
    logger.error('Database error fetching testimonies by IDs', { 
      ids,
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

/**
 * Debug function to check if a testimony exists and log details
 * @param id The testimony ID to check
 * @returns Debug information about the testimony
 */
export async function debugTestimonyLookup(id: string) {
  logger.info('DEBUG: Testimony lookup requested', { id });
  
  try {
    // Check if testimony exists
    const testimony = await getTestimonyById(id);
    
    if (testimony) {
      logger.info('DEBUG: Testimony found', {
        id,
        survivorName: testimony.survivor_name,
        filename: testimony.filename,
        createdAt: testimony.createdAt,
        hasContent: !!testimony.content,
        contentLength: testimony.content?.length || 0
      });
      return {
        found: true,
        testimony,
        message: `Testimony found: ${testimony.survivor_name}`
      };
    } else {
      // Check if any testimonies exist at all
      const allTestimonies = await db
        .select({ id: testimonySources.id, survivor_name: testimonySources.survivor_name })
        .from(testimonySources)
        .limit(5);
      
      logger.warn('DEBUG: Testimony not found', {
        requestedId: id,
        sampleTestimonies: allTestimonies
      });
      
      return {
        found: false,
        testimony: null,
        message: `Testimony with ID ${id} not found`,
        sampleIds: allTestimonies.map(t => t.id)
      };
    }
  } catch (error) {
    logger.error('DEBUG: Error during testimony lookup', {
      id,
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return {
      found: false,
      testimony: null,
      message: `Error looking up testimony: ${error instanceof Error ? error.message : String(error)}`,
      error
    };
  }
}
