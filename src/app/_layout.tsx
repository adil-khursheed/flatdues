import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Button, ErrorState, LoadingState, Screen } from "@/components";
import { useAuth } from "@/features/auth";
import { icons } from "@/lib/icons";
import { AppProviders } from "@/providers/app-providers";
import { spacing } from "@/theme";

function AuthenticatedStack() {
  const {
    activeMembership,
    isAuthenticated,
    isResolving,
    resolutionError,
    retryResolution,
    sessionIsLoading,
    signOut,
  } = useAuth();

  if (sessionIsLoading || (isAuthenticated && isResolving)) {
    return (
      <Screen contentStyle={styles.centered}>
        <LoadingState
          label={
            sessionIsLoading
              ? "Restoring your secure session..."
              : "Loading your workspace..."
          }
        />
      </Screen>
    );
  }

  if (isAuthenticated && resolutionError) {
    return (
      <Screen contentStyle={styles.centered}>
        <ErrorState
          description={resolutionError}
          onRetry={() => void retryResolution()}
          title="Account couldn't load"
        />
        <Button
          leadingIcon={icons.actions.signOut}
          onPress={() => void signOut()}
          variant="ghost"
        >
          Sign out
        </Button>
      </Screen>
    );
  }

  const hasWorkspace = activeMembership !== null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && !hasWorkspace}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && hasWorkspace}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AppProviders>
          <StatusBar style={isDark ? "light" : "dark"} />
          <AuthenticatedStack />
        </AppProviders>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
});
