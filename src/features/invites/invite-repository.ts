import { getSupabaseClient } from "@/lib/supabase";

export async function generateWorkspaceInvite(workspaceId: string) {
  const { data, error } = await getSupabaseClient().rpc(
    "generate_workspace_invite",
    { p_workspace_id: workspaceId },
  );

  if (error) {
    throw error;
  }

  return data;
}
