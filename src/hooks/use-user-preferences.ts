import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../convex/_generated/api";
import { useUser } from "@stackframe/stack";

export function useUserPreferences() {
  const user = useUser();

  const preferences = useQuery(
    api.userPreferences.getUserPreferences,
    user ? {} : "skip",
  );

  const saveMutation = useMutation(api.userPreferences.saveUserPreferences);

  return {
    preferences,
    isLoading: preferences === undefined,
    defaultModel: preferences?.defaultModel ?? null,
    saveDefaultModel: (model: string) => saveMutation({ defaultModel: model }),
    savePreferences: (prefs: Record<string, unknown>) =>
      saveMutation({ preferences: prefs }),
  };
}
