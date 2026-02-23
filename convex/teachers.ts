import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

function deriveDisplayNameFromEmail(email: string): string {
  const localPart = email.split("@")[0]?.trim() ?? "";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();

  if (!normalized) {
    return "Teacher";
  }

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const ensureTeacherProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.id("teachers"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if teacher profile already exists
    const existing = await ctx.db
      .query("teachers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      return existing._id;
    }

    const user = await ctx.db.get(userId);
    const providedEmail = args.email?.trim();
    const userEmail = user?.email?.trim();
    const email = providedEmail || userEmail;

    if (!email) {
      throw new Error(
        "Could not determine your account email. Please sign in again."
      );
    }

    const providedName = args.name?.trim();
    const userName = user?.name?.trim();
    const name = providedName || userName || deriveDisplayNameFromEmail(email);

    return await ctx.db.insert("teachers", {
      userId,
      name,
      email,
      createdAt: Date.now(),
    });
  },
});

export const getMyProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      email: v.string(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("teachers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
