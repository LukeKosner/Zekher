import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

function createSlug(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

function normalizeAnonymousSessionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 128);
}

async function assertThreadAccessAndMaybePromoteOwner(
  ctx: any,
  thread: {
    _id: any;
    ownerType: "user" | "anonymous";
    ownerIdOrAnonId: string;
  },
  args: { clientSessionId?: string; ip?: string },
  options?: { allowOwnershipPromotion?: boolean }
) {
  const userId = await auth.getUserId(ctx);
  const anonymousOwnerId =
    normalizeAnonymousSessionId(args.clientSessionId) ?? "anon";
  const actorId = userId ?? anonymousOwnerId;

  const userOwnsThread =
    !!userId &&
    thread.ownerType === "user" &&
    thread.ownerIdOrAnonId === userId;
  const anonymousSessionOwnsThread =
    thread.ownerType === "anonymous" &&
    thread.ownerIdOrAnonId === anonymousOwnerId;

  if (!userOwnsThread && !anonymousSessionOwnsThread) {
    throw new Error("Not authorized");
  }

  // If the same browser session signs in, transfer thread ownership so
  // subsequent chat/share actions stay on the same thread.
  if (
    options?.allowOwnershipPromotion !== false &&
    userId &&
    anonymousSessionOwnsThread &&
    anonymousOwnerId !== "anon"
  ) {
    await ctx.db.patch(thread._id as any, {
      ownerType: "user",
      ownerIdOrAnonId: userId,
      updatedAt: Date.now(),
    });
  }

  return { actorId };
}

export const createShare = mutation({
  args: {
    threadId: v.id("chatThreads"),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.object({
    shareId: v.id("chatShares"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    const { actorId } = await assertThreadAccessAndMaybePromoteOwner(
      ctx,
      thread,
      args
    );

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_threadId_and_createdAt", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    let slug = createSlug();
    let existing = await ctx.db
      .query("chatShares")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    while (existing) {
      slug = createSlug();
      existing = await ctx.db
        .query("chatShares")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
    }

    const payload = messages.map((message) => ({
      role: message.role,
      content: message.content,
      parts: message.parts,
      createdAt: message.createdAt,
    }));

    const shareId = await ctx.db.insert("chatShares", {
      slug,
      threadId: args.threadId,
      snapshotAtMessageCount: payload.length,
      payload,
      status: "active",
      expiresAt: undefined,
      createdBy: actorId,
      createdAt: Date.now(),
    });

    return { shareId, slug };
  },
});

export const revokeShare = mutation({
  args: {
    shareId: v.id("chatShares"),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId);
    if (!share) {
      throw new Error("Share not found");
    }

    const thread = await ctx.db.get(share.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    await assertThreadAccessAndMaybePromoteOwner(ctx, thread, args);

    await ctx.db.patch(args.shareId, { status: "revoked" });
    return null;
  },
});

export const getMyActiveShareForThread = query({
  args: {
    threadId: v.id("chatThreads"),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      shareId: v.id("chatShares"),
      slug: v.string(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return null;

    try {
      await assertThreadAccessAndMaybePromoteOwner(ctx, thread, args, {
        allowOwnershipPromotion: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message === "Not authorized") {
        return null;
      }
      throw error;
    }

    const shares = await ctx.db
      .query("chatShares")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .collect();

    const activeShare = shares.find((share) => share.status === "active");
    if (!activeShare) {
      return null;
    }

    return {
      shareId: activeShare._id,
      slug: activeShare.slug,
      createdAt: activeShare.createdAt,
    };
  },
});

export const canManageSharesForThread = query({
  args: {
    threadId: v.id("chatThreads"),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return false;

    try {
      await assertThreadAccessAndMaybePromoteOwner(ctx, thread, args, {
        allowOwnershipPromotion: false,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message === "Not authorized") {
        return false;
      }
      throw error;
    }
  },
});

export const revokeSharesForThread = mutation({
  args: {
    threadId: v.id("chatThreads"),
    clientSessionId: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  returns: v.object({
    revokedCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    await assertThreadAccessAndMaybePromoteOwner(ctx, thread, args);

    const shares = await ctx.db
      .query("chatShares")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    let revokedCount = 0;
    for (const share of shares) {
      if (share.status !== "active") continue;
      await ctx.db.patch(share._id, { status: "revoked" });
      revokedCount += 1;
    }

    return { revokedCount };
  },
});

export const getShareBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      slug: v.string(),
      threadId: v.id("chatThreads"),
      snapshotAtMessageCount: v.number(),
      payload: v.array(
        v.object({
          role: v.union(
            v.literal("user"),
            v.literal("assistant"),
            v.literal("system")
          ),
          content: v.string(),
          parts: v.array(v.any()),
          createdAt: v.number(),
        })
      ),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("chatShares")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!share) return null;
    if (share.status !== "active") return null;
    if (share.expiresAt && share.expiresAt < Date.now()) return null;
    return {
      slug: share.slug,
      threadId: share.threadId,
      snapshotAtMessageCount: share.snapshotAtMessageCount,
      payload: share.payload,
      createdAt: share.createdAt,
    };
  },
});
