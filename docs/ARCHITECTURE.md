# Flatdues architecture

## Scope and constraints

- Expo SDK 56 targets React Native 0.85, React 19.2.3, Android 7+, and iOS 16.4+.
- Expo Router owns navigation. SDK 56 application code imports navigation APIs from `expo-router`, not external `@react-navigation/*` packages.
- TypeScript stays in strict mode and all application imports may use the existing `@/*` alias.
- Existing Expo-compatible packages are retained. No additional UI framework is required for the design system.
- Hugeicons is the only in-app icon system. Use `@hugeicons/react-native` with individual icon subpath imports from `@hugeicons/core-free-icons`; do not introduce Expo Symbols, vector-icon packs, emoji glyphs, or one-off SVG icons for interface actions.
- `@gorhom/bottom-sheet` is the only modal-overlay primitive. Do not import or render React Native `Modal`, Expo UI BottomSheet, or another sheet/modal library for application flows.
- `react-native-keyboard-controller` owns keyboard avoidance. Every route-level form must use the shared keyboard-aware, scrollable form primitive instead of a plain `ScrollView` or `KeyboardAvoidingView`.
- `react-native-safe-area-context` owns system insets. Every screen protects its bottom edge, including tab content, forms, fixed actions, and empty/error states.
- Windows can build and bundle Android locally, but an iOS simulator/build requires macOS or EAS Build.
- Financial totals are derived from expenses, immutable expense splits, and settlements; they are never stored as mutable balance or spending counters.
- Supabase RLS and authorized RPCs are the security boundary. Client-side role checks are presentation only.

## Database model and local workflow

The versioned Supabase project lives in `supabase/`. Apply the schema from zero with
`pnpm db:reset`, run the pgTAP authorization and financial-integrity suite with
`pnpm db:test`, and refresh checked-in types from the local schema with
`pnpm types:supabase:local`. `pnpm types:supabase` remains the linked-project
generation path. The local stack keeps Database, Auth, and API enabled; optional
Storage, Realtime, Edge Runtime, Studio, and Analytics services are disabled because
the MVP does not use them.

All user-facing tables have RLS enabled. Active workspace membership gates reads;
active admins manage workspace metadata, memberships, invites, and budgets. Direct
client writes to expenses and splits are denied. Workspace creation, invite joining,
and expense create/edit/delete operations use security-definer RPCs with an empty
`search_path`, schema-qualified relations, explicit caller authorization, and narrow
`authenticated` execute grants.

Expense amounts and split shares use `NUMERIC(12,2)`. Equal splits are calculated in
integer minor units, ordered by participant UUID, so a deterministic participant
receives each rounding remainder and the shares always total the expense. Editing an
expense replaces its splits in the same transaction; deletion intentionally cascades
to its splits. Deactivating a membership never deletes historical expenses or splits.

Balances are derived, never stored:

```text
balance = paid total - share total + settlements sent - settlements received
```

The settlement signs above are required by the product scenarios: when a debtor pays
a creditor, the debtor's negative position increases toward zero and the creditor's
positive position decreases toward zero. Monthly and daily spending use expenses
only; settlements appear in recent activity but never affect spending or budgets.

## Source layout

```text
src/
  app/                  Expo Router route files and navigation layouts
  components/
    ui/                 Reusable design primitives, AppIcon, and AppBottomSheet
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
    env.ts               Validated Expo public runtime configuration
    supabase/            Client construction and generated database types
    query-keys.ts        Stable remote-state cache keys
  providers/            Root query, keyboard, safe-area, and session lifecycle
  services/             Cross-feature orchestration only
  theme/                Tokens and system color-scheme access
  types/                Truly shared domain/application types
  utils/                Pure reusable utilities
  validation/           Shared validation primitives and error mapping
```

Feature directories are public boundaries. Route files compose feature screens; they do not issue raw Supabase queries or repeat business calculations. A feature may contain `components`, `hooks`, `repositories`, `screens`, `types`, and `utils` as it grows, and should expose only its intended public API.

## Remote state decision

