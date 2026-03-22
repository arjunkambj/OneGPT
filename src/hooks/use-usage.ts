import { useUser } from "@stackframe/stack";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../convex/_generated/api";

export function useUsage() {
  const user = useUser();

  const usage = useQuery(api.usage.getUserUsage, user ? {} : "skip");

  return {
    usage,
    isLoading: usage === undefined,
    messageCount: usage?.messageCount ?? 0,
    searchCount: usage?.searchCount ?? 0,
  };
}
