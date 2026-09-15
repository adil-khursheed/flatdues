import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { icons } from "@/lib/icons";
import { spacing } from "@/theme";
import {
  AppBottomSheetModal,
  type AppBottomSheetModalProps,
  type AppBottomSheetModalRef,
} from "./app-bottom-sheet-modal";
import { AppText } from "./app-text";
import { Button } from "./button";

export type AppConfirmationSheetProps = Omit<
  AppBottomSheetModalProps,
  "children" | "description" | "title"
> & {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  destructive?: boolean;
  getErrorMessage?: (error: unknown) => string;
  onConfirm: () => Promise<void> | void;
  title: string;
};

type ConfirmationActionsProps = Pick<
  AppConfirmationSheetProps,
  "cancelLabel" | "confirmLabel" | "destructive" | "onConfirm"
> &
  Pick<AppConfirmationSheetProps, "getErrorMessage">;

function ConfirmationActions({
  cancelLabel = "Cancel",
  confirmLabel,
  destructive = false,
  getErrorMessage,
  onConfirm,
}: ConfirmationActionsProps) {
  const { dismiss } = useBottomSheetModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleConfirm = async () => {
    setError(undefined);
    setIsSubmitting(true);

    try {
      await onConfirm();
      dismiss();
    } catch (submissionError: unknown) {
      setError(
        getErrorMessage?.(submissionError) ??
          "We couldn't complete that action. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.actions}>
      {error ? (
        <AppText
          accessibilityLiveRegion="polite"
          tone="negative"
          variant="caption"
        >
          {error}
        </AppText>
      ) : null}
      <Button
        disabled={isSubmitting}
        fullWidth
        onPress={() => {
          setError(undefined);
          dismiss();
        }}
        variant="secondary"
      >
        {cancelLabel}
      </Button>
      <Button
        fullWidth
        leadingIcon={destructive ? icons.actions.delete : icons.actions.confirm}
        loading={isSubmitting}
        onPress={handleConfirm}
        variant={destructive ? "danger" : "primary"}
      >
        {confirmLabel}
      </Button>
    </View>
  );
}

export const AppConfirmationSheet = forwardRef<
  AppBottomSheetModalRef,
  AppConfirmationSheetProps
>(function AppConfirmationSheet(
  {
    cancelLabel,
    confirmLabel,
    destructive,
    getErrorMessage,
    onConfirm,
    ...sheetProps
  },
  ref
) {
  return (
    <AppBottomSheetModal ref={ref} {...sheetProps}>
      <ConfirmationActions
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        destructive={destructive}
        getErrorMessage={getErrorMessage}
        onConfirm={onConfirm}
      />
    </AppBottomSheetModal>
  );
});

AppConfirmationSheet.displayName = "AppConfirmationSheet";

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
});