TanStack Query is installed at the application provider boundary because expenses, balances, budgets, dashboard totals, and activity share server records and require coordinated refresh after financial mutations. Feature repositories own typed Supabase calls, feature hooks own query/mutation behavior, and screens consume those hooks.

`src/lib/query-keys.ts` is the single key factory. Invalidations fan out as follows:

| Successful mutation           | Invalidate/refetch                                                        |
| ----------------------------- | ------------------------------------------------------------------------- |
| Expense create/edit/delete    | expense list/detail, selected-month budget, balances, dashboard, activity |
| Settlement create/edit/delete | settlement list/detail, balances, dashboard, activity                     |
| Budget create/update          | selected-month budget and dashboard                                       |
| Membership change             | members, active workspace, expense-form defaults, balances, dashboard     |
| Workspace/profile update      | workspace/profile, members, dashboard, settings                           |

Important financial mutations wait for server confirmation before invalidation. Optimistic writes are not the default.

## UI and theme

The design system uses React Native primitives, semantic theme tokens, and the device color scheme. Components must keep a minimum 44-point touch target, expose accessibility state, support text scaling, and never communicate balance state through color alone.

UI primitives remain domain-neutral. Formatting a value is allowed in `MoneyText`; calculating balances, splits, spending, or budgets belongs to feature or database logic.

### Icon system

- Install `@hugeicons/react-native`, `@hugeicons/core-free-icons`, and its required `react-native-svg` peer using Expo-compatible versions.
- Render interface icons through a shared `AppIcon` primitive. The wrapper owns semantic sizes, theme colors, the default stroke width, and decorative/accessibility behavior.
- Import only the individual icons the central registry needs through package subpaths such as `@hugeicons/core-free-icons/Home01Icon`. The package barrel and wildcard imports are prohibited: Metro attempted to traverse thousands of barrel modules and exhausted Windows file handles during the Phase 1 production export.
- Use Hugeicons for tab icons, navigation actions, buttons, inputs, empty/error states, settings rows, categories, filters, member actions, budget actions, expense actions, settlement actions, and all other interface iconography.
- Meaningful icon-only controls require an accessible label on their enclosing pressable. Decorative icons are hidden from the accessibility tree when adjacent text already provides the label.
- App icon, splash art, member avatars, and user-supplied images are branded/content imagery rather than interface icons and are not replaced by Hugeicons.
- If a licensed Hugeicons Pro pack is adopted later, change the icon imports/registry behind `AppIcon`; feature components must not depend directly on a Pro package.

### Bottom-sheet overlays

- Wrap the application root in `GestureHandlerRootView` and `BottomSheetModalProvider` before any sheet is presented.
- Build a shared `AppBottomSheetModal` abstraction over `@gorhom/bottom-sheet`. It owns the themed background, handle, backdrop, safe-area insets, pan-down dismissal, Android back behavior, reduced-motion behavior where supported, and consistent snap-point conventions.
- Use `BottomSheetView`, `BottomSheetScrollView`, `BottomSheetFlatList`, and `BottomSheetTextInput` for sheet content instead of equivalent plain components when Gorhom integration affects gestures, scrolling, or keyboard behavior.
- Use sheets for modal-style pickers, filters, short action menus, confirmations, member/category/date selection, and compact forms. Multi-step or deep-linkable destinations remain Expo Router stack screens.
- Add Expense may remain a full-screen route for speed and keyboard space; any modal sub-flow inside it uses the shared Gorhom sheet.
- Destructive confirmations use a confirmation sheet with explicit cancel and destructive actions. Do not fall back to React Native `Modal` or a custom absolute-positioned overlay.
- Keep sheet state local to the owning feature where possible. Avoid nested sheets and global imperative registries unless a documented cross-feature use case requires them.
- The native share sheet invoked through React Native's `Share` API is an operating-system capability and is not replaced by Gorhom.

### Keyboard-aware forms and safe areas

