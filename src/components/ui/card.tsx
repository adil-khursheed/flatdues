import type { PropsWithChildren } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { radii, spacing, useAppTheme } from "@/theme";

type CardPadding = "large" | "medium" | "none" | "small";
type CardVariant = "elevated" | "muted" | "outlined";

export type CardProps = PropsWithChildren<
  ViewProps & {
    padding?: CardPadding;
    style?: StyleProp<ViewStyle>;
    variant?: CardVariant;
  }
>;

export function Card({
  children,
  padding = "medium",
  style,
  variant = "elevated",
  ...props
}: CardProps) {
  const { colors } = useAppTheme();
  const paddingStyles: Record<CardPadding, ViewStyle> = {
    none: { padding: spacing.none },
    small: { padding: spacing.sm },
    medium: { padding: spacing.md },
    large: { padding: spacing.lg },
  };

  return (
    <View
      {...props}
      style={[
        styles.base,
        {
          backgroundColor:
            variant === "muted" ? colors.surfaceMuted : colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        variant === "outlined" && styles.outlined,
        variant === "elevated" && styles.elevated,
        paddingStyles[padding],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
  },
  elevated: {
    elevation: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  outlined: {
    borderWidth: 1,
  },
});
