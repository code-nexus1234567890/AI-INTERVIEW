import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  }).index("by_email", ["email"]),

  InterviewSessionTable: defineTable({
    resumeUrl: v.optional(v.string()),
    userId: v.optional(v.any()),
    status: v.string(), // 'draft' | 'completed'
    interviewQuestions: v.optional(v.any()),
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    sessionAnalytics: v.optional(v.any()),
    userAnswers: v.optional(v.any()),
    aiEvaluation: v.optional(v.any()),
    createdAt: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),
});