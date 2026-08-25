import { forwardRef } from "react";
import type { ComponentProps, ComponentRef } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

import { radii, spacing, typography, useAppTheme } from "@/theme";

import { AppText } from "./app-text";

type BottomSheetTextInputComponentProps = ComponentProps<
  typeof BottomSheetTextInput
>;

export type AppBottomSheetTextInputProps = BottomSheetTextInputComponentProps & {
  error?: string;
  hint?: string;
  label?: string;
};

export const AppBottomSheetTextInput = forwardRef<
  ComponentRef<typeof BottomSheetTextInput>,
  AppBottomSheetTextInputProps
>(function AppBottomSheetTextInput(
  {
    accessibilityLabel,
    editable = true,
    error,
    hint,
    label,
    style,
    ...props
  },
  ref,
) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <BottomSheetTextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !editable }}
        editable={editable}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        {...props}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: error ? colors.negative : colors.border,
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
});

AppBottomSheetTextInput.displayName = "AppBottomSheetTextInput";

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
