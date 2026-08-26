-- Flatdues Phase 3: least-privilege grants and row-level security policies.

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.settlements enable row level security;

create or replace function private.can_access_expense(p_expense_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.expenses as expense
    where expense.id = p_expense_id
      and private.is_workspace_member(expense.workspace_id)
  );
$$;

grant execute on function private.can_access_expense(uuid) to authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

create policy profiles_select_shared_workspace
on public.profiles
for select
to authenticated
using ((select private.can_view_profile(id)));

create policy profiles_update_self
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

grant select on table public.workspaces to authenticated;
grant update (name) on table public.workspaces to authenticated;

create policy workspaces_select_active_members
on public.workspaces
for select
to authenticated
using ((select private.is_workspace_member(id)));

create policy workspaces_update_active_admins
on public.workspaces
for update
to authenticated
using ((select private.is_workspace_admin(id)))
with check ((select private.is_workspace_admin(id)));

grant select on table public.workspace_members to authenticated;
grant update (role, status, deactivated_at)
  on table public.workspace_members to authenticated;

create policy workspace_members_select_active_workspace_members
on public.workspace_members
for select
to authenticated
using ((select private.is_workspace_member(workspace_id)));

create policy workspace_members_update_active_admins
on public.workspace_members
for update
to authenticated
using ((select private.is_workspace_admin(workspace_id)))
with check ((select private.is_workspace_admin(workspace_id)));

grant select, delete on table public.workspace_invites to authenticated;

create policy workspace_invites_select_active_admins
on public.workspace_invites
for select
to authenticated
using ((select private.is_workspace_admin(workspace_id)));

create policy workspace_invites_delete_active_admins
on public.workspace_invites
for delete
to authenticated
using ((select private.is_workspace_admin(workspace_id)));

grant select, delete on table public.monthly_budgets to authenticated;
grant insert (workspace_id, month_start, amount, created_by)
  on table public.monthly_budgets to authenticated;
grant update (amount) on table public.monthly_budgets to authenticated;

create policy monthly_budgets_select_active_members
on public.monthly_budgets
for select
to authenticated
using ((select private.is_workspace_member(workspace_id)));

create policy monthly_budgets_insert_active_admins
on public.monthly_budgets
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_workspace_admin(workspace_id))
);

create policy monthly_budgets_update_active_admins
on public.monthly_budgets
for update
to authenticated
using ((select private.is_workspace_admin(workspace_id)))
with check ((select private.is_workspace_admin(workspace_id)));

create policy monthly_budgets_delete_active_admins
on public.monthly_budgets
for delete
to authenticated
using ((select private.is_workspace_admin(workspace_id)));

grant select on table public.expenses to authenticated;

create policy expenses_select_active_members
on public.expenses
for select
to authenticated
using ((select private.is_workspace_member(workspace_id)));

grant select on table public.expense_splits to authenticated;

create policy expense_splits_select_through_expense
on public.expense_splits
for select
to authenticated
using ((select private.can_access_expense(expense_id)));

grant select, delete on table public.settlements to authenticated;
grant insert (
  workspace_id,
  from_user_id,
  to_user_id,
  amount,
  settled_at,
  notes,
  created_by
) on table public.settlements to authenticated;
grant update (from_user_id, to_user_id, amount, settled_at, notes)
  on table public.settlements to authenticated;

create policy settlements_select_active_members
on public.settlements
for select
to authenticated
using ((select private.is_workspace_member(workspace_id)));

create policy settlements_insert_participants_or_admins
on public.settlements
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.can_manage_settlement(workspace_id, from_user_id, to_user_id))
);

create policy settlements_update_participants_or_admins
on public.settlements
for update
to authenticated
using ((select private.can_manage_settlement(workspace_id, from_user_id, to_user_id)))
with check ((select private.can_manage_settlement(workspace_id, from_user_id, to_user_id)));

create policy settlements_delete_participants_or_admins
on public.settlements
for delete
to authenticated
using ((select private.can_manage_settlement(workspace_id, from_user_id, to_user_id)));

