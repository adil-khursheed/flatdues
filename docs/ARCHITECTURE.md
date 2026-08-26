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

## Verification cadence

Run `pnpm check` after each meaningful milestone. Database phases additionally reset/apply migrations and run RLS/RPC tests. Android and iOS bundles must succeed before release; visual and device checks are recorded separately so a successful bundle is not mistaken for device verification.
