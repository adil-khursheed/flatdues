const workspaceErrorMessages: Readonly<Record<string, string>> = {
  ALREADY_WORKSPACE_MEMBER: "You're already a member of this workspace.",
  AUTH_REQUIRED: "Your session has expired. Sign in and try again.",
  CURRENCY_CODE_INVALID: "The workspace currency is not supported.",
  INVITE_EXHAUSTED: "This invite code has already reached its usage limit.",
  INVITE_EXPIRED: "This invite code has expired.",
  INVITE_INVALID: "That invite code isn't valid. Check it and try again.",
  INVITE_WORKSPACE_MISSING: "The workspace for this invite is no longer available.",
  WORKSPACE_NAME_INVALID: "Enter a workspace name between 1 and 100 characters.",
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

export function getWorkspaceErrorMessage(
  error: unknown,
  operation: "create" | "invite" | "join" | "resolve",
) {
  const errorText = getErrorText(error);
  const knownCode = Object.keys(workspaceErrorMessages).find((code) =>
    errorText.includes(code),
  );

  if (knownCode) {
    return workspaceErrorMessages[knownCode];
  }

  if (operation === "create") {
    return "We couldn't create your workspace. Check your connection and try again.";
  }

  if (operation === "join") {
    return "We couldn't join that workspace. Check your connection and try again.";
  }

  if (operation === "invite") {
    return "We couldn't create an invite code. Try again in a moment.";
  }

  return "We couldn't load your workspaces. Check your connection and try again.";
}
