import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { AppIcon, AppText, Screen } from "@/components/ui";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { icons } from "@/lib/icons";
import { getSupabaseClient } from "@/lib/supabase";
import { spacing } from "@/theme";

export function ConfigurationGate({ children }: PropsWithChildren) {
  const status = getPublicEnvironmentStatus();

  if (status.isValid) {
    getSupabaseClient();
    return children;
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View
        accessibilityLiveRegion="assertive"
        accessibilityRole="alert"
        style={styles.content}
      >
        <AppIcon icon={icons.states.error} size="xlarge" tone="negative" />
        <View style={styles.copy}>
          <AppText accessibilityRole="header" variant="title">
            Supabase configuration needed
          </AppText>
          <AppText tone="muted">
            Copy .env.example to .env.local, add the public project values, and
            restart Expo.
          </AppText>
        </View>
        <View style={styles.problems}>
          {status.errors.map((problem) => (
            <AppText key={problem} tone="negative" variant="label">
              {problem}
            </AppText>
          ))}
        </View>
        <AppText tone="muted" variant="caption">
          Never put a Supabase service-role key in this mobile app.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    gap: spacing.lg,
    maxWidth: 560,
    width: "100%",
  },
  copy: {
    alignItems: "center",
    gap: spacing.xs,
  },
  problems: {
    alignSelf: "stretch",
    gap: spacing.xs,
  },
  screen: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
});
