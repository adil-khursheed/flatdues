const expenseErrorMessages: Readonly<Record<string, string>> = {
  AUTH_REQUIRED: "Your session has expired. Sign in and try again.",
  EXPENSE_AMOUNT_INVALID:
    "Enter a positive amount with up to two decimal places.",
  EXPENSE_AMOUNT_TOO_SMALL_FOR_SPLITS:
    "The amount is too small for the selected participants.",
  EXPENSE_CATEGORY_INVALID: "Choose a valid expense category.",
  EXPENSE_DATE_INVALID: "Choose a valid expense date.",
  EXPENSE_NOTES_INVALID: "Notes must be 2,000 characters or fewer.",
  EXPENSE_PARTICIPANT_NOT_ACTIVE:
    "A selected participant is no longer active. Review the selection.",
  EXPENSE_PARTICIPANTS_DUPLICATE: "Each participant can be selected only once.",
  EXPENSE_PARTICIPANTS_REQUIRED: "Select at least one participant.",
  EXPENSE_PAYER_INVALID: "Choose who paid for this expense.",
  EXPENSE_PAYER_NOT_ACTIVE:
    "The selected payer is no longer active. Choose another member.",
  EXPENSE_TITLE_INVALID: "Enter a description between 1 and 160 characters.",
  WORKSPACE_MEMBER_REQUIRED: "You no longer have access to this workspace.",
};

export function getExpenseErrorMessage(error: unknown) {
  const errorText =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : "";
  const knownCode = Object.keys(expenseErrorMessages).find((code) =>
    errorText.includes(code)
  );

  return knownCode
    ? expenseErrorMessages[knownCode]
    : "We couldn't add this expense. Check your connection and try again.";
}
