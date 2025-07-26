#!/usr/bin/env bun
// Script to update existing testimony records with language data

import fs from 'fs/promises';
import path from 'path';
import {db} from '../../database';
import {testimonySources} from '../../database/schema';
import {eq} from 'drizzle-orm';

async function updateTestimonyLanguages(): Promise<void> {
  console.log('Loading testimony language mappings...');

  // Load language mappings
  const languageData = await fs.readFile(
    path.join(process.cwd(), 'lib/ingestion/testimony-languages.json'),
    'utf-8',
  );
  const testimonyLanguages = JSON.parse(languageData);

  console.log(
    `Loaded ${Object.keys(testimonyLanguages).length} language mappings`,
  );

  // Get all testimony records
  const testimonies = await db.select().from(testimonySources);
  console.log(`Found ${testimonies.length} testimony records to update`);

  let updated = 0;
  let notFound = 0;

  for (const testimony of testimonies) {
    // Try direct match first
    let language = testimonyLanguages[testimony.filename];

    // If no direct match, try to extract last name and match
    if (!language) {
      // Extract last name from full name (e.g., "Jacob Minski.txt" → "minski.txt")
      const nameMatch = testimony.filename.match(/(\w+)\.txt$/);
      if (nameMatch) {
        const lastName = nameMatch[1].toLowerCase();
        // Look for matching last name in language mappings
        const matchingKey = Object.keys(testimonyLanguages).find(
          key =>
            key.toLowerCase().includes(lastName) ||
            lastName.includes(key.toLowerCase().replace('.txt', '')),
        );
        if (matchingKey) {
          language = testimonyLanguages[matchingKey];
        }
      }
    }

    if (language) {
      await db
        .update(testimonySources)
        .set({testimony_language: language})
        .where(eq(testimonySources.id, testimony.id));

      console.log(`Updated ${testimony.filename} → ${language}`);
      updated++;
    } else {
      console.log(`No language mapping found for: ${testimony.filename}`);
      notFound++;
    }
  }

  console.log('\nUpdate Summary:');
  console.log(`Updated: ${updated} records`);
  console.log(`Not found: ${notFound} records`);
  console.log(`Total processed: ${testimonies.length} records`);
}

// Run the update
updateTestimonyLanguages()
  .then(() => {
    console.log('Language update completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error updating languages:', error);
    process.exit(1);
  });
