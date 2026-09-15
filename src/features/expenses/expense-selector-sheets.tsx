import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  AppBottomSheetModal,
  AppIcon,
  AppText,
  Avatar,
  Button,
  type AppBottomSheetModalRef,
} from "@/components";
import type { WorkspaceMember } from "@/features/members";
import { icons } from "@/lib/icons";
import { radii, spacing, useAppTheme } from "@/theme";
import type { LocalDateKey } from "@/utils/local-date";
import { formatLocalDate } from "@/utils/local-date";
import { expenseCategories } from "./expense-categories";
import { ExpenseDatePicker } from "./expense-date-picker";
import type { ExpenseCategory } from "./types";

type CategorySheetProps = Readonly<{
  onSelect: (value: ExpenseCategory) => void;
  selected: ExpenseCategory;
}>;

export const ExpenseCategorySheet = forwardRef<
  AppBottomSheetModalRef,
  CategorySheetProps
>(function ExpenseCategorySheet({ onSelect, selected }, ref) {
  return (
    <AppBottomSheetModal ref={ref} scrollable title="Choose category">
      {expenseCategories.map((category) => (
        <SelectionRow
          icon={category.icon}
          key={category.value}
          label={category.label}
          onPress={() => {
            onSelect(category.value);
            if (typeof ref !== "function") ref?.current?.dismiss();
          }}
          selected={category.value === selected}
          selectionRole="radio"
        />
      ))}
    </AppBottomSheetModal>
  );
});

type PayerSheetProps = Readonly<{
  members: readonly WorkspaceMember[];
  onSelect: (userId: string) => void;
  selectedId: string;
}>;

export const ExpensePayerSheet = forwardRef<
  AppBottomSheetModalRef,
  PayerSheetProps
>(function ExpensePayerSheet({ members, onSelect, selectedId }, ref) {
  return (
    <AppBottomSheetModal ref={ref} scrollable title="Who paid?">
      {members.map((member) => (
        <SelectionRow
          avatar={member}
          key={member.user_id}
          label={member.displayName}
          onPress={() => {
            onSelect(member.user_id);
            if (typeof ref !== "function") ref?.current?.dismiss();
          }}
          selected={member.user_id === selectedId}
          selectionRole="radio"
        />
      ))}
    </AppBottomSheetModal>
  );
});

type ParticipantsSheetProps = Readonly<{
  error?: string;
  members: readonly WorkspaceMember[];
  onConfirm: (userIds: readonly string[]) => void;
  selectedIds: readonly string[];
}>;

export const ExpenseParticipantsSheet = forwardRef<
  AppBottomSheetModalRef,
  ParticipantsSheetProps
>(function ExpenseParticipantsSheet(
  { error, members, onConfirm, selectedIds },
  ref
) {
  const [draftIds, setDraftIds] = useState<readonly string[]>(selectedIds);
  const [draftError, setDraftError] = useState<string | null>(null);

  const resetDraft = () => {
    setDraftIds(selectedIds);
    setDraftError(null);
  };

  const confirm = () => {
    if (draftIds.length === 0) {
      setDraftError("Select at least one participant.");
      return;
    }
    onConfirm(draftIds);
    if (typeof ref !== "function") ref?.current?.dismiss();
  };

  return (
    <AppBottomSheetModal
      ref={ref}
      onChange={(index) => {
        if (index === 0) resetDraft();
      }}
      scrollable
      title="Choose participants"
    >
      <View style={styles.inlineActions}>
        <Button
          onPress={() => setDraftIds(members.map((member) => member.user_id))}
          style={styles.flexButton}
          variant="secondary"
        >
          Select all
        </Button>
        <Button
          onPress={() => setDraftIds([])}
          style={styles.flexButton}
          variant="secondary"
        >
          Clear
        </Button>
      </View>
      {members.map((member) => {
        const selected = draftIds.includes(member.user_id);
        return (
          <SelectionRow
            avatar={member}
            key={member.user_id}
            label={member.displayName}
            onPress={() => {
              setDraftError(null);
              setDraftIds((current) =>
                selected
                  ? current.filter((id) => id !== member.user_id)
                  : [...current, member.user_id]
              );
            }}
            selected={selected}
            selectionRole="checkbox"
          />
        );
      })}
      {draftError || error ? (
        <AppText
          accessibilityLiveRegion="polite"
          tone="negative"
          variant="caption"
        >
          {draftError ?? error}
        </AppText>
      ) : null}
      <Button fullWidth leadingIcon={icons.actions.confirm} onPress={confirm}>
        Confirm participants
      </Button>
    </AppBottomSheetModal>
  );
});

type DateSheetProps = Readonly<{
  onSelect: (date: LocalDateKey) => void;
  selected: LocalDateKey;
}>;

export const ExpenseDateSheet = forwardRef<
  AppBottomSheetModalRef,
  DateSheetProps
>(function ExpenseDateSheet({ onSelect, selected }, ref) {
  const [draftDate, setDraftDate] = useState(selected);
  return (
    <AppBottomSheetModal
      ref={ref}
      onChange={(index) => {
        if (index === 0) setDraftDate(selected);
      }}
      title="Choose date"
    >
      <ExpenseDatePicker onChange={setDraftDate} value={draftDate} />
      <AppText tone="muted">Selected: {formatLocalDate(draftDate)}</AppText>
      <Button
        fullWidth
        leadingIcon={icons.actions.confirm}
        onPress={() => {
          onSelect(draftDate);
          if (typeof ref !== "function") ref?.current?.dismiss();
        }}
      >
        Use this date
      </Button>
    </AppBottomSheetModal>
  );
});

type SelectionRowProps = Readonly<{
  avatar?: WorkspaceMember;
  icon?: (typeof expenseCategories)[number]["icon"];
  label: string;
  onPress: () => void;
  selected: boolean;
  selectionRole: "checkbox" | "radio";
}>;

function SelectionRow({
  avatar,
  icon,
  label,
  onPress,
  selected,
  selectionRole,
}: SelectionRowProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole={selectionRole}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected ? colors.accentSoft : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      {avatar ? (
        <Avatar
          imageUrl={avatar.avatarUrl}
          name={avatar.displayName}
          size="small"
        />
      ) : icon ? (
        <AppIcon icon={icon} tone={selected ? "accent" : "muted"} />
      ) : null}
      <AppText style={styles.rowLabel} variant="bodyStrong">
        {label}
      </AppText>
      {selected ? <AppIcon icon={icons.actions.confirm} tone="accent" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flexButton: { flex: 1 },
  inlineActions: { flexDirection: "row", gap: spacing.sm },
  pressed: { opacity: 0.72 },
  row: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: { flex: 1 },
});
