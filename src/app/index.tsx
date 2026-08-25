import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Avatar, Card, MoneyText, SectionHeader } from "@/components";
import { radii, spacing, useAppTheme } from "@/theme";

export default function Index() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.hero}>
          <View style={[styles.eyebrow, { backgroundColor: colors.accentSoft }]}>
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
          <AppText variant="heading">Built for the daily flow</AppText>
          <AppText tone="muted">
            The next phases connect secure authentication and workspace data.
            Adding an expense will remain the quickest action in the app.
          </AppText>
        </Card>

        <AppText style={styles.footer} tone="muted" variant="caption">
          Expo SDK 56 · Android and iOS
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  amountGroup: {
    gap: spacing.xxs,
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
    alignSelf: "flex-start",
    borderRadius: radii.pill,
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
  safeArea: {
    flex: 1,
  },
});
