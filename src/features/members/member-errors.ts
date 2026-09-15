const memberErrorMessages: Readonly<Record<string, string>> = {
  AUTH_REQUIRED: "Your session has expired. Sign in and try again.",
  LAST_ACTIVE_ADMIN:
    "Promote another active member to admin before making this change.",
  WORKSPACE_ADMIN_REQUIRED:
    "Only an active workspace administrator can manage members.",
  WORKSPACE_MEMBER_CHANGE_REQUIRED: "Choose a member change and try again.",
  WORKSPACE_MEMBER_NOT_FOUND: "That workspace member could not be found.",
  WORKSPACE_MEMBER_ROLE_INVALID: "That member role is not supported.",
  WORKSPACE_MEMBER_SELF_MANAGEMENT:
    "Use Leave workspace to change your own membership.",
  WORKSPACE_MEMBER_STATUS_INVALID: "That member status is not supported.",
  WORKSPACE_MEMBERSHIP_INACTIVE:
    "This workspace membership is already inactive.",
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

export function getMemberErrorMessage(
  error: unknown,
  operation: "leave" | "load" | "manage"
) {
  const errorText = getErrorText(error);
  const knownCode = Object.keys(memberErrorMessages).find((code) =>
    errorText.includes(code)
  );

  if (knownCode) {
    return memberErrorMessages[knownCode];
  }

  if (operation === "load") {
    return "We couldn't load the workspace members. Check your connection and try again.";
  }

  if (operation === "leave") {
    return "We couldn't leave this workspace. Check your connection and try again.";
  }

  return "We couldn't update that member. Check your connection and try again.";
}
