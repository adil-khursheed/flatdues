export const workspaceNameMaxLength = 100;
export const inviteTokenLength = 64;

export function normalizeWorkspaceName(value: string) {
  return value.trim();
}

export function validateWorkspaceName(value: string) {
  const normalized = normalizeWorkspaceName(value);

  if (!normalized || normalized.length > workspaceNameMaxLength) {
    return "Enter a workspace name between 1 and 100 characters.";
  }

  return null;
}

export function normalizeInviteToken(value: string) {
  return value.trim().toLowerCase();
}

export function validateInviteToken(value: string) {
  const normalized = normalizeInviteToken(value);

  if (!new RegExp(`^[0-9a-f]{${inviteTokenLength}}$`).test(normalized)) {
    return "Enter the complete 64-character invite code.";
  }

  return null;
}
