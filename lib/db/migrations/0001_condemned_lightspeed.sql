CREATE TABLE IF NOT EXISTS "testimonyEmbeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"testimony_id" varchar(191),
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testimonySources" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"survivor_name" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "testimonyEmbeddings" ADD CONSTRAINT "testimonyEmbeddings_testimony_id_testimonySources_id_fk" FOREIGN KEY ("testimony_id") REFERENCES "public"."testimonySources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonyEmbeddingIndex" ON "testimonyEmbeddings" USING hnsw ("embedding" vector_cosine_ops);