import { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  AppBottomSheetModal,
  AppConfirmationSheet,
  AppIcon,
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Screen,
  type AppBottomSheetModalRef,
} from "@/components";
import { useWorkspace } from "@/features/workspaces";
import { icons } from "@/lib/icons";
import { spacing, useAppTheme } from "@/theme";
import { CreateInviteSheet } from "./create-invite-sheet";
import { copyInviteToken, shareWorkspaceInvite } from "./invite-actions";
import { getInviteErrorMessage } from "./invite-errors";
import { useRevokeWorkspaceInvite, useWorkspaceInvites } from "./invite-hooks";
import {
  formatInviteExpiry,
  getInviteRemainingUses,
  getInviteStatus,
} from "./invite-status";
import type { InviteStatus, WorkspaceInvite } from "./types";

const statusLabels: Record<Exclude<InviteStatus, "active">, string> = {
  exhausted: "Used up",
  expired: "Expired",
  revoked: "Revoked",
};

export function InvitesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { activeMembership, activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? "";
  const isAdmin = activeMembership?.role === "admin";
  const query = useWorkspaceInvites(workspaceId, isAdmin);
  const { refetch } = query;
  const revokeMutation = useRevokeWorkspaceInvite(workspaceId);
  const createSheetRef = useRef<AppBottomSheetModalRef>(null);
  const actionSheetRef = useRef<AppBottomSheetModalRef>(null);
  const revokeSheetRef = useRef<AppBottomSheetModalRef>(null);
  const shouldPresentRevokeRef = useRef(false);
  const [selectedInvite, setSelectedInvite] = useState<WorkspaceInvite | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin && workspaceId) void refetch();
    }, [isAdmin, refetch, workspaceId])
  );

  if (!activeWorkspace || !activeMembership) {
    return null;
  }

  const invites = query.data ?? [];
  const activeInvites = invites.filter(
    (invite) => getInviteStatus(invite) === "active"
  );
  const pastInvites = invites.filter(
    (invite) => getInviteStatus(invite) !== "active"
  );

  const handleCopy = async () => {
    if (!selectedInvite) return;
    setActionError(null);
    setActionMessage(null);
    try {
      await copyInviteToken(selectedInvite.token);
      setActionMessage("Invite code copied.");
    } catch {
      setActionError("We couldn't copy the code. Select and copy it manually.");
    }
  };

  const handleShare = async () => {
    if (!selectedInvite) return;
    setActionError(null);
    setActionMessage(null);
    try {
      await shareWorkspaceInvite({
        token: selectedInvite.token,
        workspaceName: activeWorkspace.name,
      });
      setActionMessage("Sharing opened.");
    } catch {
      setActionError("We couldn't open sharing. Copy the invite code instead.");
    }
  };

  const queueRevoke = () => {
    shouldPresentRevokeRef.current = true;
    actionSheetRef.current?.dismiss();
  };

  const handleActionDismiss = () => {
    if (shouldPresentRevokeRef.current) {
      shouldPresentRevokeRef.current = false;
      setTimeout(() => revokeSheetRef.current?.present(), 0);
    }
  };

  const renderInvite = (invite: WorkspaceInvite, active: boolean) => {
    const remaining = getInviteRemainingUses(invite);
    const status = getInviteStatus(invite);
    return (
      <Card key={invite.id} padding="large" style={styles.inviteCard}>
        <View style={styles.inviteHeading}>
          <View style={styles.inviteTitle}>
            <AppIcon
              icon={active ? icons.actions.invite : icons.states.information}
              tone={active ? "accent" : "muted"}
            />
            <AppText variant="bodyStrong">
              {active
                ? "Active invitation"
                : statusLabels[status as Exclude<InviteStatus, "active">]}
            </AppText>
          </View>
          {active ? (
            <IconButton
              accessibilityLabel="Invitation actions"
              icon={icons.actions.more}
              onPress={() => {
                setActionError(null);
                setActionMessage(null);
                setSelectedInvite(invite);
                actionSheetRef.current?.present();
              }}
              variant="secondary"
            />
          ) : null}
        </View>
        <Card padding="medium" style={styles.tokenCard} variant="muted">
          <AppText tone="muted" variant="caption">
            Invite code
          </AppText>
          <AppText
            selectable={active}
            style={styles.token}
            variant="bodyStrong"
          >
            {active ? invite.token : `••••••••${invite.token.slice(-8)}`}
          </AppText>
        </Card>
        <View style={styles.metadata}>
          <View style={styles.metaRow}>
            <AppIcon icon={icons.entities.expiry} size="small" tone="muted" />
            <AppText tone="muted" variant="caption">
              {formatInviteExpiry(invite.expires_at)}
            </AppText>
          </View>
          <View style={styles.metaRow}>
            <AppIcon icon={icons.entities.capacity} size="small" tone="muted" />
            <AppText tone="muted" variant="caption">
              {remaining === null
                ? "Unlimited uses"
                : `${remaining} of ${invite.max_uses} joins remaining`}
            </AppText>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          isAdmin ? (
            <RefreshControl
              onRefresh={() => void query.refetch()}
              refreshing={query.isRefetching}
              tintColor={colors.accent}
            />
          ) : undefined
        }
      >
        <View style={styles.header}>
          <IconButton
            accessibilityLabel="Go back"
            icon={icons.actions.back}
            onPress={() => router.back()}
          />
          <View style={styles.headerCopy}>
            <AppText accessibilityRole="header" variant="title">
              Invitations
            </AppText>
            <AppText tone="muted">{activeWorkspace.name}</AppText>
          </View>
          {isAdmin ? (
            <IconButton
              accessibilityLabel="Create invitation"
              icon={icons.actions.add}
              onPress={() => createSheetRef.current?.present()}
              variant="secondary"
            />
          ) : null}
        </View>

        {!isAdmin ? (
          <ErrorState
            description="Only active workspace administrators can view or manage invite codes."
            title="Administrator access required"
          />
        ) : query.isPending ? (
          <LoadingState label="Loading invitations…" />
        ) : query.error ? (
          <ErrorState
            description={getInviteErrorMessage(query.error, "load")}
            onRetry={() => void query.refetch()}
            title="Invitations unavailable"
          />
        ) : invites.length === 0 ? (
          <EmptyState
            action={
              <Button
                leadingIcon={icons.actions.invite}
                onPress={() => createSheetRef.current?.present()}
              >
                Create invitation
              </Button>
            }
            description="Create a time-limited code when you're ready to add flatmates."
            icon={icons.actions.invite}
            title="No invitations yet"
          />
        ) : (
          <>
            <View style={styles.section}>
              <AppText variant="heading">
                Active invitations ({activeInvites.length})
              </AppText>
              {activeInvites.length > 0 ? (
                activeInvites.map((invite) => renderInvite(invite, true))
              ) : (
                <AppText tone="muted">No active invitation codes.</AppText>
              )}
            </View>
            {pastInvites.length > 0 ? (
              <View style={styles.section}>
                <AppText variant="heading">
                  Past invitations ({pastInvites.length})
                </AppText>
                {pastInvites.map((invite) => renderInvite(invite, false))}
              </View>
            ) : null}
          </>
        )}

        {message ? (
          <AppText accessibilityLiveRegion="polite" tone="positive">
            {message}
          </AppText>
        ) : null}
      </ScrollView>

      {isAdmin ? (
        <CreateInviteSheet
          ref={createSheetRef}
          onCreated={() => setMessage("Invitation created.")}
          workspaceId={workspaceId}
          workspaceName={activeWorkspace.name}
        />
      ) : null}

      <AppBottomSheetModal
        ref={actionSheetRef}
        description="Copy, share, or revoke this invitation."
        onDismiss={handleActionDismiss}
        title="Invitation actions"
      >
        <Button
          fullWidth
          leadingIcon={icons.actions.copy}
          onPress={() => void handleCopy()}
          variant="secondary"
        >
          Copy code
        </Button>
        <Button
          fullWidth
          leadingIcon={icons.actions.share}
          onPress={() => void handleShare()}
          variant="secondary"
        >
          Share invitation
        </Button>
        <Button
          fullWidth
          leadingIcon={icons.actions.delete}
          onPress={queueRevoke}
          variant="danger"
        >
          Revoke invitation
        </Button>
        {actionMessage ? (
          <AppText accessibilityLiveRegion="polite" tone="positive">
            {actionMessage}
          </AppText>
        ) : null}
        {actionError ? (
          <AppText accessibilityLiveRegion="assertive" tone="negative">
            {actionError}
          </AppText>
        ) : null}
      </AppBottomSheetModal>

      {selectedInvite ? (
        <AppConfirmationSheet
          ref={revokeSheetRef}
          confirmLabel="Revoke invitation"
          description="This code will stop working immediately. Its usage history will be preserved."
          destructive
          getErrorMessage={(error) => getInviteErrorMessage(error, "revoke")}
          onConfirm={async () => {
            await revokeMutation.mutateAsync(selectedInvite.id);
            setMessage("Invitation revoked.");
          }}
          title="Revoke this invitation?"
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "flex-start", flexDirection: "row", gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
  inviteCard: { gap: spacing.md },
  inviteHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inviteTitle: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  metadata: { gap: spacing.xs },
  metaRow: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  scrollContent: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: 720,
    padding: spacing.lg,
    width: "100%",
  },
  section: { gap: spacing.sm },
  token: { letterSpacing: 0.5 },
  tokenCard: { gap: spacing.xs },
});
