import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  lexiconSources: defineTable({
    sourceId: v.string(),
    filename: v.optional(v.string()),
    title: v.optional(v.string()),
    content: v.string(),
    pdfFile: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    txtUrl: v.optional(v.string()),
    redirectUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sourceId", ["sourceId"])
    .index("by_title", ["title"]),

  lexiconEmbeddings: defineTable({
    sourceId: v.id("lexiconSources"),
    content: v.string(),
    embedding: v.array(v.float64()),
    createdAt: v.number(),
  })
    .index("by_sourceId", ["sourceId"])
    .searchIndex("search_content", { searchField: "content" })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),

  testimonySources: defineTable({
    sourceId: v.string(),
    survivor_name: v.string(),
    filename: v.string(),
    content: v.string(),
    testimony_language: v.optional(v.string()),
    interviewer: v.optional(v.string()),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    url: v.optional(v.string()),
    mediaFile: v.optional(v.string()),
    transcriptionFile: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    transcriptUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    exportDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sourceId", ["sourceId"])
    .index("by_survivor_name", ["survivor_name"]),

  testimonyEmbeddings: defineTable({
    testimonyId: v.id("testimonySources"),
    content: v.string(),
    embedding: v.array(v.float64()),
    createdAt: v.number(),
  })
    .index("by_testimonyId", ["testimonyId"])
    .searchIndex("search_content", { searchField: "content" })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),

  chatThreads: defineTable({
    ownerType: v.union(v.literal("user"), v.literal("anonymous")),
    ownerIdOrAnonId: v.string(),
    agentThreadId: v.string(),
    title: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerType_and_ownerIdOrAnonId", ["ownerType", "ownerIdOrAnonId"])
    .index("by_agentThreadId", ["agentThreadId"]),

  chatMessages: defineTable({
    threadId: v.id("chatThreads"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    parts: v.array(v.any()),
    createdAt: v.number(),
  })
    .index("by_threadId", ["threadId"])
    .index("by_threadId_and_createdAt", ["threadId", "createdAt"]),

  chatShares: defineTable({
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
    status: v.union(v.literal("active"), v.literal("revoked")),
    expiresAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_threadId", ["threadId"])
    .index("by_slug", ["slug"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  chatRateAudit: defineTable({
    ownerType: v.union(v.literal("user"), v.literal("anonymous")),
    ownerIdOrAnonId: v.string(),
    channel: v.union(v.literal("chat"), v.literal("mcp")),
    allowed: v.boolean(),
    retryAfter: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_channel_and_createdAt", ["channel", "createdAt"])
    .index("by_ownerType_and_ownerIdOrAnonId", ["ownerType", "ownerIdOrAnonId"]),

  teachers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  classes: defineTable({
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
  })
    .index("by_teacherId", ["teacherId"])
    .index("by_joinCode", ["joinCode"])
    .index("by_status", ["status"]),

  students: defineTable({
    displayName: v.string(),
    classId: v.id("classes"),
    sessionToken: v.string(),
    isActive: v.boolean(),
    lastSeenAt: v.number(),
    joinedAt: v.number(),
    kickedAt: v.optional(v.number()),
  })
    .index("by_classId", ["classId"])
    .index("by_sessionToken", ["sessionToken"])
    .index("by_classId_and_isActive", ["classId", "isActive"]),

  classMessages: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    sentAt: v.number(),
  })
    .index("by_classId", ["classId"])
    .index("by_studentId", ["studentId"])
    .index("by_classId_and_sentAt", ["classId", "sentAt"]),

  activityChecks: defineTable({
    classId: v.id("classes"),
    question: v.string(),
    sentAt: v.number(),
  }).index("by_classId", ["classId"]),

  activityResponses: defineTable({
    checkId: v.id("activityChecks"),
    studentId: v.id("students"),
    response: v.string(),
    respondedAt: v.number(),
  })
    .index("by_checkId", ["checkId"])
    .index("by_studentId_and_checkId", ["studentId", "checkId"]),

  forcedPrompts: defineTable({
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
  }).index("by_classId", ["classId"]),

  forcedPromptAcks: defineTable({
    promptId: v.id("forcedPrompts"),
    studentId: v.id("students"),
    ackedAt: v.number(),
  })
    .index("by_promptId", ["promptId"])
    .index("by_studentId_and_promptId", ["studentId", "promptId"]),
});
