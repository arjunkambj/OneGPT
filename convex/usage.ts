import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/users";

// ---------------------------------------------------------------------------
// Query: get usage stats for a given date (defaults to today)
// ---------------------------------------------------------------------------
export const getUserUsage = query({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const date = args.date || new Date().toISOString().split("T")[0];
    return await ctx.db
      .query("usage")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).eq("date", date),
      )
      .first();
  },
});

export const trackChatTurn = mutation({
  args: {
    mode: v.union(v.literal("chat"), v.literal("search")),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const date = new Date().toISOString().split("T")[0];
    const now = Date.now();

    const existing = await ctx.db
      .query("usage")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).eq("date", date),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        messageCount: existing.messageCount + 1,
        searchCount: existing.searchCount + (args.mode === "search" ? 1 : 0),
        resetAt: now,
      });
      return;
    }

    await ctx.db.insert("usage", {
      userId: user._id,
      date,
      messageCount: 1,
      searchCount: args.mode === "search" ? 1 : 0,
      resetAt: now,
    });
  },
});
