import { varchar, text, vector, index } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const embeddingsBase = {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
};