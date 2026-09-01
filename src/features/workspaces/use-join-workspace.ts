import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { queryKeys } from "@/lib/query-keys";
import type { Database } from "@/lib/supabase";

import type { JoinWorkspaceInput } from "./types";
import { useWorkspace } from "./workspace-provider";
import { joinWorkspaceByInvite } from "./workspace-repository";

type MembershipRow =
  Database["public"]["Tables"]["workspace_members"]["Row"];

export function useJoinWorkspace() {
  const queryClient = useQueryClient();
  const { refreshMemberships } = useWorkspace();
  const [joinedMembership, setJoinedMembership] =
    useState<MembershipRow | null>(null);
  const joinMutation = useMutation({ mutationFn: joinWorkspaceByInvite });

  const joinAndActivate = useCallback(
    async (input: JoinWorkspaceInput) => {
      const membership =
        joinedMembership ?? (await joinMutation.mutateAsync(input));

      if (!joinedMembership) {
        setJoinedMembership(membership);
      }

      const activeMembership = await refreshMemberships(
        membership.workspace_id,
      );

      if (
        !activeMembership ||
        activeMembership.workspace_id !== membership.workspace_id
      ) {
        throw new Error("WORKSPACE_ACTIVATION_FAILED");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces.detail(membership.workspace_id),
        }),
      ]);

      return activeMembership;
    },
    [
      joinMutation,
      joinedMembership,
      queryClient,
      refreshMemberships,
    ],
  );

  return {
    isPending: joinMutation.isPending,
    joinAndActivate,
    joinedMembership,
  } as const;
}
