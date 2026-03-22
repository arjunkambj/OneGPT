import { useUser } from "@stackframe/stack";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../convex/_generated/api";

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
