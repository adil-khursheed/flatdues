import type { Database } from "@/lib/supabase";

export type WorkspaceInvite =
  Database["public"]["Tables"]["workspace_invites"]["Row"];

export type ShareInviteInput = Readonly<{
  token: string;
  workspaceName: string;
}>;
