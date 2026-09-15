import { getSupabaseClient } from "@/lib/supabase";
import type { CreateWorkspaceInviteInput } from "./types";

export async function generateWorkspaceInvite(
  workspaceId: string,
  input: CreateWorkspaceInviteInput
) {
  const { data, error } = await getSupabaseClient().rpc(
    "create_workspace_invite",
    {
      p_expires_in_days: input.validForDays,
      p_max_uses: input.maxUses,
      p_workspace_id: workspaceId,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function listWorkspaceInvites(workspaceId: string) {
  const { data, error } = await getSupabaseClient()
    .from("workspace_invites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function revokeWorkspaceInvite(
  workspaceId: string,
  inviteId: string
) {
  const { data, error } = await getSupabaseClient().rpc(
    "revoke_workspace_invite",
    { p_invite_id: inviteId, p_workspace_id: workspaceId }
  );

  if (error) {
    throw error;
  }

  return data;
}
