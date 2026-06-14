import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation } from "./_generated/server";

const CONFIRM_CLEANUP = "delete-unknown-empty-users";

const getLimit = (limit: number | undefined) =>
  Math.min(Math.max(limit ?? 100, 1), 500);

const assertMaintenanceSecret = (secret: string) => {
  const expectedSecret = process.env.CONVEX_MAINTENANCE_SECRET;

  if (!expectedSecret) {
    throw new Error("Missing CONVEX_MAINTENANCE_SECRET.");
  }

  if (secret !== expectedSecret) {
    throw new Error("Unauthorized.");
  }
};

const hasDependentData = async (ctx: MutationCtx, userId: Id<"users">) => {
  const [chat, customInstructions, userPreferences, usage, subscription] =
    await Promise.all([
      ctx.db
        .query("chats")
        .withIndex("by_userId_and_updatedAt", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("customInstructions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("userPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("usage")
        .withIndex("by_userId_and_date", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
    ]);

  return Boolean(
    chat ?? customInstructions ?? userPreferences ?? usage ?? subscription,
  );
};

export const cleanupUnknownEmptyUsers = mutation({
  args: {
    secret: v.string(),
    dryRun: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    confirm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertMaintenanceSecret(args.secret);

    const dryRun = args.dryRun ?? true;
    if (!dryRun && args.confirm !== CONFIRM_CLEANUP) {
      throw new Error(`Set confirm to "${CONFIRM_CLEANUP}" to delete users.`);
    }

    const limit = getLimit(args.limit);
    const users = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", ""))
      .take(limit);

    const candidates = users.filter(
      (user) => user.name.trim().toLowerCase() === "unknown",
    );
    const checked = await Promise.all(
      candidates.map(async (user) => ({
        user,
        hasDependentData: await hasDependentData(ctx, user._id),
      })),
    );

    const deletable = checked
      .filter((result) => !result.hasDependentData)
      .map((result) => result.user);
    const skipped = checked
      .filter((result) => result.hasDependentData)
      .map((result) => result.user._id);

    if (!dryRun) {
      await Promise.all(deletable.map((user) => ctx.db.delete(user._id)));
    }

    return {
      dryRun,
      scannedEmptyEmailUsers: users.length,
      matchedUnknownUsers: candidates.length,
      deleted: dryRun ? 0 : deletable.length,
      deletable: dryRun ? deletable.map((user) => user._id) : [],
      skippedWithDependentData: skipped,
      hasMore: users.length === limit,
    };
  },
});
