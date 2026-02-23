import { action, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";

const nextStepsInstructions = {
  lexicon:
    "Provide your answer using multiple sources from this historical data. CRITICAL: You MUST use the 'citation' field from each entry for all citations - do NOT use pdfUrl, txtUrl, or any other URL fields. Copy the citation markdown format [Title](url) EXACTLY as provided in the citation field. Then ask if the user would like to hear survivor accounts.",
  testimony: "Now use showUsersAudio to present relevant audio segments from these testimonies.",
  audio: "Audio segments ready for playback.",
  noResults: "Try different search terms.",
} as const;

const errorMessages = {
  noTerms: "No search terms provided",
  noResults:
    "No results found. Tell the user to try a different query. Do not use background knowledge to answer a question.",
  systemError: "An error occurred while searching.",
} as const;

function toAudioFilename(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + ".mp3"
  );
}

export const getTestimonyBySourceId = internalQuery({
  args: { sourceId: v.string() },
  returns: v.union(
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
    };
  },
});

export const lexiconToolAction = action({
  args: {
    terms: v.array(v.string()),
  },
  returns: v.object({
    error: v.optional(v.string()),
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
      })
    ),
    formattedText: v.string(),
    nextSteps: v.string(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    error?: string;
    entries: Array<{
      id: string;
      title: string;
      content: string;
      citation: string;
      filename?: string;
      pdfUrl?: string;
      txtUrl?: string;
      redirectUrl?: string;
    }>;
    formattedText: string;
    nextSteps: string;
  }> => {
    if (!args.terms.length) {
      return {
        error: errorMessages.noTerms,
        entries: [],
        formattedText: errorMessages.noTerms,
        nextSteps: nextStepsInstructions.noResults,
      };
    }

    try {
      const result = await ctx.runAction(api.search.searchLexiconAction, {
        terms: args.terms,
      });
      const entries = result.entries.map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        citation: entry.citation,
        filename: entry.filename,
        pdfUrl: entry.pdfUrl,
        txtUrl: entry.txtUrl,
        redirectUrl: entry.redirectUrl,
      }));

      const formattedText = entries
        .map((entry: any) => `**${entry.title}**\n${entry.content}`)
        .join("\n\n");

      return {
        entries,
        formattedText,
        nextSteps: nextStepsInstructions.lexicon,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : errorMessages.systemError,
        entries: [],
        formattedText: errorMessages.systemError,
        nextSteps: nextStepsInstructions.noResults,
      };
    }
  },
});

export const testimonyToolAction = action({
  args: {
    terms: v.array(v.string()),
  },
  returns: v.object({
    error: v.optional(v.string()),
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
      })
    ),
    formattedText: v.string(),
    nextSteps: v.string(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    error?: string;
    entries: Array<{
      id: string;
      survivorName: string;
      excerpt: string;
      timeReference?: string;
      location?: string;
      citation: string;
      filename?: string;
      url?: string;
      language?: string;
    }>;
    formattedText: string;
    nextSteps: string;
  }> => {
    if (!args.terms.length) {
      return {
        error: errorMessages.noTerms,
        entries: [],
        formattedText: errorMessages.noTerms,
        nextSteps: nextStepsInstructions.noResults,
      };
    }

    try {
      const result = await ctx.runAction(api.search.searchTestimonyAction, {
        terms: args.terms,
      });
      const entries = result.entries.map((entry: any) => ({
        id: entry.id,
        survivorName: entry.survivorName,
        excerpt: entry.excerpt,
        timeReference: entry.timeReference,
        location: entry.location,
        citation: entry.citation,
        filename: entry.filename,
        url: entry.url,
        language: entry.language,
      }));
      const formattedText = entries
        .map((entry: any) => `**${entry.survivorName}**\n${entry.excerpt}`)
        .join("\n\n");
      return {
        entries,
        formattedText,
        nextSteps: nextStepsInstructions.testimony,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : errorMessages.systemError,
        entries: [],
        formattedText: errorMessages.systemError,
        nextSteps: nextStepsInstructions.noResults,
      };
    }
  },
});

export const audioToolAction = action({
  args: {
    segments: v.array(
      v.object({
        testimonyId: v.string(),
        speakerName: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        transcriptExcerpt: v.string(),
        language: v.optional(v.string()),
        significance: v.string(),
      })
    ),
  },
  returns: v.object({
    type: v.literal("audio_segments"),
    segments: v.array(
      v.object({
        testimonyId: v.string(),
        speakerName: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        transcriptExcerpt: v.string(),
        language: v.optional(v.string()),
        significance: v.string(),
        audioFile: v.string(),
        url: v.optional(v.string()),
      })
    ),
    message: v.string(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    type: "audio_segments";
    segments: Array<{
      testimonyId: string;
      speakerName: string;
      startTime: number;
      endTime: number;
      transcriptExcerpt: string;
      language?: string;
      significance: string;
      audioFile: string;
      url?: string;
    }>;
    message: string;
  }> => {
    const segments: Array<{
      testimonyId: string;
      speakerName: string;
      startTime: number;
      endTime: number;
      transcriptExcerpt: string;
      language?: string;
      significance: string;
      audioFile: string;
      url?: string;
    }> = [];
    for (const segment of args.segments.slice(0, 3)) {
      let testimony:
        | {
            _id: string;
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
          }
        | null = null;
      try {
        testimony = await ctx.runQuery(internal.tools.getTestimonyBySourceId, {
          sourceId: segment.testimonyId,
        });
      } catch {
        testimony = null;
      }
      const speakerName = segment.speakerName.trim() || testimony?.survivor_name || "Survivor";
      const startTime = Number.isFinite(segment.startTime)
        ? Math.max(0, segment.startTime)
        : 0;
      const endTime = Number.isFinite(segment.endTime) && segment.endTime > startTime
        ? segment.endTime
        : startTime + 30;
      const transcriptExcerpt = segment.transcriptExcerpt.trim();
      const significance = segment.significance.trim();
      if (!transcriptExcerpt || !significance) {
        continue;
      }
      const audioFile =
        testimony?.mediaUrl ??
        `https://storage.googleapis.com/zekher-storage/audio/${toAudioFilename(speakerName)}`;
      segments.push({
        testimonyId: segment.testimonyId,
        speakerName,
        startTime,
        endTime,
        transcriptExcerpt,
        language: segment.language ?? testimony?.testimony_language,
        significance,
        audioFile,
        url: testimony?.url,
      });
    }

    return {
      type: "audio_segments",
      segments,
      message: nextStepsInstructions.audio,
    };
  },
});
