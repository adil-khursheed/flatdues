import { useState } from "react";
import type {
  StyleProp,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { StyleSheet, TextInput, View } from "react-native";

import { radii, spacing, typography, useAppTheme } from "@/theme";

import { AppText } from "./app-text";

export type InputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
  hint?: string;
  label?: string;
};

export function Input({
  accessibilityLabel,
  containerStyle,
  editable = true,
  error,
  hint,
  label,
  onBlur,
  onFocus,
  style,
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
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !editable }}
        editable={editable}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        {...props}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.negative
              : isFocused
                ? colors.focus
                : colors.border,
            color: colors.text,
          },
          !editable && styles.disabled,
          style,
        ]}
      />
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
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
