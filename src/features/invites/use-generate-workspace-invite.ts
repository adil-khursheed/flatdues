import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import { generateWorkspaceInvite } from "./invite-repository";

export function useGenerateWorkspaceInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateWorkspaceInvite(workspaceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.invites.all(workspaceId),
      });
    },
  });
}
