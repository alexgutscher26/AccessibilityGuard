import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  analysisResults: defineTable({
    userId: v.string(),
    url: v.string(),
    timestamp: v.number(),
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
  }).index("by_user", ["userId"]),
});
