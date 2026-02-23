import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

const ACTIVE_WINDOW_MS = 45_000;

export const joinClass = mutation({
  args: {
    classId: v.id("classes"),
    displayName: v.string(),
    sessionToken: v.string(),
  },
  returns: v.id("students"),
  handler: async (ctx, args) => {
    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc || classDoc.status !== "active") {
      throw new Error("Class not found or not active");
    }

    // Check if student already exists with this token in this class
    const existing = await ctx.db
      .query("students")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();
    const existingInClass = existing.find((s) => s.classId === args.classId);

    if (existingInClass) {
      if (existingInClass.kickedAt) {
        throw new Error("You were removed from this class by your teacher.");
      }

      // Re-activate if returning
      await ctx.db.patch(existingInClass._id, {
        isActive: true,
        lastSeenAt: Date.now(),
      });
      return existingInClass._id;
    }

    return await ctx.db.insert("students", {
      displayName: args.displayName,
      classId: args.classId,
      sessionToken: args.sessionToken,
      isActive: true,
      lastSeenAt: Date.now(),
      joinedAt: Date.now(),
    });
  },
});

export const updateLastSeen = mutation({
  args: {
    studentId: v.id("students"),
    sessionToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student || student.sessionToken !== args.sessionToken) {
      throw new Error("Invalid student or token");
    }
    if (student.kickedAt) {
      throw new Error("You were removed from this class.");
    }

    await ctx.db.patch(args.studentId, {
      isActive: true,
      lastSeenAt: Date.now(),
    });
    return null;
  },
});

export const leaveClass = mutation({
  args: {
    studentId: v.id("students"),
    sessionToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student || student.sessionToken !== args.sessionToken) {
      throw new Error("Invalid student or token");
    }

    await ctx.db.patch(args.studentId, { isActive: false });
    return null;
  },
});

export const kickStudent = mutation({
  args: {
    classId: v.id("classes"),
    studentId: v.id("students"),
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

    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!teacher || classDoc.teacherId !== teacher._id) {
      throw new Error("Not authorized");
    }

    const student = await ctx.db.get(args.studentId);
    if (!student || student.classId !== args.classId) {
      throw new Error("Student not found in this class");
    }

    await ctx.db.patch(args.studentId, {
      isActive: false,
      kickedAt: Date.now(),
      lastSeenAt: Date.now(),
    });

    return null;
  },
});

export const getStudentByToken = query({
  args: {
    sessionToken: v.string(),
    classId: v.id("classes"),
  },
  returns: v.union(
    v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      displayName: v.string(),
      classId: v.id("classes"),
      sessionToken: v.string(),
      isActive: v.boolean(),
      lastSeenAt: v.number(),
      joinedAt: v.number(),
      kickedAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const students = await ctx.db
      .query("students")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();

    const student = students.find((s) => s.classId === args.classId) ?? null;
    if (!student) return null;

    const isRecentlySeen = Date.now() - student.lastSeenAt < ACTIVE_WINDOW_MS;
    return {
      ...student,
      isActive:
        student.isActive && isRecentlySeen && !Boolean(student.kickedAt),
    };
  },
});

export const getStudentsInClass = query({
  args: {
    classId: v.id("classes"),
  },
  returns: v.array(
    v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      displayName: v.string(),
      classId: v.id("classes"),
      isActive: v.boolean(),
      lastSeenAt: v.number(),
      joinedAt: v.number(),
      kickedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      throw new Error("Class not found");
    }

    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!teacher || classDoc.teacherId !== teacher._id) {
      throw new Error("Not authorized");
    }

    const students = await ctx.db
      .query("students")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))
      .collect();

    const now = Date.now();
    return students.map((student) => {
      const isActive =
        student.isActive &&
        now - student.lastSeenAt < ACTIVE_WINDOW_MS &&
        !Boolean(student.kickedAt);

      return {
        _id: student._id,
        _creationTime: student._creationTime,
        displayName: student.displayName,
        classId: student.classId,
        isActive,
        lastSeenAt: student.lastSeenAt,
        joinedAt: student.joinedAt,
        kickedAt: student.kickedAt,
      };
    });
  },
});
