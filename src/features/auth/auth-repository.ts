import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/supabase";

import type {
  AuthCredentials,
  AuthResolution,
  SignUpCredentials,
  SignUpResult,
} from "./types";

export async function getInitialSession() {
  const { data, error } = await getSupabaseClient().auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return getSupabaseClient().auth.onAuthStateChange(callback).data.subscription;
}

export async function signInWithPassword({
  email,
  password,
}: AuthCredentials) {
  const { error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signUpWithPassword({
  displayName,
  email,
  password,
}: SignUpCredentials): Promise<SignUpResult> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    throw error;
  }

  return { needsEmailConfirmation: data.session === null };
}

export async function signOutFromSupabase() {
  const auth = getSupabaseClient().auth;
  const { error } = await auth.signOut();

  if (error) {
    const { error: localError } = await auth.signOut({ scope: "local" });

    if (localError) {
      throw error;
    }
  }
}

export async function resolveAuthenticatedUser(
  userId: string,
): Promise<AuthResolution> {
  const supabase = getSupabaseClient();
  const [profileResult, membershipResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("workspace_members")
      .select("workspace_id, user_id, role")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (membershipResult.error) {
    throw membershipResult.error;
  }

  if (!profileResult.data) {
    throw new Error("AUTH_PROFILE_MISSING");
  }

  return {
    activeMembership: membershipResult.data,
    profile: profileResult.data,
  };
}
