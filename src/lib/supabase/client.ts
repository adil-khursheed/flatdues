import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

import { getPublicEnvironment } from "@/lib/env";

import type { Database } from "./database.types";
import { secureStoreAdapter } from "./secure-store-adapter";

const webSessionStorage = new Map<string, string>();

const memoryStorageAdapter = {
  getItem: async (key: string) => webSessionStorage.get(key) ?? null,
  removeItem: async (key: string) => {
    webSessionStorage.delete(key);
  },
  setItem: async (key: string, value: string) => {
    webSessionStorage.set(key, value);
  },
};

let client: SupabaseClient<Database> | undefined;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) {
    return client;
  }

  const { supabasePublishableKey, supabaseUrl } = getPublicEnvironment();

  client = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage:
        Platform.OS === "web" ? memoryStorageAdapter : secureStoreAdapter,
    },
  });

  return client;
}

export type { Database } from "./database.types";
