import { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  AppBottomSheetModal,
  AppConfirmationSheet,
  AppIcon,
  AppText,
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Screen,
  type AppBottomSheetModalRef,
} from "@/components";
import { useAuth } from "@/features/auth";
import { useWorkspace } from "@/features/workspaces";
import { icons } from "@/lib/icons";
import { spacing, useAppTheme } from "@/theme";
import { getMemberErrorMessage } from "./member-errors";
import {
  useLeaveWorkspace,
  useManageWorkspaceMember,
  useWorkspaceMembers,
} from "./member-hooks";
import type { ManageWorkspaceMemberInput, WorkspaceMember } from "./types";

type PendingAction = Readonly<{
  input: ManageWorkspaceMemberInput;
  kind: "deactivate" | "demote" | "promote" | "reactivate";
  member: WorkspaceMember;
}>;

const actionCopy: Record<
  PendingAction["kind"],
  { confirm: string; description: (name: string) => string; title: string }
> = {
  deactivate: {
    confirm: "Deactivate member",
    description: (name) =>
      `${name} will lose workspace access but remain in all historical records.`,
    title: "Deactivate member?",
  },
  demote: {
    confirm: "Demote to member",
    description: (name) =>
      `${name} will no longer be able to manage members, invites, or workspace settings.`,
    title: "Demote administrator?",
  },
  promote: {
    confirm: "Promote to admin",
    description: (name) =>
      `${name} will be able to manage members, invitations, and workspace settings.`,
    title: "Promote member?",
  },
  reactivate: {
    confirm: "Reactivate member",
    description: (name) =>
      `${name} will regain workspace access with their existing role.`,
    title: "Reactivate member?",
  },
};

function MemberBadges({ member }: { member: WorkspaceMember }) {
  return (
    <View style={styles.badges}>
      <View style={styles.badge}>
        <AppIcon
          icon={
            member.role === "admin"
              ? icons.entities.admin
              : icons.entities.member
          }
          size="small"
          tone={member.role === "admin" ? "accent" : "muted"}
        />
        <AppText
          tone={member.role === "admin" ? "accent" : "muted"}
          variant="caption"
        >
          {member.role === "admin" ? "Admin" : "Member"}
        </AppText>
      </View>
      <View style={styles.badge}>
        <AppIcon
          icon={
            member.status === "active"
              ? icons.actions.reactivate
              : icons.actions.deactivate
          }
          size="small"
          tone={member.status === "active" ? "positive" : "muted"}
        />
        <AppText
          tone={member.status === "active" ? "positive" : "muted"}
          variant="caption"
        >
          {member.status === "active" ? "Active" : "Inactive"}
        </AppText>
      </View>
    </View>
  );
}

