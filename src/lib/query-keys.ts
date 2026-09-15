export type ExpenseListFilters = Readonly<{
  category?: string;
  cursor?: string;
  month?: string;
}>;

export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  profile: {
    detail: (userId: string) => ["profiles", userId] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    detail: (workspaceId: string) => ["workspaces", workspaceId] as const,
    memberships: (userId: string) =>
      ["workspaces", "memberships", userId] as const,
  },
  members: {
    all: (workspaceId: string) =>
      ["workspaces", workspaceId, "members"] as const,
  },
  invites: {
    all: (workspaceId: string) =>
      ["workspaces", workspaceId, "invites"] as const,
  },
  expenses: {
    all: (workspaceId: string) =>
      ["workspaces", workspaceId, "expenses"] as const,
    list: (workspaceId: string, filters: ExpenseListFilters) =>
      ["workspaces", workspaceId, "expenses", "list", filters] as const,
    detail: (workspaceId: string, expenseId: string) =>
      ["workspaces", workspaceId, "expenses", expenseId] as const,
  },
  budgets: {
    all: (workspaceId: string) =>
      ["workspaces", workspaceId, "budgets"] as const,
    month: (workspaceId: string, monthStart: string) =>
      ["workspaces", workspaceId, "budgets", monthStart] as const,
  },
  balances: {
    all: (workspaceId: string) =>
      ["workspaces", workspaceId, "balances"] as const,
  },
  settlements: {
    all: (workspaceId: string) =>
      ["workspaces", workspaceId, "settlements"] as const,
    detail: (workspaceId: string, settlementId: string) =>
      ["workspaces", workspaceId, "settlements", settlementId] as const,
  },
  dashboard: {
    all: (workspaceId: string) =>
      ["workspaces", workspaceId, "dashboard"] as const,
    detail: (workspaceId: string, monthStart: string, localDate: string) =>
      ["workspaces", workspaceId, "dashboard", monthStart, localDate] as const,
    activity: (workspaceId: string) =>
      ["workspaces", workspaceId, "activity"] as const,
  },
} as const;
