// lib/utils/testimony.ts

import { db } from "@/lib/db";
import { testimonySources } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { TestimonyEntry } from "@/lib/types";

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
 * Get testimony by ID (now used as slug for URLs)
 */
export async function getTestimonyBySlug(id: string) {
  try {
    const results = await db.select()
      .from(testimonySources)
      .where(eq(testimonySources.id, id));
    
    return results[0] || null;
  } catch (error) {
    console.error('Error fetching testimony by ID:', error);
    return null;
  }
}

/**
 * Get testimony by ID (alias for consistency)
 */
export async function getTestimonyByIdAlias(id: string) {
  return getTestimonyBySlug(id);
}

export async function getAllTestimonies(): Promise<TestimonyEntry[]> {
  const testimonies = await db
    .select()
    .from(testimonySources)
    .orderBy(testimonySources.createdAt);

  return testimonies.map(testimony => ({
    ...testimony,
    title: testimony.survivor_name,
    survivorName: testimony.survivor_name,
    excerpt: testimony.content.slice(0, 200) + (testimony.content.length > 200 ? "..." : ""),
    citation: "USC Shoah Foundation"
  }));
}
