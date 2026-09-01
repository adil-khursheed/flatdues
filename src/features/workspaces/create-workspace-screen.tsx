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
import { icons } from "@/lib/icons";
import { spacing } from "@/theme";

import { getWorkspaceErrorMessage } from "./workspace-errors";
import { useCreateWorkspace } from "./use-create-workspace";
import {
  normalizeWorkspaceName,
  validateWorkspaceName,
  workspaceNameMaxLength,
} from "./workspace-validation";

export function CreateWorkspaceScreen() {
  const router = useRouter();
  const { createAndActivate, createdWorkspace } = useCreateWorkspace();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const validationError = validateWorkspaceName(name);
    setFieldError(validationError);

    if (validationError) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await createAndActivate({ name: normalizeWorkspaceName(name) });
    } catch (error: unknown) {
      setSubmissionError(getWorkspaceErrorMessage(error, "create"));
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
            Create a workspace
          </AppText>
          <AppText tone="muted">
            Give your household a clear, recognizable name.
          </AppText>
        </View>
      </View>

      <Card padding="large" style={styles.card}>
        <Input
          autoCapitalize="words"
          autoComplete="off"
          autoCorrect={false}
          blurOnSubmit={false}
          error={fieldError ?? undefined}
          label="Workspace name"
          leadingIcon={icons.entities.workspace}
          maxLength={workspaceNameMaxLength}
          onChangeText={(value) => {
            setName(value);
            if (fieldError) {
              setFieldError(validateWorkspaceName(value));
            }
          }}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="Flat 302"
          returnKeyType="done"
          value={name}
        />

        <View style={styles.currencyNote}>
          <AppText variant="label">Currency</AppText>
          <AppText tone="muted">
            Indian Rupee (INR) is used for this MVP. Currency symbols are only
            added when amounts are displayed.
          </AppText>
        </View>

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
          {createdWorkspace ? "Continue to workspace" : "Create workspace"}
        </Button>
      </Card>
    </KeyboardAwareForm>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  currencyNote: {
    gap: spacing.xs,
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
