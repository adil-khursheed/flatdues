import type { TextProps } from "react-native";
import { StyleSheet, Text } from "react-native";

import { typography, useAppTheme } from "@/theme";

export type AppTextVariant = keyof typeof typography;
export type AppTextTone =
  | "accent"
  | "default"
  | "inverse"
  | "muted"
  | "negative"
  | "positive"
  | "warning";

export type AppTextProps = TextProps & {
  tone?: AppTextTone;
  variant?: AppTextVariant;
};

export function AppText({
  style,
  tone = "default",
  variant = "body",
  ...props
}: AppTextProps) {
  const { colors } = useAppTheme();
  const toneColors: Record<AppTextTone, string> = {
    accent: colors.accent,
    default: colors.text,
    inverse: colors.onAccent,
    muted: colors.textMuted,
    negative: colors.negative,
    positive: colors.positive,
    warning: colors.warning,
  };

  return (
    <Text
      allowFontScaling
      {...props}
      style={[styles.base, typography[variant], { color: toneColors[tone] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: undefined,
  },
});
