import type { InviteStatus, WorkspaceInvite } from "./types";

export function getInviteStatus(
  invite: WorkspaceInvite,
  now = Date.now()
): InviteStatus {
  if (invite.revoked_at) {
    return "revoked";
  }

  if (invite.expires_at && new Date(invite.expires_at).getTime() <= now) {
    return "expired";
  }

  if (invite.max_uses !== null && invite.usage_count >= invite.max_uses) {
    return "exhausted";
  }

  return "active";
}

export function getInviteRemainingUses(invite: WorkspaceInvite) {
  return invite.max_uses === null
    ? null
    : Math.max(invite.max_uses - invite.usage_count, 0);
}

export function formatInviteExpiry(expiresAt: string | null) {
  if (!expiresAt) {
    return "No expiry";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(expiresAt));
}
