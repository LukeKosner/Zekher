// lib/utils/testimony.ts

import { db } from "@/lib/db";
import { testimonySources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

export async function getTestimonyById(id: string) {
  const testimony = await db
    .select()
    .from(testimonySources)
    .where(eq(testimonySources.id, id));

  return testimony[0];
}

/**
 * Get testimony by slug (converted from survivor name)
 */
export async function getTestimonyBySlug(slug: string) {
  try {
    // Get all testimonies and find the one whose survivor_name converts to this slug
    const results = await db.select().from(testimonySources);
    
    // Find entry where survivor_name converts to the requested slug
    const testimony = results.find(t => 
      t.survivor_name && nameToSlug(t.survivor_name) === slug
    );
    
    return testimony || null;
  } catch (error) {
    console.error('Error fetching testimony by slug:', error);
    return null;
  }
}

export async function getAllTestimonies() {
  const testimonies = await db
    .select()
    .from(testimonySources)
    .orderBy(testimonySources.createdAt);

  return testimonies;
}
