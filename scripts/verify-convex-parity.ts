import dotenv from "dotenv";
import path from "node:path";
import postgres from "postgres";
import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

function hashText(input: string) {
  return createHash("sha256").update(input).digest("hex");
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

      const [lexiconCount, lexiconEmbeddingCount, testimonyCount, testimonyEmbeddingCount] =
        await Promise.all([
          tx`SELECT count(*)::int AS count FROM "lexiconSources"`,
          tx`SELECT count(*)::int AS count FROM "lexiconEmbeddings"`,
          tx`SELECT count(*)::int AS count FROM "testimonySources"`,
          tx`SELECT count(*)::int AS count FROM "testimonyEmbeddings"`,
        ]);

      const convexCounts = await convex.query(api.backfill.getCorpusCounts, {});
      console.log("Postgres counts:", {
        lexiconSources: lexiconCount[0].count,
        lexiconEmbeddings: lexiconEmbeddingCount[0].count,
        testimonySources: testimonyCount[0].count,
        testimonyEmbeddings: testimonyEmbeddingCount[0].count,
      });
      console.log("Convex counts:", convexCounts);

      const lexiconSamples = await tx`
        SELECT id, title, content
        FROM "lexiconSources"
        ORDER BY random()
        LIMIT 10
      `;
      for (const sample of lexiconSamples) {
        const convexDoc = await convex.query(api.sources.getLexiconEntryBySourceId, {
          sourceId: sample.id,
        });
        if (!convexDoc) {
          throw new Error(`Missing lexicon source in Convex: ${sample.id}`);
        }
        if (hashText(convexDoc.content) !== hashText(sample.content)) {
          throw new Error(`Lexicon content hash mismatch: ${sample.id}`);
        }
      }

      const testimonySamples = await tx`
        SELECT id, survivor_name, content
        FROM "testimonySources"
        ORDER BY random()
        LIMIT 10
      `;
      for (const sample of testimonySamples) {
        const convexDoc = await convex.query(api.sources.getTestimonyBySourceId, {
          sourceId: sample.id,
        });
        if (!convexDoc) {
          throw new Error(`Missing testimony source in Convex: ${sample.id}`);
        }
        if (hashText(convexDoc.content) !== hashText(sample.content)) {
          throw new Error(`Testimony content hash mismatch: ${sample.id}`);
        }
      }

      const searchTerms = lexiconSamples
        .map((sample) => String(sample.title || "").trim().split(/\s+/)[0])
        .filter(Boolean)
        .slice(0, 3);
      const canRunHybridSearchParity = Boolean(process.env.COHERE_API_KEY);
      if (!canRunHybridSearchParity) {
        console.warn(
          "COHERE_API_KEY is not set; skipping hybrid search parity checks."
        );
      } else {
        for (const term of searchTerms) {
          const result = await convex.action(api.search.searchLexiconAction, {
            terms: [term],
          });
          if (result.entries.length === 0) {
            throw new Error(`Lexicon search returned no entries for term: ${term}`);
          }
        }
      }
    });

    console.log("Parity verification passed.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
