-- Flatdues Phase 3: core schema, integrity constraints, and non-recursive helpers.

create schema if not exists private;
revoke all on schema private from public;

create extension if not exists pgcrypto with schema extensions;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_not_blank
    check (char_length(btrim(display_name)) between 1 and 100),
  constraint profiles_avatar_url_length
    check (avatar_url is null or char_length(avatar_url) <= 2048)
);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_name text;
begin
  candidate_name := nullif(
    btrim(
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        new.raw_user_meta_data ->> 'full_name',
        split_part(coalesce(new.email, ''), '@', 1)
      )
    ),
    ''
  );

  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(candidate_name, 'Flatmate'), 100))
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency_code text not null default 'INR',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_name_not_blank
    check (char_length(btrim(name)) between 1 and 100),
  constraint workspaces_currency_code_iso_shape
    check (currency_code ~ '^[A-Z]{3}$')
);

create index workspaces_created_by_idx on public.workspaces (created_by);

create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function private.set_updated_at();

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  role text not null default 'member',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  deactivated_at timestamptz,
  primary key (workspace_id, user_id),
  constraint workspace_members_role_valid check (role in ('admin', 'member')),
  constraint workspace_members_status_valid check (status in ('active', 'inactive')),
  constraint workspace_members_deactivation_consistent check (
    (status = 'active' and deactivated_at is null)
    or (status = 'inactive' and deactivated_at is not null)
  )
);

create index workspace_members_user_lookup_idx
  on public.workspace_members (user_id, status, workspace_id);
create index workspace_members_active_admin_idx
  on public.workspace_members (workspace_id, user_id)
  where status = 'active' and role = 'admin';

create or replace function private.is_workspace_member(
  p_workspace_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is not null and exists (
    select 1
    from public.workspace_members as member
    where member.workspace_id = p_workspace_id
      and member.user_id = p_user_id
      and member.status = 'active'
  );
$$;

create or replace function private.is_workspace_admin(
  p_workspace_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is not null and exists (
    select 1
    from public.workspace_members as member
    where member.workspace_id = p_workspace_id
      and member.user_id = p_user_id
      and member.status = 'active'
      and member.role = 'admin'
  );
$$;

create or replace function private.can_view_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_profile_id = auth.uid() or exists (
    select 1
    from public.workspace_members as viewer_membership
    join public.workspace_members as target_membership
      on target_membership.workspace_id = viewer_membership.workspace_id
    where viewer_membership.user_id = auth.uid()
      and viewer_membership.status = 'active'
      and target_membership.user_id = p_profile_id
  );
$$;

create or replace function private.protect_last_workspace_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'admin'
    and old.status = 'active'
    and (new.role <> 'admin' or new.status <> 'active')
  then
    perform 1
    from public.workspaces
    where id = old.workspace_id
    for update;

    if not exists (
      select 1
      from public.workspace_members as other_admin
      where other_admin.workspace_id = old.workspace_id
        and other_admin.user_id <> old.user_id
        and other_admin.role = 'admin'
        and other_admin.status = 'active'
    ) then
      raise exception using errcode = 'P0001', message = 'LAST_ACTIVE_ADMIN';
    end if;
  end if;

  if new.status = 'inactive' and old.status = 'active' then
    new.deactivated_at = coalesce(new.deactivated_at, statement_timestamp());
  elsif new.status = 'active' then
    new.deactivated_at = null;
  end if;

  return new;
end;
$$;

create trigger workspace_members_protect_last_admin
before update of role, status on public.workspace_members
for each row execute function private.protect_last_workspace_admin();

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  token text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  created_by uuid not null,
  expires_at timestamptz,
  max_uses integer,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_invites_token_unique unique (token),
  constraint workspace_invites_token_shape check (token ~ '^[0-9a-f]{64}$'),
  constraint workspace_invites_max_uses_positive check (max_uses is null or max_uses > 0),
  constraint workspace_invites_usage_count_nonnegative check (usage_count >= 0),
  constraint workspace_invites_usage_within_limit
    check (max_uses is null or usage_count <= max_uses),
  constraint workspace_invites_creator_membership_fk
    foreign key (workspace_id, created_by)
    references public.workspace_members (workspace_id, user_id)
    on delete restrict
);

create index workspace_invites_workspace_idx
  on public.workspace_invites (workspace_id, created_at desc);
create index workspace_invites_token_lookup_idx
  on public.workspace_invites (token);

create trigger workspace_invites_set_updated_at
before update on public.workspace_invites
for each row execute function private.set_updated_at();

create table public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  month_start date not null,
  amount numeric(12, 2) not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_budgets_workspace_month_unique unique (workspace_id, month_start),
  constraint monthly_budgets_amount_positive check (amount > 0),
  constraint monthly_budgets_month_first_day
    check (month_start = date_trunc('month', month_start)::date),
  constraint monthly_budgets_creator_membership_fk
    foreign key (workspace_id, created_by)
    references public.workspace_members (workspace_id, user_id)
    on delete restrict
);

