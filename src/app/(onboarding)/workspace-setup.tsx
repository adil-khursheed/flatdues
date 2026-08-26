import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, EmptyState, Screen } from "@/components";
import { getAuthErrorMessage, useAuth } from "@/features/auth";
import { icons } from "@/lib/icons";
import { spacing } from "@/theme";

export default function WorkspaceSetupRoute() {
  const { signOut, user } = useAuth();
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
      <Card padding="large" style={styles.card}>
        <EmptyState
          description="Your account is ready. Phase 5 adds the Create Workspace and Join Workspace flows here."
          icon={icons.entities.workspace}
          title="Set up your workspace"
        />
        <View style={styles.account}>
          <AppText tone="muted" variant="caption">
            Signed in as
          </AppText>
          <AppText variant="label">{user?.email ?? "Your account"}</AppText>
        </View>
        {error ? (
          <AppText accessibilityLiveRegion="assertive" tone="negative">
            {error}
          </AppText>
        ) : null}
        <Button
          fullWidth
          leadingIcon={icons.actions.signOut}
          loading={isSigningOut}
          onPress={() => void handleSignOut()}
          variant="secondary"
        >
          Sign out
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  account: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  card: {
    gap: spacing.md,
    maxWidth: 560,
    width: "100%",
  },
  screen: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
});
