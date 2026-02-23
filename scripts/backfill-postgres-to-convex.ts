import dotenv from "dotenv";
import path from "node:path";
import postgres from "postgres";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

type PgVector = string | number[] | null;

function parseVector(value: PgVector): number[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => Number(v));
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  if (trimmed === "[]") return [];
  return trimmed
    .slice(1, -1)
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
}

function toMillis(value: unknown): number {
  if (!value) return Date.now();
  const date = value instanceof Date ? value : new Date(String(value));
  const ts = date.getTime();
  return Number.isFinite(ts) ? ts : Date.now();
}

async function main() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });
  dotenv.config({ quiet: true });

  const readonlyUrl =
    process.env.DATABASE_URL_READONLY ?? process.env.DATABASE_URL;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!readonlyUrl) {
    throw new Error(
      "DATABASE_URL_READONLY (or DATABASE_URL as fallback) is required"
    );
  }
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  }

  if (!process.env.DATABASE_URL_READONLY && process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL_READONLY is not set; falling back to DATABASE_URL with enforced read-only transaction checks."
    );
  }

  const sql = postgres(readonlyUrl, { max: 1 });
  const convex = new ConvexHttpClient(convexUrl, {
    skipConvexDeploymentUrlCheck: true,
  });

  try {
    await sql.begin(async (tx) => {
      await tx`SET TRANSACTION READ ONLY`;
      const readOnly = await tx`SHOW transaction_read_only`;
      if (readOnly[0]?.transaction_read_only !== "on") {
        throw new Error("Database transaction is not read-only");
      }

      const batchSize = 50;

      let offset = 0;
      while (true) {
        const rows = await tx`
          SELECT id, filename, title, content, "pdfFile", "pdfUrl", "txtUrl", "redirectUrl", created_at, updated_at
          FROM "lexiconSources"
          ORDER BY id
          LIMIT ${batchSize} OFFSET ${offset}
        `;
        if (rows.length === 0) break;

        for (const row of rows) {
          await convex.mutation(api.backfill.upsertLexiconSource, {
            sourceId: row.id,
            filename: row.filename ?? undefined,
            title: row.title ?? undefined,
            content: row.content,
            pdfFile: row.pdfFile ?? undefined,
            pdfUrl: row.pdfUrl ?? undefined,
            txtUrl: row.txtUrl ?? undefined,
            redirectUrl: row.redirectUrl ?? undefined,
            createdAt: toMillis(row.created_at),
            updatedAt: toMillis(row.updated_at),
          });
        }
        offset += rows.length;
        console.log(`Backfilled lexiconSources: ${offset}`);
      }

      offset = 0;
      while (true) {
        const rows = await tx`
          SELECT s.id as source_id, e.content, e.embedding, s.created_at as created_at
          FROM "lexiconEmbeddings" e
          JOIN "lexiconSources" s ON s.id = e.resource_id
          ORDER BY e.id
          LIMIT ${batchSize} OFFSET ${offset}
        `;
        if (rows.length === 0) break;
        for (const row of rows) {
          const embedding = parseVector(row.embedding as PgVector);
          if (embedding.length !== 1536) continue;
          await convex.mutation(api.backfill.upsertLexiconEmbedding, {
            sourceId: row.source_id,
            content: row.content,
            embedding,
            createdAt: toMillis(row.created_at),
          });
        }
        offset += rows.length;
        console.log(`Backfilled lexiconEmbeddings: ${offset}`);
      }

      offset = 0;
      while (true) {
        const rows = await tx`
          SELECT id, survivor_name, filename, content, testimony_language, interviewer, date, location, url, "mediaFile", "transcriptionFile", "mediaUrl", "transcriptUrl", description, "exportDate", created_at, updated_at
          FROM "testimonySources"
          ORDER BY id
          LIMIT ${batchSize} OFFSET ${offset}
        `;
        if (rows.length === 0) break;
        for (const row of rows) {
          await convex.mutation(api.backfill.upsertTestimonySource, {
            sourceId: row.id,
            survivor_name: row.survivor_name,
            filename: row.filename,
            content: row.content,
            testimony_language: row.testimony_language ?? undefined,
            interviewer: row.interviewer ?? undefined,
            date: row.date ?? undefined,
            location: row.location ?? undefined,
            url: row.url ?? undefined,
            mediaFile: row.mediaFile ?? undefined,
            transcriptionFile: row.transcriptionFile ?? undefined,
            mediaUrl: row.mediaUrl ?? undefined,
            transcriptUrl: row.transcriptUrl ?? undefined,
            description: row.description ?? undefined,
            exportDate: row.exportDate ?? undefined,
            createdAt: toMillis(row.created_at),
            updatedAt: toMillis(row.updated_at),
          });
        }
        offset += rows.length;
        console.log(`Backfilled testimonySources: ${offset}`);
      }

      offset = 0;
      while (true) {
        const rows = await tx`
          SELECT s.id as source_id, e.content, e.embedding, s.created_at as created_at
          FROM "testimonyEmbeddings" e
          JOIN "testimonySources" s ON s.id = e.testimony_id
          ORDER BY e.id
          LIMIT ${batchSize} OFFSET ${offset}
        `;
        if (rows.length === 0) break;
        for (const row of rows) {
          const embedding = parseVector(row.embedding as PgVector);
          if (embedding.length !== 1536) continue;
          await convex.mutation(api.backfill.upsertTestimonyEmbedding, {
            sourceId: row.source_id,
            content: row.content,
            embedding,
            createdAt: toMillis(row.created_at),
          });
        }
        offset += rows.length;
        console.log(`Backfilled testimonyEmbeddings: ${offset}`);
      }
    });

    console.log("Backfill complete.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
