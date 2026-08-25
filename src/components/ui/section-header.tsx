import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { spacing } from "@/theme";

import { AppText } from "./app-text";

export type SectionHeaderProps = {
  action?: ReactNode;
  description?: string;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export function SectionHeader({
  action,
  description,
  style,
  title,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        <AppText accessibilityRole="header" variant="heading">
          {title}
        </AppText>
        {description ? (
          <AppText tone="muted" variant="caption">
            {description}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
});
