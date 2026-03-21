import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/users";

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
      .withIndex("ByUserIdDate", (q) =>
        q.eq("userId", user._id).eq("date", date),
      )
      .first();
  },
});
