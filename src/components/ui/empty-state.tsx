import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { spacing } from "@/theme";

import { AppText } from "./app-text";

export type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  illustration?: ReactNode;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export function EmptyState({
  action,
  description,
  illustration,
  style,
  title,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {illustration}
      <View style={styles.copy}>
        <AppText accessibilityRole="header" variant="heading">
          {title}
        </AppText>
        <AppText tone="muted">{description}</AppText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  copy: {
    alignItems: "center",
    gap: spacing.xs,
  },
});
