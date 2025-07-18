ALTER TABLE "lexiconEmbeddings" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "lexiconEmbeddings" ALTER COLUMN "resource_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "lexiconEmbeddings" ALTER COLUMN "resource_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lexiconSources" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "testimonyEmbeddings" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "testimonyEmbeddings" ALTER COLUMN "testimony_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "testimonyEmbeddings" ALTER COLUMN "testimony_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonySources" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "lexiconSources" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "lexiconSources" ADD COLUMN "pdfFile" varchar(255);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "interviewer" varchar(255);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "date" varchar(255);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "location" varchar(255);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "url" varchar(255);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "mediaFile" varchar(255);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "transcriptionFile" varchar(255);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "exportDate" varchar(255);