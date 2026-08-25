# Flatdues architecture

## Scope and constraints

- Expo SDK 56 targets React Native 0.85, React 19.2.3, Android 7+, and iOS 16.4+.
- Expo Router owns navigation. SDK 56 application code imports navigation APIs from `expo-router`, not external `@react-navigation/*` packages.
- TypeScript stays in strict mode and all application imports may use the existing `@/*` alias.
- Existing Expo-compatible packages are retained. No additional UI framework is required for the design system.
- Windows can build and bundle Android locally, but an iOS simulator/build requires macOS or EAS Build.
- Financial totals are derived from expenses, immutable expense splits, and settlements; they are never stored as mutable balance or spending counters.
- Supabase RLS and authorized RPCs are the security boundary. Client-side role checks are presentation only.

## Source layout

```text
src/
  app/                  Expo Router route files and navigation layouts
  components/
    ui/                 Reusable, domain-neutral design primitives
  features/
    auth/               Authentication and session lifecycle
    workspaces/         Workspace selection, creation, and joining
    members/            Membership state and administration
    invites/            Secure invitation generation and joining
    expenses/           Expense forms, history, and exact splits
    budgets/            Calendar-month budgets and spending views
    balances/           Derived member positions
    settlements/        Repayment recording and history
    dashboard/          Home aggregation and recent activity
    settings/           Profile and workspace settings
  hooks/                Shared hooks with no feature ownership
  lib/
    supabase/            Client construction and generated database types
    query-keys.ts        Stable remote-state cache keys
  services/             Cross-feature orchestration only
  theme/                Tokens and system color-scheme access
  types/                Truly shared domain/application types
  utils/                Pure reusable utilities
  validation/           Shared validation primitives and error mapping
```

Feature directories are public boundaries. Route files compose feature screens; they do not issue raw Supabase queries or repeat business calculations. A feature may contain `components`, `hooks`, `repositories`, `screens`, `types`, and `utils` as it grows, and should expose only its intended public API.

## Remote state decision

TanStack Query is beneficial because expenses, balances, budgets, dashboard totals, and activity share server records and require coordinated refresh after financial mutations. It will be installed alongside the Supabase client in Phase 2. Feature repositories will own typed Supabase calls, feature hooks will own query/mutation behavior, and screens will consume those hooks.

`src/lib/query-keys.ts` is the single key factory. Invalidations fan out as follows:

| Successful mutation | Invalidate/refetch |
| --- | --- |
| Expense create/edit/delete | expense list/detail, selected-month budget, balances, dashboard, activity |
| Settlement create/edit/delete | settlement list/detail, balances, dashboard, activity |
| Budget create/update | selected-month budget and dashboard |
| Membership change | members, active workspace, expense-form defaults, balances, dashboard |
| Workspace/profile update | workspace/profile, members, dashboard, settings |

Important financial mutations wait for server confirmation before invalidation. Optimistic writes are not the default.

## UI and theme

The design system uses React Native primitives, semantic theme tokens, and the device color scheme. Components must keep a minimum 44-point touch target, expose accessibility state, support text scaling, and never communicate balance state through color alone.

UI primitives remain domain-neutral. Formatting a value is allowed in `MoneyText`; calculating balances, splits, spending, or budgets belongs to feature or database logic.

## Data and authorization boundaries

1. A route renders a feature screen.
2. The screen calls typed feature hooks.
3. Hooks use stable query keys and feature repositories.
4. Repositories call the typed Supabase client or a named RPC.
5. PostgreSQL constraints, RLS, and RPC authorization validate every write and workspace boundary.

Multi-table financial writes use database transactions/RPCs. Client input is never trusted for membership, payer, participant, split-total, invitation, or admin validation.

## Verification cadence

Run `pnpm check` after each meaningful milestone. Database phases additionally reset/apply migrations and run RLS/RPC tests. Android and iOS bundles must succeed before release; visual and device checks are recorded separately so a successful bundle is not mistaken for device verification.
