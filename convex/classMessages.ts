import { query, mutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import type { Id } from "./_generated/dataModel";

async function assertTeacherOwnsClass(
  ctx: QueryCtx | MutationCtx,
  classId: Id<"classes">
): Promise<void> {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const classDoc = await ctx.db.get(classId);
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
}

async function assertStudentSessionForClass(
  ctx: QueryCtx | MutationCtx,
  args: {
    studentId: Id<"students">;
    classId: Id<"classes">;
    sessionToken: string;
  }
): Promise<void> {
  const student = await ctx.db.get(args.studentId);
  if (!student || student.sessionToken !== args.sessionToken) {
    throw new Error("Invalid student or token");
  }
  if (student.classId !== args.classId) {
    throw new Error("Student not in this class");
  }
  if (student.kickedAt) {
    throw new Error("Student has been removed from this class");
  }
}

export const mirrorMessage = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    sessionToken: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  returns: v.id("classMessages"),
  handler: async (ctx, args) => {
    // Validate session token matches student
    const student = await ctx.db.get(args.studentId);
    if (!student || student.sessionToken !== args.sessionToken) {
      throw new Error("Invalid student or token");
    }
    if (student.kickedAt) {
      throw new Error("Student has been removed from this class");
    }
    if (student.classId !== args.classId) {
      throw new Error("Student not in this class");
    }

    return await ctx.db.insert("classMessages", {
      studentId: args.studentId,
      classId: args.classId,
      role: args.role,
      content: args.content,
      sentAt: Date.now(),
    });
  },
});

export const getMessagesForClass = query({
  args: {
    classId: v.id("classes"),
  },
  returns: v.array(
    v.object({
      _id: v.id("classMessages"),
      _creationTime: v.number(),
      studentId: v.id("students"),
      classId: v.id("classes"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      sentAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    await assertTeacherOwnsClass(ctx, args.classId);

    return await ctx.db
      .query("classMessages")
      .withIndex("by_classId_and_sentAt", (q) => q.eq("classId", args.classId))
      .order("asc")
      .collect();
  },
});

export const getMessagesForStudent = query({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    sessionToken: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("classMessages"),
      _creationTime: v.number(),
      studentId: v.id("students"),
      classId: v.id("classes"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      sentAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    await assertStudentSessionForClass(ctx, args);

    return await ctx.db
      .query("classMessages")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .order("asc")
      .collect();
  },
});

export const getRecentActivity = query({
  args: {
    classId: v.id("classes"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("classMessages"),
      _creationTime: v.number(),
      studentId: v.id("students"),
      classId: v.id("classes"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      sentAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    await assertTeacherOwnsClass(ctx, args.classId);

    return await ctx.db
      .query("classMessages")
      .withIndex("by_classId_and_sentAt", (q) => q.eq("classId", args.classId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});
