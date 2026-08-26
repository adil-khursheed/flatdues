import type { AuthMode } from "./types";

export type AuthFormValues = Readonly<{
  displayName: string;
  email: string;
  password: string;
}>;

export type AuthFieldErrors = Partial<
  Record<keyof AuthFormValues, string>
>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateAuthForm(
  mode: AuthMode,
  values: AuthFormValues,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = normalizeEmail(values.email);
  const displayName = values.displayName.trim();

  if (mode === "signUp" && displayName.length === 0) {
    errors.displayName = "Enter the name your flatmates will see.";
  } else if (displayName.length > 100) {
    errors.displayName = "Keep your name to 100 characters or fewer.";
  }

  if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length === 0) {
    errors.password = "Enter your password.";
  } else if (mode === "signUp" && values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  return errors;
}