- `SafeAreaProvider` is mounted once at the root with `initialWindowMetrics`. Route roots render the shared `Screen` primitive, whose default edges are top, right, bottom, and left. A route may opt out of an edge only when its parent navigator demonstrably owns that inset.
- The bottom of every screen remains inside the safe area. Scroll content, tab content, sticky/floating actions, form submit controls, and loading/error/empty states must include the bottom inset; do not solve this with fixed device-specific padding.
- `KeyboardProvider` is mounted once at the root. Every route-level form renders `KeyboardAwareForm`, which wraps `KeyboardAwareScrollView` from `react-native-keyboard-controller`, stays scrollable at all supported text sizes, keeps the focused field above the keyboard, and includes the bottom safe-area inset.
- `KeyboardAwareForm` defaults to `mode="insets"`, `keyboardShouldPersistTaps="handled"`, interactive keyboard dismissal, and a consistent focused-input offset. Use `mode="layout"` only when a submit control intentionally participates in flex reflow.
- A fixed form action may use `KeyboardStickyView`, but it must still incorporate the safe-area bottom inset and leave the form body scrollable. Plain React Native `KeyboardAvoidingView` is not the application form convention.
- Forms inside Gorhom sheets use `AppBottomSheetTextInput` and `AppBottomSheetKeyboardAwareScrollView`, the shared Gorhom/keyboard-controller integration. Set `keyboardAware` on `AppBottomSheetModal` forms (it enables scrolling automatically); do not combine arbitrary scroll views in feature code.

## Supabase client and environment

- Local development copies `.env.example` to `.env.local`, then sets `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Legacy projects may supply `EXPO_PUBLIC_SUPABASE_ANON_KEY` instead. Restart Expo after changing these values.
- Only the public URL and publishable/legacy anon key may be embedded in the application. A service-role key is never stored in an Expo environment variable, mobile source, build profile, or client bundle.
- `src/lib/env.ts` validates configuration before application routes mount and displays variable names and recovery guidance without echoing values.
- `src/lib/supabase/client.ts` lazily creates one `SupabaseClient<Database>`. React Native URL behavior is polyfilled before client construction, URL-session detection remains disabled for the selected non-passwordless baseline, and Phase 4 may add explicit deep-link handling only if passwordless authentication is selected.
- Native auth sessions use a versioned, chunked Expo SecureStore adapter so values remain below the platform item-size limit and updates commit by manifest. Web preview sessions are memory-only because browser storage cannot provide the native SecureStore guarantee.
- The root session lifecycle starts token refresh only while a native app is active and stops it in the background. Supabase handles browser refresh behavior on web.
- `pnpm types:supabase` regenerates `src/lib/supabase/database.types.ts` from the linked Supabase project. The checked-in Phase 2 file is only an empty generated-schema placeholder and is replaced after Phase 3 migrations.

## Data and authorization boundaries

1. A route renders a feature screen.
2. The screen calls typed feature hooks.
3. Hooks use stable query keys and feature repositories.
4. Repositories call the typed Supabase client or a named RPC.
5. PostgreSQL constraints, RLS, and RPC authorization validate every write and workspace boundary.

Multi-table financial writes use database transactions/RPCs. Client input is never trusted for membership, payer, participant, split-total, invitation, or admin validation.

## Authentication

Phase 4 uses Supabase email/password authentication. This keeps the native flow
inside the app and avoids adding passwordless callback handling before the product
needs it. The decision follows the Expo SDK 56 Router model: route groups are
guarded with `Stack.Protected`, and the root renders a loading or recovery state
until both the persisted session and active workspace membership are resolved.
Protected content is never used as a loading placeholder.

`src/features/auth/auth-repository.ts` is the Supabase-specific boundary. The auth
context exposes provider-neutral sign-in, sign-up, sign-out, and account-resolution
operations so another identity provider can be added without coupling screens or
routes to Supabase calls. Native sessions continue to use the versioned SecureStore
adapter; web preview sessions remain memory-only. The provider starts token refresh
while a native app is active, stops it in the background, reacts to signed-out or
revoked sessions, and clears session-scoped TanStack Query data on sign-out.

The Phase 3 `on_auth_user_created` database trigger creates the profile in the same
transaction as the auth user. Sign-up supplies `display_name` as user metadata, and
account resolution verifies that the profile is present before admitting the user
to onboarding or the app.

Supabase Dashboard setup for this flow:

- Enable the Email provider and password sign-ins.
- Decide whether Confirm email is required for the target environment. When it is
  enabled, set the project's Site URL to a valid confirmation landing page. After
  confirming in the browser, the user returns to Flatdues and signs in.
- No `flatdues://` redirect URL or Expo deep-link callback is required for the
  selected email/password flow. `detectSessionInUrl` therefore remains disabled.

