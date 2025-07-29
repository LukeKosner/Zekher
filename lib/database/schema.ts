// l../database/schema.ts
// Database schema for Holocaust Lexicon and Testimony sources and embeddings.
// Defines tables for source documents and their vector embeddings, with rich metadata for search and retrieval.

import { sql } from 'drizzle-orm';
import {
  text,
  varchar,
  timestamp,
  pgTable,
  index,
  vector,
} from 'drizzle-orm/pg-core';
import {createSelectSchema} from 'drizzle-zod';
import {nanoid} from 'nanoid';
import { embeddingsBase } from './embeddings-base';

// Lexicon Sources Table
// Stores processed entries from Yad Vashem's Holocaust Lexicon.
export const lexiconSources = pgTable('lexiconSources', {
  id: varchar('id', {length: 191}) // Unique ID (nanoid)
    .primaryKey()
    .$defaultFn(() => nanoid()),
  filename: varchar('filename', {length: 255}), // Original filename
  title: varchar('title', {length: 255}), // Lexicon entry title
  content: text('content').notNull(), // Full text content
  pdfFile: varchar('pdfFile', {length: 255}), // Path to original PDF (if available)
  pdfUrl: varchar('pdfUrl', {length: 500}), // Direct URL to PDF in storage
  txtUrl: varchar('txtUrl', {length: 500}), // Direct URL to TXT file in storage
  redirectUrl: varchar('redirectUrl', {length: 500}), // External redirect URL (if entry redirects instead of showing content)
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`), // Creation timestamp
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`), // Last update timestamp
});

// Lexicon Embeddings Table
// Stores vector embeddings for lexicon entries for semantic search.
export const lexiconEmbeddings = pgTable(
  'lexiconEmbeddings',
  {
    ...embeddingsBase,
    resourceId: varchar('resource_id', {length: 191}) // FK to lexiconSources
      .references(() => lexiconSources.id, {onDelete: 'cascade'}),
  },
  table => ({
    embeddingIndex: index('embeddingIndex').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ), // HNSW index for fast vector search
  }),
);

// Testimony Sources Table
// Stores processed Holocaust survivor testimonies and rich metadata.
export const testimonySources = pgTable('testimonySources', {
  id: varchar('id', {length: 191}) // Unique ID (nanoid)
    .primaryKey()
    .$defaultFn(() => nanoid()),
  survivor_name: varchar('survivor_name', {length: 255}).notNull(), // Survivor's full name
  filename: varchar('filename', {length: 255}).notNull(), // Original filename
  content: text('content').notNull(), // Full transcript content
  testimony_language: varchar('testimony_language', {length: 100}), // Language of the testimony (e.g., "German", "Yiddish", "English")
  interviewer: varchar('interviewer', {length: 255}), // Interviewer's name (if available)
  date: varchar('date', {length: 255}), // Interview date (if available)
  location: varchar('location', {length: 255}), // Interview location (if available)
  url: varchar('url', {length: 255}), // Source URL (if available)
  mediaFile: varchar('mediaFile', {length: 255}), // Path to audio file (if available)
  transcriptionFile: varchar('transcriptionFile', {length: 255}), // Path to transcript file (if available)
  mediaUrl: varchar('mediaUrl', {length: 500}), // Direct URL to audio file in storage
  transcriptUrl: varchar('transcriptUrl', {length: 500}), // Direct URL to transcript file in storage
  description: text('description'), // Description or summary
  exportDate: varchar('exportDate', {length: 255}), // Date of export from source
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`), // Creation timestamp
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`), // Last update timestamp
});

// Testimony Embeddings Table
// Stores vector embeddings for testimony transcripts for semantic search.
export const testimonyEmbeddings = pgTable(
  'testimonyEmbeddings',
  {
    ...embeddingsBase,
    testimonyId: varchar('testimony_id', {length: 191}) // FK to testimonySources
      .references(() => testimonySources.id, {onDelete: 'cascade'}),
  },
  table => ({
    embeddingIndex: index('testimonyEmbeddingIndex').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ), // HNSW index for fast vector search
  }),
);

// Zod schemas for validation and type inference
export const insertLexiconSourceSchema = createSelectSchema(lexiconSources);
export const selectLexiconSourceSchema = createSelectSchema(lexiconSources);

export const insertTestimonySourceSchema = createSelectSchema(testimonySources);
export const selectTestimonySourceSchema = createSelectSchema(testimonySources);

export type InsertLexiconSource = typeof lexiconSources.$inferInsert;
export type SelectLexiconSource = typeof lexiconSources.$inferSelect;

export type InsertTestimonySource = typeof testimonySources.$inferInsert;
export type SelectTestimonySource = typeof testimonySources.$inferSelect;

