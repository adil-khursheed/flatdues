import { forwardRef, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import {
  AppBottomSheetModal,
  AppBottomSheetTextInput,
  AppText,
  Button,
  Card,
  type AppBottomSheetModalRef,
} from "@/components";
import { icons } from "@/lib/icons";
import { spacing } from "@/theme";
import { copyInviteToken, shareWorkspaceInvite } from "./invite-actions";
import { getInviteErrorMessage } from "./invite-errors";
import {
  defaultInviteDays,
  defaultInviteMaxUses,
  parseInviteConfiguration,
  validateInviteDays,
  validateInviteMaxUses,
} from "./invite-validation";
import type { WorkspaceInvite } from "./types";
import { useGenerateWorkspaceInvite } from "./use-generate-workspace-invite";

type CreateInviteSheetProps = Readonly<{
  onCreated?: (invite: WorkspaceInvite) => void;
  workspaceId: string;
  workspaceName: string;
}>;

export const CreateInviteSheet = forwardRef<
  AppBottomSheetModalRef,
  CreateInviteSheetProps
>(function CreateInviteSheet({ onCreated, workspaceId, workspaceName }, ref) {
  const mutation = useGenerateWorkspaceInvite(workspaceId);
  const [validForDays, setValidForDays] = useState(String(defaultInviteDays));
  const [maxUses, setMaxUses] = useState(String(defaultInviteMaxUses));
  const [daysError, setDaysError] = useState<string | null>(null);
  const [usesError, setUsesError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const invite = mutation.data;

  const reset = () => {
    mutation.reset();
    setValidForDays(String(defaultInviteDays));
    setMaxUses(String(defaultInviteMaxUses));
    setDaysError(null);
    setUsesError(null);
    setActionError(null);
    setActionMessage(null);
  };

  const handleSubmit = () => {
    const nextDaysError = validateInviteDays(validForDays);
    const nextUsesError = validateInviteMaxUses(maxUses);
    const configuration = parseInviteConfiguration(validForDays, maxUses);
    setDaysError(nextDaysError);
    setUsesError(nextUsesError);
    setActionError(null);
    setActionMessage(null);

    if (!configuration) {
      return;
    }

    Keyboard.dismiss();
    mutation.mutate(configuration, {
      onSuccess: (createdInvite) => onCreated?.(createdInvite),
    });
  };

  const handleCopy = async () => {
    if (!invite) return;
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
    if (!invite) return;
    setActionError(null);
    setActionMessage(null);
    try {
      await shareWorkspaceInvite({ token: invite.token, workspaceName });
      setActionMessage("Sharing opened.");
    } catch {
      setActionError("We couldn't open sharing. Copy the invite code instead.");
    }
  };

  return (
    <AppBottomSheetModal
      ref={ref}
      description={
        invite
          ? "Share this code only with people you want in the workspace."
          : "Choose how long the code works and how many people may use it."
      }
      keyboardAware={!invite}
      onDismiss={reset}
      scrollable={Boolean(invite)}
      title={invite ? "Invite ready" : "Create invitation"}
    >
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
          <AppText tone="muted" variant="caption">
            Expires in {validForDays} days · Up to {maxUses} joins
          </AppText>
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
        <>
          <AppBottomSheetTextInput
            error={daysError ?? undefined}
            inputMode="numeric"
            keyboardType="number-pad"
            label="Valid for (days)"
            maxLength={2}
            onChangeText={(value) => {
              setValidForDays(value);
              if (daysError) setDaysError(validateInviteDays(value));
            }}
            value={validForDays}
          />
          <AppBottomSheetTextInput
            error={usesError ?? undefined}
            inputMode="numeric"
            keyboardType="number-pad"
            label="Maximum joins"
            maxLength={2}
            onChangeText={(value) => {
              setMaxUses(value);
              if (usesError) setUsesError(validateInviteMaxUses(value));
            }}
            value={maxUses}
          />
          <Button
            fullWidth
            leadingIcon={icons.actions.invite}
            loading={mutation.isPending}
            onPress={handleSubmit}
          >
            Create invite code
          </Button>
        </>
      )}

      {mutation.error ? (
        <AppText accessibilityLiveRegion="assertive" tone="negative">
          {getInviteErrorMessage(mutation.error, "create")}
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
    </AppBottomSheetModal>
  );
});

CreateInviteSheet.displayName = "CreateInviteSheet";

const styles = StyleSheet.create({
  actionButton: { flex: 1 },
  actions: { flexDirection: "row", gap: spacing.sm },
  token: { letterSpacing: 0.5 },
  tokenCard: { gap: spacing.xs },
});
