import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { auth } from "./auth";
import { appRateLimiter, rateLimitName } from "./rateLimits";

function normalizeAnonymousSessionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 128);
}

export const searchLexiconForMcp = action({
  args: {
    terms: v.array(v.string()),
    ip: v.optional(v.string()),
    clientSessionId: v.optional(v.string()),
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
      })
    ),
    formattedText: v.string(),
    nextSteps: v.string(),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
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
    error?: string;
  }> => {
    const userId = await auth.getUserId(ctx);
    const ownerType = userId ? "user" : "anonymous";
    const ownerIdOrAnonId =
      userId ?? normalizeAnonymousSessionId(args.clientSessionId) ?? "anon";
    const key = userId ?? ownerIdOrAnonId;

    const limit = await appRateLimiter.limit(
      ctx,
      rateLimitName("mcp", ownerType),
      { key }
    );

    await ctx.runMutation(internal.rateLimits.recordRateAudit, {
      ownerType,
      ownerIdOrAnonId: key,
      channel: "mcp",
      allowed: limit.ok,
      retryAfter: limit.retryAfter ? Number(limit.retryAfter) : undefined,
    });

    if (!limit.ok) {
      throw new Error(
        `rate_limit:${Number(limit.retryAfter ?? Date.now() + 60_000)}`
      );
    }

    return await ctx.runAction(api.tools.lexiconToolAction, { terms: args.terms });
  },
});
