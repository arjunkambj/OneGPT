import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { stackServerApp } from "./stack";

type Ctx = QueryCtx | MutationCtx | ActionCtx;

export type PartialStackUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  primaryEmailVerified: boolean;
  isAnonymous: boolean;
  isMultiFactorRequired: boolean;
  isRestricted: boolean;
  restrictedReason: string | null;
};

export const requireAuth = async (ctx: Ctx) => {
  const user = await stackServerApp.getPartialUser({ from: "convex", ctx });

  if (user == null) {
    throw new Error("Authentication required.");
  }

  return user as PartialStackUser;
};

export const getAuth = async (ctx: Ctx) => {
  const user = await stackServerApp.getPartialUser({ from: "convex", ctx });

  return user as PartialStackUser | null;
};
