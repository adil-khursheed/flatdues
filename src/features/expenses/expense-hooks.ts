import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createExpense } from "./expense-repository";
import type { CreateExpenseInput } from "./types";

export function useCreateExpense(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.all(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.balances.all(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.budgets.all(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.activity(workspaceId),
        }),
      ]);
    },
  });
}
