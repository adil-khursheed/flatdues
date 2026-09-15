# Flatdues MVP TODO

This file is the implementation tracker for the Flatdues production-quality MVP described in the project brief.

## Status legend

- `[ ]` Incomplete
- `[x]` Complete and verified
- A feature is complete only when its implementation, validation, authorization, loading/error states, and relevant checks/tests are complete.
- After completing an item, add a short verification note or link to the relevant file/commit when useful.
- Every interface icon must use the shared Hugeicons mapping and `AppIcon`.
- Every modal-style application overlay must use the shared Gorhom bottom-sheet primitives.
- Every form must use `react-native-keyboard-controller` so it remains keyboard-height aware and scrollable: route forms use `KeyboardAwareForm`; Gorhom sheet forms use `AppBottomSheetKeyboardAwareScrollView` plus `AppBottomSheetTextInput`.
- Every screen and fixed/sticky bottom action must keep its bottom edge inside `react-native-safe-area-context`; use shared `Screen`/inset primitives rather than device-specific padding.

## Current project constraints

- [x] Confirm the existing project is Expo SDK 56 (`expo ~56.0.20`) with React Native 0.85.3 and React 19.2.3.
- [x] Confirm Expo Router is configured as the application entry point and typed routes are enabled.
- [x] Confirm TypeScript strict mode and the `@/*` source alias are enabled.
- [x] Confirm the app is currently a minimal starter with only a root stack and placeholder index screen.
- [x] Confirm `expo-secure-store` and a custom `flatdues` URL scheme are already configured.
- [x] Confirm `@gorhom/bottom-sheet`, React Native Gesture Handler, Reanimated, and Worklets are already installed.
- [x] Confirm Hugeicons and the Expo SDK 56-compatible `react-native-svg` peer are installed.
- [x] Confirm Supabase was absent at baseline; Phase 2 installs it while application testing dependencies remain deferred.
- [x] Confirm `react-native-keyboard-controller` and `react-native-safe-area-context` are installed at Expo SDK 56-compatible versions.
- [x] Confirm the repository has pre-existing uncommitted changes that must be preserved.
- [x] Record that `reset-project` still exists in `package.json` although `scripts/reset-project.js` is deleted.
- [x] Read the exact Expo SDK 56 documentation at <https://docs.expo.dev/versions/v56.0.0/> before changing application code.
- [x] Confirm the supported Android and iOS development/build workflow for the available host environment.
- [x] Decide whether the already-installed UI/animation packages are needed; avoid adding another UI library without a clear benefit.

## Phase 1 — Project inspection and architecture

### Feature: Repository baseline

- [x] Review the product brief and required implementation order.
- [x] Inspect `package.json`, Expo configuration, TypeScript configuration, app routes, README, and repository file structure.
- [x] Inspect the current Git status without modifying the user's existing changes.
- [x] Capture the untouched source/static-check baseline and record that the original placeholder runtime was not launched before Phase 1 source changes.
- [x] Run the initial TypeScript check and lint check; record and triage existing errors separately from new errors.
- [x] Remove or repair the stale `reset-project` script entry without discarding unrelated user changes.

### Feature: Application architecture

- [x] Create a feature-oriented `src` structure for auth, workspaces, members, invites, expenses, budgets, balances, settlements, and settings.
- [x] Create shared directories for components, hooks, Supabase access, services/repositories, types, theme, validation, and utilities.
- [x] Keep route files and screens small by moving data access and business logic into feature modules.
- [x] Define query keys and a consistent server-state invalidation strategy.
- [x] Decide whether TanStack Query is beneficial; otherwise document and use a clean Supabase repository/service abstraction.
- [x] Document architectural decisions, including financial derivation rules and server/client trust boundaries.

### Feature: Design system foundations

- [x] Define reusable colors, spacing, typography, radii, shadows, and positive/negative/neutral financial states.
- [x] Support system light/dark appearance where practical without delaying core behavior.
- [x] Implement `AppText`.
- [x] Implement `Button` with loading, disabled, and accessible states.
- [x] Implement `Card`.
- [x] Implement `Input` with label, help text, and inline validation.
- [x] Implement `MoneyText`.
- [x] Implement `Avatar` with image and initials fallback.
- [x] Implement `EmptyState`.
- [x] Implement `LoadingState`.
- [x] Implement `ErrorState` with retry/recovery action where appropriate.
- [x] Implement `SectionHeader`.
- [x] Verify generous spacing, readable amounts, rounded components, accessible contrast, and at least 44×44 touch targets.

### Feature: Hugeicons icon system

- [x] Install `@hugeicons/react-native` and `@hugeicons/core-free-icons`.
- [x] Install `react-native-svg` through Expo so the Hugeicons peer uses an SDK 56-compatible version.
- [x] Implement a shared `AppIcon` wrapper with semantic sizes, theme colors, and a consistent default stroke width.
- [x] Define typed, centralized icon mappings for tabs, settings, categories, activity, and repeated actions where mappings improve consistency.
- [x] Import individual icons through `@hugeicons/core-free-icons/<IconName>` subpaths; prohibit the package barrel and wildcard imports.
- [x] Add optional leading/trailing Hugeicons support to `Button` and icon slots to other relevant primitives.
- [x] Use Hugeicons for every interface icon currently implemented and require the mapping/wrapper for future navigation, actions, inputs, filters, states, categories, settings, expenses, budgets, members, and settlements.
- [x] Keep app/splash branding, avatars, and content images outside the interface-icon rule.
- [x] Give meaningful icon-only controls accessible labels and hide decorative icons from the accessibility tree.
- [x] Remove or avoid Expo Symbols, vector-icon libraries, emoji glyphs, and one-off SVG interface icons.
- [x] Verify unused Hugeicons remain tree-shakeable and do not create an excessive production bundle increase.

### Feature: Gorhom bottom-sheet foundation

