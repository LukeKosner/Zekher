import { eq, sql } from "drizzle-orm";
import { hybridSearch } from "./hybrid-search";
import { generateLexiconEmbeddings, generateTestimonyEmbeddings } from "@/lib/ingestion/embeddings";
import { lexiconEmbeddings, lexiconSources, testimonyEmbeddings, testimonySources } from "@/lib/database/schema";
import { generateSourceUrl } from "@/lib";
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;

export async function searchSources(searchTerms: string[], sourceType: "lexicon" | "testimony") {
  const limitedTerms = searchTerms.slice(0, sourceType === "lexicon" ? 6 : 2);
  const searchResults = [];

  for (const term of limitedTerms) {
    const query = term.trim();
    if (!query) continue;

    try {
      const hybridResults = await hybridSearch({
        query,
        embedFn: sourceType === "lexicon" ? generateLexiconEmbeddings : generateTestimonyEmbeddings,
        table: sourceType === "lexicon" ? lexiconEmbeddings : testimonyEmbeddings,
        embeddingColumn: sql`${sourceType === "lexicon" ? lexiconEmbeddings.embedding : testimonyEmbeddings.embedding}`,
        contentColumn: sql`${sourceType === "lexicon" ? lexiconEmbeddings.content : testimonyEmbeddings.content}`,
        joinTable: sourceType === "lexicon" ? lexiconSources : testimonySources,
        joinCondition: sourceType === "lexicon" ? eq(lexiconEmbeddings.resourceId, lexiconSources.id) : eq(testimonyEmbeddings.testimonyId, testimonySources.id),
        additionalColumns: sourceType === "lexicon" ? {
          title: sql`${lexiconSources.title}`,
          filename: sql`${lexiconSources.filename}`,
          pdfUrl: sql`${lexiconSources.pdfUrl}`,
          txtUrl: sql`${lexiconSources.txtUrl}`,
          redirectUrl: sql`${lexiconSources.redirectUrl}`,
          sourceId: sql`${lexiconSources.id}`
        } : {
          survivor_name: sql`${testimonySources.survivor_name}`,
          interviewer: sql`${testimonySources.interviewer}`,
          date: sql`${testimonySources.date}`,
          location: sql`${testimonySources.location}`,
          filename: sql`${testimonySources.filename}`,
          testimonyId: sql`${testimonySources.id}`,
          fullContent: sql`${testimonySources.content}`,
          url: sql`${testimonySources.url}`
        },
        exactMatchColumns: sourceType === "lexicon" ? [sql`${lexiconSources.title}`] : [sql`${testimonySources.survivor_name}`, sql`${testimonySources.filename}`],
        exactMatchBoost: 5.0,
        semanticThreshold: sourceType === "lexicon" ? 0.3 : 0.2,
        textSearchLimit: sourceType === "lexicon" ? 10 : 15,
        semanticSearchLimit: sourceType === "lexicon" ? 10 : 15
      });

      const formattedResults = hybridResults.slice(0, sourceType === "lexicon" ? 6 : 3).map((result) => (
        sourceType === "lexicon" ? {
          id: (result.metadata as any).sourceId,
          title: (result.metadata as any).title,
          filename: (result.metadata as any).filename,
          pdfUrl: (result.metadata as any).pdfUrl,
          txtUrl: (result.metadata as any).txtUrl,
          redirectUrl: (result.metadata as any).redirectUrl,
          content: result.content,
          relevanceScore: result.rrfScore
        } : {
          id: (result.metadata as any).testimonyId, // Use testimonyId (testimonySources.id) not embedding id
          survivorName: (result.metadata as any).survivor_name,
          content: (result.metadata as any).fullContent,
          relevanceScore: result.rrfScore,
          interviewer: (result.metadata as any).interviewer,
          date: (result.metadata as any).date,
          location: (result.metadata as any).location,
          filename: (result.metadata as any).filename,
          url: (result.metadata as any).url
        }
      ));

      searchResults.push(...formattedResults);
    } catch (termError) {
      logger.error("Error processing term", { error: termError });
      // If this looks like a system failure (database connection, etc.),
      // we should fail immediately rather than continuing
      if (
        termError instanceof Error &&
        (termError.message.includes("Database connection failed") ||
          termError.message.includes("Search service unavailable") ||
          termError.message.includes("connection") ||
          termError.message.includes("ECONNREFUSED") ||
          termError.message.includes("timeout") ||
          termError.message.includes("unavailable") ||
          termError.message.includes("service"))
      ) {
        throw termError; // Re-throw system errors to be caught by outer try-catch
      }
      // For other errors (validation, etc.), continue processing other terms
    }
  }

  const deduplicatedResults = searchResults
    .filter(
      (result, index, arr) =>
        arr.findIndex((r) => r.id === result.id) === index
    )
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, sourceType === "lexicon" ? 6 : 3);

  return deduplicatedResults;
}