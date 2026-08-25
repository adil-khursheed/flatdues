import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { spacing, useAppTheme } from "@/theme";

import { Screen } from "./screen";

type ManagedProps =
  | "bottomOffset"
  | "children"
  | "contentContainerStyle"
  | "keyboardDismissMode"
  | "keyboardShouldPersistTaps";

export type KeyboardAwareFormProps = PropsWithChildren<
  Omit<KeyboardAwareScrollViewProps, ManagedProps> & {
    contentContainerStyle?: StyleProp<ViewStyle>;
  }
>;

export function KeyboardAwareForm({
  children,
  contentContainerStyle,
  mode = "insets",
  ...props
}: KeyboardAwareFormProps) {
  const { colors } = useAppTheme();

  return (
    <Screen>
      <KeyboardAwareScrollView
        automaticallyAdjustContentInsets={false}
        bottomOffset={spacing.md}
        contentContainerStyle={[
          styles.content,
          styles.safeBottomSpacing,
          contentContainerStyle,
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        mode={mode}
        style={{ backgroundColor: colors.background }}
        {...props}
      >
        {children}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  safeBottomSpacing: {
    paddingBottom: spacing.lg,
  },
});
