import type { ReactNode } from "react";
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from "react-native";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { radii, spacing, useAppTheme } from "@/theme";

import { AppText, type AppTextTone } from "./app-text";

type ButtonVariant = "danger" | "ghost" | "primary" | "secondary";
type ButtonSize = "compact" | "default";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: ButtonVariant;
};

export function Button({
  accessibilityLabel,
  children,
  disabled = false,
  fullWidth = false,
  loading = false,
  size = "default",
  style,
  textStyle,
  variant = "primary",
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;
  const variants: Record<
    ButtonVariant,
    { backgroundColor: string; borderColor: string; textTone: AppTextTone }
  > = {
    primary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      textTone: "inverse",
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      textTone: "default",
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textTone: "accent",
    },
    danger: {
      backgroundColor: colors.negative,
      borderColor: colors.negative,
      textTone: "inverse",
    },
  };
  const selectedVariant = variants[variant];

  return (
    <Pressable
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === "string" ? children : undefined)
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        size === "compact" ? styles.compact : styles.default,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: selectedVariant.backgroundColor,
          borderColor: selectedVariant.borderColor,
        },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityElementsHidden
          color={
            selectedVariant.textTone === "inverse"
              ? colors.onAccent
              : colors.accent
          }
          size="small"
        />
      ) : (
        <AppText tone={selectedVariant.textTone} variant="bodyStrong" style={textStyle}>
          {children}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 48,
  },
  compact: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  default: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.48,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
