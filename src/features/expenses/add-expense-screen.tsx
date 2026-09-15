import { useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Keyboard,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  AppIcon,
  AppText,
  Button,
  Card,
  ErrorState,
  IconButton,
  Input,
  KeyboardAwareForm,
  LoadingState,
  type AppBottomSheetModalRef,
} from "@/components";
import { useAuth } from "@/features/auth";
import {
  selectActiveWorkspaceMembers,
  useWorkspaceMembers,
  type WorkspaceMember,
} from "@/features/members";
import { useWorkspace } from "@/features/workspaces";
import type { AppIconData } from "@/lib/icons";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";
import {
  formatLocalDate,
  toLocalDateKey,
  type LocalDateKey,
} from "@/utils/local-date";
import {
  calculateSplitPreview,
  formatMinorUnits,
  parseMoneyInput,
} from "@/utils/money";
import { getExpenseCategory } from "./expense-categories";
import { getExpenseErrorMessage } from "./expense-errors";
import { useCreateExpense } from "./expense-hooks";
import {
  ExpenseCategorySheet,
  ExpenseDateSheet,
  ExpenseParticipantsSheet,
  ExpensePayerSheet,
} from "./expense-selector-sheets";
import type { ExpenseValidationErrors } from "./expense-validation";
import { validateExpenseInput } from "./expense-validation";
import type { CreateExpenseInput, ExpenseCategory } from "./types";

export function AddExpenseScreen() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? "";
  const membersQuery = useWorkspaceMembers(workspaceId);
  const activeMembers = useMemo(
    () => selectActiveWorkspaceMembers(membersQuery.data ?? []),
    [membersQuery.data]
  );

  if (membersQuery.isPending) {
    return (
      <KeyboardAwareForm contentContainerStyle={styles.centered}>
        <LoadingState label="Loading workspace members…" />
      </KeyboardAwareForm>
    );
  }

  if (membersQuery.error || activeMembers.length === 0) {
    return (
      <KeyboardAwareForm contentContainerStyle={styles.centered}>
        <ErrorState
          description="We couldn't load active members for this expense."
          onRetry={() => void membersQuery.refetch()}
        />
      </KeyboardAwareForm>
    );
  }

  return (
    <AddExpenseForm
      activeMembers={activeMembers}
      currency={activeWorkspace?.currency_code ?? "INR"}
      key={workspaceId}
      userId={user?.id ?? ""}
      workspaceId={workspaceId}
    />
  );
}

type AddExpenseFormProps = Readonly<{
  activeMembers: readonly WorkspaceMember[];
  currency: string;
  userId: string;
  workspaceId: string;
}>;

