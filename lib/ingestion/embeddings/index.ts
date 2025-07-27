import {embedMany} from 'ai';
import {cohere} from '@ai-sdk/cohere';
import {cosineDistance, desc, gt, sql} from 'drizzle-orm';

import {db} from '../../database';
import {lexiconEmbeddings, testimonyEmbeddings} from '../../database/schema';

// Models
const lexiconModel = cohere.embedding('embed-v4.0');
const testimonyModel = cohere.embedding('embed-v4.0');

// Bulk embedding generation
export const generateLexiconEmbeddings = async (
  texts: string[],
): Promise<Array<{embedding: number[]; content: string}>> => {
  const {embeddings} = await embedMany({
    model: lexiconModel,
    values: texts,
  });

  return texts.map((content, index) => ({
    content,
    embedding: embeddings[index],
  }));
};

export const generateTestimonyEmbeddings = async (
  texts: string[],
): Promise<Array<{embedding: number[]; content: string}>> => {
  const {embeddings} = await embedMany({
    model: testimonyModel,
    values: texts,
  });

  return texts.map((content, index) => ({
    content,
    embedding: embeddings[index],
  }));
};
