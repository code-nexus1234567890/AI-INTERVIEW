import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch a single interview session record by ID
 */
export const GetInterviewQuestions = query({
  args: {
    interviewRecordId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("InterviewSessionTable")
      .filter((q) => q.eq(q.field("_id"), args.interviewRecordId))
      .collect();

    return result[0];
  },
});

/**
 * Fetch all interview sessions for a specific user (or all recent sessions)
 */
export const GetUserInterviews = query({
  args: {
    userId: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    return await ctx.db
      .query("InterviewSessionTable")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Create a new interview session
 */
export const SaveInterviewQuestions = mutation({
  args: {
    questions: v.array(v.any()),
    uid: v.optional(v.any()),
    resumeUrl: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("InterviewSessionTable", {
      interviewQuestions: args.questions,
      userId: args.uid,
      resumeUrl: args.resumeUrl,
      status: "draft",
      jobTitle: args.jobTitle,
      jobDescription: args.jobDescription,
      createdAt: new Date().toISOString(),
    });
    return result;
  },
});

/**
 * Save real-time emotion telemetry analytics
 */
export const SaveEmotionAnalytics = mutation({
  args: {
    interviewRecordId: v.id("InterviewSessionTable"),
    sessionAnalytics: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.interviewRecordId, {
      sessionAnalytics: args.sessionAnalytics,
      status: "completed",
    });
  },
});

/**
 * Save user voice answers and AI evaluation report
 */
export const SaveUserAnswersAndEvaluation = mutation({
  args: {
    interviewRecordId: v.id("InterviewSessionTable"),
    userAnswers: v.any(),
    aiEvaluation: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.interviewRecordId, {
      userAnswers: args.userAnswers,
      aiEvaluation: args.aiEvaluation,
      status: "completed",
    });
  },
});