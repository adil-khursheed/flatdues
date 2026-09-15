import type { Database } from "@/lib/supabase";

type MembershipRow = Database["public"]["Tables"]["workspace_members"]["Row"];

export type MemberRole = "admin" | "member";
export type MemberStatus = "active" | "inactive";

export type WorkspaceMember = Readonly<
  Pick<
    MembershipRow,
    "deactivated_at" | "joined_at" | "user_id" | "workspace_id"
  > & {
    avatarUrl: string | null;
    displayName: string;
    role: MemberRole;
    status: MemberStatus;
  }
>;

export type ManageWorkspaceMemberInput = Readonly<{
  role?: MemberRole;
  status?: MemberStatus;
  userId: string;
}>;