- [x] Wrap the application root with `GestureHandlerRootView`.
- [x] Add `BottomSheetModalProvider` at the application provider boundary.
- [x] Implement a reusable, typed `AppBottomSheetModal` over `@gorhom/bottom-sheet`.
- [x] Centralize themed background, handle, backdrop, safe-area inset, snap-point, and pan-down-to-close behavior.
- [x] Support keyboard-safe form content with `BottomSheetTextInput` and the appropriate keyboard behavior.
- [x] Support scrollable/list sheet content through Gorhom's integrated scroll components.
- [x] Handle Android back dismissal and screen-reader focus/announcements correctly.
- [x] Use Gorhom sheets for all currently implemented modal-style interactions and require them for future pickers, filters, short actions, confirmations, and compact forms.
- [x] Keep multi-step or deep-linkable destinations as Expo Router stack screens.
- [x] Prohibit application imports of React Native `Modal`, Expo UI BottomSheet, other sheet/modal libraries, and custom absolute-positioned modal overlays.
- [x] Use a Gorhom confirmation sheet for destructive actions instead of React Native `Modal` or `Alert`-style application confirmations.
- [x] Document that the operating-system share sheet through `Share` remains allowed.

### Phase 1 verification

- [x] TypeScript passes.
- [x] Lint passes.
- [x] Root route produces complete Android and iOS production bundles without errors or blank route output.

Phase 1 verification notes:

- [x] `pnpm check` passes after the Phase 1 implementation.
- [x] Expo SDK dependency compatibility check reports all dependencies up to date.
- [x] Production export completes for Android, iOS, and web; the web root is statically rendered with expected content.
- [x] Production export completes after the Hugeicons and Gorhom provider foundations are implemented.
- [x] Defer interactive Android/iOS device rendering to the final release quality gate; this Windows host has no available emulator and cannot run an iOS simulator.
- The pre-change TypeScript baseline passed. The pre-change lint command could not run because ESLint was not configured; Phase 1 added the Expo SDK 56 flat configuration and compatible dependencies.
- The pre-change app itself was not launched before source changes; its placeholder source, configuration, TypeScript result, and missing lint setup were recorded as the available historical baseline.

## Phase 2 — Supabase client configuration

### Feature: Dependencies and environment

