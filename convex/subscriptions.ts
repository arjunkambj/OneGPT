import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/users";

// ---------------------------------------------------------------------------
// Query: get the current user's subscription
// ---------------------------------------------------------------------------
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(20);

    return (
      subscriptions
        .filter((subscription) =>
          ["active", "trialing", "past_due"].includes(subscription.status),
        )
        .sort((a, b) => b.updatedAt - a.updatedAt)[0] ??
      subscriptions.sort((a, b) => b.updatedAt - a.updatedAt)[0] ??
      null
    );
  },
});

export const syncFromDodoWebhook = internalMutation({
  args: {
    externalId: v.string(),
    stackId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerId: v.optional(v.string()),
    productId: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("paused"),
    ),
    tier: v.optional(v.union(v.literal("pro"), v.literal("max"))),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    recurringInterval: v.optional(
      v.union(v.literal("month"), v.literal("year")),
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = args.customerEmail?.trim().toLowerCase();
    const stackId = args.stackId;
    const user = stackId
      ? await ctx.db
          .query("users")
          .withIndex("by_stackId", (q) => q.eq("stackId", stackId))
          .first()
      : null;

    const resolvedUser =
      user ??
      (email
        ? await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first()
        : null);

    if (!resolvedUser) {
      throw new Error("Unable to resolve subscription user");
    }

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();

    const tier = args.tier ?? existing?.tier;
    if (!tier || tier === "free") {
      console.error("[Dodo subscription sync] missing tier", {
        externalId: args.externalId,
        productId: args.productId,
        customerEmail: args.customerEmail,
        existingTier: existing?.tier,
      });
      throw new Error("Unable to resolve subscription tier");
    }

    const subscription = {
      userId: resolvedUser._id,
      externalId: args.externalId,
      tier,
      status: args.status,
      amount: args.amount,
      currency: args.currency,
      recurringInterval: args.recurringInterval,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      customerId: args.customerId,
      productId: args.productId,
      metadata: args.metadata,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, subscription);
      console.log("[Dodo subscription sync] updated", {
        subscriptionId: existing._id,
        externalId: args.externalId,
        tier,
        status: args.status,
      });
      return existing._id;
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      ...subscription,
      createdAt: now,
    });
    console.log("[Dodo subscription sync] inserted", {
      subscriptionId,
      externalId: args.externalId,
      tier,
      status: args.status,
    });
    return subscriptionId;
  },
});
