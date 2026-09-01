import type { Database } from "@/lib/supabase";

export type AuthMode = "signIn" | "signUp";

export type AuthCredentials = Readonly<{
  email: string;
  password: string;
}>;

export type SignUpCredentials = AuthCredentials &
  Readonly<{
    displayName: string;
  }>;

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthResolution = Readonly<{
  profile: Profile;
}>;

export type SignUpResult = Readonly<{
  needsEmailConfirmation: boolean;
}>;

export type AuthUser = Readonly<{
  email: string | null;
  id: string;
}>;

export type AuthContextValue = Readonly<{
  isAuthenticated: boolean;
  isResolving: boolean;
  profile: Profile | null;
  resolutionError: string | null;
  retryResolution: () => Promise<void>;
  sessionIsLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<SignUpResult>;
  user: AuthUser | null;
}>;
