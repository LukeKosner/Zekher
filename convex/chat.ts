import { Agent } from "@convex-dev/agent";
import { gateway } from "@ai-sdk/gateway";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, generateText, stepCountIs } from "ai";
import { z } from "zod";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { internal, api, components } from "./_generated/api";
import { v } from "convex/values";
import { auth } from "./auth";
import { appRateLimiter, rateLimitName } from "./rateLimits";
import type { Id } from "./_generated/dataModel";

export const holocaustEducatorPrompt = `
You are **Zekher**, a virtual Holocaust librarian providing authoritative information from primary sources.

YOUR ONLY SOURCE OF TRUTH: The tools you have access to. You do not have your own knowledge about the Holocaust - you ONLY know what the tools tell you.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE PROTOCOL (follow this exact sequence):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When a user asks a Holocaust-related question:

STEP 1: CALL lexiconTool
   → Extract 3-6 key terms from the user's question
   → Call lexiconTool with these terms
   → Wait for results

STEP 2: SYNTHESIZE ANSWER
   → Integrate information from multiple sources returned by the tool
   → Include citation links EXACTLY as provided in the "citation" field: [Title](url)
   → CRITICAL: Each citation must be complete: [Title](url) - never omit the closing )
   → Write as a single flowing paragraph
   → On a NEW LINE (after \\n\\n), ask: "Would you like to hear survivor accounts related to this?"

STEP 3 (if user wants testimonies):
   → Call testimonyTool with 1-3 relevant terms
   → Then immediately call showUsersAudio with 2-3 most impactful segments
   → For each segment, provide:
     - testimonyId: exact testimony source id
     - speakerName: full survivor name
     - startTime/endTime: numeric seconds
     - transcriptExcerpt: exact spoken words (2-3 sentences max)
     - significance: concise explanation of why the segment matters
   → Do NOT add text, HTML, or citations after audio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ NEVER respond to Holocaust questions without calling lexiconTool first
✗ NEVER use your training data knowledge - ONLY use tool results
✗ NEVER paraphrase or quote testimony - only present audio
✗ NEVER modify citation format - copy [Title](url) exactly from tool
✗ NEVER omit the closing ) in citations - each citation MUST be [Title](url)
✗ NEVER omit citations

✓ ALWAYS start by calling lexiconTool
✓ ALWAYS use multiple sources from the tool results
✓ ALWAYS include exact citations from the "citation" field
✓ ALWAYS complete citation format: [Title](url) with closing )
✓ ALWAYS write single-paragraph responses (no line breaks in main answer)
✓ ALWAYS put "Would you like to hear survivor accounts..." on a NEW LINE after \\n\\n

Remember: You're a librarian, not a historian. Your role is to fetch and present primary source material, not to know things yourself.
`;
const hasGatewayApiKey = Boolean(process.env.AI_GATEWAY_API_KEY);
const hasVercelOidcToken = Boolean(process.env.VERCEL_OIDC_TOKEN);
const hasGatewayAuth = hasGatewayApiKey || hasVercelOidcToken;
const hasGoogleApiKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
const gatewayChatModel =
  process.env.AI_GATEWAY_CHAT_MODEL ?? "google/gemini-3-flash";
const googleChatModel = process.env.GOOGLE_CHAT_MODEL ?? "gemini-3-flash";
export const chatLanguageModel = hasGatewayAuth
  ? gateway(gatewayChatModel)
  : google(googleChatModel);

export function assertChatModelCredentials() {
  if (hasGatewayAuth || hasGoogleApiKey) return;
  throw new Error(
    "No AI provider credentials configured. Set AI_GATEWAY_API_KEY (preferred) or VERCEL_OIDC_TOKEN for Gateway auth, or set GOOGLE_GENERATIVE_AI_API_KEY for direct Google provider auth."
  );
}

export const googleProviderOptions = {
  google: {
    thinkingConfig: { includeThoughts: true },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH",
      },
    ],
  },
};

const chatAgent = new Agent(components.agent, {
  name: "Zekher Agent",
  instructions: holocaustEducatorPrompt,
  languageModel: chatLanguageModel,
});

export function extractLatestUserText(messages: any[]): string {
  const reversed = [...messages].reverse();
  for (const message of reversed) {
    if (message?.role !== "user") continue;
    if (Array.isArray(message.parts)) {
      const textPart = message.parts.find((part: any) => part?.type === "text");
      if (textPart?.text && typeof textPart.text === "string") {
        return textPart.text;
      }
    }
    if (typeof message.content === "string") {
      return message.content;
    }
  }
  return "";
}

