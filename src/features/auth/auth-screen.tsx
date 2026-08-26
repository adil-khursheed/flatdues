import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  AppIcon,
  AppText,
  Button,
  Card,
  Input,
  KeyboardAwareForm,
} from "@/components";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";

import { getAuthErrorMessage } from "./auth-errors";
import {
  type AuthFieldErrors,
  normalizeEmail,
  validateAuthForm,
} from "./auth-validation";
import { useAuth } from "./auth-provider";
import type { AuthMode } from "./types";

export function AuthScreen() {
  const { colors } = useAppTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "signUp";

  const clearFieldError = (field: keyof AuthFieldErrors) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return { ...current, [field]: undefined };
    });
    setFormError(null);
  };

  const switchMode = () => {
    setMode((current) => (current === "signIn" ? "signUp" : "signIn"));
    setPassword("");
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const errors = validateAuthForm(mode, { displayName, email, password });
    setFieldErrors(errors);
    setFormError(null);
    setNotice(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUp({
          displayName: displayName.trim(),
          email: normalizedEmail,
          password,
        });

        if (result.needsEmailConfirmation) {
          setMode("signIn");
          setPassword("");
          setNotice(
            "Check your inbox to confirm your email. Then return here and sign in.",
          );
        }
      } else {
        await signIn({ email: normalizedEmail, password });
      }
    } catch (error: unknown) {
      setFormError(
        getAuthErrorMessage(error, isSignUp ? "signUp" : "signIn"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareForm contentContainerStyle={styles.formContainer}>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <View
            style={[styles.logo, { backgroundColor: colors.accentSoft }]}
          >
            <AppIcon
              icon={icons.entities.workspace}
              size="xlarge"
              tone="accent"
            />
          </View>
          <View style={styles.heroCopy}>
            <AppText accessibilityRole="header" variant="display">
              {isSignUp ? "Create your account" : "Welcome back"}
            </AppText>
            <AppText tone="muted">
              {isSignUp
                ? "Start a shared space for expenses, budgets, and balances."
                : "Sign in to continue managing your shared home finances."}
            </AppText>
          </View>
        </View>

        <Card padding="large" style={styles.card}>
          <View style={styles.fields}>
            {isSignUp ? (
              <Input
                autoCapitalize="words"
                autoComplete="name"
                editable={!isSubmitting}
                error={fieldErrors.displayName}
                label="Your name"
                leadingIcon={icons.auth.user}
                maxLength={100}
                onChangeText={(value) => {
                  setDisplayName(value);
                  clearFieldError("displayName");
                }}
                placeholder="Adil"
                returnKeyType="next"
                textContentType="name"
                value={displayName}
              />
            ) : null}

            <Input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isSubmitting}
              error={fieldErrors.email}
              keyboardType="email-address"
              label="Email"
              leadingIcon={icons.auth.email}
              onChangeText={(value) => {
                setEmail(value);
                clearFieldError("email");
              }}
              placeholder="you@example.com"
              returnKeyType="next"
              textContentType="emailAddress"
              value={email}
            />

            <Input
              autoCapitalize="none"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              editable={!isSubmitting}
              error={fieldErrors.password}
              hint={isSignUp ? "Use at least 8 characters." : undefined}
              label="Password"
              leadingIcon={icons.auth.password}
              onChangeText={(value) => {
                setPassword(value);
                clearFieldError("password");
              }}
              onSubmitEditing={() => void handleSubmit()}
              returnKeyType="done"
              secureTextEntry
              textContentType={isSignUp ? "newPassword" : "password"}
              value={password}
            />
          </View>

          {formError ? (
            <View
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={[
                styles.message,
                { backgroundColor: colors.negativeSoft },
              ]}
            >
              <AppIcon icon={icons.states.error} tone="negative" />
              <AppText style={styles.messageText} tone="negative" variant="label">
                {formError}
              </AppText>
            </View>
          ) : null}

          {notice ? (
            <View
              accessibilityLiveRegion="polite"
              style={[
                styles.message,
                { backgroundColor: colors.positiveSoft },
              ]}
            >
              <AppIcon icon={icons.states.settled} tone="positive" />
              <AppText style={styles.messageText} tone="positive" variant="label">
                {notice}
              </AppText>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button
              fullWidth
              leadingIcon={isSignUp ? icons.actions.add : icons.auth.signIn}
              loading={isSubmitting}
              onPress={() => void handleSubmit()}
            >
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
            <Button
              disabled={isSubmitting}
              onPress={switchMode}
              variant="ghost"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "New to Flatdues? Create an account"}
            </Button>
          </View>
        </Card>

        <AppText style={styles.footer} tone="muted" variant="caption">
          Native sessions are encrypted on this device.
        </AppText>
      </View>
    </KeyboardAwareForm>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xs,
  },
  card: {
    gap: spacing.lg,
  },
  fields: {
    gap: spacing.md,
  },
  footer: {
    textAlign: "center",
  },
  formContainer: {
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    gap: spacing.lg,
  },
  heroCopy: {
    alignItems: "center",
    gap: spacing.xs,
  },
  logo: {
    alignItems: "center",
    borderRadius: radii.lg,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  message: {
    alignItems: "flex-start",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  messageText: {
    flex: 1,
  },
  shell: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: 520,
    width: "100%",
  },
});
