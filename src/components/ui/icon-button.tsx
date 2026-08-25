import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet } from "react-native";

import type { AppIconData } from "@/lib/icons";
import { radii, useAppTheme } from "@/theme";

import { AppIcon, type AppIconSize, type AppIconTone } from "./app-icon";

type IconButtonVariant = "danger" | "ghost" | "secondary";

export type IconButtonProps = Omit<PressableProps, "children" | "style"> & {
  accessibilityLabel: string;
  icon: AppIconData;
  iconSize?: AppIconSize;
  style?: StyleProp<ViewStyle>;
  variant?: IconButtonVariant;
};

export function IconButton({
  accessibilityLabel,
  disabled = false,
  icon,
  iconSize = "medium",
  style,
  variant = "ghost",
  ...props
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled === true;
  const variants: Record<
    IconButtonVariant,
    { backgroundColor: string; borderColor: string; iconTone: AppIconTone }
  > = {
    danger: {
      backgroundColor: colors.negativeSoft,
      borderColor: colors.negativeSoft,
      iconTone: "negative",
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      iconTone: "default",
    },
    secondary: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      iconTone: "default",
    },
  };
  const selectedVariant = variants[variant];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selectedVariant.backgroundColor,
          borderColor: selectedVariant.borderColor,
        },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <AppIcon icon={icon} size={iconSize} tone={selectedVariant.iconTone} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});
