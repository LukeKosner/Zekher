import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertLexiconSource = mutation({
  args: {
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
  },
  returns: v.id("lexiconSources"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("lexiconSources")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("lexiconSources", args);
  },
});

export const upsertLexiconEmbedding = mutation({
  args: {
    sourceId: v.string(),
    content: v.string(),
    embedding: v.array(v.float64()),
    createdAt: v.number(),
  },
  returns: v.id("lexiconEmbeddings"),
  handler: async (ctx, args) => {
    const source = await ctx.db
      .query("lexiconSources")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
      .unique();
    if (!source) {
      throw new Error(`Lexicon source not found for ${args.sourceId}`);
    }

    const existing = await ctx.db
      .query("lexiconEmbeddings")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", source._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        embedding: args.embedding,
        createdAt: args.createdAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("lexiconEmbeddings", {
      sourceId: source._id,
      content: args.content,
      embedding: args.embedding,
      createdAt: args.createdAt,
    });
  },
});

export const upsertTestimonySource = mutation({
  args: {
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
  },
  returns: v.id("testimonySources"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("testimonySources")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("testimonySources", args);
  },
});

export const upsertTestimonyEmbedding = mutation({
  args: {
    sourceId: v.string(),
    content: v.string(),
    embedding: v.array(v.float64()),
    createdAt: v.number(),
  },
  returns: v.id("testimonyEmbeddings"),
  handler: async (ctx, args) => {
    const source = await ctx.db
      .query("testimonySources")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
      .unique();
    if (!source) {
      throw new Error(`Testimony source not found for ${args.sourceId}`);
    }

    const existing = await ctx.db
      .query("testimonyEmbeddings")
      .withIndex("by_testimonyId", (q) => q.eq("testimonyId", source._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        embedding: args.embedding,
        createdAt: args.createdAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("testimonyEmbeddings", {
      testimonyId: source._id,
      content: args.content,
      embedding: args.embedding,
      createdAt: args.createdAt,
    });
  },
});

export const getCorpusCounts = query({
  args: {},
  returns: v.object({
    lexiconSources: v.number(),
    lexiconEmbeddings: v.number(),
    testimonySources: v.number(),
    testimonyEmbeddings: v.number(),
  }),
  handler: async (ctx) => {
    const [lexiconSources, lexiconEmbeddings, testimonySources, testimonyEmbeddings] =
      await Promise.all([
        ctx.db.query("lexiconSources").collect(),
        ctx.db.query("lexiconEmbeddings").collect(),
        ctx.db.query("testimonySources").collect(),
        ctx.db.query("testimonyEmbeddings").collect(),
      ]);
    return {
      lexiconSources: lexiconSources.length,
      lexiconEmbeddings: lexiconEmbeddings.length,
      testimonySources: testimonySources.length,
      testimonyEmbeddings: testimonyEmbeddings.length,
    };
  },
});