export function normalizeUiMessages(messages: any[]): any[] {
  return messages
    .filter((message) => message && typeof message === "object")
    .map((message) => {
      if (Array.isArray(message.parts)) return message;
      if (typeof message.content === "string") {
        return {
          ...message,
          parts: [{ type: "text", text: message.content }],
        };
      }
      return message;
    });
}

function normalizeAnonymousSessionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 128);
}

const lexiconSchema = z.object({
  terms: z.array(z.string()).max(6).describe("Maximum 6 lexicon search terms"),
});
const testimonySchema = z.object({
  terms: z.array(z.string()).max(3).describe("Maximum 3 testimony search terms"),
});
const rawAudioSegmentSchema = z.object({
  testimonyId: z.string().describe("The testimony source id"),
  speakerName: z.string().describe("Full name of the survivor speaking"),
  startTime: z.union([z.number(), z.string()]).describe("Start time in seconds"),
  endTime: z.union([z.number(), z.string()]).describe("End time in seconds"),
  transcriptExcerpt: z
    .string()
    .describe("Concise exact excerpt (2-3 sentences max) spoken by the survivor"),
  language: z.string().optional().describe("Original spoken language"),
  significance: z
    .string()
    .describe("Brief explanation (1-2 sentences) of why this segment matters"),
});
const audioSchema = z.object({
  segments: z
    .array(rawAudioSegmentSchema)
    .max(3)
    .describe("Maximum 3 carefully selected audio segments"),
});

type NormalizedAudioSegment = {
  testimonyId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  transcriptExcerpt: string;
  language?: string;
  significance: string;
};

function coerceAudioTime(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber)) return asNumber;
  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return undefined;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return undefined;
}

function normalizeAudioSegments(rawSegments: Array<Record<string, unknown>>) {
  const normalized: Array<NormalizedAudioSegment> = [];
  for (const raw of rawSegments.slice(0, 3)) {
    const testimonyId =
      typeof raw.testimonyId === "string" ? raw.testimonyId.trim() : "";
    const speakerName =
      typeof raw.speakerName === "string" ? raw.speakerName.trim() : "";
    const transcriptExcerpt =
      typeof raw.transcriptExcerpt === "string"
        ? raw.transcriptExcerpt.trim()
        : "";
    const significance =
      typeof raw.significance === "string" ? raw.significance.trim() : "";
    if (!testimonyId || !speakerName || !transcriptExcerpt || !significance) {
      continue;
    }
    const startTime = Math.max(0, coerceAudioTime(raw.startTime) ?? 0);
    const coercedEnd = coerceAudioTime(raw.endTime);
    const endTime =
      typeof coercedEnd === "number" && coercedEnd > startTime
        ? coercedEnd
        : startTime + 30;
    const language =
      typeof raw.language === "string" && raw.language.trim().length > 0
        ? raw.language.trim()
        : undefined;

    normalized.push({
      testimonyId,
      speakerName,
      startTime,
      endTime,
      transcriptExcerpt,
      language,
      significance,
    });
  }
  return normalized.slice(0, 3);
}

export function buildChatTools(
  ctx: { runAction: (fn: any, args: any) => Promise<any> },
  toolCallTracker: Set<string>
) {
  return {
    lexiconTool: {
      description:
        "Get authoritative historical information from Yad Vashem's Holocaust Lexicon. Use for factual/historical questions (what, when, where, who, how many, definitions). Maximum 6 search terms. Returns up to 6 Lexicon entries with next steps instructions.",
      inputSchema: lexiconSchema,
      execute: async ({ terms }: { terms: string[] }): Promise<any> => {
        const callId = `lexicon-${JSON.stringify({ terms })}`;
        if (toolCallTracker.has(callId)) {
          return {
            error: "This search was already performed in this conversation turn.",
            entries: [],
            formattedText: "Search already performed.",
            nextSteps: "Please ask a different question or refine your search terms.",
          };
        }
        toolCallTracker.add(callId);
        return await ctx.runAction(api.tools.lexiconToolAction, { terms });
      },
    },
    testimonyTool: {
      description:
        "Search Holocaust survivor testimonies for personal accounts and lived experiences. Use for questions about personal experiences, survivor stories, or individual accounts. Returns up to 3 testimonies with next steps instructions.",
      inputSchema: testimonySchema,
      execute: async ({ terms }: { terms: string[] }): Promise<any> => {
        const callId = `testimony-${JSON.stringify({ terms })}`;
        if (toolCallTracker.has(callId)) {
          return {
            error: "This search was already performed in this conversation turn.",
            entries: [],
            formattedText: "Search already performed.",
            nextSteps: "Please ask a different question or refine your search terms.",
          };
        }
        toolCallTracker.add(callId);
        return await ctx.runAction(api.tools.testimonyToolAction, { terms });
      },
    },
    showUsersAudio: {
      description: `Present the most impactful audio segment(s) from survivor testimonies. STRICT GUIDELINES:
- Select only 2-3 of the most powerful and relevant segments
- Focus on segments that directly answer the user's question
- Prioritize emotional impact and historical significance
- Keep transcriptExcerpt concise (2-3 sentences max) and exactly as spoken
- Use original language
- Do not add ellipsis; use another segment if needed
- Keep significance concise and specific`,
      inputSchema: audioSchema,
      execute: async ({ segments }: { segments: Array<Record<string, unknown>> }): Promise<any> => {
        const callId = `audio-${JSON.stringify({ segments })}`;
        if (toolCallTracker.has(callId)) {
          return {
            type: "audio_segments",
            segments: [],
            message: "Audio segments were already processed in this conversation turn.",
          };
        }
        toolCallTracker.add(callId);
        const normalizedSegments = normalizeAudioSegments(segments);
        if (normalizedSegments.length === 0) {
          return {
            type: "audio_segments",
            segments: [],
            message: "No valid audio segments were identified from this testimony search.",
          };
        }
        try {
          return await ctx.runAction(api.tools.audioToolAction, {
            segments: normalizedSegments,
          });
        } catch (error) {
          return {
            type: "audio_segments",
            segments: [],
            message:
              error instanceof Error
                ? error.message
                : "Unable to resolve testimony audio segments.",
          };
        }
      },
    },
  };
}

