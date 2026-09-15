import { getSupabaseClient } from "@/lib/supabase";
import type { CreateExpenseInput, Expense } from "./types";

export async function createExpense(
  input: CreateExpenseInput
): Promise<Expense> {
  const { data, error } = await getSupabaseClient().rpc("create_expense", {
    p_amount: Number(input.amount),
    p_category: input.category,
    p_expense_date: input.expenseDate,
    p_notes: input.notes.trim(),
    p_participant_ids: [...new Set(input.participantIds)],
    p_payer_id: input.payerId,
    p_title: input.title.trim(),
    p_workspace_id: input.workspaceId,
  });

  if (error) throw error;
  return data;
}
