import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { queryKeys } from "@/lib/query-keys";

import type { CreateWorkspaceInput, Workspace } from "./types";
import { useWorkspace } from "./workspace-provider";
import { createWorkspace } from "./workspace-repository";

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const {
    refreshMemberships,
    setPendingCreatedWorkspace,
  } = useWorkspace();
  const [createdWorkspace, setCreatedWorkspace] = useState<Workspace | null>(
    null,
  );
  const createMutation = useMutation({ mutationFn: createWorkspace });

  const createAndActivate = useCallback(
    async (input: CreateWorkspaceInput) => {
      const workspace =
        createdWorkspace ?? (await createMutation.mutateAsync(input));

      if (!createdWorkspace) {
        setCreatedWorkspace(workspace);
      }

      setPendingCreatedWorkspace(workspace.id);
      const membership = await refreshMemberships(workspace.id);

      if (!membership || membership.workspace_id !== workspace.id) {
        throw new Error("WORKSPACE_ACTIVATION_FAILED");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces.detail(workspace.id),
        }),
      ]);

      return workspace;
    },
    [
      createMutation,
      createdWorkspace,
      queryClient,
      refreshMemberships,
      setPendingCreatedWorkspace,
    ],
  );

  return {
    createAndActivate,
    createdWorkspace,
    isPending: createMutation.isPending,
  } as const;
}
