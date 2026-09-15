import { isLocalDateKey } from "@/utils/local-date";
import { parseMoneyInput } from "@/utils/money";
import type { CreateExpenseInput } from "./types";

export type ExpenseValidationErrors = Partial<
  Record<
    "amount" | "date" | "notes" | "participants" | "payer" | "title",
    string
  >
>;

export function validateExpenseInput(
  input: CreateExpenseInput,
  activeMemberIds: ReadonlySet<string>
): ExpenseValidationErrors {
  const errors: ExpenseValidationErrors = {};
  const parsedAmount = parseMoneyInput(input.amount);
  const uniqueParticipants = new Set(input.participantIds);

  if (!parsedAmount) {
    errors.amount = "Enter a positive amount with up to two decimal places.";
  }

  if (input.title.trim().length < 1 || input.title.trim().length > 160) {
    errors.title = "Enter a description between 1 and 160 characters.";
  }

  if (!isLocalDateKey(input.expenseDate)) {
    errors.date = "Choose a valid expense date.";
  }

  if (!input.payerId || !activeMemberIds.has(input.payerId)) {
    errors.payer = "Choose an active workspace member.";
  }

  if (uniqueParticipants.size === 0) {
    errors.participants = "Select at least one participant.";
  } else if (
    uniqueParticipants.size !== input.participantIds.length ||
    [...uniqueParticipants].some((id) => !activeMemberIds.has(id))
  ) {
    errors.participants =
      "A selected participant is no longer active. Review the selection.";
  } else if (
    parsedAmount &&
    parsedAmount.minorUnits < uniqueParticipants.size
  ) {
    errors.amount =
      "The amount is too small to give every participant a positive share.";
  }

  if (input.notes.trim().length > 2000) {
    errors.notes = "Notes must be 2,000 characters or fewer.";
  }

  return errors;
}
