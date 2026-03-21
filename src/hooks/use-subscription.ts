import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@stackframe/stack";

export function useSubscription() {
  const user = useUser();

  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    user ? {} : "skip",
  );

  return {
    subscription,
    isLoading: subscription === undefined,
    tier: subscription?.tier ?? "free",
    isProUser: subscription?.tier === "pro" || subscription?.tier === "max",
    isMaxUser: subscription?.tier === "max",
    status: subscription?.status ?? null,
  };
}
