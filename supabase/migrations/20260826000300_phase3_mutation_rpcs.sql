-- Flatdues Phase 3: authorized atomic workspace, invitation, and expense RPCs.

create or replace function public.create_workspace(
  p_name text,
  p_currency_code text default 'INR'
)
returns public.workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  normalized_name text := btrim(p_name);
  normalized_currency text := upper(btrim(coalesce(p_currency_code, 'INR')));
  created_workspace public.workspaces;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if normalized_name is null or char_length(normalized_name) not between 1 and 100 then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_NAME_INVALID';
  end if;

  if normalized_currency !~ '^[A-Z]{3}$' then
    raise exception using errcode = 'P0001', message = 'CURRENCY_CODE_INVALID';
  end if;

  insert into public.profiles (id, display_name)
  select
    auth_user.id,
    left(
      coalesce(
        nullif(btrim(auth_user.raw_user_meta_data ->> 'display_name'), ''),
        nullif(btrim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
        nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''),
        'Flatmate'
      ),
      100
    )
  from auth.users as auth_user
  where auth_user.id = caller_id
  on conflict (id) do nothing;

  insert into public.workspaces (name, currency_code, created_by)
  values (normalized_name, normalized_currency, caller_id)
  returning * into created_workspace;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (created_workspace.id, caller_id, 'admin', 'active');

  return created_workspace;
end;
$$;

revoke all on function public.create_workspace(text, text) from public, anon;
grant execute on function public.create_workspace(text, text) to authenticated;

create or replace function public.generate_workspace_invite(
  p_workspace_id uuid,
  p_expires_at timestamptz default null,
  p_max_uses integer default null
)
returns public.workspace_invites
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  created_invite public.workspace_invites;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if not private.is_workspace_admin(p_workspace_id, caller_id) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_ADMIN_REQUIRED';
  end if;

  if p_expires_at is not null and p_expires_at <= statement_timestamp() then
    raise exception using errcode = 'P0001', message = 'INVITE_EXPIRY_INVALID';
  end if;

  if p_max_uses is not null and p_max_uses <= 0 then
    raise exception using errcode = 'P0001', message = 'INVITE_MAX_USES_INVALID';
  end if;

  insert into public.workspace_invites (
    workspace_id,
    token,
    created_by,
    expires_at,
    max_uses
  )
  values (
    p_workspace_id,
    encode(extensions.gen_random_bytes(32), 'hex'),
    caller_id,
    p_expires_at,
    p_max_uses
  )
  returning * into created_invite;

  return created_invite;
end;
$$;

revoke all on function public.generate_workspace_invite(uuid, timestamptz, integer)
  from public, anon;
grant execute on function public.generate_workspace_invite(uuid, timestamptz, integer)
  to authenticated;

create or replace function public.join_workspace_by_invite(p_token text)
returns public.workspace_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  normalized_token text := lower(btrim(p_token));
  locked_invite public.workspace_invites;
  created_membership public.workspace_members;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if normalized_token is null or normalized_token !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = 'P0001', message = 'INVITE_INVALID';
  end if;

  select invite.*
  into locked_invite
  from public.workspace_invites as invite
  where invite.token = normalized_token
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'INVITE_INVALID';
  end if;

  if not exists (
    select 1 from public.workspaces where id = locked_invite.workspace_id
  ) then
    raise exception using errcode = 'P0001', message = 'INVITE_WORKSPACE_MISSING';
  end if;

  if locked_invite.expires_at is not null
    and locked_invite.expires_at <= statement_timestamp()
  then
    raise exception using errcode = 'P0001', message = 'INVITE_EXPIRED';
  end if;

  if locked_invite.max_uses is not null
    and locked_invite.usage_count >= locked_invite.max_uses
  then
    raise exception using errcode = 'P0001', message = 'INVITE_EXHAUSTED';
  end if;

  if exists (
    select 1
    from public.workspace_members
    where workspace_id = locked_invite.workspace_id
      and user_id = caller_id
  ) then
    raise exception using errcode = 'P0001', message = 'ALREADY_WORKSPACE_MEMBER';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (locked_invite.workspace_id, caller_id, 'member', 'active')
  returning * into created_membership;

  update public.workspace_invites
  set usage_count = usage_count + 1
  where id = locked_invite.id;

  return created_membership;
end;
$$;

