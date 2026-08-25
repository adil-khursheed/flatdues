import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { icons } from "@/lib/icons";
import { spacing } from "@/theme";

import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { Button } from "./button";

export type ErrorStateProps = {
  description?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  title?: string;
};

export function ErrorState({
  description = "We couldn't load this right now. Please try again.",
  onRetry,
  style,
  title = "Something went wrong",
}: ErrorStateProps) {
  return (
    <View accessibilityLiveRegion="polite" style={[styles.container, style]}>
      <AppIcon icon={icons.states.error} size="xlarge" tone="negative" />
      <View style={styles.copy}>
        <AppText accessibilityRole="header" variant="heading">
          {title}
        </AppText>
        <AppText tone="muted">{description}</AppText>
      </View>
      {onRetry ? (
        <Button
          leadingIcon={icons.actions.refresh}
          onPress={onRetry}
          variant="secondary"
        >
          Try again
        </Button>
      ) : null}
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