export function buildAssistantParts(
  text: string,
  steps: Array<{
    reasoningText?: string;
    toolCalls?: Array<{
      toolName: string;
      toolCallId: string;
      input?: unknown;
    }>;
    toolResults?: Array<{
      toolCallId: string;
      output?: unknown;
      result?: unknown;
    }>;
  }> = []
) {
  const assistantParts: Array<any> = [];
  for (const step of steps) {
    if (step.reasoningText) {
      assistantParts.push({
        type: "reasoning",
        text: step.reasoningText,
        state: "done",
      });
    }

    for (const call of step.toolCalls ?? []) {
      const corresponding = (step.toolResults ?? []).find(
        (candidate: { toolCallId: string }) => candidate.toolCallId === call.toolCallId
      );
      assistantParts.push({
        type: `tool-${call.toolName}`,
        state: corresponding ? "output-available" : "input-available",
        toolCallId: call.toolCallId,
        input: call.input,
        output: corresponding?.output ?? corresponding?.result,
      });
    }
  }

  if (text.trim().length > 0) {
    assistantParts.unshift({
      type: "text",
      text,
    });
  }

  return assistantParts;
}

export const getOrCreateThreadForOwner = internalMutation({
  args: {
    threadId: v.optional(v.id("chatThreads")),
    ownerType: v.union(v.literal("user"), v.literal("anonymous")),
    ownerIdOrAnonId: v.string(),
  },
  returns: v.object({
    threadId: v.id("chatThreads"),
    agentThreadId: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.threadId) {
      const existing = await ctx.db.get(args.threadId);
      if (
        existing &&
        existing.ownerType === args.ownerType &&
        existing.ownerIdOrAnonId === args.ownerIdOrAnonId
      ) {
        await ctx.db.patch(existing._id, { updatedAt: Date.now() });
        return { threadId: existing._id, agentThreadId: existing.agentThreadId };
      }
    }

    const created = await chatAgent.createThread(ctx, {
      userId: args.ownerIdOrAnonId,
      title: "Zekher Chat",
    });

    const threadId = await ctx.db.insert("chatThreads", {
      ownerType: args.ownerType,
      ownerIdOrAnonId: args.ownerIdOrAnonId,
      agentThreadId: created.threadId,
      title: "Zekher Chat",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      threadId,
      agentThreadId: created.threadId,
    };
  },
});

export const appendThreadMessage = internalMutation({
  args: {
    threadId: v.id("chatThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    parts: v.array(v.any()),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      parts: args.parts,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.threadId, { updatedAt: Date.now() });
    return messageId;
  },
});

export const getOrCreateThread = mutation({
  args: {
    threadId: v.optional(v.id("chatThreads")),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.id("chatThreads"),
  handler: async (ctx, args): Promise<Id<"chatThreads">> => {
    const userId = await auth.getUserId(ctx);
    const ownerType = userId ? "user" : "anonymous";
    const ownerIdOrAnonId =
      userId ?? normalizeAnonymousSessionId(args.clientSessionId) ?? "anon";
    const resolved: { threadId: Id<"chatThreads">; agentThreadId: string } =
      await ctx.runMutation(internal.chat.getOrCreateThreadForOwner, {
        threadId: args.threadId,
        ownerType,
        ownerIdOrAnonId,
      });
    return resolved.threadId;
  },
});

export const listThreads = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chatThreads"),
      ownerType: v.union(v.literal("user"), v.literal("anonymous")),
      ownerIdOrAnonId: v.string(),
      title: v.optional(v.string()),
      status: v.union(v.literal("active"), v.literal("archived")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("chatThreads")
      .withIndex("by_ownerType_and_ownerIdOrAnonId", (q) =>
        q.eq("ownerType", "user").eq("ownerIdOrAnonId", userId)
      )
      .order("desc")
      .collect();
    return rows.map((row) => ({
      _id: row._id,
      ownerType: row.ownerType,
      ownerIdOrAnonId: row.ownerIdOrAnonId,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.id("chatThreads"),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("chatMessages"),
      threadId: v.id("chatThreads"),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      parts: v.array(v.any()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return [];

    const userId = await auth.getUserId(ctx);
    const ownerIdOrAnonId =
      userId ?? normalizeAnonymousSessionId(args.clientSessionId) ?? "anon";
    const ownerType = userId ? "user" : "anonymous";
    if (
      thread.ownerType !== ownerType ||
      thread.ownerIdOrAnonId !== ownerIdOrAnonId
    ) {
      return [];
    }

    const rows = await ctx.db
      .query("chatMessages")
      .withIndex("by_threadId_and_createdAt", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
    return rows.map((row) => ({
      _id: row._id,
      threadId: row.threadId,
      role: row.role,
      content: row.content,
      parts: row.parts,
      createdAt: row.createdAt,
    }));
  },
});

export const generateReply = action({
  args: {
    messages: v.array(v.any()),
    threadId: v.optional(v.id("chatThreads")),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.id("chatThreads"),
    assistant: v.object({
      content: v.string(),
      parts: v.array(v.any()),
    }),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    threadId: Id<"chatThreads">;
    assistant: { content: string; parts: Array<any> };
  }> => {
    const userId = await auth.getUserId(ctx);
    assertChatModelCredentials();
    const ownerType = userId ? "user" : "anonymous";
    const ownerIdOrAnonId =
      userId ?? normalizeAnonymousSessionId(args.clientSessionId) ?? "anon";
    const key = userId ?? ownerIdOrAnonId;

    const limit = await appRateLimiter.limit(
      ctx,
      rateLimitName("chat", ownerType),
      { key }
    );

    await ctx.runMutation(internal.rateLimits.recordRateAudit, {
      ownerType,
      ownerIdOrAnonId: key,
      channel: "chat",
      allowed: limit.ok,
      retryAfter: limit.retryAfter ? Number(limit.retryAfter) : undefined,
    });

    if (!limit.ok) {
      throw new Error(
        `rate_limit:${Number(limit.retryAfter ?? Date.now() + 60_000)}`
      );
    }

    const thread: { threadId: Id<"chatThreads">; agentThreadId: string } =
      await ctx.runMutation(internal.chat.getOrCreateThreadForOwner, {
        threadId: args.threadId,
        ownerType,
        ownerIdOrAnonId,
      });

    const normalizedMessages = normalizeUiMessages(args.messages as any[]);
    const toolCallTracker = new Set<string>();

    const result: {
      text: string;
      steps: Array<{
        reasoningText?: string;
        toolCalls?: Array<{
          toolName: string;
          toolCallId: string;
          input?: unknown;
        }>;
        toolResults?: Array<{
          toolCallId: string;
          output?: unknown;
          result?: unknown;
        }>;
      }>;
    } = (await generateText({
      model: chatLanguageModel,
      system: holocaustEducatorPrompt,
      messages: convertToModelMessages(normalizedMessages as any),
      stopWhen: stepCountIs(4),
      temperature: 0,
      providerOptions: googleProviderOptions as any,
      tools: buildChatTools(ctx, toolCallTracker),
    })) as any;

    const assistantParts = buildAssistantParts(result.text, result.steps);

    const latestUserText = extractLatestUserText(normalizedMessages);
    if (latestUserText.trim().length > 0) {
      await ctx.runMutation(internal.chat.appendThreadMessage, {
        threadId: thread.threadId,
        role: "user",
        content: latestUserText,
        parts: [{ type: "text", text: latestUserText }],
      });
    }

    await ctx.runMutation(internal.chat.appendThreadMessage, {
      threadId: thread.threadId,
      role: "assistant",
      content: result.text,
      parts: assistantParts,
    });

    return {
      threadId: thread.threadId,
      assistant: {
        content: result.text,
        parts: assistantParts,
      },
    };
  },
});
