import type { StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { spacing, useAppTheme } from "@/theme";

import { AppText } from "./app-text";

export type LoadingStateProps = {
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function LoadingState({
  label = "Loading…",
  style,
}: LoadingStateProps) {
  const { colors } = useAppTheme();

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={[styles.container, style]}
    >
      <ActivityIndicator color={colors.accent} size="small" />
      <AppText tone="muted" variant="label">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
