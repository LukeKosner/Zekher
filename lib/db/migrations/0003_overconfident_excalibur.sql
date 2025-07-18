ALTER TABLE "lexiconEmbeddings" ALTER COLUMN "id" SET DATA TYPE varchar(191);--> statement-breakpoint
ALTER TABLE "lexiconEmbeddings" ALTER COLUMN "resource_id" SET DATA TYPE varchar(191);--> statement-breakpoint
ALTER TABLE "lexiconEmbeddings" ALTER COLUMN "resource_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lexiconSources" ALTER COLUMN "id" SET DATA TYPE varchar(191);--> statement-breakpoint
ALTER TABLE "testimonyEmbeddings" ALTER COLUMN "id" SET DATA TYPE varchar(191);--> statement-breakpoint
ALTER TABLE "testimonyEmbeddings" ALTER COLUMN "testimony_id" SET DATA TYPE varchar(191);--> statement-breakpoint
ALTER TABLE "testimonyEmbeddings" ALTER COLUMN "testimony_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonySources" ALTER COLUMN "id" SET DATA TYPE varchar(191);