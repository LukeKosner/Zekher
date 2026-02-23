import { embed } from "ai";
import { cohere } from "@ai-sdk/cohere";
import { v } from "convex/values";
import { internalAction, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const lexiconEmbeddingModel = cohere.embedding("embed-v4.0");
const testimonyEmbeddingModel = cohere.embedding("embed-v4.0");
const hasCohereApiKey = Boolean(process.env.COHERE_API_KEY);

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://zekher.com";
}

function rrfScore(rank: number, k = 60) {
  return 1 / (rank + 1 + k);
}

const vectorHitValidator = v.object({
  sourceId: v.id("lexiconSources"),
  score: v.number(),
});

const testimonyVectorHitValidator = v.object({
  sourceId: v.id("testimonySources"),
  score: v.number(),
});

export const textSearchLexiconEmbeddings = internalQuery({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      embeddingId: v.id("lexiconEmbeddings"),
      sourceId: v.id("lexiconSources"),
    })
  ),
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("lexiconEmbeddings")
      .withSearchIndex("search_content", (q) => q.search("content", args.term))
      .take(args.limit);
    return docs.map((doc) => ({ embeddingId: doc._id, sourceId: doc.sourceId }));
  },
});

export const textSearchTestimonyEmbeddings = internalQuery({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      embeddingId: v.id("testimonyEmbeddings"),
      sourceId: v.id("testimonySources"),
    })
  ),
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("testimonyEmbeddings")
      .withSearchIndex("search_content", (q) => q.search("content", args.term))
      .take(args.limit);
    return docs.map((doc) => ({ embeddingId: doc._id, sourceId: doc.testimonyId }));
  },
});

export const getLexiconSourcesByIds = internalQuery({
  args: {
    ids: v.array(v.id("lexiconSources")),
  },
  returns: v.array(
    v.object({
      _id: v.id("lexiconSources"),
      sourceId: v.string(),
      filename: v.optional(v.string()),
      title: v.optional(v.string()),
      content: v.string(),
      pdfFile: v.optional(v.string()),
      pdfUrl: v.optional(v.string()),
      txtUrl: v.optional(v.string()),
      redirectUrl: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const results: Array<{
      _id: Id<"lexiconSources">;
      sourceId: string;
      filename?: string;
      title?: string;
      content: string;
      pdfFile?: string;
      pdfUrl?: string;
      txtUrl?: string;
      redirectUrl?: string;
      createdAt: number;
      updatedAt: number;
    }> = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc) {
        results.push({
          _id: doc._id,
          sourceId: doc.sourceId,
          filename: doc.filename,
          title: doc.title,
          content: doc.content,
          pdfFile: doc.pdfFile,
          pdfUrl: doc.pdfUrl,
          txtUrl: doc.txtUrl,
          redirectUrl: doc.redirectUrl,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        });
      }
    }
    return results;
  },
});

export const getTestimonySourcesByIds = internalQuery({
  args: {
    ids: v.array(v.id("testimonySources")),
  },
  returns: v.array(
    v.object({
      _id: v.id("testimonySources"),
      sourceId: v.string(),
      survivor_name: v.string(),
      filename: v.string(),
      content: v.string(),
      testimony_language: v.optional(v.string()),
      interviewer: v.optional(v.string()),
      date: v.optional(v.string()),
      location: v.optional(v.string()),
      url: v.optional(v.string()),
      mediaFile: v.optional(v.string()),
      transcriptionFile: v.optional(v.string()),
      mediaUrl: v.optional(v.string()),
      transcriptUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      exportDate: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const results: Array<{
      _id: Id<"testimonySources">;
      sourceId: string;
      survivor_name: string;
      filename: string;
      content: string;
      testimony_language?: string;
      interviewer?: string;
      date?: string;
      location?: string;
      url?: string;
      mediaFile?: string;
      transcriptionFile?: string;
      mediaUrl?: string;
      transcriptUrl?: string;
      description?: string;
      exportDate?: string;
      createdAt: number;
      updatedAt: number;
    }> = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc) {
        results.push({
          _id: doc._id,
          sourceId: doc.sourceId,
          survivor_name: doc.survivor_name,
          filename: doc.filename,
          content: doc.content,
          testimony_language: doc.testimony_language,
          interviewer: doc.interviewer,
          date: doc.date,
          location: doc.location,
          url: doc.url,
          mediaFile: doc.mediaFile,
          transcriptionFile: doc.transcriptionFile,
          mediaUrl: doc.mediaUrl,
          transcriptUrl: doc.transcriptUrl,
          description: doc.description,
          exportDate: doc.exportDate,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        });
      }
    }
    return results;
  },
});

