import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import { getSupabaseClient } from "@/lib/supabase";

import { getAuthErrorMessage } from "./auth-errors";
import {
  getInitialSession,
  resolveAuthenticatedUser,
  signInWithPassword,
  signOutFromSupabase,
  signUpWithPassword,
  subscribeToAuthChanges,
} from "./auth-repository";
import type {
  AuthContextValue,
  AuthCredentials,
  Profile,
  SignUpCredentials,
} from "./types";

const AuthContext = createContext<AuthContextValue | null>(null);

type ResolutionSnapshot = Readonly<{
  attempt: number;
  error: string | null;
  profile: Profile | null;
  userId: string;
}>;

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionIsLoading, setSessionIsLoading] = useState(true);
  const [resolution, setResolution] = useState<ResolutionSnapshot | null>(null);
  const [resolutionAttempt, setResolutionAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const authEventSeen = useRef(false);
  const sessionUserId = session?.user.id ?? null;
  const resolutionMatches =
    resolution?.userId === sessionUserId &&
    resolution.attempt === resolutionAttempt;
  const profile = resolutionMatches ? resolution.profile : null;
  const resolutionError = resolutionMatches ? resolution.error : null;
  const isResolving =
    sessionUserId !== null && (!resolutionMatches || isRetrying);

  useEffect(() => {
    let isMounted = true;
    const subscription = subscribeToAuthChanges((_event, nextSession) => {
      authEventSeen.current = true;

      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setResolution((current) =>
        nextSession && current?.userId === nextSession.user.id
          ? current
          : null,
      );
      setSessionIsLoading(false);
    });

    void getInitialSession()
      .then((initialSession) => {
        if (isMounted && !authEventSeen.current) {
          setSession(initialSession);
          setSessionIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted && !authEventSeen.current) {
          setSession(null);
          setSessionIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const supabase = getSupabaseClient();
    const syncRefreshState = (state: string) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    syncRefreshState(AppState.currentState);
    const appStateSubscription = AppState.addEventListener(
      "change",
      syncRefreshState,
    );

    return () => {
      appStateSubscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const userId = sessionUserId;

    if (!userId) {
      queryClient.clear();
      return;
    }

    void resolveAuthenticatedUser(userId)
      .then((nextResolution) => {
        if (!isCurrent) {
          return;
        }

        setResolution({
          attempt: resolutionAttempt,
          error: null,
          profile: nextResolution.profile,
          userId,
        });
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        setResolution({
          attempt: resolutionAttempt,
          error: getAuthErrorMessage(error, "resolve"),
          profile: null,
          userId,
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [queryClient, resolutionAttempt, sessionUserId]);

  const signIn = useCallback((credentials: AuthCredentials) => {
    return signInWithPassword(credentials);
  }, []);

  const signUp = useCallback((credentials: SignUpCredentials) => {
    return signUpWithPassword(credentials);
  }, []);

  const signOut = useCallback(() => signOutFromSupabase(), []);

  const retryResolution = useCallback(async () => {
    if (isRetrying) {
      return;
    }

    setIsRetrying(true);
    try {
      const { error } = await getSupabaseClient().auth.refreshSession();

      if (error) {
        if (sessionUserId) {
          setResolution({
            attempt: resolutionAttempt,
            error: getAuthErrorMessage(error, "resolve"),
            profile: null,
            userId: sessionUserId,
          });
        }
        return;
      }

      setResolutionAttempt((attempt) => attempt + 1);
    } catch (error: unknown) {
      if (sessionUserId) {
        setResolution({
          attempt: resolutionAttempt,
          error: getAuthErrorMessage(error, "resolve"),
          profile: null,
          userId: sessionUserId,
        });
      }
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, resolutionAttempt, sessionUserId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: session !== null,
      isResolving,
      profile,
      resolutionError,
      retryResolution,
      sessionIsLoading,
      signIn,
      signOut,
      signUp,
      user: session
        ? { email: session.user.email ?? null, id: session.user.id }
        : null,
    }),
    [
      isResolving,
      profile,
      resolutionError,
      retryResolution,
      session,
      sessionIsLoading,
      signIn,
      signOut,
      signUp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
