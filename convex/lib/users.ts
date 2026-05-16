import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuth, requireAuth } from "./auth";

/**
 * Resolves the currently authenticated user from the Convex `users` table.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const user = await getAuth(ctx);
  if (!user) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_stackId", (q) => q.eq("stackId", user.id))
    .first();
}

async function getOrCreateCurrentUser(ctx: MutationCtx) {
  const user = await requireAuth(ctx);

  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_stackId", (q) => q.eq("stackId", user.id))
    .first();

  if (existingUser) return existingUser;

  if (!user.primaryEmail) {
    throw new Error("Stack user is missing a primary email.");
  }

  const now = Date.now();
  const email = user.primaryEmail.trim().toLowerCase();

  const userId = await ctx.db.insert("users", {
    stackId: user.id,
    name: user.displayName ?? email,
    email,
    updatedAt: now,
    createdAt: now,
  });

  const createdUser = await ctx.db.get(userId);
  if (!createdUser) throw new Error("Failed to create user");
  return createdUser;
}

/**
 * Same as getCurrentUser but throws if user not found.
 * Use in mutations where a user record is required to write data.
 */
export async function requireCurrentUser(ctx: MutationCtx) {
  return await getOrCreateCurrentUser(ctx);
}
