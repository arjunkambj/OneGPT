import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuth, requireAuth } from "./auth";

function getStackId(tokenIdentifier: string) {
  return tokenIdentifier.split("|").pop() ?? null;
}

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
  const identity = await getAuth(ctx);
  if (!identity) return null;

  // tokenIdentifier format: "{issuer}|{subject}" — subject is the Stack user ID
  const stackId = getStackId(identity.tokenIdentifier);
  if (!stackId) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_stackId", (q) => q.eq("stackId", stackId))
    .first();
}

async function getOrCreateCurrentUser(ctx: Pick<MutationCtx, "auth" | "db">) {
  const identity = await requireAuth(ctx);
  const stackId = getStackId(identity.tokenIdentifier);
  if (!stackId) throw new Error("Invalid auth token");

  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_stackId", (q) => q.eq("stackId", stackId))
    .first();

  if (existingUser) return existingUser;

  const now = Date.now();
  const name =
    identity.name ??
    identity.preferredUsername ??
    identity.nickname ??
    identity.email ??
    "User";
  const email = identity.email?.trim().toLowerCase() ?? "";

  const userId = await ctx.db.insert("users", {
    stackId,
    name,
    email,
    imageUrl: identity.pictureUrl,
    updatedAt: now,
    createdAt: now,
  });

  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Failed to create user");
  return user;
}

/**
 * Same as getCurrentUser but throws if user not found.
 * Use in mutations where a user record is required to write data.
 */
export async function requireCurrentUser(
  ctx: Pick<MutationCtx, "auth" | "db">,
) {
  return await getOrCreateCurrentUser(ctx);
}
