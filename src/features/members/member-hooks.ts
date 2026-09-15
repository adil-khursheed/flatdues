import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  leaveWorkspace,
  listWorkspaceMembers,
  manageWorkspaceMember,
} from "./member-repository";
import type { ManageWorkspaceMemberInput } from "./types";

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    enabled: workspaceId.length > 0,
    queryFn: () => listWorkspaceMembers(workspaceId),
    queryKey: queryKeys.members.all(workspaceId),
  });
}

export function useManageWorkspaceMember(
  workspaceId: string,
  currentUserId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ManageWorkspaceMemberInput) =>
      manageWorkspaceMember(workspaceId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.members.all(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces.memberships(currentUserId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.balances.all(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all(workspaceId),
        }),
      ]);
    },
  });
}

export function useLeaveWorkspace(workspaceId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveWorkspace(workspaceId),
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: ["workspaces", workspaceId],
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.memberships(currentUserId),
      });
    },
  });
}
