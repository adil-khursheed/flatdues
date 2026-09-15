import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { generateWorkspaceInvite } from "./invite-repository";
import type { CreateWorkspaceInviteInput } from "./types";

export function useGenerateWorkspaceInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInviteInput) =>
      generateWorkspaceInvite(workspaceId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.invites.all(workspaceId),
      });
    },
  });
}
