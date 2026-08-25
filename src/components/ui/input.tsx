import { useState } from "react";
import type {
  StyleProp,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { StyleSheet, TextInput, View } from "react-native";

import type { AppIconData } from "@/lib/icons";
import { radii, spacing, typography, useAppTheme } from "@/theme";

import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";

export type InputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
  hint?: string;
  label?: string;
  leadingIcon?: AppIconData;
  trailingIcon?: AppIconData;
};

export function Input({
  accessibilityLabel,
  containerStyle,
  editable = true,
  error,
  hint,
  label,
  leadingIcon,
  onBlur,
  onFocus,
  style,
  trailingIcon,
  ...props
}: InputProps) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <View
        style={[
          styles.inputFrame,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.negative
              : isFocused
                ? colors.focus
                : colors.border,
          },
          !editable && styles.disabled,
        ]}
      >
        {leadingIcon ? (
          <AppIcon
            icon={leadingIcon}
            size="small"
            tone={error ? "negative" : "muted"}
          />
        ) : null}
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: !editable }}
          editable={editable}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          {...props}
          style={[styles.input, typography.body, { color: colors.text }, style]}
        />
        {trailingIcon ? (
          <AppIcon
            icon={trailingIcon}
            size="small"
            tone={error ? "negative" : "muted"}
          />
        ) : null}
      </View>
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="negative" variant="caption">
          {error}
        </AppText>
      ) : hint ? (
        <AppText tone="muted" variant="caption">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.56,
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: spacing.sm,
  },
  inputFrame: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
});
