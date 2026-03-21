import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/users";

// ---------------------------------------------------------------------------
// Query: get the current user's custom instructions
// ---------------------------------------------------------------------------
export const getCustomInstructions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("customInstructions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

// ---------------------------------------------------------------------------
// Mutation: save / update custom instructions (upsert)
// ---------------------------------------------------------------------------
export const saveCustomInstructions = mutation({
  args: {
    content: v.string(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query("customInstructions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        isEnabled: args.isEnabled,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("customInstructions", {
      userId: user._id,
      content: args.content,
      isEnabled: args.isEnabled,
      updatedAt: now,
      createdAt: now,
    });
  },
});

// ---------------------------------------------------------------------------
// Mutation: delete custom instructions
// ---------------------------------------------------------------------------
export const deleteCustomInstructions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query("customInstructions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