The implementation was checked against the exact
[Expo SDK 56 reference](https://docs.expo.dev/versions/v56.0.0/) and uses the SDK 56
Expo Router package APIs rather than imports from external React Navigation packages.

## Workspace onboarding and active selection

Phase 5 keeps authentication and workspace selection separate. `AuthProvider`
owns the session and profile, while `WorkspaceProvider` loads every active
membership for the authenticated user, joins each membership to its workspace in
one query, and exposes the selected workspace to route guards and features.

The selected workspace ID is a versioned, user-scoped AsyncStorage preference.
It is not an authorization claim: repositories still pass explicit workspace IDs,
and PostgreSQL RLS/RPC checks remain authoritative. On restoration, a saved ID is
used only when it still belongs to an active membership. Otherwise the provider
falls back to the earliest active membership, repairs storage, or returns the user
to onboarding when none remain. The provider retains all memberships so a future
workspace switcher does not require a data-model change.

Workspace creation and joining call only the Phase 3 `create_workspace` and
`join_workspace_by_invite` RPCs. After the server confirms either mutation, the
client reloads memberships before protected routing changes. If that refresh fails,
the form retries activation without recreating a workspace or consuming the invite
again. The create flow fixes the MVP currency to the ISO code `INR`; symbols remain
presentation-only.

After creation, an authenticated welcome route offers invite generation without
creating an unused invite automatically. Phase 5 invite codes have no expiry and
no usage limit. Copy/paste uses the Expo SDK 56 Clipboard package, while sharing
uses React Native's operating-system share sheet. Tokens are never used as client
authorization or written to logs.

## Verification cadence

Run `pnpm check` after each meaningful milestone. Database phases additionally reset/apply migrations and run RLS/RPC tests. Android and iOS bundles must succeed before release; visual and device checks are recorded separately so a successful bundle is not mistaken for device verification.

## Members and invitations

Phase 6 exposes protected `/members` and `/invites` stack routes before the final
tab/settings navigation arrives. Workspace members are loaded with their profile
name and avatar in one joined query, then partitioned into active and inactive
sections in the client. Feature code exports an active-member selector for expense
defaults; historical screens continue to use the complete membership list.

Membership writes are RPC-only. `manage_workspace_member` lets an active admin
promote, demote, deactivate, or reactivate another member, while
`leave_workspace` is the only self-management path. The workspace row is locked
during these changes and the existing trigger rejects any operation that would
remove the last active admin. Deactivation retains the membership role and every
historical financial row; reactivation restores that role. After self-leave, the
client removes workspace-scoped cache data and asks `WorkspaceProvider` to select
another active membership or return to onboarding.

New invitations use `create_workspace_invite`, with expiry calculated from database
time. The UI defaults to seven days and five joins and accepts bounded values of
1–30 days and 1–50 joins. The older `generate_workspace_invite` RPC remains as a
deprecated deployment-compatibility wrapper, but omitted limits now resolve to the
same safe defaults. New application code must not call the compatibility RPC.

Revocation sets `workspace_invites.revoked_at`; invitation rows are never
hard-deleted by the mobile client. `join_workspace_by_invite` rejects revoked codes
before checking expiry or remaining uses. Existing Phase 5 rows with nullable expiry
or capacity remain valid legacy invitations and are labeled “No expiry” or
“Unlimited uses” until an admin revokes them. RLS hides raw invite rows from regular
members, and every create/revoke operation repeats active-admin authorization inside
its security-definer RPC.

Member mutations invalidate members, membership selection, balances, and dashboard
keys. Invite creation/revocation invalidates the workspace invitation key. Realtime
remains disabled; both management screens refetch on focus and support explicit
pull-to-refresh.