export function MembersScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { activeMembership, activeWorkspace, refreshMemberships } =
    useWorkspace();
  const workspaceId = activeWorkspace?.id ?? "";
  const userId = user?.id ?? "";
  const isAdmin = activeMembership?.role === "admin";
  const query = useWorkspaceMembers(workspaceId);
  const { refetch } = query;
  const manageMutation = useManageWorkspaceMember(workspaceId, userId);
  const leaveMutation = useLeaveWorkspace(workspaceId, userId);
  const actionSheetRef = useRef<AppBottomSheetModalRef>(null);
  const confirmationRef = useRef<AppBottomSheetModalRef>(null);
  const leaveSheetRef = useRef<AppBottomSheetModalRef>(null);
  const pendingActionRef = useRef<PendingAction | null>(null);
  const shouldRefreshAfterLeaveRef = useRef(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (workspaceId) void refetch();
    }, [refetch, workspaceId])
  );

  const members = query.data ?? [];
  const activeMembers = members.filter((member) => member.status === "active");
  const inactiveMembers = members.filter(
    (member) => member.status === "inactive"
  );
  const isLastAdmin =
    activeMembership?.role === "admin" &&
    activeMembers.filter((member) => member.role === "admin").length === 1;

  const openMemberActions = (member: WorkspaceMember) => {
    setSelectedMember(member);
    actionSheetRef.current?.present();
  };

  const queueAction = (action: PendingAction) => {
    pendingActionRef.current = action;
    setPendingAction(action);
    actionSheetRef.current?.dismiss();
  };

  const handleActionSheetDismiss = () => {
    if (pendingActionRef.current) {
      pendingActionRef.current = null;
      setTimeout(() => confirmationRef.current?.present(), 0);
    }
  };

  const handleMemberChange = async () => {
    if (!pendingAction) return;
    await manageMutation.mutateAsync(pendingAction.input);
    setMessage(`${pendingAction.member.displayName} was updated.`);
  };

  const renderMember = (member: WorkspaceMember) => {
    const isCurrentUser = member.user_id === userId;
    return (
      <Card key={member.user_id} padding="medium" style={styles.memberCard}>
        <Avatar
          imageUrl={member.avatarUrl}
          name={member.displayName}
          size="medium"
        />
        <View style={styles.memberCopy}>
          <AppText variant="bodyStrong">
            {member.displayName}
            {isCurrentUser ? " (You)" : ""}
          </AppText>
          <MemberBadges member={member} />
        </View>
        {isAdmin && !isCurrentUser ? (
          <IconButton
            accessibilityLabel={`Manage ${member.displayName}`}
            icon={icons.actions.more}
            onPress={() => openMemberActions(member)}
            variant="secondary"
          />
        ) : null}
      </Card>
    );
  };

  if (!activeWorkspace || !activeMembership || !user) {
    return null;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            onRefresh={() => void query.refetch()}
            refreshing={query.isRefetching}
            tintColor={colors.accent}
          />
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
              Members
            </AppText>
            <AppText tone="muted">{activeWorkspace.name}</AppText>
          </View>
          {isAdmin ? (
            <IconButton
              accessibilityLabel="Invite members"
              icon={icons.actions.invite}
              onPress={() => router.push("/invites")}
              variant="secondary"
            />
          ) : null}
        </View>

        {query.isPending ? (
          <LoadingState label="Loading members…" />
        ) : query.error ? (
          <ErrorState
            description={getMemberErrorMessage(query.error, "load")}
            onRetry={() => void query.refetch()}
            title="Members unavailable"
          />
        ) : (
          <>
            <View style={styles.section}>
              <AppText variant="heading">
                Active members ({activeMembers.length})
              </AppText>
              {activeMembers.map(renderMember)}
            </View>

            {activeMembers.length === 1 ? (
              <EmptyState
                action={
                  isAdmin ? (
                    <Button
                      leadingIcon={icons.actions.invite}
                      onPress={() => router.push("/invites")}
                      variant="secondary"
                    >
                      Invite flatmates
                    </Button>
                  ) : undefined
                }
                description="You're the only member here. Invite your flatmates to start splitting expenses."
                icon={icons.entities.members}
                title="Just you for now"
              />
            ) : null}

            {inactiveMembers.length > 0 ? (
              <View style={styles.section}>
                <AppText variant="heading">
                  Inactive members ({inactiveMembers.length})
                </AppText>
                {inactiveMembers.map(renderMember)}
              </View>
            ) : null}

            {message ? (
              <AppText accessibilityLiveRegion="polite" tone="positive">
                {message}
              </AppText>
            ) : null}

            <Card padding="large" style={styles.leaveCard} variant="muted">
              <AppText variant="heading">Leave workspace</AppText>
              <AppText tone="muted">
                {isLastAdmin
                  ? "Promote another active member to admin before leaving."
                  : "Your history stays intact, but you will lose access to this workspace."}
              </AppText>
              <Button
                disabled={isLastAdmin}
                fullWidth
                leadingIcon={icons.actions.leave}
                onPress={() => leaveSheetRef.current?.present()}
                variant="danger"
              >
                Leave workspace
              </Button>
            </Card>
          </>
        )}
      </ScrollView>

      <AppBottomSheetModal
        ref={actionSheetRef}
        description={selectedMember?.displayName}
        onDismiss={handleActionSheetDismiss}
        title="Manage member"
      >
        {selectedMember?.status === "inactive" ? (
          <Button
            fullWidth
            leadingIcon={icons.actions.reactivate}
            onPress={() =>
              queueAction({
                input: { status: "active", userId: selectedMember.user_id },
                kind: "reactivate",
                member: selectedMember,
              })
            }
            variant="secondary"
          >
            Reactivate as {selectedMember.role}
          </Button>
        ) : (
          <>
            <Button
              fullWidth
              leadingIcon={
                selectedMember?.role === "admin"
                  ? icons.actions.demote
                  : icons.actions.promote
              }
              onPress={() => {
                if (!selectedMember) return;
                const demoting = selectedMember.role === "admin";
                queueAction({
                  input: {
                    role: demoting ? "member" : "admin",
                    userId: selectedMember.user_id,
                  },
                  kind: demoting ? "demote" : "promote",
                  member: selectedMember,
                });
              }}
              variant="secondary"
            >
              {selectedMember?.role === "admin"
                ? "Demote to member"
                : "Promote to admin"}
            </Button>
            <Button
              fullWidth
              leadingIcon={icons.actions.deactivate}
              onPress={() => {
                if (!selectedMember) return;
                queueAction({
                  input: {
                    status: "inactive",
                    userId: selectedMember.user_id,
                  },
                  kind: "deactivate",
                  member: selectedMember,
                });
              }}
              variant="danger"
            >
              Deactivate member
            </Button>
          </>
        )}
      </AppBottomSheetModal>

      {pendingAction ? (
        <AppConfirmationSheet
          ref={confirmationRef}
          confirmLabel={actionCopy[pendingAction.kind].confirm}
          description={actionCopy[pendingAction.kind].description(
            pendingAction.member.displayName
          )}
          destructive={pendingAction.kind === "deactivate"}
          getErrorMessage={(error) => getMemberErrorMessage(error, "manage")}
          onConfirm={handleMemberChange}
          onDismiss={() => setPendingAction(null)}
          title={actionCopy[pendingAction.kind].title}
        />
      ) : null}

      <AppConfirmationSheet
        ref={leaveSheetRef}
        confirmLabel="Leave workspace"
        description={`You will lose access to ${activeWorkspace.name}. Your historical expenses and balances will be preserved.`}
        destructive
        getErrorMessage={(error) => getMemberErrorMessage(error, "leave")}
        onConfirm={async () => {
          await leaveMutation.mutateAsync();
          shouldRefreshAfterLeaveRef.current = true;
        }}
        onDismiss={() => {
          if (shouldRefreshAfterLeaveRef.current) {
            shouldRefreshAfterLeaveRef.current = false;
            void refreshMemberships();
          }
        }}
        title="Leave this workspace?"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", flexDirection: "row", gap: spacing.xxs },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  header: { alignItems: "flex-start", flexDirection: "row", gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
  leaveCard: { gap: spacing.md },
  memberCard: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  memberCopy: { flex: 1, gap: spacing.xs },
  scrollContent: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: 720,
    padding: spacing.lg,
    width: "100%",
  },
  section: { gap: spacing.sm },
});
