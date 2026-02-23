import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAllLexiconEntries = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
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
    const docs = await ctx.db.query("lexiconSources").collect();
    const sorted = docs.sort((a, b) => {
      const aTitle = (a.title ?? "").toLowerCase();
      const bTitle = (b.title ?? "").toLowerCase();
      return aTitle.localeCompare(bTitle);
    });
    const selected = args.limit ? sorted.slice(0, args.limit) : sorted;
    return selected.map((doc) => ({
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
    }));
  },
});

export const getLexiconEntryBySourceId = query({
  args: { sourceId: v.string() },
  returns: v.union(
    v.object({
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("lexiconSources")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
      .unique();
    if (!doc) return null;
    return {
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
    };
  },
});

export const getAllTestimonies = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
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
    const docs = await ctx.db.query("testimonySources").collect();
    const sorted = docs.sort((a, b) => a.survivor_name.localeCompare(b.survivor_name));
    const selected = args.limit ? sorted.slice(0, args.limit) : sorted;
    return selected.map((doc) => ({
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
    }));
  },
});

export const getTestimonyBySourceId = query({
  args: { sourceId: v.string() },
  returns: v.union(
    v.object({
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("testimonySources")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
      .unique();
    if (!doc) return null;
    return {
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
    };
  },
});