create index monthly_budgets_workspace_month_idx
  on public.monthly_budgets (workspace_id, month_start);

create trigger monthly_budgets_set_updated_at
before update on public.monthly_budgets
for each row execute function private.set_updated_at();

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null,
  payer_id uuid not null,
  expense_date date not null,
  category text not null default 'other',
  notes text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_title_not_blank
    check (char_length(btrim(title)) between 1 and 160),
  constraint expenses_amount_positive check (amount > 0),
  constraint expenses_category_not_blank
    check (char_length(btrim(category)) between 1 and 50),
  constraint expenses_notes_length
    check (notes is null or char_length(notes) <= 2000),
  constraint expenses_payer_membership_fk
    foreign key (workspace_id, payer_id)
    references public.workspace_members (workspace_id, user_id)
    on delete restrict,
  constraint expenses_creator_membership_fk
    foreign key (workspace_id, created_by)
    references public.workspace_members (workspace_id, user_id)
    on delete restrict
);

create index expenses_workspace_date_idx
  on public.expenses (workspace_id, expense_date desc, id);
create index expenses_payer_idx on public.expenses (payer_id);
create index expenses_creator_idx on public.expenses (created_by);

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function private.set_updated_at();

create table public.expense_splits (
  expense_id uuid not null references public.expenses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  share_amount numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  primary key (expense_id, user_id),
  constraint expense_splits_share_positive check (share_amount > 0)
);

create index expense_splits_expense_idx on public.expense_splits (expense_id);
create index expense_splits_user_idx on public.expense_splits (user_id);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  from_user_id uuid not null,
  to_user_id uuid not null,
  amount numeric(12, 2) not null,
  settled_at timestamptz not null default now(),
  notes text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settlements_amount_positive check (amount > 0),
  constraint settlements_different_members check (from_user_id <> to_user_id),
  constraint settlements_notes_length
    check (notes is null or char_length(notes) <= 2000),
  constraint settlements_from_membership_fk
    foreign key (workspace_id, from_user_id)
    references public.workspace_members (workspace_id, user_id)
    on delete restrict,
  constraint settlements_to_membership_fk
    foreign key (workspace_id, to_user_id)
    references public.workspace_members (workspace_id, user_id)
    on delete restrict,
  constraint settlements_creator_membership_fk
    foreign key (workspace_id, created_by)
    references public.workspace_members (workspace_id, user_id)
    on delete restrict
);

create index settlements_workspace_settled_at_idx
  on public.settlements (workspace_id, settled_at desc, id);
create index settlements_from_user_idx on public.settlements (from_user_id);
create index settlements_to_user_idx on public.settlements (to_user_id);

create trigger settlements_set_updated_at
before update on public.settlements
for each row execute function private.set_updated_at();

create or replace function private.protect_settlement_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.workspace_id <> old.workspace_id or new.created_by <> old.created_by then
    raise exception using errcode = 'P0001', message = 'SETTLEMENT_IDENTITY_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger settlements_protect_identity
before update on public.settlements
for each row execute function private.protect_settlement_identity();

create or replace function private.can_manage_settlement(
  p_workspace_id uuid,
  p_from_user_id uuid,
  p_to_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_workspace_member(p_workspace_id)
    and private.is_workspace_member(p_workspace_id, p_from_user_id)
    and private.is_workspace_member(p_workspace_id, p_to_user_id)
    and (
      auth.uid() = p_from_user_id
      or auth.uid() = p_to_user_id
      or private.is_workspace_admin(p_workspace_id)
    );
$$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid, uuid) to authenticated;
grant execute on function private.is_workspace_admin(uuid, uuid) to authenticated;
grant execute on function private.can_view_profile(uuid) to authenticated;
grant execute on function private.can_manage_settlement(uuid, uuid, uuid) to authenticated;

