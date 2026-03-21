import type { QueryCtx, MutationCtx } from "../_generated/server";
import { requireAuth } from "./auth";

/**
 * Resolves the currently authenticated user from the Convex `users` table.
 *
 * Uses `tokenIdentifier` (per convex_rules.md) to extract the Stack user ID,
 * then looks up via the `BystackId` index.
 *
 * Returns `null` if the user record hasn't been synced via webhook yet
 * (avoids throwing in queries).
 */
export async function getCurrentUser(
  ctx: Pick<QueryCtx | MutationCtx, "auth" | "db">,
) {
  const identity = await requireAuth(ctx);
  // tokenIdentifier format: "{issuer}|{subject}" — subject is the Stack user ID
  const stackId = identity.tokenIdentifier.split("|").pop()!;
  return await ctx.db
    .query("users")
    .withIndex("BystackId", (q) => q.eq("stackId", stackId))
    .first();
}

/**
 * Same as getCurrentUser but throws if user not found.
 * Use in mutations where a user record is required to write data.
 */
export async function requireCurrentUser(
  ctx: Pick<QueryCtx | MutationCtx, "auth" | "db">,
) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("User not found in database");
  return user;
}
