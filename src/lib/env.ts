const publicEnvironment = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim(),
  supabasePublishableKey:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim(),
};

export type PublicEnvironment = {
  supabasePublishableKey: string;
  supabaseUrl: string;
};

export type PublicEnvironmentStatus =
  | { environment: PublicEnvironment; isValid: true }
  | { errors: readonly string[]; isValid: false };

export class AppConfigurationError extends Error {
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super(`Flatdues configuration is incomplete: ${problems.join(" ")}`);
    this.name = "AppConfigurationError";
    this.problems = problems;
  }
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function getPublicEnvironmentStatus(): PublicEnvironmentStatus {
  const errors: string[] = [];

  if (!publicEnvironment.supabaseUrl) {
    errors.push("Set EXPO_PUBLIC_SUPABASE_URL.");
  } else if (!isHttpUrl(publicEnvironment.supabaseUrl)) {
    errors.push("EXPO_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL.");
  }

  if (!publicEnvironment.supabasePublishableKey) {
    errors.push(
      "Set EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY for a legacy project).",
    );
  }

  if (errors.length > 0) {
    return { errors, isValid: false };
  }

  return {
    environment: {
      supabasePublishableKey: publicEnvironment.supabasePublishableKey!,
      supabaseUrl: publicEnvironment.supabaseUrl!,
    },
    isValid: true,
  };
}

export function getPublicEnvironment(): PublicEnvironment {
  const status = getPublicEnvironmentStatus();

  if (!status.isValid) {
    throw new AppConfigurationError(status.errors);
  }

  return status.environment;
}