export const hybridSearchLexicon = internalAction({
  args: {
    terms: v.array(v.string()),
    vectorSearchLimit: v.optional(v.number()),
    textSearchLimit: v.optional(v.number()),
    resultLimit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      sourceId: v.id("lexiconSources"),
      score: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const terms = args.terms.map((term) => term.trim()).filter(Boolean).slice(0, 6);
    const vectorLimit = args.vectorSearchLimit ?? 10;
    const textLimit = args.textSearchLimit ?? 10;
    const resultLimit = args.resultLimit ?? 6;

    const scores = new Map<Id<"lexiconSources">, number>();

    for (const term of terms) {
      if (hasCohereApiKey) {
        const { embedding } = await embed({
          model: lexiconEmbeddingModel,
          value: term,
        });

        const vectorHits = await ctx.vectorSearch("lexiconEmbeddings", "by_embedding", {
          vector: embedding,
          limit: vectorLimit,
        });

        for (let i = 0; i < vectorHits.length; i++) {
          const hit = vectorHits[i];
          const embeddingDoc = await ctx.runQuery(
            internal.search.getLexiconEmbeddingSourceId,
            { embeddingId: hit._id }
          );
          if (!embeddingDoc) continue;
          const existing = scores.get(embeddingDoc.sourceId) ?? 0;
          scores.set(embeddingDoc.sourceId, existing + rrfScore(i));
        }
      }

      const textHits = await ctx.runQuery(internal.search.textSearchLexiconEmbeddings, {
        term,
        limit: textLimit,
      });
      for (let i = 0; i < textHits.length; i++) {
        const hit = textHits[i];
        const existing = scores.get(hit.sourceId) ?? 0;
        scores.set(hit.sourceId, existing + rrfScore(i));
      }
    }

    return Array.from(scores.entries())
      .map(([sourceId, score]) => ({ sourceId, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, resultLimit);
  },
});

export const hybridSearchTestimony = internalAction({
  args: {
    terms: v.array(v.string()),
    vectorSearchLimit: v.optional(v.number()),
    textSearchLimit: v.optional(v.number()),
    resultLimit: v.optional(v.number()),
  },
  returns: v.array(testimonyVectorHitValidator),
  handler: async (ctx, args) => {
    const terms = args.terms.map((term) => term.trim()).filter(Boolean).slice(0, 3);
    const vectorLimit = args.vectorSearchLimit ?? 15;
    const textLimit = args.textSearchLimit ?? 15;
    const resultLimit = args.resultLimit ?? 3;

    const scores = new Map<Id<"testimonySources">, number>();

    for (const term of terms) {
      if (hasCohereApiKey) {
        const { embedding } = await embed({
          model: testimonyEmbeddingModel,
          value: term,
        });
        const vectorHits = await ctx.vectorSearch("testimonyEmbeddings", "by_embedding", {
          vector: embedding,
          limit: vectorLimit,
        });

        for (let i = 0; i < vectorHits.length; i++) {
          const hit = vectorHits[i];
          const embeddingDoc = await ctx.runQuery(
            internal.search.getTestimonyEmbeddingSourceId,
            { embeddingId: hit._id }
          );
          if (!embeddingDoc) continue;
          const existing = scores.get(embeddingDoc.sourceId) ?? 0;
          scores.set(embeddingDoc.sourceId, existing + rrfScore(i));
        }
      }

      const textHits = await ctx.runQuery(internal.search.textSearchTestimonyEmbeddings, {
        term,
        limit: textLimit,
      });
      for (let i = 0; i < textHits.length; i++) {
        const hit = textHits[i];
        const existing = scores.get(hit.sourceId) ?? 0;
        scores.set(hit.sourceId, existing + rrfScore(i));
      }
    }

    return Array.from(scores.entries())
      .map(([sourceId, score]) => ({ sourceId, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, resultLimit);
  },
});

export const getLexiconEmbeddingSourceId = internalQuery({
  args: {
    embeddingId: v.id("lexiconEmbeddings"),
  },
  returns: v.union(
    v.object({
      sourceId: v.id("lexiconSources"),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.embeddingId);
    if (!doc) return null;
    return { sourceId: doc.sourceId };
  },
});

export const getTestimonyEmbeddingSourceId = internalQuery({
  args: {
    embeddingId: v.id("testimonyEmbeddings"),
  },
  returns: v.union(
    v.object({
      sourceId: v.id("testimonySources"),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.embeddingId);
    if (!doc) return null;
    return { sourceId: doc.testimonyId };
  },
});

export const searchLexiconAction = action({
  args: {
    terms: v.array(v.string()),
  },
  returns: v.object({
    entries: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
        citation: v.string(),
        filename: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
        txtUrl: v.optional(v.string()),
        redirectUrl: v.optional(v.string()),
        relevanceScore: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const hits: Array<{ sourceId: Id<"lexiconSources">; score: number }> =
      await ctx.runAction(internal.search.hybridSearchLexicon, {
      terms: args.terms,
    });
    const ids: Array<Id<"lexiconSources">> = hits.map(
      (hit: { sourceId: Id<"lexiconSources">; score: number }) => hit.sourceId
    );
    const docs: Array<{
      _id: Id<"lexiconSources">;
      sourceId: string;
      filename?: string;
      title?: string;
      content: string;
      pdfFile?: string;
      pdfUrl?: string;
      txtUrl?: string;
      redirectUrl?: string;
      createdAt: number;
      updatedAt: number;
    }> = await ctx.runQuery(internal.search.getLexiconSourcesByIds, { ids });
    const scoreById = new Map<Id<"lexiconSources">, number>(
      hits.map((hit: { sourceId: Id<"lexiconSources">; score: number }) => [
        hit.sourceId,
        hit.score,
      ])
    );
    const baseUrl = getBaseUrl();
    const entries = docs
      .map((doc: {
        _id: Id<"lexiconSources">;
        sourceId: string;
        filename?: string;
        title?: string;
        content: string;
        pdfFile?: string;
        pdfUrl?: string;
        txtUrl?: string;
        redirectUrl?: string;
        createdAt: number;
        updatedAt: number;
      }) => ({
        id: doc.sourceId,
        title: doc.title ?? `Entry ${doc.sourceId}`,
        content: doc.content,
        citation: `[${doc.title ?? `Entry ${doc.sourceId}`}](${baseUrl}/sources/lexicon/${doc.sourceId})`,
        filename: doc.filename,
        pdfUrl: doc.pdfUrl,
        txtUrl: doc.txtUrl,
        redirectUrl: doc.redirectUrl,
        relevanceScore: scoreById.get(doc._id) ?? 0,
      }))
      .sort(
        (a: { relevanceScore: number }, b: { relevanceScore: number }) =>
          b.relevanceScore - a.relevanceScore
      )
      .slice(0, 6);
    return { entries };
  },
});

export const searchTestimonyAction = action({
  args: {
    terms: v.array(v.string()),
  },
  returns: v.object({
    entries: v.array(
      v.object({
        id: v.string(),
        survivorName: v.string(),
        excerpt: v.string(),
        timeReference: v.optional(v.string()),
        location: v.optional(v.string()),
        citation: v.string(),
        filename: v.optional(v.string()),
        url: v.optional(v.string()),
        language: v.optional(v.string()),
        relevanceScore: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const hits: Array<{ sourceId: Id<"testimonySources">; score: number }> =
      await ctx.runAction(internal.search.hybridSearchTestimony, {
      terms: args.terms,
    });
    const ids: Array<Id<"testimonySources">> = hits.map(
      (hit: { sourceId: Id<"testimonySources">; score: number }) => hit.sourceId
    );
    const docs: Array<{
      _id: Id<"testimonySources">;
      sourceId: string;
      survivor_name: string;
      filename: string;
      content: string;
      testimony_language?: string;
      interviewer?: string;
      date?: string;
      location?: string;
      url?: string;
      mediaFile?: string;
      transcriptionFile?: string;
      mediaUrl?: string;
      transcriptUrl?: string;
      description?: string;
      exportDate?: string;
      createdAt: number;
      updatedAt: number;
    }> = await ctx.runQuery(internal.search.getTestimonySourcesByIds, { ids });
    const scoreById = new Map<Id<"testimonySources">, number>(
      hits.map((hit: { sourceId: Id<"testimonySources">; score: number }) => [
        hit.sourceId,
        hit.score,
      ])
    );
    const baseUrl = getBaseUrl();
    const entries = docs
      .map((doc: {
        _id: Id<"testimonySources">;
        sourceId: string;
        survivor_name: string;
        filename: string;
        content: string;
        testimony_language?: string;
        interviewer?: string;
        date?: string;
        location?: string;
        url?: string;
        mediaFile?: string;
        transcriptionFile?: string;
        mediaUrl?: string;
        transcriptUrl?: string;
        description?: string;
        exportDate?: string;
        createdAt: number;
        updatedAt: number;
      }) => ({
        id: doc.sourceId,
        survivorName: doc.survivor_name,
        excerpt: doc.content,
        timeReference: doc.date,
        location: doc.location,
        citation: `[${doc.survivor_name}](${baseUrl}/sources/testimony/${doc.sourceId})`,
        filename: doc.filename,
        url: doc.url,
        language: doc.testimony_language,
        relevanceScore: scoreById.get(doc._id) ?? 0,
      }))
      .sort(
        (a: { relevanceScore: number }, b: { relevanceScore: number }) =>
          b.relevanceScore - a.relevanceScore
      )
      .slice(0, 3);
    return { entries };
  },
});
