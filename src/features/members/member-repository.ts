import { getSupabaseClient } from "@/lib/supabase";
import type {
  ManageWorkspaceMemberInput,
  MemberRole,
  MemberStatus,
  WorkspaceMember,
} from "./types";

export async function listWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const { data, error } = await getSupabaseClient()
    .from("workspace_members")
    .select(
      "workspace_id, user_id, role, status, joined_at, deactivated_at, profiles!workspace_members_user_id_fkey(display_name, avatar_url)"
    )
    .eq("workspace_id", workspaceId);

  if (error) {
    throw error;
  }

  return data
    .map((member) => ({
      avatarUrl: member.profiles.avatar_url,
      deactivated_at: member.deactivated_at,
      displayName: member.profiles.display_name,
      joined_at: member.joined_at,
      role: member.role as MemberRole,
      status: member.status as MemberStatus,
      user_id: member.user_id,
      workspace_id: member.workspace_id,
    }))
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "active" ? -1 : 1;
      }

      if (left.role !== right.role) {
        return left.role === "admin" ? -1 : 1;
      }

      return left.displayName.localeCompare(right.displayName);
    });
}

export async function manageWorkspaceMember(
  workspaceId: string,
  input: ManageWorkspaceMemberInput
) {
  const { data, error } = await getSupabaseClient().rpc(
    "manage_workspace_member",
    {
      p_role: input.role,
      p_status: input.status,
      p_user_id: input.userId,
      p_workspace_id: workspaceId,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function leaveWorkspace(workspaceId: string) {
  const { data, error } = await getSupabaseClient().rpc("leave_workspace", {
    p_workspace_id: workspaceId,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function selectActiveWorkspaceMembers(
  members: readonly WorkspaceMember[]
) {
  return members.filter((member) => member.status === "active");
}
