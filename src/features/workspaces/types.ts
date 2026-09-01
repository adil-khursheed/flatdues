import type { Database } from "@/lib/supabase";

export type Workspace =
  Database["public"]["Tables"]["workspaces"]["Row"];

type MembershipRow =
  Database["public"]["Tables"]["workspace_members"]["Row"];

export type WorkspaceMembership = Readonly<
  Pick<
    MembershipRow,
    "joined_at" | "role" | "status" | "user_id" | "workspace_id"
  > & {
    workspace: Workspace;
  }
>;

export type CreateWorkspaceInput = Readonly<{
  name: string;
}>;

export type JoinWorkspaceInput = Readonly<{
  token: string;
}>;

export type WorkspaceContextValue = Readonly<{
  activeMembership: WorkspaceMembership | null;
  activeWorkspace: Workspace | null;
  clearPendingCreatedWorkspace: () => void;
  isResolving: boolean;
  memberships: readonly WorkspaceMembership[];
  pendingCreatedWorkspaceId: string | null;
  refreshMemberships: (
    preferredWorkspaceId?: string,
  ) => Promise<WorkspaceMembership | null>;
  resolutionError: string | null;
  retryResolution: () => void;
  selectActiveWorkspace: (workspaceId: string) => Promise<void>;
  setPendingCreatedWorkspace: (workspaceId: string) => void;
}>;
