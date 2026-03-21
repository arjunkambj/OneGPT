import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/users";

// ---------------------------------------------------------------------------
// Query: get the current user's preferences
// ---------------------------------------------------------------------------
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("userPreferences")
      .withIndex("ByUserId", (q) => q.eq("userId", user._id))
      .first();
  },
});

// ---------------------------------------------------------------------------
// Mutation: save / update user preferences (upsert)
// ---------------------------------------------------------------------------
export const saveUserPreferences = mutation({
  args: {
    defaultModel: v.optional(v.string()),
    preferences: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("ByUserId", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.defaultModel !== undefined && {
          defaultModel: args.defaultModel,
        }),
        ...(args.preferences !== undefined && {
          preferences: args.preferences,
        }),
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("userPreferences", {
      userId: user._id,
      defaultModel: args.defaultModel,
      preferences: args.preferences,
      updatedAt: Date.now(),
    });
  },
});
