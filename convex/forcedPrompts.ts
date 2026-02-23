import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const sendForcedPrompt = mutation({
  args: {
    classId: v.id("classes"),
    promptText: v.string(),
    promptType: v.optional(
      v.union(
        v.literal("forced"),
        v.literal("suggested"),
        v.literal("assignment")
      )
    ),
  },
  returns: v.id("forcedPrompts"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!teacher) {
      throw new Error("Teacher profile not found");
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc || classDoc.teacherId !== teacher._id) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("forcedPrompts", {
      classId: args.classId,
      teacherId: teacher._id,
      promptText: args.promptText,
      promptType: args.promptType ?? "forced",
      sentAt: Date.now(),
    });
  },
});

export const ackForcedPrompt = mutation({
  args: {
    promptId: v.id("forcedPrompts"),
    studentId: v.id("students"),
    sessionToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student || student.sessionToken !== args.sessionToken) {
      throw new Error("Invalid student or token");
    }

    // Check if already acked
    const existing = await ctx.db
      .query("forcedPromptAcks")
      .withIndex("by_studentId_and_promptId", (q) =>
        q.eq("studentId", args.studentId).eq("promptId", args.promptId)
      )
      .unique();

    if (existing) {
      return null;
    }

    await ctx.db.insert("forcedPromptAcks", {
      promptId: args.promptId,
      studentId: args.studentId,
      ackedAt: Date.now(),
    });

    return null;
  },
});

export const getUnackedPrompts = query({
  args: {
    classId: v.id("classes"),
    studentId: v.id("students"),
  },
  returns: v.array(
    v.object({
      _id: v.id("forcedPrompts"),
      _creationTime: v.number(),
      classId: v.id("classes"),
      teacherId: v.id("teachers"),
      promptText: v.string(),
      promptType: v.optional(
        v.union(
          v.literal("forced"),
          v.literal("suggested"),
          v.literal("assignment")
        )
      ),
      sentAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const prompts = await ctx.db
      .query("forcedPrompts")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))
      .order("desc")
      .collect();

    const unacked = [];
    for (const prompt of prompts) {
      const ack = await ctx.db
        .query("forcedPromptAcks")
        .withIndex("by_studentId_and_promptId", (q) =>
          q.eq("studentId", args.studentId).eq("promptId", prompt._id)
        )
        .unique();

      if (!ack) {
        unacked.push(prompt);
      }
    }

    return unacked;
  },
});

export const getPromptAckStatus = query({
  args: {
    promptId: v.id("forcedPrompts"),
  },
  returns: v.array(
    v.object({
      _id: v.id("forcedPromptAcks"),
      _creationTime: v.number(),
      promptId: v.id("forcedPrompts"),
      studentId: v.id("students"),
      ackedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forcedPromptAcks")
      .withIndex("by_promptId", (q) => q.eq("promptId", args.promptId))
      .collect();
  },
});
