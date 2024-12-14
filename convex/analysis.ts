import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

interface AccessibilityIssue {
  type: string;
  message: string;
  code: string;
  impact: string;
  selector?: string;
}

export const createAnalysis = mutation({
  args: {
    url: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analysisResults", {
      userId: args.userId,
      url: args.url,
      timestamp: Date.now(),
      score: 0,
      issues: [],
      status: "in-progress" as const,
    });
  },
});

export const updateAnalysis = mutation({
  args: {
    id: v.id("analysisResults"),
    score: v.number(),
    issues: v.array(
      v.object({
        type: v.string(),
        message: v.string(),
        code: v.string(),
        impact: v.string(),
        selector: v.optional(v.string()),
      })
    ),
    status: v.union(
      v.literal("completed"),
      v.literal("failed"),
      v.literal("in-progress")
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const getUserAnalyses = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysisResults")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
