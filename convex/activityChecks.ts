import {
  query,
  mutation,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const ACTIVITY_QUESTIONS = [
  "What is the most important thing you've learned so far?",
  "Summarize what you've been reading about in one sentence.",
  "What question do you still have about this topic?",
  "How does what you're learning connect to what you already knew?",
  "What has surprised you most in your research?",
];

export const sendActivityCheck = internalMutation({
  args: {
    classId: v.id("classes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc || classDoc.status !== "active") {
      return null; // Class ended, stop scheduling
    }

    if (!classDoc.settings.activityCheckEnabled) {
      return null;
    }

    // Pick a random question
    const question =
      ACTIVITY_QUESTIONS[Math.floor(Math.random() * ACTIVITY_QUESTIONS.length)];

    await ctx.db.insert("activityChecks", {
      classId: args.classId,
      question,
      sentAt: Date.now(),
    });

    // Schedule next check
    await ctx.scheduler.runAfter(
      classDoc.settings.activityCheckInterval,
      internal.activityChecks.sendActivityCheck,
      { classId: args.classId }
    );

    return null;
  },
});

export const respondToCheck = mutation({
  args: {
    checkId: v.id("activityChecks"),
    studentId: v.id("students"),
    sessionToken: v.string(),
    response: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student || student.sessionToken !== args.sessionToken) {
      throw new Error("Invalid student or token");
    }

    // Check if already responded
    const existing = await ctx.db
      .query("activityResponses")
      .withIndex("by_studentId_and_checkId", (q) =>
        q.eq("studentId", args.studentId).eq("checkId", args.checkId)
      )
      .unique();

    if (existing) {
      return null; // Already responded
    }

    await ctx.db.insert("activityResponses", {
      checkId: args.checkId,
      studentId: args.studentId,
      response: args.response,
      respondedAt: Date.now(),
    });

    return null;
  },
});

export const getActiveCheck = query({
  args: {
    classId: v.id("classes"),
  },
  returns: v.union(
    v.object({
      _id: v.id("activityChecks"),
      _creationTime: v.number(),
      classId: v.id("classes"),
      question: v.string(),
      sentAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const checks = await ctx.db
      .query("activityChecks")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))
      .order("desc")
      .take(1);

    if (checks.length === 0) {
      return null;
    }

    // Only return if recent (within last 2 minutes)
    const check = checks[0];
    if (Date.now() - check.sentAt > 120000) {
      return null;
    }

    return check;
  },
});

export const getCheckResponses = query({
  args: {
    checkId: v.id("activityChecks"),
  },
  returns: v.array(
    v.object({
      _id: v.id("activityResponses"),
      _creationTime: v.number(),
      checkId: v.id("activityChecks"),
      studentId: v.id("students"),
      response: v.string(),
      respondedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityResponses")
      .withIndex("by_checkId", (q) => q.eq("checkId", args.checkId))
      .collect();
  },
});
