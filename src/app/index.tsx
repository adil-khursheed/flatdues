import { useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  AppBottomSheetModal,
  type AppBottomSheetModalRef,
  AppIcon,
  AppText,
  Avatar,
  Button,
  Card,
  MoneyText,
  Screen,
  SectionHeader,
} from "@/components";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";

export default function Index() {
  const { colors } = useAppTheme();
  const foundationSheetRef = useRef<AppBottomSheetModalRef>(null);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.hero}>
          <View style={[styles.eyebrow, { backgroundColor: colors.accentSoft }]}>
            <AppIcon icon={icons.entities.workspace} size="small" tone="accent" />
            <AppText tone="accent" variant="label">
              Shared home finances
            </AppText>
          </View>
          <AppText accessibilityRole="header" variant="display">
            Flatdues
          </AppText>
          <AppText tone="muted">
            A trustworthy place for flatmates to track expenses, budgets, and
            who owes what.
          </AppText>
        </View>

        <Card accessibilityLabel="Design system preview" padding="large">
          <SectionHeader
            action={<Avatar name="Flat 302" />}
            description="Phase 1 foundation"
            title="Architecture ready"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.amountGroup}>
            <AppText tone="muted" variant="label">
              Example monthly spending
            </AppText>
            <MoneyText amount={18450} variant="title" />
            <View style={styles.remainingRow}>
              <MoneyText amount={11550} state="positive" variant="label" />
              <AppText tone="positive" variant="label">
                remaining in the example budget
              </AppText>
            </View>
          </View>
        </Card>

        <Card padding="large" variant="muted">
          <View style={styles.cardHeading}>
            <AppIcon icon={icons.entities.expense} tone="accent" />
            <AppText variant="heading">Built for the daily flow</AppText>
          </View>
          <AppText tone="muted">
            The next phases connect secure authentication and workspace data.
            Adding an expense will remain the quickest action in the app.
          </AppText>
          <Button
            leadingIcon={icons.actions.add}
            onPress={() => foundationSheetRef.current?.present()}
            variant="secondary"
          >
            Preview native sheet
          </Button>
        </Card>

        <AppText style={styles.footer} tone="muted" variant="caption">
          Expo SDK 56 · Android and iOS
        </AppText>
      </ScrollView>

      <AppBottomSheetModal
        ref={foundationSheetRef}
        description="Hugeicons and Gorhom Bottom Sheet now share the app theme and accessibility conventions."
        title="Native foundation ready"
      >
        <View style={styles.sheetPreview}>
          <View
            style={[
              styles.sheetIcon,
              { backgroundColor: colors.positiveSoft },
            ]}
          >
            <AppIcon
              icon={icons.states.settled}
              size="xlarge"
              tone="positive"
            />
          </View>
          <AppText tone="muted">
            Future pickers, filters, compact actions, and confirmations will use
            this shared sheet instead of React Native Modal.
          </AppText>
          <Button
            fullWidth
            leadingIcon={icons.actions.confirm}
            onPress={() => foundationSheetRef.current?.dismiss()}
          >
            Done
          </Button>
        </View>
      </AppBottomSheetModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountGroup: {
    gap: spacing.xxs,
  },
  cardHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  content: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: 680,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: "100%",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.lg,
  },
  eyebrow: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  footer: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  hero: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.lg,
  },
  remainingRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
  },
  sheetIcon: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: radii.pill,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  sheetPreview: {
    gap: spacing.lg,
  },
});
