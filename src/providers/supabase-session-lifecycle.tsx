import { useEffect } from "react";
import { AppState, Platform } from "react-native";

import { getSupabaseClient } from "@/lib/supabase";

export function SupabaseSessionLifecycle() {
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
    const subscription = AppState.addEventListener("change", syncRefreshState);

    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  return null;
}