revoke all on function public.join_workspace_by_invite(text) from public, anon;
grant execute on function public.join_workspace_by_invite(text) to authenticated;

create or replace function private.validate_expense_input(
  p_workspace_id uuid,
  p_title text,
  p_amount numeric,
  p_payer_id uuid,
  p_participant_ids uuid[],
  p_existing_expense_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  participant_count integer;
  distinct_participant_count integer;
  amount_in_minor_units bigint;
begin
  if p_title is null or char_length(btrim(p_title)) not between 1 and 160 then
    raise exception using errcode = 'P0001', message = 'EXPENSE_TITLE_INVALID';
  end if;

  if p_amount is null
    or p_amount <= 0
    or p_amount > 9999999999.99
    or p_amount <> trunc(p_amount, 2)
  then
    raise exception using errcode = 'P0001', message = 'EXPENSE_AMOUNT_INVALID';
  end if;

  if p_payer_id is null then
    raise exception using errcode = 'P0001', message = 'EXPENSE_PAYER_INVALID';
  end if;

  participant_count := cardinality(p_participant_ids);
  if p_participant_ids is null
    or participant_count = 0
    or array_position(p_participant_ids, null) is not null
  then
    raise exception using errcode = 'P0001', message = 'EXPENSE_PARTICIPANTS_REQUIRED';
  end if;

  select count(distinct participant_id)
  into distinct_participant_count
  from unnest(p_participant_ids) as participant(participant_id);

  if distinct_participant_count <> participant_count then
    raise exception using errcode = 'P0001', message = 'EXPENSE_PARTICIPANTS_DUPLICATE';
  end if;

  amount_in_minor_units := (p_amount * 100)::bigint;
  if amount_in_minor_units < participant_count then
    raise exception using errcode = 'P0001', message = 'EXPENSE_AMOUNT_TOO_SMALL_FOR_SPLITS';
  end if;

  if not private.is_workspace_member(p_workspace_id, p_payer_id)
    and not exists (
      select 1
      from public.expenses as existing_expense
      where existing_expense.id = p_existing_expense_id
        and existing_expense.workspace_id = p_workspace_id
        and existing_expense.payer_id = p_payer_id
    )
  then
    raise exception using errcode = 'P0001', message = 'EXPENSE_PAYER_NOT_ACTIVE';
  end if;

  if exists (
    select 1
    from unnest(p_participant_ids) as participant(participant_id)
    where not private.is_workspace_member(p_workspace_id, participant.participant_id)
      and not exists (
        select 1
        from public.expense_splits as existing_split
        where existing_split.expense_id = p_existing_expense_id
          and existing_split.user_id = participant.participant_id
      )
  ) then
    raise exception using errcode = 'P0001', message = 'EXPENSE_PARTICIPANT_NOT_ACTIVE';
  end if;
end;
$$;

create or replace function private.insert_equal_expense_splits(
  p_expense_id uuid,
  p_amount numeric,
  p_participant_ids uuid[]
)
returns void
language sql
security definer
set search_path = ''
as $$
  with split_input as (
    select
      participant_id,
      row_number() over (order by participant_id::text) as split_position,
      count(*) over () as split_count,
      (p_amount * 100)::bigint as total_minor_units
    from unnest(p_participant_ids) as participant(participant_id)
  )
  insert into public.expense_splits (expense_id, user_id, share_amount)
  select
    p_expense_id,
    participant_id,
    (
      (
        total_minor_units / split_count
        + case
            when split_position <= total_minor_units % split_count then 1
            else 0
          end
      )::numeric / 100
    )::numeric(12, 2)
  from split_input;
$$;

create or replace function public.create_expense(
  p_workspace_id uuid,
  p_title text,
  p_amount numeric,
  p_payer_id uuid,
  p_expense_date date,
  p_category text,
  p_notes text,
  p_participant_ids uuid[]
)
returns public.expenses
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  created_expense public.expenses;
  normalized_category text := btrim(coalesce(p_category, 'other'));
  normalized_notes text := nullif(btrim(p_notes), '');
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if not private.is_workspace_member(p_workspace_id, caller_id) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_REQUIRED';
  end if;

  if p_expense_date is null then
    raise exception using errcode = 'P0001', message = 'EXPENSE_DATE_INVALID';
  end if;

  if char_length(normalized_category) not between 1 and 50 then
    raise exception using errcode = 'P0001', message = 'EXPENSE_CATEGORY_INVALID';
  end if;

  if normalized_notes is not null and char_length(normalized_notes) > 2000 then
    raise exception using errcode = 'P0001', message = 'EXPENSE_NOTES_INVALID';
  end if;

  perform private.validate_expense_input(
    p_workspace_id,
    p_title,
    p_amount,
    p_payer_id,
    p_participant_ids
  );

  insert into public.expenses (
    workspace_id,
    title,
    amount,
    payer_id,
    expense_date,
    category,
    notes,
    created_by
  )
  values (
    p_workspace_id,
    btrim(p_title),
    p_amount,
    p_payer_id,
    p_expense_date,
    normalized_category,
    normalized_notes,
    caller_id
  )
  returning * into created_expense;

  perform private.insert_equal_expense_splits(
    created_expense.id,
    created_expense.amount,
    p_participant_ids
  );

  return created_expense;
end;
$$;

revoke all on function public.create_expense(uuid, text, numeric, uuid, date, text, text, uuid[])
  from public, anon;
grant execute on function public.create_expense(uuid, text, numeric, uuid, date, text, text, uuid[])
  to authenticated;

create or replace function public.update_expense(
  p_expense_id uuid,
  p_title text,
  p_amount numeric,
  p_payer_id uuid,
  p_expense_date date,
  p_category text,
  p_notes text,
  p_participant_ids uuid[]
)
returns public.expenses
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  existing_expense public.expenses;
  updated_expense public.expenses;
  normalized_category text := btrim(coalesce(p_category, 'other'));
  normalized_notes text := nullif(btrim(p_notes), '');
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  select expense.*
  into existing_expense
  from public.expenses as expense
  where expense.id = p_expense_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'EXPENSE_NOT_FOUND';
  end if;

  if not private.is_workspace_member(existing_expense.workspace_id, caller_id) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_REQUIRED';
  end if;

  if existing_expense.created_by <> caller_id
    and not private.is_workspace_admin(existing_expense.workspace_id, caller_id)
  then
    raise exception using errcode = 'P0001', message = 'EXPENSE_EDIT_FORBIDDEN';
  end if;

  if p_expense_date is null then
    raise exception using errcode = 'P0001', message = 'EXPENSE_DATE_INVALID';
  end if;

  if char_length(normalized_category) not between 1 and 50 then
    raise exception using errcode = 'P0001', message = 'EXPENSE_CATEGORY_INVALID';
  end if;

  if normalized_notes is not null and char_length(normalized_notes) > 2000 then
    raise exception using errcode = 'P0001', message = 'EXPENSE_NOTES_INVALID';
  end if;

  perform private.validate_expense_input(
    existing_expense.workspace_id,
    p_title,
    p_amount,
    p_payer_id,
    p_participant_ids,
    p_expense_id
  );

  update public.expenses
  set
    title = btrim(p_title),
    amount = p_amount,
    payer_id = p_payer_id,
    expense_date = p_expense_date,
    category = normalized_category,
    notes = normalized_notes
  where id = p_expense_id
  returning * into updated_expense;

  delete from public.expense_splits where expense_id = p_expense_id;
  perform private.insert_equal_expense_splits(
    updated_expense.id,
    updated_expense.amount,
    p_participant_ids
  );

  return updated_expense;
end;
$$;

revoke all on function public.update_expense(uuid, text, numeric, uuid, date, text, text, uuid[])
  from public, anon;
grant execute on function public.update_expense(uuid, text, numeric, uuid, date, text, text, uuid[])
  to authenticated;

create or replace function public.delete_expense(p_expense_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  existing_expense public.expenses;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  select expense.*
  into existing_expense
  from public.expenses as expense
  where expense.id = p_expense_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'EXPENSE_NOT_FOUND';
  end if;

  if not private.is_workspace_member(existing_expense.workspace_id, caller_id) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_REQUIRED';
  end if;

  if existing_expense.created_by <> caller_id
    and not private.is_workspace_admin(existing_expense.workspace_id, caller_id)
  then
    raise exception using errcode = 'P0001', message = 'EXPENSE_DELETE_FORBIDDEN';
  end if;

  delete from public.expenses where id = p_expense_id;
  return p_expense_id;
end;
$$;

revoke all on function public.delete_expense(uuid) from public, anon;
grant execute on function public.delete_expense(uuid) to authenticated;

