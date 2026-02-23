import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { internalMutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { auth } from "./auth";

export type RateLimitChannel = "chat" | "mcp";
export type RateLimitOwnerType = "user" | "anonymous";
export const CHAT_ANONYMOUS_LIMIT = 10;

export const appRateLimiter = new RateLimiter(components.rateLimiter, {
  chatAnonymous: { kind: "fixed window", rate: CHAT_ANONYMOUS_LIMIT, period: HOUR },
  mcpAnonymous: { kind: "fixed window", rate: 10, period: HOUR },
  chatUser: { kind: "fixed window", rate: 120, period: HOUR },
  mcpUser: { kind: "fixed window", rate: 120, period: HOUR },
});

export function rateLimitName(
  channel: RateLimitChannel,
  ownerType: RateLimitOwnerType
) {
  if (channel === "chat" && ownerType === "anonymous") {
    return "chatAnonymous" as const;
  }
  if (channel === "mcp" && ownerType === "anonymous") {
    return "mcpAnonymous" as const;
  }
  if (channel === "chat" && ownerType === "user") {
    return "chatUser" as const;
  }
  return "mcpUser" as const;
}

export const recordRateAudit = internalMutation({
  args: {
    ownerType: v.union(v.literal("user"), v.literal("anonymous")),
    ownerIdOrAnonId: v.string(),
    channel: v.union(v.literal("chat"), v.literal("mcp")),
    allowed: v.boolean(),
    retryAfter: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("chatRateAudit", {
      ownerType: args.ownerType,
      ownerIdOrAnonId: args.ownerIdOrAnonId,
      channel: args.channel,
      allowed: args.allowed,
      retryAfter: args.retryAfter,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const getAnonymousChatRateStatus = query({
  args: {
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
    refreshNonce: v.optional(v.number()),
  },
  returns: v.union(
    v.object({
      remaining: v.number(),
      limit: v.number(),
      resetAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (userId) {
      return null;
    }

    const anonymousOwnerId = args.clientSessionId ?? args.ip ?? "anon";
    const now = Date.now();
    const windowStart = now - HOUR;

    const rows = await ctx.db
      .query("chatRateAudit")
      .withIndex("by_ownerType_and_ownerIdOrAnonId", (q) =>
        q.eq("ownerType", "anonymous").eq("ownerIdOrAnonId", anonymousOwnerId)
      )
      .collect();

    const recentChatAttempts = rows
      .filter(
        (row) =>
          row.channel === "chat" && row.allowed && row.createdAt >= windowStart
      )
      .map((row) => row.createdAt);

    const used = recentChatAttempts.length;
    const remaining = Math.max(0, CHAT_ANONYMOUS_LIMIT - used);
    const oldestAttemptInWindow = recentChatAttempts.length
      ? Math.min(...recentChatAttempts)
      : now;

    return {
      remaining,
      limit: CHAT_ANONYMOUS_LIMIT,
      resetAt: oldestAttemptInWindow + HOUR,
    };
  },
});
