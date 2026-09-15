import type { Database } from "@/lib/supabase";

export type ExpenseCategory =
  | "groceries"
  | "food"
  | "utilities"
  | "rent"
  | "housekeeping"
  | "maintenance"
  | "household"
  | "transport"
  | "other";

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];

export type CreateExpenseInput = Readonly<{
  amount: string;
  category: ExpenseCategory;
  expenseDate: string;
  notes: string;
  participantIds: readonly string[];
  payerId: string;
  title: string;
  workspaceId: string;
}>;
