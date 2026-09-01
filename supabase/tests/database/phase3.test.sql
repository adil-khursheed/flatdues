begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(56);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'workspaces', 'workspaces table exists');
select has_table('public', 'workspace_members', 'workspace_members table exists');
select has_table('public', 'workspace_invites', 'workspace_invites table exists');
select has_table('public', 'monthly_budgets', 'monthly_budgets table exists');
select has_table('public', 'expenses', 'expenses table exists');
select has_table('public', 'expense_splits', 'expense_splits table exists');
select has_table('public', 'settlements', 'settlements table exists');

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_class
    where oid in (
      'public.profiles'::regclass,
      'public.workspaces'::regclass,
      'public.workspace_members'::regclass,
      'public.workspace_invites'::regclass,
      'public.monthly_budgets'::regclass,
      'public.expenses'::regclass,
      'public.expense_splits'::regclass,
      'public.settlements'::regclass
    )
      and relrowsecurity
  ),
  8,
  'every user-facing table has RLS enabled'
);

create temporary table test_context (
  key text primary key,
  id uuid,
  token text
) on commit drop;
grant select, insert, update, delete on table test_context to authenticated;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'adil@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{"display_name":"Adil"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'aman@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{"display_name":"Aman"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'outsider@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{"display_name":"Outsider"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ali@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{"display_name":"Ali"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'extra@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{"display_name":"Extra"}'::jsonb,
    now(),
    now()
  );

select is(
  (select count(*)::integer from public.profiles),
  5,
  'the auth trigger creates one profile per new user'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

insert into test_context (key, id)
select 'workspace_a', id
from public.create_workspace('  Flat 302  ', 'inr');

select is(
  (select name from public.workspaces where id = (select id from test_context where key = 'workspace_a')),
  'Flat 302',
  'workspace creation normalizes the name'
);

select is(
  (select currency_code from public.workspaces where id = (select id from test_context where key = 'workspace_a')),
  'INR',
  'workspace creation stores the normalized INR currency code'
);

select is(
  (
    select role
    from public.workspace_members
    where workspace_id = (select id from test_context where key = 'workspace_a')
      and user_id = '00000000-0000-4000-8000-000000000001'
  ),
  'admin',
  'workspace creation atomically makes the creator an admin'
);

select is(
  (
    select status
    from public.workspace_members
    where workspace_id = (select id from test_context where key = 'workspace_a')
      and user_id = '00000000-0000-4000-8000-000000000001'
  ),
  'active',
  'workspace creation atomically activates the creator membership'
);

insert into test_context (key, id, token)
select 'invite_b', id, token
from public.generate_workspace_invite(
  (select id from test_context where key = 'workspace_a'),
  now() + interval '1 day',
  null
);

select matches(
  (select token from test_context where key = 'invite_b'),
  '^[0-9a-f]{64}$',
  'invite generation produces a 256-bit hexadecimal token'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from test_context where key = 'invite_b')
  ),
  'an authenticated user can join with a valid invite'
);

reset role;
select is(
  (
    select usage_count
    from public.workspace_invites
    where id = (select id from test_context where key = 'invite_b')
  ),
  1,
  'joining increments invite usage exactly once'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.workspace_invites),
  0,
  'non-admin members cannot list raw invitations'
);

