import { getSupabaseClient } from "@/lib/supabase";

import type {
  CreateWorkspaceInput,
  JoinWorkspaceInput,
  WorkspaceMembership,
} from "./types";

export async function listActiveWorkspaceMemberships(
  userId: string,
): Promise<WorkspaceMembership[]> {
  const { data, error } = await getSupabaseClient()
    .from("workspace_members")
    .select(
      "joined_at, role, status, user_id, workspace_id, workspaces!inner(*)",
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((membership) => ({
    joined_at: membership.joined_at,
    role: membership.role,
    status: membership.status,
    user_id: membership.user_id,
    workspace: membership.workspaces,
    workspace_id: membership.workspace_id,
  }));
}

export async function createWorkspace({ name }: CreateWorkspaceInput) {
  const { data, error } = await getSupabaseClient().rpc("create_workspace", {
    p_currency_code: "INR",
    p_name: name,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function joinWorkspaceByInvite({ token }: JoinWorkspaceInput) {
  const { data, error } = await getSupabaseClient().rpc(
    "join_workspace_by_invite",
    { p_token: token },
  );

  if (error) {
    throw error;
  }

  return data;
}
