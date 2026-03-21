import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/users";

// ---------------------------------------------------------------------------
// Query: get the current user's subscription
// ---------------------------------------------------------------------------
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});
