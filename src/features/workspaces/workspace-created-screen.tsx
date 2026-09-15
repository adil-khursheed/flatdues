import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import {
  AppIcon,
  AppText,
  Button,
  Card,
  Screen,
  type AppBottomSheetModalRef,
} from "@/components";
import { CreateInviteSheet } from "@/features/invites";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";
import { useWorkspace } from "./workspace-provider";

export function WorkspaceCreatedScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    activeWorkspace,
    clearPendingCreatedWorkspace,
    pendingCreatedWorkspaceId,
  } = useWorkspace();
  const inviteSheetRef = useRef<AppBottomSheetModalRef>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (
    !activeWorkspace ||
    !pendingCreatedWorkspaceId ||
    activeWorkspace.id !== pendingCreatedWorkspaceId
  ) {
    return <Redirect href="/home" />;
  }

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
              style={[
                styles.heroIcon,
                { backgroundColor: colors.positiveSoft },
              ]}
            >
              <AppIcon
                icon={icons.states.settled}
                size="xlarge"
                tone="positive"
              />
            </View>
            <AppText accessibilityRole="header" variant="title">
              {activeWorkspace.name} is ready
            </AppText>
            <AppText style={styles.centeredText} tone="muted">
              You&apos;re the workspace administrator. Invite your flatmates
              now, or continue and do it later.
            </AppText>
          </View>

          <Card padding="large" style={styles.card}>
            <View style={styles.sectionHeading}>
              <AppIcon icon={icons.actions.invite} tone="accent" />
              <View style={styles.sectionCopy}>
                <AppText variant="heading">Invite flatmates</AppText>
                <AppText tone="muted">
                  New codes default to seven days and five joins. You can adjust
                  both limits before creating one.
                </AppText>
              </View>
            </View>
            <Button
              fullWidth
              leadingIcon={icons.actions.invite}
              onPress={() => inviteSheetRef.current?.present()}
            >
              Create invite code
            </Button>
            {message ? (
              <AppText accessibilityLiveRegion="polite" tone="positive">
                {message}
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

      <CreateInviteSheet
        ref={inviteSheetRef}
        onCreated={() => setMessage("Invitation created.")}
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  centeredText: { textAlign: "center" },
  content: { gap: spacing.lg, maxWidth: 620, width: "100%" },
  hero: { alignItems: "center", gap: spacing.sm },
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
  sectionCopy: { flex: 1, gap: spacing.xs },
  sectionHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
});
