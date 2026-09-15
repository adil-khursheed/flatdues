import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  listWorkspaceInvites,
  revokeWorkspaceInvite,
} from "./invite-repository";

export function useWorkspaceInvites(workspaceId: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && workspaceId.length > 0,
    queryFn: () => listWorkspaceInvites(workspaceId),
    queryKey: queryKeys.invites.all(workspaceId),
  });
}

export function useRevokeWorkspaceInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      revokeWorkspaceInvite(workspaceId, inviteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.invites.all(workspaceId),
      });
    },
  });
}
