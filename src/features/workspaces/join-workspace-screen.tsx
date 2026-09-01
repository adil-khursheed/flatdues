import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  IconButton,
  Input,
  KeyboardAwareForm,
} from "@/components";
import { readInviteTokenFromClipboard } from "@/features/invites";
import { icons } from "@/lib/icons";
import { spacing } from "@/theme";

import { getWorkspaceErrorMessage } from "./workspace-errors";
import { useJoinWorkspace } from "./use-join-workspace";
import {
  inviteTokenLength,
  normalizeInviteToken,
  validateInviteToken,
} from "./workspace-validation";

export function JoinWorkspaceScreen() {
  const router = useRouter();
  const { joinAndActivate, joinedMembership } = useJoinWorkspace();
  const [token, setToken] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  const handlePaste = async () => {
    if (isPasting) {
      return;
    }

    setIsPasting(true);
    setSubmissionError(null);

    try {
      const pastedToken = await readInviteTokenFromClipboard();
      setToken(pastedToken);
      setFieldError(validateInviteToken(pastedToken));
    } catch {
      setSubmissionError(
        "We couldn't read the clipboard. Paste the invite code into the field instead.",
      );
    } finally {
      setIsPasting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const validationError = validateInviteToken(token);
    setFieldError(validationError);

    if (validationError) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await joinAndActivate({ token: normalizeInviteToken(token) });
    } catch (error: unknown) {
      setSubmissionError(getWorkspaceErrorMessage(error, "join"));
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareForm contentContainerStyle={styles.form}>
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Go back"
          icon={icons.actions.back}
          onPress={() => router.back()}
        />
        <View style={styles.headerCopy}>
          <AppText accessibilityRole="header" variant="title">
            Join a workspace
          </AppText>
          <AppText tone="muted">
            Enter the invite code shared by a workspace administrator.
          </AppText>
        </View>
      </View>

      <Card padding="large" style={styles.card}>
        <Input
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          error={fieldError ?? undefined}
          label="Invite code"
          leadingIcon={icons.actions.invite}
          maxLength={inviteTokenLength}
          onChangeText={(value) => {
            setToken(value);
            if (fieldError) {
              setFieldError(validateInviteToken(value));
            }
          }}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="64-character invite code"
          returnKeyType="join"
          spellCheck={false}
          value={token}
        />

        <Button
          fullWidth
          leadingIcon={icons.actions.paste}
          loading={isPasting}
          onPress={() => void handlePaste()}
          variant="secondary"
        >
          Paste invite code
        </Button>

        {submissionError ? (
          <AppText accessibilityLiveRegion="assertive" tone="negative">
            {submissionError}
          </AppText>
        ) : null}

        <Button
          fullWidth
          leadingIcon={icons.actions.confirm}
          loading={isSubmitting}
          onPress={() => void handleSubmit()}
        >
          {joinedMembership ? "Continue to workspace" : "Join workspace"}
        </Button>
      </Card>
    </KeyboardAwareForm>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  form: {
    alignSelf: "center",
    maxWidth: 620,
    width: "100%",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
