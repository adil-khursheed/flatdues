import { HugeiconsIcon } from "@hugeicons/react-native";
import type { HugeiconsProps } from "@hugeicons/react-native";

import { useAppTheme } from "@/theme";

import type { AppTextTone } from "./app-text";

export type AppIconSize = "large" | "medium" | "small" | "xlarge" | "xsmall";
export type AppIconTone = AppTextTone;

export type AppIconProps = Omit<
  HugeiconsProps,
  "color" | "icon" | "size" | "strokeWidth"
> & {
  accessibilityLabel?: string;
  icon: HugeiconsProps["icon"];
  size?: AppIconSize | number;
  strokeWidth?: number;
  tone?: AppIconTone;
};

const iconSizes: Record<AppIconSize, number> = {
  xsmall: 16,
  small: 20,
  medium: 24,
  large: 28,
  xlarge: 36,
};

export function AppIcon({
  accessibilityLabel,
  icon,
  size = "medium",
  strokeWidth = 1.8,
  tone = "default",
  ...props
}: AppIconProps) {
  const { colors } = useAppTheme();
  const toneColors: Record<AppIconTone, string> = {
    accent: colors.accent,
    default: colors.text,
    inverse: colors.onAccent,
    muted: colors.textMuted,
    negative: colors.negative,
    positive: colors.positive,
    warning: colors.warning,
  };
  const isDecorative = !accessibilityLabel;

  return (
    <HugeiconsIcon
      accessibilityElementsHidden={isDecorative}
      accessibilityLabel={accessibilityLabel}
      accessible={!isDecorative}
      color={toneColors[tone]}
      focusable={!isDecorative}
      icon={icon}
      importantForAccessibility={isDecorative ? "no-hide-descendants" : "yes"}
      size={typeof size === "number" ? size : iconSizes[size]}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
