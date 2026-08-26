-- Flatdues Phase 3: authorized, set-based balance and dashboard queries.

create or replace function public.get_workspace_balances(p_workspace_id uuid)
returns table (
  user_id uuid,
  display_name text,
  paid_total numeric,
  share_total numeric,
  settlements_sent numeric,
  settlements_received numeric,
  balance numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if not private.is_workspace_member(p_workspace_id, auth.uid()) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_REQUIRED';
  end if;

  return query
  with paid as (
    select expense.payer_id as member_id, sum(expense.amount) as total
    from public.expenses as expense
    where expense.workspace_id = p_workspace_id
    group by expense.payer_id
  ),
  shares as (
    select split.user_id as member_id, sum(split.share_amount) as total
    from public.expense_splits as split
    join public.expenses as expense on expense.id = split.expense_id
    where expense.workspace_id = p_workspace_id
    group by split.user_id
  ),
  sent as (
    select settlement.from_user_id as member_id, sum(settlement.amount) as total
    from public.settlements as settlement
    where settlement.workspace_id = p_workspace_id
    group by settlement.from_user_id
  ),
  received as (
    select settlement.to_user_id as member_id, sum(settlement.amount) as total
    from public.settlements as settlement
    where settlement.workspace_id = p_workspace_id
    group by settlement.to_user_id
  ),
  positions as (
    select
      member.user_id,
      member.status,
      profile.display_name,
      coalesce(paid.total, 0::numeric) as paid_total,
      coalesce(shares.total, 0::numeric) as share_total,
      coalesce(sent.total, 0::numeric) as settlements_sent,
      coalesce(received.total, 0::numeric) as settlements_received
    from public.workspace_members as member
    join public.profiles as profile on profile.id = member.user_id
    left join paid on paid.member_id = member.user_id
    left join shares on shares.member_id = member.user_id
    left join sent on sent.member_id = member.user_id
    left join received on received.member_id = member.user_id
    where member.workspace_id = p_workspace_id
  )
  select
    positions.user_id,
    positions.display_name,
    positions.paid_total,
    positions.share_total,
    positions.settlements_sent,
    positions.settlements_received,
    (
      positions.paid_total
      - positions.share_total
      + positions.settlements_sent
      - positions.settlements_received
    ) as balance
  from positions
  where positions.status = 'active'
    or positions.paid_total <> 0
    or positions.share_total <> 0
    or positions.settlements_sent <> 0
    or positions.settlements_received <> 0
  order by
    case when positions.user_id = auth.uid() then 0 else 1 end,
    positions.display_name,
    positions.user_id;
end;
$$;

comment on function public.get_workspace_balances(uuid) is
  'Returns paid - share + settlements sent - settlements received. The settlement signs move a payer and receiver toward zero while preserving a zero-sum workspace.';

revoke all on function public.get_workspace_balances(uuid) from public, anon;
grant execute on function public.get_workspace_balances(uuid) to authenticated;

create or replace function public.get_monthly_spending(
  p_workspace_id uuid,
  p_month_start date
)
returns numeric
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  spending_total numeric;
begin
  if auth.uid() is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if not private.is_workspace_member(p_workspace_id, auth.uid()) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_REQUIRED';
  end if;

  if p_month_start is null
    or p_month_start <> date_trunc('month', p_month_start)::date
  then
    raise exception using errcode = 'P0001', message = 'MONTH_START_INVALID';
  end if;

  select coalesce(sum(expense.amount), 0::numeric)
  into spending_total
  from public.expenses as expense
  where expense.workspace_id = p_workspace_id
    and expense.expense_date >= p_month_start
    and expense.expense_date < (p_month_start + interval '1 month')::date;

  return spending_total;
end;
$$;

revoke all on function public.get_monthly_spending(uuid, date) from public, anon;
grant execute on function public.get_monthly_spending(uuid, date) to authenticated;

create or replace function public.get_daily_spending(
  p_workspace_id uuid,
  p_local_date date
)
returns numeric
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  spending_total numeric;
begin
  if auth.uid() is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if not private.is_workspace_member(p_workspace_id, auth.uid()) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_REQUIRED';
  end if;

  if p_local_date is null then
    raise exception using errcode = 'P0001', message = 'LOCAL_DATE_INVALID';
  end if;

  select coalesce(sum(expense.amount), 0::numeric)
  into spending_total
  from public.expenses as expense
  where expense.workspace_id = p_workspace_id
    and expense.expense_date = p_local_date;

  return spending_total;
end;
$$;

revoke all on function public.get_daily_spending(uuid, date) from public, anon;
grant execute on function public.get_daily_spending(uuid, date) to authenticated;

create or replace function public.get_recent_activity(
  p_workspace_id uuid,
  p_limit integer default 20
)
returns table (
  activity_type text,
  activity_id uuid,
  occurred_at timestamptz,
  activity_date date,
  title text,
  amount numeric,
  category text,
  actor_id uuid,
  actor_display_name text,
  from_user_id uuid,
  from_display_name text,
  to_user_id uuid,
  to_display_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if not private.is_workspace_member(p_workspace_id, auth.uid()) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_REQUIRED';
  end if;

  if p_limit is null or p_limit not between 1 and 100 then
    raise exception using errcode = 'P0001', message = 'ACTIVITY_LIMIT_INVALID';
  end if;

  return query
  select combined.*
  from (
    select
      'expense'::text as activity_type,
      expense.id as activity_id,
      expense.created_at as occurred_at,
      expense.expense_date as activity_date,
      expense.title,
      expense.amount,
      expense.category,
      expense.created_by as actor_id,
      creator.display_name as actor_display_name,
      null::uuid as from_user_id,
      null::text as from_display_name,
      null::uuid as to_user_id,
      null::text as to_display_name
    from public.expenses as expense
    join public.profiles as creator on creator.id = expense.created_by
    where expense.workspace_id = p_workspace_id

    union all

    select
      'settlement'::text as activity_type,
      settlement.id as activity_id,
      settlement.settled_at as occurred_at,
      (settlement.settled_at at time zone 'UTC')::date as activity_date,
      'Settlement'::text as title,
      settlement.amount,
      null::text as category,
      settlement.created_by as actor_id,
      creator.display_name as actor_display_name,
      settlement.from_user_id,
      sender.display_name as from_display_name,
      settlement.to_user_id,
      receiver.display_name as to_display_name
    from public.settlements as settlement
    join public.profiles as creator on creator.id = settlement.created_by
    join public.profiles as sender on sender.id = settlement.from_user_id
    join public.profiles as receiver on receiver.id = settlement.to_user_id
    where settlement.workspace_id = p_workspace_id
  ) as combined
  order by combined.occurred_at desc, combined.activity_id
  limit p_limit;
end;
$$;

revoke all on function public.get_recent_activity(uuid, integer) from public, anon;
grant execute on function public.get_recent_activity(uuid, integer) to authenticated;

