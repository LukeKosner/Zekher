// lib/ingest.ts
// Ingestion pipeline for lexicon and testimony sources. Handles reading, metadata extraction, deduplication, and embedding generation.
// All input/output now uses the public/ directory for processed and metadata files.

import * as Sentry from '@sentry/nextjs';
const {logger} = Sentry;
import fs from 'fs/promises';
import path from 'path';
import {db} from '../../database';
import {
  lexiconSources,
  lexiconEmbeddings,
  testimonySources,
  testimonyEmbeddings,
} from '../../database/schema';
import {
  generateLexiconEmbeddings,
  generateTestimonyEmbeddings,
} from '../embeddings';
import {eq} from 'drizzle-orm';
import {
  loadMetadata,
  extractSurvivorName,
  resourceExists,
  getTextFromTxt,
} from '../processors/ingestUtils';

// Load testimony language mappings
let testimonyLanguages: Record<string, string> = {};
async function loadTestimonyLanguages(): Promise<void> {
  try {
    const languageData = await fs.readFile(
      path.join(process.cwd(), 'lib/ingestion/testimony-languages.json'),
      'utf-8',
    );
    testimonyLanguages = JSON.parse(languageData);
    logger.info('Loaded testimony language mappings', {
      count: Object.keys(testimonyLanguages).length,
    });
  } catch (error) {
    logger.error('Failed to load testimony language mappings', {error});
  }
}

// Paths to processed files (now in public/)
const LEXICON_PATH = `${process.env.USER_DATA_PATH}/hf-custom-backup-processed/lexicon/txt`;
const TESTIMONY_PATH = `${process.env.USER_DATA_PATH}/hf-custom-backup-processed/testimony/txt`;
const LEXICON_JSON = `${process.env.USER_DATA_PATH}/hf-custom-backup/lexicon/lexicon.json`;
const TESTIMONY_JSON = `${process.env.USER_DATA_PATH}/hf-custom-backup/testimony/testimony.json`;

/**
 * Processes a single lexicon file: checks for duplicates, extracts metadata, stores content, and generates embeddings.
 */
async function processLexiconFile(
  filePath: string,
  metadata?: any,
): Promise<void> {
  const filename = path.basename(filePath);
  logger.info('Processing lexicon', {filename});
  if (await resourceExists(lexiconSources, filename)) {
    logger.info('Skipping lexicon (already exists)', {filename});
    return;
  }
  const content = await getTextFromTxt(filePath);
  logger.info('Extracted characters from lexicon', {
    filename,
    length: content.length,
  });
  // Find matching metadata entry
  let metadataEntry = null;
  if (metadata?.entries) {
    const baseName = filename.replace('.txt', '');
    metadataEntry = metadata.entries.find(
      (entry: any) =>
        entry.title === baseName || entry.txtFile?.endsWith(`/${baseName}.txt`),
    );
  }
  const [source] = await db
    .insert(lexiconSources)
    .values({
      filename,
      content,
      title: metadataEntry?.title || null,
      pdfFile: metadataEntry?.pdfFile || null,
    })
    .returning();
  const embeddingData = await generateLexiconEmbeddings([content]);
  await db.insert(lexiconEmbeddings).values({
    resourceId: source.id,
    content: content,
    embedding: embeddingData[0].embedding,
  });
  logger.info('Successfully processed lexicon', {filename});
}

/**
 * Processes a single testimony file: checks for duplicates, extracts survivor name and metadata, stores content, and generates embeddings.
 */