select throws_ok(
  $$
    insert into public.workspace_members (workspace_id, user_id)
    values (
      (select id from test_context where key = 'workspace_a'),
      '00000000-0000-4000-8000-000000000005'
    )
  $$,
  '42501',
  null,
  'clients cannot insert arbitrary workspace memberships'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    update public.workspace_members
    set role = 'member'
    where workspace_id = (select id from test_context where key = 'workspace_a')
      and user_id = '00000000-0000-4000-8000-000000000001'
  $$,
  'P0001',
  'LAST_ACTIVE_ADMIN',
  'the last active workspace admin cannot be demoted'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;

insert into test_context (key, id)
select 'workspace_b', id
from public.create_workspace('Other flat', 'INR');

select is(
  (
    select count(*)::integer
    from public.workspaces
    where id = (select id from test_context where key = 'workspace_a')
  ),
  0,
  'RLS hides another workspace'
);

select throws_ok(
  format(
    'select * from public.get_workspace_balances(%L::uuid)',
    (select id from test_context where key = 'workspace_a')
  ),
  'P0001',
  'WORKSPACE_MEMBER_REQUIRED',
  'balance RPC rejects an unrelated workspace member'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

insert into test_context (key, id, token)
select 'invite_single_use', id, token
from public.generate_workspace_invite(
  (select id from test_context where key = 'workspace_a'),
  null,
  1
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from test_context where key = 'invite_single_use')
  ),
  'the first use of a single-use invitation succeeds'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000005","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from test_context where key = 'invite_single_use')
  ),
  'P0001',
  'INVITE_EXHAUSTED',
  'a locked single-use invitation cannot be overused'
);

reset role;
select is(
  (
    select usage_count
    from public.workspace_invites
    where id = (select id from test_context where key = 'invite_single_use')
  ),
  1,
  'failed invitation reuse never increments usage past its limit'
);

select ok(
  pg_get_functiondef('public.join_workspace_by_invite(text)'::regprocedure)
    ~* 'for[[:space:]]+update',
  'invite joining locks the invite row to serialize concurrent use'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.profiles),
  3,
  'profile reads include shared members but exclude unrelated users'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

insert into test_context (key, id)
select 'expense', id
from public.create_expense(
  (select id from test_context where key = 'workspace_a'),
  'Groceries',
  1000.00,
  '00000000-0000-4000-8000-000000000001',
  date '2026-08-26',
  'groceries',
  'Shared food',
  array[
    '00000000-0000-4000-8000-000000000001'::uuid,
    '00000000-0000-4000-8000-000000000002'::uuid,
    '00000000-0000-4000-8000-000000000004'::uuid
  ]
);

select is(
  (
    select count(*)::integer
    from public.expense_splits
    where expense_id = (select id from test_context where key = 'expense')
  ),
  3,
  'atomic expense creation inserts one split per participant'
);

select is(
  (
    select sum(share_amount)
    from public.expense_splits
    where expense_id = (select id from test_context where key = 'expense')
  ),
  1000.00::numeric,
  'non-even split rows total the expense exactly'
);

select is(
  (
    select share_amount
    from public.expense_splits
    where expense_id = (select id from test_context where key = 'expense')
      and user_id = '00000000-0000-4000-8000-000000000001'
  ),
  333.34::numeric,
  'the deterministic UUID ordering receives the rounding remainder'
);

select throws_ok(
  format(
    $sql$
      select public.create_expense(
        %L::uuid,
        'Duplicate participants',
        10.00,
        '00000000-0000-4000-8000-000000000001'::uuid,
        date '2026-08-26',
        'other',
        null,
        array[
          '00000000-0000-4000-8000-000000000001'::uuid,
          '00000000-0000-4000-8000-000000000001'::uuid
        ]
      )
    $sql$,
    (select id from test_context where key = 'workspace_a')
  ),
  'P0001',
  'EXPENSE_PARTICIPANTS_DUPLICATE',
  'duplicate participants are rejected'
);

select throws_ok(
  format(
    $sql$
      select public.create_expense(
        %L::uuid,
        'Invalid amount',
        -1.00,
        '00000000-0000-4000-8000-000000000001'::uuid,
        date '2026-08-26',
        'other',
        null,
        array['00000000-0000-4000-8000-000000000001'::uuid]
      )
    $sql$,
    (select id from test_context where key = 'workspace_a')
  ),
  'P0001',
  'EXPENSE_AMOUNT_INVALID',
  'non-positive expenses are rejected'
);

select is(
  (select count(*)::integer from public.expenses),
  1,
  'failed expense RPCs leave no partial expense rows'
);

