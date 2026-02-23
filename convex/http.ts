import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import type { Id } from "./_generated/dataModel";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  stepCountIs,
  streamText,
} from "ai";
import { appRateLimiter, rateLimitName } from "./rateLimits";
import {
  assertChatModelCredentials,
  buildAssistantParts,
  buildChatTools,
  chatLanguageModel,
  extractLatestUserText,
  googleProviderOptions,
  holocaustEducatorPrompt,
  normalizeUiMessages,
} from "./chat";

const http = httpRouter();

auth.addHttpRoutes(http);

function isRateLimitError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("rate_limit:") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes(" 429")
  );
}

function normalizeAnonymousSessionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 128);
}

http.route({
  path: "/chat",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json().catch(() => null);
      if (!body || !Array.isArray(body?.messages)) {
        return new Response(
          JSON.stringify({
            error: "Invalid request",
            message: "messages must be an array",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      assertChatModelCredentials();
      const messages = normalizeUiMessages(body.messages as any[]);

      const userId = await auth.getUserId(ctx);
      const ownerType = userId ? "user" : "anonymous";
      const ownerIdOrAnonId =
        userId ?? normalizeAnonymousSessionId(body.clientSessionId) ?? "anon";
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
        return new Response(
          JSON.stringify({
            error: "Rate limited",
            message: `rate_limit:${Number(limit.retryAfter ?? Date.now() + 60_000)}`,
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const threadId =
        typeof body.threadId === "string"
          ? (body.threadId as Id<"chatThreads">)
          : undefined;
      const thread = await ctx.runMutation(internal.chat.getOrCreateThreadForOwner, {
        threadId,
        ownerType,
        ownerIdOrAnonId,
      });

      const latestUserText = extractLatestUserText(messages);
      if (latestUserText.trim().length > 0) {
        await ctx.runMutation(internal.chat.appendThreadMessage, {
          threadId: thread.threadId,
          role: "user",
          content: latestUserText,
          parts: [{ type: "text", text: latestUserText }],
        });
      }

      const toolCallTracker = new Set<string>();
      const generation = streamText({
        model: chatLanguageModel,
        system: holocaustEducatorPrompt,
        messages: convertToModelMessages(messages as any),
        stopWhen: stepCountIs(4),
        temperature: 0,
        providerOptions: googleProviderOptions as any,
        tools: buildChatTools(ctx as any, toolCallTracker),
        onFinish: async ({ text, steps }) => {
          const assistantParts = buildAssistantParts(text, (steps ?? []) as any);
          await ctx.runMutation(internal.chat.appendThreadMessage, {
            threadId: thread.threadId,
            role: "assistant",
            content: text,
            parts: assistantParts,
          });
        },
      });

      const stream = createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({
            type: "data-thread" as any,
            id: `thread-${thread.threadId}`,
            data: { threadId: thread.threadId },
          });
          writer.merge(generation.toUIMessageStream());
        },
      });

      return createUIMessageStreamResponse({ stream });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to process chat";
      const isRateLimit = isRateLimitError(message);
      return new Response(
        JSON.stringify({
          error: isRateLimit ? "Rate limited" : "Chat failed",
          message,
        }),
        {
          status: isRateLimit ? 429 : 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