async function processTestimonyFile(
  filePath: string,
  metadata?: any,
): Promise<void> {
  const filename = path.basename(filePath);
  logger.info('Processing testimony', {filename});
  if (await resourceExists(testimonySources, filename)) {
    logger.info('Skipping testimony (already exists)', {filename});
    return;
  }
  const content = await fs.readFile(filePath, 'utf-8');
  const survivorName = extractSurvivorName(content, filename);

  // Get language for this testimony
  const testimonyLanguage = testimonyLanguages[filename] || null;

  logger.info('Extracted survivor name and language', {
    filename,
    survivorName,
    language: testimonyLanguage,
  });

  // Find matching metadata entry
  let metadataEntry = null;
  if (metadata?.entries) {
    metadataEntry = metadata.entries.find(
      (entry: any) =>
        entry.title === survivorName ||
        entry.txtFile?.includes(filename) ||
        entry.interviewee === survivorName,
    );
  }
  const [source] = await db
    .insert(testimonySources)
    .values({
      survivor_name: survivorName,
      filename,
      content,
      testimony_language: testimonyLanguage,
      interviewer: metadataEntry?.interviewer || null,
      date: metadataEntry?.date || null,
      location: metadataEntry?.location || null,
      url: metadataEntry?.url || null,
      mediaFile: metadataEntry?.mediaFile || null,
      transcriptionFile: metadataEntry?.transcriptionFile || null,
      description: metadataEntry?.description || null,
      exportDate: metadataEntry?.exportDate || null,
    })
    .returning();
  const embeddingData = await generateTestimonyEmbeddings([content]);
  await db.insert(testimonyEmbeddings).values({
    testimonyId: source.id,
    content,
    embedding: embeddingData[0].embedding,
  });
  logger.info('Successfully processed testimony', {filename});
}

/**
 * Ingests all lexicon files in the processed directory, skipping duplicates and logging progress.
 */
export async function ingestLexicon(): Promise<void> {
  logger.info('Starting lexicon ingestion');
  const metadata = await loadMetadata(LEXICON_JSON);
  if (metadata) {
    logger.info('Lexicon metadata loaded', {
      totalEntries: metadata.totalEntries,
      generated: metadata.generated,
    });
  }
  const files = await fs.readdir(LEXICON_PATH);
  const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt'));
  logger.info('Found TXT files for lexicon', {count: txtFiles.length});
  let processed = 0,
    skipped = 0,
    failed = 0;
  for (const file of txtFiles) {
    try {
      const filePath = path.join(LEXICON_PATH, file);
      if (await resourceExists(lexiconSources, file)) {
        skipped++;
        continue;
      }
      await processLexiconFile(filePath, metadata);
      processed++;
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      failed++;
      logger.error('Failed to process lexicon file', {file, error});
    }
  }
  logger.info('Lexicon ingestion summary', {processed, skipped, failed});
}

/**
 * Ingests all testimony files in the processed directory, skipping duplicates and logging progress.
 */
export async function ingestTestimonies(): Promise<void> {
  logger.info('Starting testimony ingestion');

  // Load language mappings first
  await loadTestimonyLanguages();

  const metadata = await loadMetadata(TESTIMONY_JSON);
  if (metadata) {
    logger.info('Testimony metadata loaded', {
      totalEntries: metadata.totalEntries,
      generated: metadata.generated,
    });
  }
  const files = await fs.readdir(TESTIMONY_PATH);
  const textFiles = files.filter(f => f.toLowerCase().endsWith('.txt'));
  logger.info('Found text files for testimony', {count: textFiles.length});
  let processed = 0,
    skipped = 0,
    failed = 0;
  for (const file of textFiles) {
    try {
      const filePath = path.join(TESTIMONY_PATH, file);
      if (await resourceExists(testimonySources, file)) {
        skipped++;
        continue;
      }
      await processTestimonyFile(filePath, metadata);
      processed++;
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      failed++;
      logger.error('Failed to process testimony file', {file, error});
    }
  }
  logger.info('Testimony ingestion summary', {processed, skipped, failed});
}

/**
 * Ingests both lexicon and testimony sources.
 */
export async function ingestAll(): Promise<void> {
  await ingestLexicon();
  await ingestTestimonies();
}

/**
 * Clears all data from the database (lexicon and testimony sources and embeddings).
 */
export async function clearAll(): Promise<void> {
  logger.info('Clearing all data');
  await db.delete(lexiconEmbeddings);
  await db.delete(testimonyEmbeddings);
  await db.delete(lexiconSources);
  await db.delete(testimonySources);
  logger.info('All data cleared');
}

// CLI interface for running ingestion/clear from the command line
if (require.main === module) {
  const command = process.argv[2];
  switch (command) {
    case 'lexicon':
      ingestLexicon().catch(err => {
        logger.error('Error in ingestLexicon', {error: err});
      });
      break;
    case 'testimony':
      ingestTestimonies().catch(err => {
        logger.error('Error in ingestTestimonies', {error: err});
      });
      break;
    case 'clear':
      clearAll().catch(err => {
        logger.error('Error in clearAll', {error: err});
      });
      break;
    default:
      ingestAll().catch(err => {
        logger.error('Error in ingestAll', {error: err});
      });
  }
}
