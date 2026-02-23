import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { internal } from "./_generated/api";

// Characters excluding ambiguous ones (0/O, 1/I/l)
const JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }
  return code;
}

export const createClass = mutation({
  args: {
    name: v.string(),
    topic: v.optional(v.string()),
    activityCheckInterval: v.optional(v.number()),
    activityCheckEnabled: v.optional(v.boolean()),
  },
  returns: v.id("classes"),
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

    // Generate unique join code
    let joinCode = generateJoinCode();
    let existing = await ctx.db
      .query("classes")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", joinCode))
      .unique();
    while (existing) {
      joinCode = generateJoinCode();
      existing = await ctx.db
        .query("classes")
        .withIndex("by_joinCode", (q) => q.eq("joinCode", joinCode))
        .unique();
    }

    const classId = await ctx.db.insert("classes", {
      name: args.name,
      topic: args.topic,
      teacherId: teacher._id,
      joinCode,
      status: "active" as const,
      settings: {
        activityCheckInterval: args.activityCheckInterval ?? 300000, // 5 min default
        activityCheckEnabled: args.activityCheckEnabled ?? false,
      },
      startedAt: Date.now(),
    });

    // Schedule first activity check if enabled
    if (args.activityCheckEnabled) {
      await ctx.scheduler.runAfter(
        args.activityCheckInterval ?? 300000,
        internal.activityChecks.sendActivityCheck,
        { classId }
      );
    }

    return classId;
  },
});

export const endClass = mutation({
  args: {
    classId: v.id("classes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      throw new Error("Class not found");
    }

    // Verify ownership
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!teacher || classDoc.teacherId !== teacher._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.classId, {
      status: "ended" as const,
      endedAt: Date.now(),
    });

    // Mark all students as inactive
    const students = await ctx.db
      .query("students")
      .withIndex("by_classId_and_isActive", (q) =>
        q.eq("classId", args.classId).eq("isActive", true)
      )
      .collect();

    for (const student of students) {
      await ctx.db.patch(student._id, { isActive: false });
    }

    return null;
  },
});

export const getMyClasses = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("classes"),
      _creationTime: v.number(),
      name: v.string(),
      topic: v.optional(v.string()),
      teacherId: v.id("teachers"),
      joinCode: v.string(),
      status: v.union(v.literal("active"), v.literal("ended")),
      settings: v.object({
        activityCheckInterval: v.number(),
        activityCheckEnabled: v.boolean(),
      }),
      startedAt: v.number(),
      endedAt: v.optional(v.number()),
      studentCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!teacher) {
      return [];
    }

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_teacherId", (q) => q.eq("teacherId", teacher._id))
      .order("desc")
      .collect();

    const result = [];
    for (const cls of classes) {
      const students = await ctx.db
        .query("students")
        .withIndex("by_classId", (q) => q.eq("classId", cls._id))
        .collect();
      result.push({ ...cls, studentCount: students.length });
    }
    return result;
  },
});

export const getClassById = query({
  args: {
    classId: v.id("classes"),
  },
  returns: v.union(
    v.object({
      _id: v.id("classes"),
      _creationTime: v.number(),
      name: v.string(),
      topic: v.optional(v.string()),
      teacherId: v.id("teachers"),
      joinCode: v.optional(v.string()),
      status: v.union(v.literal("active"), v.literal("ended")),
      settings: v.object({
        activityCheckInterval: v.number(),
        activityCheckEnabled: v.boolean(),
      }),
      startedAt: v.number(),
      endedAt: v.optional(v.number()),
      studentCount: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      return null;
    }

    const students = await ctx.db
      .query("students")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))
      .collect();

    const userId = await auth.getUserId(ctx);
    let joinCode: string | undefined;

    if (userId) {
      const teacher = await ctx.db
        .query("teachers")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (teacher && classDoc.teacherId === teacher._id) {
        joinCode = classDoc.joinCode;
      }
    }

    return { ...classDoc, joinCode, studentCount: students.length };
  },
});

export const getClassByJoinCode = query({
  args: {
    joinCode: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("classes"),
      _creationTime: v.number(),
      name: v.string(),
      topic: v.optional(v.string()),
      teacherId: v.id("teachers"),
      joinCode: v.string(),
      status: v.union(v.literal("active"), v.literal("ended")),
      settings: v.object({
        activityCheckInterval: v.number(),
        activityCheckEnabled: v.boolean(),
      }),
      startedAt: v.number(),
      endedAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const classDoc = await ctx.db
      .query("classes")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode.toUpperCase()))
      .unique();

    if (!classDoc || classDoc.status !== "active") {
      return null;
    }

    return classDoc;
  },
});
