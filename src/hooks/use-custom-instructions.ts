import { useUser } from "@stackframe/stack";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../convex/_generated/api";

export function useCustomInstructions() {
  const user = useUser();

  const instructions = useQuery(
    api.customInstructions.getCustomInstructions,
    user ? {} : "skip",
  );

  const saveMutation = useMutation(
    api.customInstructions.saveCustomInstructions,
  );
  const deleteMutation = useMutation(
    api.customInstructions.deleteCustomInstructions,
  );

  return {
    instructions,
    isLoading: instructions === undefined,
    content: instructions?.content ?? "",
    isEnabled: instructions?.isEnabled ?? true,
    save: (content: string, isEnabled: boolean) =>
      saveMutation({ content, isEnabled }),
    remove: () => deleteMutation({}),
  };
}