- [x] Install `@supabase/supabase-js` using versions compatible with Expo SDK 56.
- [x] Add `react-native-url-polyfill` as required by current Supabase React Native guidance.
- [x] Create `.env.example` containing `EXPO_PUBLIC_SUPABASE_URL` and the current `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, with documented legacy `EXPO_PUBLIC_SUPABASE_ANON_KEY` fallback.
- [x] Confirm `.env` files are ignored (except `.env.example`) and no service-role key or JWT pattern is present in mobile code or tracked repository history.
- [x] Validate required public environment variables at startup and show a developer-friendly configuration error.
- [x] Document local environment setup in `docs/ARCHITECTURE.md`.

### Feature: Typed Supabase client

- [x] Create a singleton, typed Supabase client.
- [x] Persist native auth sessions with a versioned, chunked Expo SecureStore adapter; keep web preview sessions memory-only.
- [x] Configure session refresh and React Native app-state handling correctly.
- [x] Keep URL-session detection disabled and defer explicit deep-link handling unless Phase 4 selects passwordless auth.
- [x] Add pinned Supabase CLI tooling and the repeatable `pnpm types:supabase` generation command.
- [x] Avoid untyped response casts and unnecessary `any`.

### Feature: Application providers, keyboard, and safe areas

- [x] Mount `SafeAreaProvider` with initial window metrics at the application boundary.
- [x] Implement shared `Screen` with all safe-area edges enabled by default, including the bottom edge.
- [x] Mount `KeyboardProvider` from `react-native-keyboard-controller` at the application boundary.
- [x] Implement shared, scrollable `KeyboardAwareForm` with safe-area bottom padding and focused-input keyboard offset.
- [x] Implement the shared Gorhom/keyboard-controller aware scroll primitive for every compact bottom-sheet form.
- [x] Mount one TanStack Query client and the native Supabase session lifecycle at the provider boundary.
- [x] Update the current route to use `Screen`; require every future route and bottom action to preserve the safe-area bottom inset.
- [x] Require every future route-level form to use `KeyboardAwareForm`; prohibit plain route-level form scroll/avoidance implementations.

### Phase 2 verification

- [x] TypeScript passes.
- [x] Lint passes.
- [x] Supabase client initializes with valid public development environment variables and production bundles complete for Android, iOS, and web.
- [x] Missing environment variables statically render a clear, safe-area-aware configuration screen without exposing secrets.

Phase 2 verification notes:

- [x] `pnpm check` passes after the Phase 2 implementation.
- [x] Pinned Supabase CLI `2.115.0` is available and `pnpm types:supabase` writes generated output only after a successful linked-project command.
- [x] A missing-environment web production export renders both required variable names and the service-role warning without rendering a value.
- [x] Synthetic valid public configuration completes Android, iOS, and web production exports, including the keyboard-controller/Gorhom integration, in `dist/phase2-final`.
- [x] Native interactive keyboard/safe-area behavior remains part of the final Android/iOS device quality gate because this Windows host has no iOS simulator and no available Android emulator.

## Phase 3 — Database schema and Row Level Security

### Feature: Supabase migration foundation

- [x] Initialize/version a `supabase` project directory and migrations in the repository.
- [x] Add required PostgreSQL extensions using migration-safe statements.
- [x] Add a reusable `updated_at` trigger function.
- [x] Add non-recursive authorization helpers such as `is_workspace_member` and `is_workspace_admin`.
- [x] Ensure security-definer functions pin a safe `search_path` and perform explicit authorization.

### Feature: Profiles schema

- [x] Create `profiles` with `id`, `display_name`, nullable `avatar_url`, `created_at`, and `updated_at`.
- [x] Reference `auth.users(id)` with the intended delete behavior.
- [x] Add a safe new-user profile creation trigger or an equivalent idempotent application flow.
- [x] Enable RLS and add read/update policies that expose only appropriate profile data.

### Feature: Workspaces schema

- [x] Create `workspaces` with name, ISO currency code defaulting to `INR`, creator, and audit timestamps.
- [x] Validate non-empty workspace names and valid currency storage.
- [x] Add foreign keys and useful indexes.
- [x] Enable RLS so only active members can read a workspace.
- [x] Restrict workspace updates to active admins.

### Feature: Workspace memberships schema

- [x] Create `workspace_members` with composite uniqueness on workspace and user.
- [x] Constrain roles to `admin` or `member`.
- [x] Constrain status to `active` or `inactive`.
- [x] Store `joined_at` and nullable `deactivated_at` without deleting membership history.
- [x] Add `workspace_id, user_id` and member lookup indexes.
- [x] Enable RLS and prevent clients from inserting themselves into arbitrary workspaces.
- [x] Restrict role/status management to authorized admins while preventing unsafe removal of the last admin.

### Feature: Workspace invitations schema

- [x] Create `workspace_invites` with unique secure token, creator, expiry, maximum uses, usage count, and timestamps.
- [x] Validate non-negative limits/counts and prevent usage count from exceeding the maximum.
- [x] Add indexes for token and workspace lookups.
- [x] Enable RLS so only active admins can list, create, or revoke invitations.
- [x] Ensure raw invite lookup does not leak workspace data to unrelated users.

### Feature: Monthly budgets schema

- [x] Create `monthly_budgets` with unique workspace/month start records.
- [x] Enforce `amount > 0` and require `month_start` to be the first calendar day of its month.
- [x] Store amounts as `NUMERIC(12,2)`.
- [x] Add the `workspace_id, month_start` index.
- [x] Enable RLS for member reads and admin-only writes.

### Feature: Expenses schema

- [x] Create `expenses` with workspace, title, amount, payer, local expense date, category, notes, creator, and timestamps.
- [x] Enforce a non-empty title and `amount > 0` using `NUMERIC(12,2)`.
- [x] Validate that payer and creator relationships are compatible with the workspace model.
- [x] Add indexes for `(workspace_id, expense_date)` and `payer_id`.
- [x] Enable RLS for member reads.
- [x] Allow members to edit/delete only expenses they created and admins to manage any workspace expense.
- [x] Ensure edits cannot bypass split integrity or historical rules.

### Feature: Expense splits schema

- [x] Create immutable historical `expense_splits` with unique expense/user rows.
- [x] Store `share_amount` as `NUMERIC(12,2)` and require a positive share.
- [x] Add indexes for `expense_id` and `user_id`.
- [x] Enable RLS through authorized access to the parent expense/workspace.
- [x] Prevent direct client writes that could create incomplete or mismatched split totals.
- [x] Ensure membership deactivation never changes historical splits.

### Feature: Settlements schema

- [x] Create `settlements` with workspace, paying member, receiving member, amount, settlement timestamp, notes, creator, and audit timestamp.
- [x] Enforce `amount > 0` and `from_user_id <> to_user_id`.
- [x] Add the `(workspace_id, settled_at)` index.
- [x] Enable RLS for workspace-member reads.
- [x] Restrict creation/update/delete to allowed participants and authorized admins according to the final permission model.
- [x] Ensure settlements never mutate expenses, spending totals, or budgets.

### Feature: Atomic workspace creation RPC

- [x] Create an authorized RPC that atomically inserts a workspace and its creator as an active admin.
- [x] Validate and normalize workspace name and default currency server-side.
- [x] Return the created workspace in a typed shape.
- [x] Prevent partial workspace creation.

### Feature: Secure invitation RPCs

- [x] Create an admin-only invite generation RPC using cryptographically secure, non-predictable tokens.
- [x] Support optional expiry and usage limits.
- [x] Create an authenticated join RPC that locks/updates invite usage atomically.
- [x] Validate invalid, expired, exhausted, missing-workspace, and already-member cases server-side.
- [x] Prevent arbitrary direct membership insertion and invite race-condition overuse.
- [x] Return stable error codes that the app can translate into friendly messages.

### Feature: Atomic expense RPC

- [x] Create an authenticated RPC that atomically creates an expense and exact split rows.
- [x] Validate caller membership, positive amount, non-empty title, valid payer, and at least one unique participant.
- [x] Validate participant membership according to active/historical edit rules.
- [x] Calculate in minor units or safe decimal arithmetic, never binary floating point.
- [x] Allocate rounding remainders deterministically so split rows total the expense exactly.
- [x] Prevent partial expenses when any validation or insert fails.
- [x] Define a safe atomic edit flow that preserves or replaces splits consistently.
- [x] Define a safe delete flow with intentional cascade/audit behavior.

### Feature: Balance calculation RPC

- [x] Create `get_workspace_balances(workspace_id)` with an explicit membership authorization check.
- [x] Return user ID, display name, paid total, share total, settlements sent, settlements received, and balance.
- [x] Implement `balance = paid_total - share_total + settlements_sent - settlements_received` so the settlement scenarios move both participants toward zero.
- [x] Include inactive members when historical records give them a non-zero position.
- [x] Ensure all member balances sum exactly to zero at currency precision.
- [x] Prevent data disclosure for unrelated workspaces.

### Feature: Spending and dashboard queries

- [x] Create efficient monthly spending data access derived only from expenses.
- [x] Create efficient daily spending data access derived only from expenses and a supplied local calendar date.
- [x] Create recent activity data access that combines expenses and settlements without treating settlements as spending.
- [x] Avoid N+1 profile/member queries.

### Phase 3 verification

- [x] Apply all migrations to a clean local/development Supabase database.
- [x] Reapply/reset migrations successfully from zero.
- [x] Generate fresh database TypeScript types.
- [x] Verify all user-facing tables have RLS enabled and expected policies.
- [x] Add database tests for constraints, RLS isolation, invitation races, atomic expense creation, exact rounding, and balance zero-sum behavior.
- [x] TypeScript passes.
- [x] Lint passes.

Phase 3 verification notes:

- [x] `pnpm db:reset` replays all five migrations from zero; the final lean local stack reset completed successfully twice in one run.
- [x] `pnpm db:test` passes 54 pgTAP assertions covering schema/RLS, cross-workspace isolation, last-admin protection, serialized single-use invites, atomic expense failures/edits, deterministic rounding, inactive-member history, spending isolation, and zero-sum balances.
- [x] `pnpm exec supabase db lint --local --level warning` reports no schema errors.
- [x] `pnpm types:supabase:local` generated `src/lib/supabase/database.types.ts` from the reset public schema.
- [x] `pnpm check` passes after the Phase 3 implementation.
- The original balance checklist signs were corrected from `- sent + received` to `+ sent - received`; the original expression contradicted Scenarios 3 and 6 by moving both settlement participants farther from zero.

## Phase 4 — Authentication

### Feature: Authentication strategy

- [x] Decide between passwordless email OTP/magic link and email/password after validating Expo/Supabase SDK 56 deep-link complexity.
- [x] Isolate the auth provider implementation so another provider can be added later.
- [x] Document the selected flow and any Supabase dashboard redirect configuration.

### Feature: Session lifecycle

- [x] Create an auth provider/hook with initial session loading, signed-in, and signed-out states.
- [x] Restore persisted sessions securely on application launch.
- [x] Refresh sessions while the app is active and stop refresh behavior appropriately in the background.
- [x] Handle expired/revoked sessions and sign-out cleanup.
- [x] Ensure the profile row exists after first authentication.

### Feature: Login and signup UI

- [x] Build the email authentication screen with `KeyboardAwareForm` so every field and submit action remains keyboard-height aware, safe-area protected, and scrollable.
- [x] Use Hugeicons for meaningful authentication input/action iconography through `AppIcon`.
- [x] Validate email and password/OTP inputs inline.
- [x] Show submission loading and prevent duplicate requests.
- [x] Translate Supabase authentication errors into understandable user messages.
- [x] Handle confirmation/magic-link return state if required.
- [x] Provide retry and navigation between login/signup states.

### Feature: Auth routing guard

- [x] Route unauthenticated users to authentication.
- [x] Route authenticated users with no active workspace membership to onboarding.
- [x] Route authenticated users with a workspace membership to the main app.
- [x] Show a loading state while session and membership are being resolved.
- [x] Prevent protected screens from briefly rendering during resolution.

### Phase 4 verification

- [ ] Sign up, sign in, app restart/session restore, expired session, and sign out work on Android.
- [ ] Sign up, sign in, app restart/session restore, expired session, and sign out work on iOS.
- [x] TypeScript passes.
- [x] Lint passes.

Phase 4 verification notes:

- [x] Selected email/password authentication; no native deep-link callback or Supabase mobile redirect allow-list entry is required.
- [x] `pnpm check` passes after the Phase 4 implementation.
- [x] Android and iOS production bundles complete with the guarded route groups; web static export also completes and includes the root, sign-in, onboarding, and home routes.
- [ ] Native interactive authentication, SecureStore restart restoration, revoked-session handling, keyboard behavior, and sign-out remain device quality gates because this Windows host has no available Android emulator and cannot run an iOS simulator.

## Phase 5 — Workspace create/join flow

### Feature: Workspace onboarding

- [x] Build the onboarding choice screen with Create Workspace and Join Workspace actions.
- [x] Use Hugeicons consistently for Create Workspace, Join Workspace, copy, and share actions.
- [x] Add suitable loading, error, and signed-in user context states.
- [x] Prevent entry when the user is not authenticated.

### Feature: Create workspace

- [x] Build the create workspace form with `KeyboardAwareForm`, safe-area-aware bottom spacing, and required name validation.
- [x] Call the atomic workspace creation RPC.
- [x] Make the creator an active admin automatically.
- [x] Set the default currency to `INR` without hard-coding a currency symbol into calculations.
- [x] Refresh active-workspace state and enter the new workspace.
- [x] Offer invite-code creation/copy/share after success.

### Feature: Join workspace

- [x] Build invite token entry/paste UI with `KeyboardAwareForm` and safe-area-aware bottom spacing.
- [x] Normalize token input without weakening token validation.
- [x] Call the secure invitation join RPC.
- [x] Show friendly errors for invalid, expired, exhausted, and already-member invitations.
- [x] Refresh membership/active-workspace state and enter the workspace after success.

### Feature: Active workspace foundation

- [x] Support a database model with multiple memberships even if the MVP UI selects a single active workspace.
- [x] Store/select the active workspace without making it an authorization mechanism.
- [x] Handle an inactive or deleted active-workspace selection safely.

### Phase 5 verification

- [ ] Acceptance Scenario 1 — Create Workspace passes.
- [ ] Join flow cannot be used to insert an arbitrary membership.
- [x] TypeScript passes.
- [x] Lint passes.

Phase 5 verification notes:

- [x] `pnpm check` passes after the Phase 5 implementation.
- [x] Android and iOS production bundles complete with the workspace provider, protected onboarding routes, Clipboard integration, and create/join flows.
- [x] Web production export completes and statically renders the workspace setup, create, join, and post-create routes.
- [x] Invite creation deliberately uses no expiry and no usage limit until Phase 6 adds invite management controls.
- [ ] `pnpm db:reset` and `pnpm db:test` could not be rerun because Docker Desktop was not running; the CLI could not reach `dockerDesktopLinuxEngine` or local Postgres on port 54322.
- [ ] Interactive create/join, clipboard, native share-sheet, keyboard, and safe-area checks remain Android/iOS device quality gates.

## Phase 6 — Members and invitations

### Feature: Members list

- [x] Show name, avatar/initial, role, and active/inactive status for each member.
- [x] Use Hugeicons for role/status indicators and member actions without replacing member avatars.
- [x] Avoid N+1 profile fetching.
- [x] Show a useful empty/single-member state.
- [x] Restrict management controls in the UI while relying on database authorization for enforcement.

### Feature: Invite management

- [x] Allow admins to generate an invitation with safe defaults.
- [x] Display and copy the invite code.
- [x] Share the invite through the native share sheet.
- [x] Present invite configuration and short invite actions through `AppBottomSheetModal` where an overlay is appropriate.
- [x] Show expiry and remaining-use information when configured.
- [x] Allow admins to revoke an active invitation.
- [x] Show loading, success, and friendly failure feedback.

### Feature: Membership management

- [x] Allow an admin to mark another member inactive without deleting history.
- [x] Exclude inactive members from new-expense defaults.
- [x] Optionally support promotion to admin if it can be implemented safely within MVP scope.
- [x] Prevent unsafe demotion/deactivation of the last active admin.
- [x] Decide and enforce whether users can leave a workspace themselves.
- [x] Present role/status actions and deactivation confirmation through Gorhom bottom sheets.

### Phase 6 verification

- [x] Acceptance Scenario 2 — Invite Members passes with five active members.
- [x] Acceptance Scenario 7 — Member Leaves preserves history and changes new-expense defaults.
- [x] Non-admin membership/invite mutations fail at the database layer.
- [x] TypeScript passes.
- [x] Lint passes.

Phase 6 verification notes:

- [x] `pnpm db:reset` replays the Phase 6 migration from zero and `pnpm db:test` passes 94 pgTAP assertions across the Phase 3 and Phase 6 suites.
- [x] Phase 6 database coverage includes bounded/compatibility invites, revocation, five active members, role/status lifecycle, RPC-only writes, self-leave, last-admin protection, and cross-workspace rejection.
- [x] Fresh local Supabase types are generated and `pnpm check` passes after the members/invitations implementation.
- [x] Expo SDK 56 compatibility reports all dependencies up to date after the required patch alignment.
- [x] Clean-cache Android, iOS, and web production exports complete with Expo Router `56.2.20`, including the protected members/invites routes and static web output.
- [ ] Interactive Android/iOS verification of bottom-sheet transitions, clipboard/share behavior, pull-to-refresh, safe areas, large text, and self-leave routing remains a device quality gate.

## Phase 7 — Expense creation and equal splitting

### Feature: Money utilities

- [x] Implement a reusable ISO-currency formatter using workspace currency.
- [x] Implement safe conversion between user-entered decimal amounts and minor units/decimal strings.
- [x] Use consistent rounding and reject invalid precision/negative/zero values.
- [ ] Add unit tests for INR formatting, parsing, large values, and rounding edge cases.

### Feature: Date utilities

- [x] Represent `expense_date` as a local calendar date without UTC shifting.
- [x] Implement device-local Today labeling and date formatting.
- [ ] Add tests around timezone boundaries and month transitions.

### Feature: Add Expense form

- [x] Build fields for amount, title/description, category, date, payer, participants, and notes inside `KeyboardAwareForm` so the long form stays keyboard-height aware, safe-area protected, and scrollable.
- [x] Default date to the device's current local date.
- [x] Default payer to the authenticated member.
- [x] Default participants to all active workspace members.
- [x] Keep the common path fast: amount, description, Add Expense.
- [x] Allow any active member to be selected as payer.
- [x] Allow participant selection/deselection and technically allow payer outside participants.
- [x] Use Gorhom bottom sheets for category, date, payer, and participant selection instead of React Native modals.
- [x] Use Hugeicons for category choices and expense-form actions through the shared icon system.
- [x] Use Gorhom-integrated list, scroll, and text-input components inside selector sheets where required.
- [x] Prevent zero selected participants.
- [x] Validate required title, payer, amount, positive amount, and participants inline.
- [x] Show an approximate per-person share before saving.
- [x] Use categories: Groceries, Food, Utilities, Rent, Housekeeping, Maintenance, Household, Transport, and Other.
- [x] Keep category definitions centralized and future-configurable.
- [x] Submit through the atomic expense RPC and prevent duplicate submissions.
- [x] Refresh expense, balance, budget, dashboard, and activity data only after success.
- [x] Show friendly server validation errors without exposing raw Postgres text.

### Feature: Prominent Add Expense action

- [x] Choose a clean prominent action compatible with the final tab/stack structure.
- [x] Make Add Expense reachable with one obvious interaction from Home.
- [x] Ensure the action is accessible and does not obscure content or navigation.
- [x] Use a Hugeicons Add/Plus icon with an accessible text label or accessible icon-only control label.

### Phase 7 verification

- [x] Acceptance Scenario 3 — Equal Expense stores five exact ₹200 splits and produces the expected zero-sum balances.
- [x] Acceptance Scenario 4 — Selected Participants affects only the selected members.
- [x] Verify a non-even split (for example ₹100 / 3) stores deterministic exact splits totaling ₹100.
- [x] Verify payer-not-participant behavior.
- [x] Verify inactive members cannot be accidentally included in a new expense.
- [x] TypeScript passes.
- [x] Lint passes.

Phase 7 verification notes:

- [x] `pnpm check` passes with no lint warnings after the Phase 7 implementation.
- [x] `pnpm db:test` passes 103 pgTAP assertions, including exact five-way splitting and balances, deterministic non-even rounding, inactive-member rejection, zero-sum balances, and payer-outside-participants behavior.
- [x] Android and iOS production bundles complete; the web production export completes with the native-only Add Expense unavailable state.
- [ ] Money/date application unit tests remain deliberately deferred to the Phase 16 `jest-expo` setup.
- [ ] Interactive Android/iOS form, keyboard, sheet, accessibility, and acceptance-scenario walkthroughs remain part of the device quality gate on a host with an available emulator/device.

## Phase 8 — Expense history and details

### Feature: Expense history

- [ ] Build the Expenses tab ordered/grouped by expense date.
- [ ] Show title, formatted amount, category, date, payer, and participant count.
- [ ] Label dates such as Today using local calendar dates.
- [ ] Implement current-month and previous-month filters.
- [ ] Optionally add a simple category filter if it remains within MVP scope.
- [ ] Present month/category filters in a Gorhom bottom sheet with Hugeicons filter/category iconography.
- [ ] Add pagination before history size becomes unbounded.
- [ ] Show loading, retryable error, pull-to-refresh, and no-expenses states.

### Feature: Expense details

- [ ] Show amount, title, date, payer, category, notes, participants, exact split amounts, and creator.
- [ ] Show edit/delete actions only when the user appears permitted.
- [ ] Use Hugeicons for edit, delete, payer, participant, category, notes, and date affordances where icons aid scanning.
- [ ] Enforce edit/delete authorization in the database regardless of UI visibility.
- [ ] Preserve the historical participant set during display.
- [ ] Handle an inactive historical member gracefully.

### Feature: Edit expense

- [ ] Build a prefilled edit form for permitted users.
- [ ] Use an atomic server-side operation when changes affect splits.
- [ ] Recalculate exact splits safely when amount or participants change.
- [ ] Preserve the original record when update validation fails.
- [ ] Refresh all affected queries after success.

### Feature: Delete expense

- [ ] Add a clear destructive-action confirmation using the shared Gorhom confirmation sheet.
- [ ] Delete the expense and splits using intentional atomic/cascade behavior.
- [ ] Refresh spending, balances, budget, history, and activity after success.
- [ ] Handle authorization or network failure without falsely removing the record from UI.

### Phase 8 verification

- [ ] History filters and pagination do not duplicate or omit records.
- [ ] Member permissions and admin overrides work at both UI and database layers.
- [ ] Editing/deleting an expense updates derived values correctly.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 9 — Monthly budget

### Feature: Monthly budget data access

- [ ] Fetch the budget for a selected calendar month.
- [ ] Derive monthly spending only from expense amounts in that month.
- [ ] Calculate `remaining = budget - spent` and `percentageUsed = spent / budget × 100` safely.
- [ ] Exclude settlements from all budget calculations.
- [ ] Preserve independent historical budget records without automatic carry-over.

### Feature: Budget management

- [ ] Build an admin-only monthly budget create/update form with `KeyboardAwareForm` and safe-area-aware bottom spacing.
- [ ] Validate a positive amount inline and server-side.
- [ ] Save the first day of the selected month as `month_start`.
- [ ] Offer to use the previous month's budget only after explicit user confirmation.
- [ ] Use Gorhom bottom sheets for month selection and the explicit “use last month” confirmation.
- [ ] Use Hugeicons for budget, calendar, edit, and confirmation affordances.
- [ ] Enforce admin-only changes at the database layer.

### Feature: Budget presentation

- [ ] Show budget, spent amount, remaining amount, and percentage used.
- [ ] Show an understandable progress indicator.
- [ ] Show “over budget” with the overage amount instead of a negative remaining value.
- [ ] Show a no-budget empty state with an admin action or member explanation.
- [ ] Handle loading and retryable errors.

### Phase 9 verification

- [ ] Acceptance Scenario 5 — Monthly Budget passes and settlements do not change it.
- [ ] Verify over-budget, no-budget, zero-expense, previous-month, and month-boundary cases.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 10 — Balance calculation and Balances screen

### Feature: Balance data layer

- [ ] Use the single server-side balance formula rather than duplicating financial calculations in screens.
- [ ] Type the balance RPC response without blind casts.
- [ ] Invalidate/refetch balances after expense and settlement mutations.
- [ ] Treat database decimal values safely in UI formatting.

### Feature: Balances tab

- [ ] Show the authenticated user's position first.
- [ ] Use “You are owed”, “You owe”, or “You're all settled up” wording.
- [ ] Show every relevant workspace member with “Gets back”, “Owes”, or settled wording.
- [ ] Use clear positive, negative, and zero visual states without relying on color alone.
- [ ] Handle inactive members with historical balances.
- [ ] Show loading, retryable error, and all-settled empty states.
- [ ] Use Hugeicons for owed/owing/settled states and Settle Up actions without relying on icons or color alone.

### Phase 10 verification

- [ ] Reverify Scenario 3 balance results and exact zero sum.
- [ ] Verify multiple payers, overlapping participant groups, edits, deletes, and inactive historical members.
- [ ] Verify an unauthorized workspace balance request fails.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 11 — Settlements

### Feature: Settlement recording

- [ ] Build Settle Up fields for paying member, receiving member, amount, date, and notes inside `KeyboardAwareForm` with safe-area-aware bottom spacing.
- [ ] Default the amount to the relevant outstanding balance where unambiguous.
- [ ] Validate positive amount and different paying/receiving members inline and server-side.
- [ ] Restrict member choices and allowed participation according to the final authorization model.
- [ ] Use Gorhom bottom sheets for paying-member, receiving-member, and date selection.
- [ ] Use Hugeicons for transfer direction, members, date, notes, and confirmation actions.
- [ ] Store settlement time without corrupting the user-selected local date intent.
- [ ] Prevent duplicate submissions.
- [ ] Refresh balances and activity only after successful persistence.
- [ ] Confirm no expense record is created.

### Feature: Settlement history

- [ ] Show settlements in recent activity.
- [ ] Provide an appropriate settlement history view or section.
- [ ] Display payer, receiver, amount, date, notes, and creator where useful.
- [ ] Define and enforce edit/delete rules, or explicitly make settlements immutable for MVP.
- [ ] Show loading, retryable error, and empty states.

### Phase 11 verification

- [ ] Acceptance Scenario 6 — Settlement moves both balances toward zero exactly.
- [ ] Verify household spending, daily spending, and monthly budget are unchanged.
- [ ] Verify unrelated users and disallowed participants cannot create or modify settlements.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 12 — Home dashboard and main navigation

### Feature: Main Expo Router navigation

- [ ] Create authenticated bottom tabs for Home, Expenses, Balances, and Settings.
- [ ] Use Hugeicons exclusively for Home, Expenses, Balances, and Settings tab icons with selected/unselected theme states.
- [ ] Add stack routes for add expense, expense details/edit, settle up, workspace onboarding, members, invites, and budget management.
- [ ] Use shared Gorhom bottom sheets for modal-style overlays inside routes; do not use React Native modal presentation.
- [ ] Ensure back behavior and deep links work on Android and iOS.
- [ ] Keep protected routes behind the auth/workspace guard.
- [ ] Use accessible tab labels/icons and safe-area handling.

### Feature: Home dashboard

- [ ] Show the active workspace name.
- [ ] Show the current month budget card with spent, total budget, remaining/overage, and progress.
- [ ] Show today's spending derived from expenses for the device's local date.
- [ ] Show the authenticated user's current balance in plain language.
- [ ] Show a prominent Add Expense quick action.
- [ ] Show recent expense and settlement activity.
- [ ] Use Hugeicons for dashboard sections, quick actions, expense categories, and activity types where they improve scanning.
- [ ] Keep analytics intentionally limited to the MVP questions.
- [ ] Avoid duplicate/N+1 requests and fetch dashboard data efficiently.

### Feature: Dashboard states and refresh

- [ ] Show a non-blank loading state while essential data loads.
- [ ] Show partial-section recovery when one dashboard request fails.
- [ ] Support manual refresh/retry.
- [ ] Show tailored no-expense, no-budget, no-balance, and no-other-members states.
- [ ] Refresh after expense, settlement, budget, and membership changes.

### Phase 12 verification

- [ ] Dashboard answers spending, budget remaining/overage, personal balance, and recent activity at a glance.
- [ ] Today's total supports multiple same-day expenses and local timezone boundaries.
- [ ] Settlements appear in activity but never in spending totals.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 13 — Settings and member management

### Feature: Settings screen

- [ ] Add Profile, Workspace, Members, Monthly Budget, Invite Members, and Sign Out entries.
- [ ] Use Hugeicons for every settings row and disclosure/action affordance.
- [ ] Hide or explain admin-only actions for regular members while retaining server enforcement.
- [ ] Keep settings navigation and content intentionally simple.

### Feature: Profile settings

- [ ] Show and edit display name in `KeyboardAwareForm` with keyboard-height-aware scrolling and safe-area bottom spacing.
- [ ] Show avatar or initials fallback; keep avatar upload out of scope unless storage is deliberately configured.
- [ ] Validate input and handle save loading/errors.
- [ ] Refresh member displays after profile changes.

### Feature: Workspace settings

- [ ] Show workspace name and currency; use `KeyboardAwareForm` for editable content and keep bottom actions inside the safe area.
- [ ] Allow admins to update the workspace name.
- [ ] Keep MVP currency fixed to `INR` after creation unless a safe migration/product rule is defined.
- [ ] Enforce updates at the database layer.

### Feature: Sign out

- [ ] Confirm/execute sign out with a progress state using the shared Gorhom confirmation sheet.
- [ ] Clear session-scoped cached data and active-workspace selection safely.
- [ ] Return to the authentication flow without protected-screen flashes.

### Phase 13 verification

- [ ] Admin and member settings experiences reflect their permissions.
- [ ] Profile/workspace updates appear consistently throughout the app.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 14 — Loading, error, and empty states

### Feature: Request-state coverage

- [ ] Audit every Supabase query for an intentional loading state.
- [ ] Audit every query/mutation for friendly error handling.
- [ ] Add retry/recovery where safe and useful.
- [ ] Prevent blank screens and stuck loading indicators.
- [ ] Prevent double-submit behavior for all financial mutations.
- [ ] Log useful development context without secrets or sensitive records.
- [ ] Never expose raw Postgres/Supabase error text directly to users.

### Feature: Required empty states

- [ ] Use appropriate Hugeicons through `AppIcon` for empty, loading-success context, warning, and error illustrations where an icon adds meaning.
- [ ] No expenses: “No expenses yet. Add your first shared expense.”
- [ ] No budget: “No budget set for [month]. Set a monthly budget to track your spending.”
- [ ] Zero balance: “You're all settled up.”
- [ ] No other members: “You're the only member here. Invite your flatmates to start splitting expenses.”
- [ ] Adapt actions/messages appropriately for non-admin members.

### Feature: Connectivity and stale data behavior

- [ ] Handle transient network failures without losing entered form data.
- [ ] Clearly distinguish loading, refreshing, stale data, and failed mutation states.
- [ ] Prefer confirmed writes and refetches over risky optimistic financial updates.
- [ ] Ensure failed financial writes never appear permanently successful.

### Phase 14 verification

- [ ] Request-state audit is complete for every screen and mutation.
- [ ] Offline/transient-error manual checks preserve data integrity.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 15 — Validation, security, accessibility, and edge cases

### Feature: Form validation audit

- [ ] Expense: required title, required payer, amount greater than zero, valid precision, and at least one participant.
- [ ] Budget: amount greater than zero and valid precision.
- [ ] Settlement: amount greater than zero, valid precision, and different members.
- [ ] Workspace: non-empty normalized name.
- [ ] Authentication: valid email and required password/OTP fields.
- [ ] Invitations: required normalized token.
- [ ] Match important client validations with authoritative database validations.

### Feature: Financial correctness edge cases

- [ ] Test one-participant expenses.
- [ ] Test payer excluded from participants.
- [ ] Test non-even division and deterministic remainder allocation.
- [ ] Test decimal input, maximum supported values, and rejected over-precision.
- [ ] Test multiple expenses, edits, deletes, and settlements in different orders.
- [ ] Test inactive members with historical expenses and non-zero balances.
- [ ] Test month/year boundaries and device timezone changes.
- [ ] Test over-budget and missing-budget cases.
- [ ] Ensure no manually stored balance, daily total, monthly spent total, or remaining-budget counter exists.

### Feature: Authorization audit

- [ ] Verify a Workspace A user cannot read Workspace B workspace details.
- [ ] Verify a Workspace A user cannot read or mutate Workspace B members/invites.
- [ ] Verify a Workspace A user cannot read or mutate Workspace B expenses/splits.
- [ ] Verify a Workspace A user cannot read or mutate Workspace B budgets.
- [ ] Verify a Workspace A user cannot read or mutate Workspace B settlements/balances.
- [ ] Verify manually substituted IDs do not bypass RLS/RPC authorization.
- [ ] Verify member/admin edit and delete rules for expenses.
- [ ] Verify admin-only budget, invite, workspace, and membership mutations.
- [ ] Verify no service-role credentials ship in the app bundle.

### Feature: Accessibility and usability audit

- [ ] Add accessible names/roles/hints to interactive elements.
- [ ] Verify touch target sizes and screen-reader navigation.
- [ ] Verify positive/negative states do not rely on color alone.
- [ ] Verify text scaling and large financial amounts do not break critical layouts.
- [ ] Verify every route-level form uses `KeyboardAwareForm`, remains scrollable at keyboard height and large text sizes, and has correct focus order, input types, and submit behavior.
- [ ] Verify every screen, tab, sheet, and fixed/sticky bottom action respects the safe-area bottom inset on Android and iOS.
- [ ] Verify Android back behavior and iOS gestures.
- [ ] Verify bottom-sheet focus, announcements, dismissal gestures, backdrop behavior, and Android back handling.
- [ ] Verify every meaningful icon-only control has an accessible label and decorative Hugeicons are hidden appropriately.
- [ ] Verify light/dark mode contrast if both modes are enabled.

### Feature: Icon and overlay implementation audit

- [ ] Verify all interface icons render through the shared Hugeicons `AppIcon` primitive.
- [ ] Verify icon imports are named imports and remain tree-shakeable.
- [ ] Verify no Expo Symbols, vector-icon packs, emoji glyphs, or ad hoc SVGs are used as interface icons.
- [ ] Verify app/splash branding, avatars, and content imagery remain correctly outside the interface-icon abstraction.
- [ ] Verify no feature imports `Modal` from React Native.
- [ ] Verify no feature uses Expo UI BottomSheet or another modal/sheet implementation instead of Gorhom.
- [ ] Verify every modal-style application overlay uses the shared Gorhom bottom-sheet abstraction.
- [ ] Verify sheets use Gorhom-integrated text input/list/scroll primitives where gesture or keyboard integration requires them.
- [ ] Verify destructive confirmations use the shared confirmation sheet.
- [ ] Verify deep-linkable and multi-step flows remain stack routes rather than being forced into sheets.

### Phase 15 verification

- [ ] Acceptance Scenario 8 — Authorization passes at the database layer.
- [ ] All financial/date edge-case tests pass.
- [ ] Accessibility audit has no critical issues.
- [ ] TypeScript passes.
- [ ] Lint passes.

## Phase 16 — Tests, release checks, and documentation

### Feature: Automated test suite

- [ ] Choose minimal Expo SDK 56-compatible unit/component test tooling.
- [ ] Add unit tests for money parsing/formatting and split allocation.
- [ ] Add unit tests for date/month utilities.
- [ ] Add tests for balance and budget response mapping/presentation.
- [ ] Add component/form tests for required validation, states, `KeyboardAwareForm` usage, keyboard-height scrolling, and safe-area bottom behavior.
- [ ] Add component tests for `AppIcon`, accessible icon buttons, and Hugeicons theme states.
- [ ] Add component/integration tests for bottom-sheet presentation, dismissal, confirmation, and keyboard-safe form behavior.
- [ ] Add database tests for migrations, constraints, RPCs, atomicity, and RLS.
- [ ] Add integration or scripted acceptance tests for the eight required scenarios.
- [ ] Add test scripts to `package.json`.

### Feature: Performance and reliability

- [ ] Check dashboard and history queries for duplicate requests and N+1 patterns.
- [ ] Verify required indexes are used for expected workspace-scale queries.
- [ ] Verify expense history pagination remains stable.
- [ ] Confirm normal refetching is reliable before considering optional Realtime.
- [ ] Add Realtime only if it does not complicate or delay the working MVP.

### Feature: README and developer setup

- [ ] Replace the starter README with the Flatdues project overview.
- [ ] Document the tech stack and prerequisites.
- [ ] Document Hugeicons as the only interface icon system and Gorhom Bottom Sheet as the only modal-overlay primitive.
- [ ] Document environment variables and the prohibition on service-role keys in the app.
- [ ] Document Supabase project setup and authentication configuration.
- [ ] Document applying/resetting migrations and generating database types.
- [ ] Document installing dependencies and starting Expo.
- [ ] Document Android and iOS run instructions.
- [ ] Document tests, lint, and TypeScript commands.
- [ ] Document architecture and data-access decisions.
- [ ] Document the database model and financial derivation rules.
- [ ] Document any platform limitations or manual configuration.

### Feature: Final acceptance scenarios

- [ ] Scenario 1 — A new user signs up, creates “Flat 302,” becomes admin, and reaches the dashboard.
- [ ] Scenario 2 — An admin generates an invite and four users join, producing five active members.
- [ ] Scenario 3 — ₹1,000 paid by Adil across five members creates ₹200 splits; balances are +₹800/-₹200 and sum to ₹0.
- [ ] Scenario 4 — ₹600 shared only by Adil, Aman, and Ali creates three ₹200 splits and no shares for others.
- [ ] Scenario 5 — A ₹20,000 budget and ₹1,000 expense show ₹1,000 spent and ₹19,000 remaining; settlement does not change either.
- [ ] Scenario 6 — Aman settling ₹200 to Adil moves both balances toward zero without changing spending or budget.
- [ ] Scenario 7 — Deactivating a member preserves historical splits and defaults new expenses to the four active members.
- [ ] Scenario 8 — Cross-workspace reads and writes fail even when IDs are manually changed.

### Feature: Final quality gate

- [ ] Run the complete automated test suite successfully.
- [ ] Run a clean TypeScript check successfully.
- [ ] Run lint successfully with no ignored new errors.
- [ ] Apply/reset Supabase migrations successfully from a clean database.
- [ ] Verify no secrets, dead code, unnecessary `any`, duplicate financial formulas, or raw screen-level Supabase queries remain.
- [ ] Verify no unauthorized icon library, direct Hugeicons styling duplication, React Native `Modal`, or custom modal overlay remains.
- [ ] Verify Android behavior on a development build or representative device/emulator.
- [ ] Verify iOS behavior on a development build or representative device/simulator.
- [ ] Walk through every acceptance scenario using concrete records and record results.
- [ ] Confirm financial correctness and database authorization before declaring the MVP complete.

## Explicitly deferred V1 non-goals

These are guardrails, not incomplete MVP work. Do not add them unless the product scope changes explicitly.

- AI features or OCR receipt scanning
- Bank integrations, payment gateways, or automatic UPI payments
- Recurring expenses
- Advanced statistics or debt optimization
- Receipt image storage
- Chat/comments or push notifications
- Per-category or carry-forward budgets
- Multiple currencies inside one workspace
- Offline-first synchronization
- Web administration dashboard
