ALTER TABLE "lexiconSources" ADD COLUMN "pdfUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "lexiconSources" ADD COLUMN "txtUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "mediaUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "testimonySources" ADD COLUMN "transcriptUrl" varchar(500);