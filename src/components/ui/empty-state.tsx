import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import type { AppIconData } from "@/lib/icons";
import { spacing } from "@/theme";

import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";

export type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon?: AppIconData;
  illustration?: ReactNode;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export function EmptyState({
  action,
  description,
  icon,
  illustration,
  style,
  title,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {illustration ??
        (icon ? <AppIcon icon={icon} size="xlarge" tone="muted" /> : null)}
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
