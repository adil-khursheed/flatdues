import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  AppIcon,
  AppText,
  Button,
  Card,
  Screen,
} from "@/components";
import {
  copyInviteToken,
  shareWorkspaceInvite,
  useGenerateWorkspaceInvite,
} from "@/features/invites";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";

import { getWorkspaceErrorMessage } from "./workspace-errors";
import { useWorkspace } from "./workspace-provider";

export function WorkspaceCreatedScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    activeWorkspace,
    clearPendingCreatedWorkspace,
    pendingCreatedWorkspaceId,
  } = useWorkspace();
  const inviteMutation = useGenerateWorkspaceInvite(
    activeWorkspace?.id ?? "",
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const invite = inviteMutation.data;

  if (
    !activeWorkspace ||
    !pendingCreatedWorkspaceId ||
    activeWorkspace.id !== pendingCreatedWorkspaceId
  ) {
    return <Redirect href="/home" />;
  }

  const handleCopy = async () => {
    if (!invite) {
      return;
    }

    setActionError(null);
    setActionMessage(null);

    try {
      await copyInviteToken(invite.token);
      setActionMessage("Invite code copied.");
    } catch {
      setActionError("We couldn't copy the code. Select and copy it manually.");
    }
  };

  const handleShare = async () => {
    if (!invite) {
      return;
    }

    setActionError(null);
    setActionMessage(null);

    try {
      await shareWorkspaceInvite({
        token: invite.token,
        workspaceName: activeWorkspace.name,
      });
    } catch {
      setActionError("We couldn't open sharing. Copy the invite code instead.");
    }
  };

  const handleContinue = () => {
    clearPendingCreatedWorkspace();
    router.replace("/home");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View
              style={[styles.heroIcon, { backgroundColor: colors.positiveSoft }]}
            >
              <AppIcon icon={icons.states.settled} size="xlarge" tone="positive" />
            </View>
            <AppText accessibilityRole="header" variant="title">
              {activeWorkspace.name} is ready
            </AppText>
            <AppText style={styles.centeredText} tone="muted">
              You&apos;re the workspace administrator. Invite your flatmates now,
              or continue and do it later.
            </AppText>
          </View>

          <Card padding="large" style={styles.card}>
            <View style={styles.sectionHeading}>
              <AppIcon icon={icons.actions.invite} tone="accent" />
              <View style={styles.sectionCopy}>
                <AppText variant="heading">Invite flatmates</AppText>
                <AppText tone="muted">
                  The invite code does not expire and has no usage limit for
                  now. Share it only with people you want in this workspace.
                </AppText>
              </View>
            </View>

            {invite ? (
              <>
                <Card padding="medium" style={styles.tokenCard} variant="muted">
                  <AppText tone="muted" variant="caption">
                    Invite code
                  </AppText>
                  <AppText selectable style={styles.token} variant="bodyStrong">
                    {invite.token}
                  </AppText>
                </Card>
                <View style={styles.actions}>
                  <Button
                    leadingIcon={icons.actions.copy}
                    onPress={() => void handleCopy()}
                    style={styles.actionButton}
                    variant="secondary"
                  >
                    Copy
                  </Button>
                  <Button
                    leadingIcon={icons.actions.share}
                    onPress={() => void handleShare()}
                    style={styles.actionButton}
                    variant="secondary"
                  >
                    Share
                  </Button>
                </View>
              </>
            ) : (
              <Button
                fullWidth
                leadingIcon={icons.actions.invite}
                loading={inviteMutation.isPending}
                onPress={() => {
                  setActionError(null);
                  inviteMutation.mutate();
                }}
              >
                Create invite code
              </Button>
            )}

            {inviteMutation.error ? (
              <AppText accessibilityLiveRegion="assertive" tone="negative">
                {getWorkspaceErrorMessage(inviteMutation.error, "invite")}
              </AppText>
            ) : null}
            {actionError ? (
              <AppText accessibilityLiveRegion="assertive" tone="negative">
                {actionError}
              </AppText>
            ) : null}
            {actionMessage ? (
              <AppText accessibilityLiveRegion="polite" tone="positive">
                {actionMessage}
              </AppText>
            ) : null}
          </Card>

          <Button
            fullWidth
            onPress={handleContinue}
            trailingIcon={icons.actions.forward}
          >
            Continue to home
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    gap: spacing.lg,
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
  sectionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  token: {
    letterSpacing: 0.5,
  },
  tokenCard: {
    gap: spacing.xs,
  },
});
