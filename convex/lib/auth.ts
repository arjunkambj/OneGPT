import { z } from "zod";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

const HexclaveUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  isAnonymous: z.boolean(),
  isRestricted: z.boolean(),
  name: z.string(),
  role: z.string(),
  selectedTeamId: z.string().nullable(),
  tokenIdentifier: z.string(),
});

export const getCurrentHexclaveUser = async (ctx: Ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity == null) {
    return { authenticated: false, error: "Unauthenticated." } as const;
  }

  const user = HexclaveUserSchema.safeParse({
    id: identity.subject,
    email: identity.email,
    emailVerified: identity.email_verified,
    isAnonymous: identity.is_anonymous,
    isRestricted: identity.is_restricted,
    name: identity.name,
    role: identity.role,
    selectedTeamId: identity.selected_team_id ?? null,
    tokenIdentifier: identity.tokenIdentifier,
  });

  if (!user.success) {
    return {
      authenticated: false,
      error: "Missing Hexclave user claims.",
    } as const;
  }

  return { authenticated: true, user: user.data } as const;
};
