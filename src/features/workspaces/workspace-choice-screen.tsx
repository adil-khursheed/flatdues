import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  AppIcon,
  AppText,
  Button,
  Card,
  Screen,
} from "@/components";
import { getAuthErrorMessage, useAuth } from "@/features/auth";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";

export function WorkspaceChoiceScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { profile, signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setError(null);

    try {
      await signOut();
    } catch (signOutError: unknown) {
      setError(getAuthErrorMessage(signOutError, "signOut"));
      setIsSigningOut(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.hero}>
            <View
              style={[styles.heroIcon, { backgroundColor: colors.accentSoft }]}
            >
              <AppIcon icon={icons.entities.workspace} size="xlarge" tone="accent" />
            </View>
            <AppText accessibilityRole="header" variant="title">
              Set up your workspace
            </AppText>
            <AppText style={styles.centeredText} tone="muted">
              Create a home for your shared expenses, or join one your
              flatmate has already created.
            </AppText>
          </View>

          <Card padding="large" style={styles.actionCard}>
            <AppIcon icon={icons.entities.workspace} size="large" tone="accent" />
            <View style={styles.actionCopy}>
              <AppText variant="heading">Create a workspace</AppText>
              <AppText tone="muted">
                Start a new workspace and become its administrator.
              </AppText>
            </View>
            <Button
              fullWidth
              leadingIcon={icons.actions.add}
              onPress={() => router.push("/create-workspace")}
            >
              Create workspace
            </Button>
          </Card>

          <Card padding="large" style={styles.actionCard} variant="outlined">
            <AppIcon icon={icons.actions.invite} size="large" tone="accent" />
            <View style={styles.actionCopy}>
              <AppText variant="heading">Join a workspace</AppText>
              <AppText tone="muted">
                Use the invite code shared by a workspace administrator.
              </AppText>
            </View>
            <Button
              fullWidth
              leadingIcon={icons.actions.invite}
              onPress={() => router.push("/join-workspace")}
              variant="secondary"
            >
              Join workspace
            </Button>
          </Card>

          <View style={styles.account}>
            <AppText tone="muted" variant="caption">
              Signed in as
            </AppText>
            <AppText variant="label">
              {profile?.display_name ?? user?.email ?? "Your account"}
            </AppText>
          </View>

          {error ? (
            <AppText accessibilityLiveRegion="assertive" tone="negative">
              {error}
            </AppText>
          ) : null}

          <Button
            leadingIcon={icons.actions.signOut}
            loading={isSigningOut}
            onPress={() => void handleSignOut()}
            variant="ghost"
          >
            Sign out
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  account: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  actionCard: {
    alignItems: "flex-start",
    gap: spacing.md,
  },
  actionCopy: {
    gap: spacing.xs,
  },
  centeredText: {
    textAlign: "center",
  },
  content: {
    gap: spacing.lg,
    maxWidth: 620,
    width: "100%",
  },
  hero: {
    alignItems: "center",
    gap: spacing.sm,
  },
  heroIcon: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
