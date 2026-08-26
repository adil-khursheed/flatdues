import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { ConfigurationGate } from "@/components/configuration-gate";
import { AuthProvider } from "@/features/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigurationGate>
            <AuthProvider>
              <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
            </AuthProvider>
          </ConfigurationGate>
        </QueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
