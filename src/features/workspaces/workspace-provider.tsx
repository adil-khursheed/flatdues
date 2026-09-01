import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/features/auth";
import { queryKeys } from "@/lib/query-keys";

import {
  clearStoredActiveWorkspaceId,
  getStoredActiveWorkspaceId,
  storeActiveWorkspaceId,
} from "./active-workspace-storage";
import type {
  WorkspaceContextValue,
  WorkspaceMembership,
} from "./types";
import { getWorkspaceErrorMessage } from "./workspace-errors";
import { listActiveWorkspaceMemberships } from "./workspace-repository";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

type WorkspaceSnapshot = Readonly<{
  activeWorkspaceId: string | null;
  attempt: number;
  error: string | null;
  memberships: readonly WorkspaceMembership[];
  userId: string;
}>;

async function persistSelection(
  userId: string,
  membership: WorkspaceMembership | null,
) {
  try {
    if (membership) {
      await storeActiveWorkspaceId(userId, membership.workspace_id);
    } else {
      await clearStoredActiveWorkspaceId(userId);
    }
  } catch {
    // A workspace ID is only a local preference. The server membership list
    // remains authoritative when storage is unavailable.
  }
}

async function readStoredSelection(userId: string) {
  try {
    return await getStoredActiveWorkspaceId(userId);
  } catch {
    return null;
  }
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [pendingCreatedWorkspace, setPendingCreatedWorkspaceState] = useState<{
    userId: string;
    workspaceId: string;
  } | null>(null);
  const matchesUser =
    snapshot?.userId === userId && snapshot.attempt === attempt;
  const memberships = useMemo(
    () => (matchesUser ? snapshot.memberships : []),
    [matchesUser, snapshot],
  );
  const activeMembership = matchesUser
    ? (memberships.find(
        (membership) =>
          membership.workspace_id === snapshot.activeWorkspaceId,
      ) ?? null)
    : null;
  const resolutionError = matchesUser ? snapshot.error : null;
  const isResolving = userId !== null && !matchesUser;
  const pendingCreatedWorkspaceId =
    pendingCreatedWorkspace?.userId === userId
      ? pendingCreatedWorkspace.workspaceId
      : null;

  const resolveMemberships = useCallback(
    async (resolvedUserId: string, preferredWorkspaceId?: string) => {
      const nextMemberships =
        await listActiveWorkspaceMemberships(resolvedUserId);
      const storedWorkspaceId = await readStoredSelection(resolvedUserId);
      const selectedMembership =
        nextMemberships.find(
          (membership) =>
            membership.workspace_id === preferredWorkspaceId,
        ) ??
        nextMemberships.find(
          (membership) => membership.workspace_id === storedWorkspaceId,
        ) ??
        nextMemberships[0] ??
        null;

      await persistSelection(resolvedUserId, selectedMembership);
      return { nextMemberships, selectedMembership };
    },
    [],
  );

  useEffect(() => {
    let isCurrent = true;

    if (!userId) {
      return;
    }

    void resolveMemberships(userId)
      .then(({ nextMemberships, selectedMembership }) => {
        if (!isCurrent) {
          return;
        }

        setSnapshot({
          activeWorkspaceId: selectedMembership?.workspace_id ?? null,
          attempt,
          error: null,
          memberships: nextMemberships,
          userId,
        });
        queryClient.setQueryData(
          queryKeys.workspaces.memberships(userId),
          nextMemberships,
        );
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        setSnapshot({
          activeWorkspaceId: null,
          attempt,
          error: getWorkspaceErrorMessage(error, "resolve"),
          memberships: [],
          userId,
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt, queryClient, resolveMemberships, userId]);

  const refreshMemberships = useCallback(
    async (preferredWorkspaceId?: string) => {
      if (!userId) {
        return null;
      }

      const { nextMemberships, selectedMembership } =
        await resolveMemberships(userId, preferredWorkspaceId);

      setSnapshot({
        activeWorkspaceId: selectedMembership?.workspace_id ?? null,
        attempt,
        error: null,
        memberships: nextMemberships,
        userId,
      });
      queryClient.setQueryData(
        queryKeys.workspaces.memberships(userId),
        nextMemberships,
      );

      return selectedMembership;
    },
    [attempt, queryClient, resolveMemberships, userId],
  );

  const selectActiveWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!userId || !matchesUser) {
        throw new Error("WORKSPACE_SELECTION_UNAVAILABLE");
      }

      const selectedMembership = memberships.find(
        (membership) => membership.workspace_id === workspaceId,
      );

      if (!selectedMembership) {
        throw new Error("WORKSPACE_MEMBERSHIP_INACTIVE");
      }

      await persistSelection(userId, selectedMembership);
      setSnapshot((current) =>
        current && current.userId === userId
          ? { ...current, activeWorkspaceId: workspaceId }
          : current,
      );
    },
    [matchesUser, memberships, userId],
  );

  const retryResolution = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  const clearPendingCreatedWorkspace = useCallback(() => {
    setPendingCreatedWorkspaceState(null);
  }, []);

  const setPendingCreatedWorkspace = useCallback((workspaceId: string) => {
    if (userId) {
      setPendingCreatedWorkspaceState({ userId, workspaceId });
    }
  }, [userId]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeMembership,
      activeWorkspace: activeMembership?.workspace ?? null,
      clearPendingCreatedWorkspace,
      isResolving,
      memberships,
      pendingCreatedWorkspaceId,
      refreshMemberships,
      resolutionError,
      retryResolution,
      selectActiveWorkspace,
      setPendingCreatedWorkspace,
    }),
    [
      activeMembership,
      clearPendingCreatedWorkspace,
      isResolving,
      memberships,
      pendingCreatedWorkspaceId,
      refreshMemberships,
      resolutionError,
      retryResolution,
      selectActiveWorkspace,
      setPendingCreatedWorkspace,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return context;
}
