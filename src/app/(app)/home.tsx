import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppIcon, AppText, Button, Card, Screen } from "@/components";
import { getAuthErrorMessage, useAuth } from "@/features/auth";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";

export default function HomeRoute() {
  const { colors } = useAppTheme();
  const { activeMembership, profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
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
    <Screen contentStyle={styles.screen}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View
            style={[styles.icon, { backgroundColor: colors.positiveSoft }]}
          >
            <AppIcon
              icon={icons.states.settled}
              size="xlarge"
              tone="positive"
            />
          </View>
          <AppText accessibilityRole="header" variant="title">
            Welcome, {profile?.display_name ?? "flatmate"}
          </AppText>
          <AppText tone="muted">
            Your session and active workspace membership are ready.
          </AppText>
        </View>

        <Card padding="large" style={styles.card} variant="muted">
          <AppText variant="label">Phase 4 complete</AppText>
          <AppText tone="muted">
            The full dashboard and tab navigation arrive in Phase 12. Workspace
            access is already protected by both this route guard and database
            authorization.
          </AppText>
          <AppText tone="muted" variant="caption">
            Workspace: {activeMembership?.workspace_id}
          </AppText>
        </Card>

        {error ? (
          <AppText accessibilityLiveRegion="assertive" tone="negative">
            {error}
          </AppText>
        ) : null}
        <Button
          leadingIcon={icons.actions.signOut}
          loading={isSigningOut}
          onPress={() => void handleSignOut()}
          variant="secondary"
        >
          Sign out
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
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
  icon: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  screen: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
});
