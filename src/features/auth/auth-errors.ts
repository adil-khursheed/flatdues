type ErrorLike = Readonly<{
  code?: unknown;
  message?: unknown;
  name?: unknown;
  status?: unknown;
}>;

function asErrorLike(error: unknown): ErrorLike | null {
  return typeof error === "object" && error !== null ? error : null;
}

export function getAuthErrorMessage(
  error: unknown,
  action: "resolve" | "signIn" | "signOut" | "signUp",
) {
  const candidate = asErrorLike(error);
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  const message =
    typeof candidate?.message === "string"
      ? candidate.message.toLowerCase()
      : "";

  if (code === "invalid_credentials") {
    return "That email or password isn't correct.";
  }

  if (code === "email_not_confirmed") {
    return "Confirm your email first, then try signing in again.";
  }

  if (code === "user_already_exists" || code === "email_exists") {
    return "An account already exists for that email. Try signing in.";
  }

  if (code === "signup_disabled") {
    return "New accounts are temporarily unavailable.";
  }

  if (code === "weak_password") {
    return "Choose a stronger password with at least 8 characters.";
  }

  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    candidate?.status === 429
  ) {
    return "Too many attempts. Wait a moment and try again.";
  }

  if (
    code === "request_timeout" ||
    message.includes("network request failed") ||
    message.includes("failed to fetch") ||
    message.includes("timeout")
  ) {
    return "We couldn't reach Flatdues. Check your connection and try again.";
  }

  const fallbacks = {
    resolve:
      "We couldn't finish loading your account. Check your connection and try again.",
    signIn: "We couldn't sign you in. Check your details and try again.",
    signOut: "We couldn't sign you out. Please try again.",
    signUp: "We couldn't create your account. Please try again.",
  } as const;

  return fallbacks[action];
}
