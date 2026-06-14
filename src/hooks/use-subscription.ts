import { useUser } from "@hexclave/next";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../convex/_generated/api";

export function useSubscription() {
  const user = useUser();

  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    user ? {} : "skip",
  );

  const hasActiveSubscription =
    subscription?.status === "active" ||
    subscription?.status === "trialing" ||
    subscription?.status === "past_due";

  return {
    subscription,
    isLoading: subscription === undefined,
    tier: subscription?.tier ?? "free",
    isProUser:
      hasActiveSubscription &&
      (subscription?.tier === "pro" || subscription?.tier === "max"),
    isMaxUser: hasActiveSubscription && subscription?.tier === "max",
    status: subscription?.status ?? null,
  };
}
