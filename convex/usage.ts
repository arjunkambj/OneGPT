import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/users";

const FREE_DAILY_MESSAGE_LIMIT = 20;
const FREE_DAILY_SEARCH_LIMIT = 5;
const MAX_WEEKLY_MODEL_LIMIT = 60;

type UsageCounters = {
  maxModelCount?: number;
};

function getDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().split("T")[0];
}

function getWeekStartDateKey(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  date.setUTCHours(0, 0, 0, 0);
  return getDateKey(date.getTime());
}

function asUsageCounters(value: unknown): UsageCounters {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const counters = value as Record<string, unknown>;
  return {
    maxModelCount:
      typeof counters.maxModelCount === "number" ? counters.maxModelCount : 0,
  };
}

async function getActiveTier(
  ctx: Parameters<typeof getCurrentUser>[0],
  userId: Awaited<ReturnType<typeof requireCurrentUser>>["_id"],
) {
  const subscriptions = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(50);

  const activeSubscription = subscriptions
    .filter((subscription) =>
      ["active", "trialing", "past_due"].includes(subscription.status),
    )
    .sort((left, right) => right.updatedAt - left.updatedAt)[0];

  return activeSubscription?.tier ?? "free";
}

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
    modelTier: v.union(v.literal("free"), v.literal("pro"), v.literal("max")),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const date = getDateKey(now);
    const tier = await getActiveTier(ctx, user._id);
    const isProUser = tier === "pro" || tier === "max";
    const isMaxUser = tier === "max";

    if (args.modelTier === "max" && !isMaxUser) {
      throw new Error("Max subscription required.");
    }

    if (args.modelTier === "pro" && !isProUser) {
      throw new Error("Pro subscription required.");
    }

    const existing = await ctx.db
      .query("usage")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", user._id).eq("date", date),
      )
      .first();

    if (tier === "free") {
      const messageCount = existing?.messageCount ?? 0;
      const searchCount = existing?.searchCount ?? 0;

      if (messageCount >= FREE_DAILY_MESSAGE_LIMIT) {
        throw new Error("Free daily message limit reached.");
      }

      if (args.mode === "search" && searchCount >= FREE_DAILY_SEARCH_LIMIT) {
        throw new Error("Free daily search limit reached.");
      }
    }

    if (args.modelTier === "max") {
      const weekUsage = await ctx.db
        .query("usage")
        .withIndex("by_userId_and_date", (q) =>
          q
            .eq("userId", user._id)
            .gte("date", getWeekStartDateKey(now))
            .lte("date", date),
        )
        .collect();
      const weeklyMaxModelCount = weekUsage.reduce(
        (total, usage) =>
          total + (asUsageCounters(usage.tokensByProvider).maxModelCount ?? 0),
        0,
      );

      if (weeklyMaxModelCount >= MAX_WEEKLY_MODEL_LIMIT) {
        throw new Error("Weekly Max model credit limit reached.");
      }
    }

    if (existing) {
      const counters = asUsageCounters(existing.tokensByProvider);
      await ctx.db.patch(existing._id, {
        messageCount: existing.messageCount + 1,
        searchCount: existing.searchCount + (args.mode === "search" ? 1 : 0),
        tokensByProvider: {
          ...counters,
          maxModelCount:
            (counters.maxModelCount ?? 0) + (args.modelTier === "max" ? 1 : 0),
        },
        resetAt: now,
      });
      return;
    }

    await ctx.db.insert("usage", {
      userId: user._id,
      date,
      messageCount: 1,
      searchCount: args.mode === "search" ? 1 : 0,
      tokensByProvider: {
        maxModelCount: args.modelTier === "max" ? 1 : 0,
      },
      resetAt: now,
    });
  },
});
