-- Migration to add rich metadata fields to capture all available data from JSON files

-- Add metadata fields to testimonySources table
ALTER TABLE "testimonySources" 
ADD COLUMN IF NOT EXISTS "interviewer" varchar(255),
ADD COLUMN IF NOT EXISTS "date" varchar(255),
ADD COLUMN IF NOT EXISTS "location" varchar(255),
ADD COLUMN IF NOT EXISTS "url" varchar(255),
ADD COLUMN IF NOT EXISTS "mediaFile" varchar(255),
ADD COLUMN IF NOT EXISTS "transcriptionFile" varchar(255),
ADD COLUMN IF NOT EXISTS "description" text,
ADD COLUMN IF NOT EXISTS "exportDate" varchar(255),
ADD COLUMN IF NOT EXISTS "testimony_language" varchar(100);

-- Add metadata fields to lexiconSources table
ALTER TABLE "lexiconSources" 
ADD COLUMN IF NOT EXISTS "title" varchar(255),
ADD COLUMN IF NOT EXISTS "pdfFile" varchar(255);

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS "idx_testimony_interviewer" ON "testimonySources" ("interviewer");
CREATE INDEX IF NOT EXISTS "idx_testimony_date" ON "testimonySources" ("date");
CREATE INDEX IF NOT EXISTS "idx_testimony_location" ON "testimonySources" ("location");
CREATE INDEX IF NOT EXISTS "idx_testimony_language" ON "testimonySources" ("testimony_language");
CREATE INDEX IF NOT EXISTS "idx_lexicon_title" ON "lexiconSources" ("title");
