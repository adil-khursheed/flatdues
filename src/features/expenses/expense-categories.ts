import type { AppIconData } from "@/lib/icons";
import { icons } from "@/lib/icons";
import type { ExpenseCategory } from "./types";

export type ExpenseCategoryDefinition = Readonly<{
  icon: AppIconData;
  label: string;
  value: ExpenseCategory;
}>;

export const expenseCategories: readonly ExpenseCategoryDefinition[] = [
  { icon: icons.categories.groceries, label: "Groceries", value: "groceries" },
  { icon: icons.categories.food, label: "Food", value: "food" },
  { icon: icons.categories.utilities, label: "Utilities", value: "utilities" },
  { icon: icons.categories.rent, label: "Rent", value: "rent" },
  {
    icon: icons.categories.housekeeping,
    label: "Housekeeping",
    value: "housekeeping",
  },
  {
    icon: icons.categories.maintenance,
    label: "Maintenance",
    value: "maintenance",
  },
  { icon: icons.categories.household, label: "Household", value: "household" },
  { icon: icons.categories.transport, label: "Transport", value: "transport" },
  { icon: icons.categories.other, label: "Other", value: "other" },
] as const;

export function getExpenseCategory(value: ExpenseCategory) {
  return (
    expenseCategories.find((category) => category.value === value) ??
    expenseCategories.at(-1)!
  );
}