function AddExpenseForm({
  activeMembers,
  currency,
  userId,
  workspaceId,
}: AddExpenseFormProps) {
  const router = useRouter();
  const activeMemberIds = useMemo(
    () => new Set(activeMembers.map((member) => member.user_id)),
    [activeMembers]
  );
  const mutation = useCreateExpense(workspaceId);
  const categorySheetRef = useRef<AppBottomSheetModalRef>(null);
  const dateSheetRef = useRef<AppBottomSheetModalRef>(null);
  const payerSheetRef = useRef<AppBottomSheetModalRef>(null);
  const participantsSheetRef = useRef<AppBottomSheetModalRef>(null);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [expenseDate, setExpenseDate] = useState<LocalDateKey>(() =>
    toLocalDateKey(new Date())
  );
  const [payerId, setPayerId] = useState(() =>
    activeMemberIds.has(userId) ? userId : ""
  );
  const [participantIds, setParticipantIds] = useState<readonly string[]>(() =>
    activeMembers.map((member) => member.user_id)
  );
  const [notes, setNotes] = useState("");
  const [visibleErrors, setVisibleErrors] = useState<ExpenseValidationErrors>(
    {}
  );

  const input: CreateExpenseInput = {
    amount,
    category,
    expenseDate,
    notes,
    participantIds,
    payerId,
    title,
    workspaceId,
  };
  const validationErrors = validateExpenseInput(input, activeMemberIds);
  const displayErrors: ExpenseValidationErrors = {
    ...visibleErrors,
    amount: amount.length > 0 ? validationErrors.amount : visibleErrors.amount,
    participants: validationErrors.participants,
    payer: validationErrors.payer,
    title: title.length > 0 ? validationErrors.title : visibleErrors.title,
  };
  const parsedAmount = parseMoneyInput(amount);
  const preview = parsedAmount
    ? calculateSplitPreview(parsedAmount.minorUnits, participantIds.length)
    : null;
  const payer = activeMembers.find((member) => member.user_id === payerId);
  const categoryDefinition = getExpenseCategory(category);
  const canSubmit =
    workspaceId.length > 0 &&
    Object.keys(validationErrors).length === 0 &&
    !mutation.isPending;

  const clearVisibleError = (key: keyof ExpenseValidationErrors) => {
    setVisibleErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = () => {
    if (mutation.isPending) return;

    const nextErrors = validateExpenseInput(input, activeMemberIds);
    setVisibleErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !parsedAmount) return;

    Keyboard.dismiss();
    mutation.mutate(
      { ...input, amount: parsedAmount.decimal },
      {
        onSuccess: () => {
          AccessibilityInfo.announceForAccessibility(
            "Expense added successfully."
          );
          router.dismissTo("/home");
        },
      }
    );
  };

  return (
    <>
      <KeyboardAwareForm contentContainerStyle={styles.form}>
        <View style={styles.header}>
          <IconButton
            accessibilityLabel="Back to home"
            icon={icons.actions.back}
            onPress={() => router.back()}
          />
          <View style={styles.headerCopy}>
            <AppText accessibilityRole="header" variant="title">
              Add expense
            </AppText>
            <AppText tone="muted">Split a shared cost equally.</AppText>
          </View>
        </View>

        <Input
          autoFocus
          error={displayErrors.amount}
          inputMode="decimal"
          keyboardType="decimal-pad"
          label={`Amount (${currency})`}
          leadingIcon={icons.entities.budget}
          maxLength={13}
          onChangeText={(value) => {
            setAmount(value);
            clearVisibleError("amount");
          }}
          placeholder="0.00"
          returnKeyType="next"
          value={amount}
        />
        <Input
          error={displayErrors.title}
          label="Description"
          leadingIcon={icons.tabs.expenses}
          maxLength={160}
          onChangeText={(value) => {
            setTitle(value);
            clearVisibleError("title");
          }}
          placeholder="What was this for?"
          returnKeyType="done"
          value={title}
        />

        <SelectionField
          icon={categoryDefinition.icon}
          label="Category"
          onPress={() => categorySheetRef.current?.present()}
          value={categoryDefinition.label}
        />
        <SelectionField
          error={displayErrors.date}
          icon={icons.entities.calendar}
          label="Date"
          onPress={() => dateSheetRef.current?.present()}
          value={formatLocalDate(expenseDate)}
        />
        <SelectionField
          error={displayErrors.payer}
          icon={icons.entities.member}
          label="Paid by"
          onPress={() => payerSheetRef.current?.present()}
          value={payer?.displayName ?? "Choose a member"}
        />
        <SelectionField
          error={displayErrors.participants}
          icon={icons.entities.members}
          label="Participants"
          onPress={() => participantsSheetRef.current?.present()}
          value={`${participantIds.length} ${participantIds.length === 1 ? "person" : "people"}`}
        />

        <Input
          error={displayErrors.notes}
          label="Notes (optional)"
          leadingIcon={icons.entities.notes}
          maxLength={2000}
          multiline
          onChangeText={(value) => {
            setNotes(value);
            clearVisibleError("notes");
          }}
          placeholder="Add any useful details"
          style={styles.notesInput}
          textAlignVertical="top"
          value={notes}
        />

        {preview ? (
          <Card padding="medium" style={styles.preview} variant="muted">
            <AppText variant="label">
              About {formatMinorUnits(preview.baseShareMinorUnits, currency)}{" "}
              each
            </AppText>
            {preview.remainderMinorUnits > 0 ? (
              <AppText tone="muted" variant="caption">
                {preview.remainderMinorUnits}{" "}
                {preview.remainderMinorUnits === 1
                  ? "person pays"
                  : "people pay"}{" "}
                one paisa more so the total stays exact.
              </AppText>
            ) : null}
          </Card>
        ) : null}

        {mutation.error ? (
          <AppText accessibilityLiveRegion="assertive" tone="negative">
            {getExpenseErrorMessage(mutation.error)}
          </AppText>
        ) : null}
        <Button
          disabled={!canSubmit}
          fullWidth
          leadingIcon={icons.entities.expense}
          loading={mutation.isPending}
          onPress={handleSubmit}
        >
          Add Expense
        </Button>
      </KeyboardAwareForm>

      <ExpenseCategorySheet
        ref={categorySheetRef}
        onSelect={(value) => {
          setCategory(value);
        }}
        selected={category}
      />
      <ExpenseDateSheet
        ref={dateSheetRef}
        onSelect={(value) => {
          setExpenseDate(value);
          clearVisibleError("date");
        }}
        selected={expenseDate}
      />
      <ExpensePayerSheet
        ref={payerSheetRef}
        members={activeMembers}
        onSelect={(value) => {
          setPayerId(value);
          clearVisibleError("payer");
        }}
        selectedId={payerId}
      />
      <ExpenseParticipantsSheet
        ref={participantsSheetRef}
        error={displayErrors.participants}
        members={activeMembers}
        onConfirm={(value) => {
          setParticipantIds(value);
          clearVisibleError("participants");
          clearVisibleError("amount");
        }}
        selectedIds={participantIds}
      />
    </>
  );
}

type SelectionFieldProps = Readonly<{
  error?: string;
  icon: AppIconData;
  label: string;
  onPress: () => void;
  value: string;
}>;

function SelectionField({
  error,
  icon,
  label,
  onPress,
  value,
}: SelectionFieldProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.fieldGroup}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        accessibilityLabel={`${label}, ${value}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.selectionField,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.negative : colors.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <AppIcon icon={icon} tone={error ? "negative" : "muted"} />
        <AppText style={styles.selectionValue}>{value}</AppText>
        <AppIcon icon={icons.actions.forward} size="small" tone="muted" />
      </Pressable>
      {error ? (
        <AppText
          accessibilityLiveRegion="polite"
          tone="negative"
          variant="caption"
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: "center", justifyContent: "center" },
  fieldGroup: { gap: spacing.xs },
  form: { alignSelf: "center", maxWidth: 620, width: "100%" },
  header: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm },
  headerCopy: { flex: 1, gap: spacing.xs },
  notesInput: { minHeight: 96, paddingTop: spacing.sm },
  pressed: { opacity: 0.72 },
  preview: { gap: spacing.xs },
  selectionField: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectionValue: { flex: 1 },
});
