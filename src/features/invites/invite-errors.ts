const inviteErrorMessages: Readonly<Record<string, string>> = {
  AUTH_REQUIRED: "Your session has expired. Sign in and try again.",
  INVITE_DAYS_INVALID: "Invite validity must be between 1 and 30 days.",
  INVITE_MAX_USES_INVALID: "Maximum joins must be between 1 and 50.",
  INVITE_NOT_FOUND: "That invitation could not be found.",
  INVITE_REVOKED: "This invite code has been revoked.",
  WORKSPACE_ADMIN_REQUIRED:
    "Only an active workspace administrator can manage invitations.",
};

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

export function getInviteErrorMessage(
  error: unknown,
  operation: "create" | "load" | "revoke"
) {
  const errorText = getErrorText(error);
  const knownCode = Object.keys(inviteErrorMessages).find((code) =>
    errorText.includes(code)
  );

  if (knownCode) {
    return inviteErrorMessages[knownCode];
  }

  if (operation === "load") {
    return "We couldn't load invitations. Check your connection and try again.";
  }

  if (operation === "revoke") {
    return "We couldn't revoke that invitation. Try again in a moment.";
  }

  return "We couldn't create an invite code. Try again in a moment.";
}
