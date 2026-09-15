import type { Database } from "@/lib/supabase";

export type WorkspaceInvite =
  Database["public"]["Tables"]["workspace_invites"]["Row"];

export type CreateWorkspaceInviteInput = Readonly<{
  maxUses: number;
  validForDays: number;
}>;

export type InviteStatus = "active" | "exhausted" | "expired" | "revoked";

export type ShareInviteInput = Readonly<{
  token: string;
  workspaceName: string;
}>;
