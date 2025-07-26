CREATE TABLE IF NOT EXISTS "lexiconEmbeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"resource_id" varchar(191),
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lexiconSources" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"filename" varchar(255),
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lexiconEmbeddings" ADD CONSTRAINT "lexiconEmbeddings_resource_id_lexiconSources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."lexiconSources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "lexiconEmbeddings" USING hnsw ("embedding" vector_cosine_ops);