select throws_ok(
  $$
    insert into public.expenses (
      workspace_id,
      title,
      amount,
      payer_id,
      expense_date,
      created_by
    )
    values (
      (select id from test_context where key = 'workspace_a'),
      'Direct write',
      10,
      '00000000-0000-4000-8000-000000000001',
      date '2026-08-26',
      '00000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  null,
  'direct client expense inserts are denied'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  format(
    $sql$
      select public.update_expense(
        %L::uuid,
        'Hijacked',
        900.00,
        '00000000-0000-4000-8000-000000000002'::uuid,
        date '2026-08-26',
        'other',
        null,
        array['00000000-0000-4000-8000-000000000002'::uuid]
      )
    $sql$,
    (select id from test_context where key = 'expense')
  ),
  'P0001',
  'EXPENSE_EDIT_FORBIDDEN',
  'a member cannot edit another member''s expense'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  format(
    $sql$
      select public.update_expense(
        %L::uuid,
        'Groceries updated',
        600.00,
        '00000000-0000-4000-8000-000000000001'::uuid,
        date '2026-08-26',
        'groceries',
        null,
        array[
          '00000000-0000-4000-8000-000000000001'::uuid,
          '00000000-0000-4000-8000-000000000002'::uuid,
          '00000000-0000-4000-8000-000000000004'::uuid
        ]
      )
    $sql$,
    (select id from test_context where key = 'expense')
  ),
  'the creator can atomically replace expense data and splits'
);

select is(
  (
    select sum(share_amount)
    from public.expense_splits
    where expense_id = (select id from test_context where key = 'expense')
  ),
  600.00::numeric,
  'edited expense splits still total exactly'
);

select is(
  (
    select balance
    from public.get_workspace_balances(
      (select id from test_context where key = 'workspace_a')
    )
    where user_id = '00000000-0000-4000-8000-000000000001'
  ),
  400.00::numeric,
  'the payer balance is paid minus share before settlements'
);

select is(
  (
    select balance
    from public.get_workspace_balances(
      (select id from test_context where key = 'workspace_a')
    )
    where user_id = '00000000-0000-4000-8000-000000000002'
  ),
  (-200.00)::numeric,
  'a participant owes their expense share'
);

select is(
  (
    select sum(balance)
    from public.get_workspace_balances(
      (select id from test_context where key = 'workspace_a')
    )
  ),
  0.00::numeric,
  'expense balances are exactly zero-sum'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

insert into public.settlements (
  workspace_id,
  from_user_id,
  to_user_id,
  amount,
  settled_at,
  notes,
  created_by
)
values (
  (select id from test_context where key = 'workspace_a'),
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  200.00,
  '2026-08-26 12:00:00+00',
  'Paid back',
  '00000000-0000-4000-8000-000000000002'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (
    select balance
    from public.get_workspace_balances(
      (select id from test_context where key = 'workspace_a')
    )
    where user_id = '00000000-0000-4000-8000-000000000001'
  ),
  200.00::numeric,
  'receiving a settlement reduces the creditor balance'
);

select is(
  (
    select balance
    from public.get_workspace_balances(
      (select id from test_context where key = 'workspace_a')
    )
    where user_id = '00000000-0000-4000-8000-000000000002'
  ),
  0.00::numeric,
  'sending a settlement moves the debtor to zero'
);

select is(
  (
    select sum(balance)
    from public.get_workspace_balances(
      (select id from test_context where key = 'workspace_a')
    )
  ),
  0.00::numeric,
  'settlement-adjusted balances remain exactly zero-sum'
);

select is(
  public.get_monthly_spending(
    (select id from test_context where key = 'workspace_a'),
    date '2026-08-01'
  ),
  600.00::numeric,
  'monthly spending derives only from expenses'
);

select is(
  public.get_daily_spending(
    (select id from test_context where key = 'workspace_a'),
    date '2026-08-26'
  ),
  600.00::numeric,
  'daily spending uses the supplied local calendar date'
);

select is(
  (
    select count(distinct activity_type)::integer
    from public.get_recent_activity(
      (select id from test_context where key = 'workspace_a'),
      20
    )
  ),
  2,
  'recent activity combines expenses and settlements in one query'
);

update public.workspace_members
set status = 'inactive'
where workspace_id = (select id from test_context where key = 'workspace_a')
  and user_id = '00000000-0000-4000-8000-000000000004';

select is(
  (
    select balance
    from public.get_workspace_balances(
      (select id from test_context where key = 'workspace_a')
    )
    where user_id = '00000000-0000-4000-8000-000000000004'
  ),
  (-200.00)::numeric,
  'inactive members with historical positions remain in balances'
);

select throws_ok(
  format(
    $sql$
      select public.create_expense(
        %L::uuid,
        'New inactive share',
        10.00,
        '00000000-0000-4000-8000-000000000001'::uuid,
        date '2026-08-26',
        'other',
        null,
        array[
          '00000000-0000-4000-8000-000000000001'::uuid,
          '00000000-0000-4000-8000-000000000004'::uuid
        ]
      )
    $sql$,
    (select id from test_context where key = 'workspace_a')
  ),
  'P0001',
  'EXPENSE_PARTICIPANT_NOT_ACTIVE',
  'new expenses cannot add inactive participants'
);

select lives_ok(
  format(
    $sql$
      select public.update_expense(
        %L::uuid,
        'Historical edit',
        600.00,
        '00000000-0000-4000-8000-000000000001'::uuid,
        date '2026-08-26',
        'groceries',
        null,
        array[
          '00000000-0000-4000-8000-000000000001'::uuid,
          '00000000-0000-4000-8000-000000000002'::uuid,
          '00000000-0000-4000-8000-000000000004'::uuid
        ]
      )
    $sql$,
    (select id from test_context where key = 'expense')
  ),
  'an edit may preserve an existing inactive historical participant'
);

select is(
  (
    select count(*)::integer
    from public.expense_splits
    where expense_id = (select id from test_context where key = 'expense')
      and user_id = '00000000-0000-4000-8000-000000000004'
  ),
  1,
  'membership deactivation does not erase historical splits'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.expenses),
  0,
  'RLS hides expenses from unrelated workspaces'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    insert into public.monthly_budgets (workspace_id, month_start, amount, created_by)
    values (
      (select id from test_context where key = 'workspace_a'),
      date '2026-08-02',
      20000.00,
      '00000000-0000-4000-8000-000000000001'
    )
  $$,
  '23514',
  null,
  'budget month_start must be the first calendar day'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    insert into public.monthly_budgets (workspace_id, month_start, amount, created_by)
    values (
      (select id from test_context where key = 'workspace_a'),
      date '2026-08-01',
      20000.00,
      '00000000-0000-4000-8000-000000000002'
    )
  $$,
  '42501',
  null,
  'regular members cannot create budgets'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    insert into public.settlements (
      workspace_id,
      from_user_id,
      to_user_id,
      amount,
      created_by
    )
    values (
      (select id from test_context where key = 'workspace_a'),
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000001',
      10.00,
      '00000000-0000-4000-8000-000000000001'
    )
  $$,
  '23514',
  null,
  'settlement payer and receiver must differ'
);

select throws_ok(
  format(
    'select public.generate_workspace_invite(%L::uuid, now() - interval ''1 second'', null)',
    (select id from test_context where key = 'workspace_a')
  ),
  'P0001',
  'INVITE_EXPIRY_INVALID',
  'expired invitations cannot be generated'
);

reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

select throws_ok(
  $$select public.create_workspace('Anonymous workspace', 'INR')$$,
  '42501',
  null,
  'anonymous callers cannot execute workspace creation'
);

reset role;
select * from finish();
rollback;
