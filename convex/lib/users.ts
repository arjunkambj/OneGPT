import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getCurrentHexclaveUser } from "./auth";

type QueryOrMutationCtx = QueryCtx | MutationCtx;

export const getUserByHexclaveId = async (
  ctx: QueryOrMutationCtx,
  hexclaveId: string,
) =>
  await ctx.db
    .query("users")
    .withIndex("by_hexclaveId", (q) => q.eq("hexclaveId", hexclaveId))
    .first();

const getUserFields = (
  user: Extract<
    Awaited<ReturnType<typeof getCurrentHexclaveUser>>,
    { authenticated: true }
  >["user"],
  now: number,
) =>
  ({
    hexclaveId: user.id,
    name: user.name || user.email || "User",
    email: user.email.trim().toLowerCase(),
    updatedAt: now,
  }) satisfies Pick<
    Doc<"users">,
    "hexclaveId" | "name" | "email" | "updatedAt"
  >;

export const getCurrentUser = async (ctx: QueryOrMutationCtx) => {
  const auth = await getCurrentHexclaveUser(ctx);
  if (!auth.authenticated) return null;

  return await getUserByHexclaveId(ctx, auth.user.id);
};

export const requireCurrentUser = async (ctx: MutationCtx) => {
  const auth = await getCurrentHexclaveUser(ctx);
  if (!auth.authenticated) throw new Error(auth.error);

  const existing = await getUserByHexclaveId(ctx, auth.user.id);
  if (existing) return existing;

  const now = Date.now();
  const userId = await ctx.db.insert("users", {
    ...getUserFields(auth.user, now),
    createdAt: now,
  });
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Unable to create user.");
  return user;
};
