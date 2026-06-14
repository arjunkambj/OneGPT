import { v } from "convex/values";
import { mutation } from "./_generated/server";

const getBatchSize = (batchSize: number | undefined) =>
  Math.min(Math.max(batchSize ?? 100, 1), 500);

export const backfillUserHexclaveIds = mutation({
  args: {
    secret: v.string(),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const migrationSecret = process.env.HEXCLAVE_MIGRATION_SECRET;

    if (!migrationSecret) {
      throw new Error("Missing HEXCLAVE_MIGRATION_SECRET.");
    }

    if (args.secret !== migrationSecret) {
      throw new Error("Unauthorized.");
    }

    const limit = getBatchSize(args.batchSize);
    const now = Date.now();
    const users = await ctx.db
      .query("users")
      .withIndex("by_stackId", (q) => q.gt("stackId", ""))
      .take(limit);

    await Promise.all(
      users.map((user) =>
        ctx.db.patch(user._id, {
          hexclaveId: user.hexclaveId ?? user.stackId,
          stackId: undefined,
          updatedAt: now,
        }),
      ),
    );

    return {
      migrated: users.length,
      hasMore: users.length === limit,
    };
  },
});
