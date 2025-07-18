// lib/utils/ingestUtils.ts
// Shared utilities for ingestion pipeline: metadata loading, survivor name extraction, deduplication, and file reading.

import fs from 'fs/promises';
import {eq} from 'drizzle-orm';
import {db} from '../../db';

/**
 * Loads metadata from a JSON file, returning null if not found or invalid.
 */
export async function loadMetadata(jsonPath: string): Promise<any> {
  try {
    const content = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Could not load metadata from ${jsonPath}`);
    return null;
  }
}

/**
 * Extracts the survivor's name from the content or filename.
 * Tries to parse the header line, falls back to filename if needed.
 */
export function extractSurvivorName(content: string, filename: string): string {
  const lines = content.split('\n');
  const headerLine = lines[0]?.trim();
  if (headerLine && headerLine.includes('David P. Boder Interviews')) {
    const match = headerLine.match(/David P\. Boder Interviews\s+([^,]+)/);
    if (match) {
      return match[1].trim();
    }
  }
  // Fallback to filename without extension
  return filename.replace('.txt', '').replace(/[-_]/g, ' ');
}

/**
 * Checks if a resource (by filename) already exists in the given table.
 */
export async function resourceExists(
  table: any,
  filename: string,
): Promise<boolean> {
  const existing = await db
    .select()
    .from(table)
    .where(eq(table.filename, filename))
    .limit(1);
  return existing.length > 0;
}

/**
 * Reads and returns the text content of a file.
 */
export async function getTextFromTxt(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}
