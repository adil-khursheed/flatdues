begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(38);

select has_column(
  'public',
  'workspace_invites',
  'revoked_at',
  'workspace invites preserve a revocation timestamp'
);
select has_function(
  'public',
  'create_workspace_invite',
  array['uuid', 'integer', 'integer'],
  'bounded invitation creation RPC exists'
);
select has_function(
  'public',
  'manage_workspace_member',
  array['uuid', 'uuid', 'text', 'text'],
  'member management RPC exists'
);
select has_function(
  'public',
  'leave_workspace',
  array['uuid'],
  'self-leave RPC exists'
);
select has_function(
  'public',
  'revoke_workspace_invite',
  array['uuid', 'uuid'],
  'invitation revocation RPC exists'
);

create temporary table phase6_context (
  key text primary key,
  id uuid,
  token text,
  stamp timestamptz
) on commit drop;
grant select, insert, update, delete on table phase6_context to authenticated;

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
select
  ('10000000-0000-4000-8000-' || lpad(user_number::text, 12, '0'))::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  format('phase6-user-%s@example.test', user_number),
  '',
  now(),
  '{}'::jsonb,
  jsonb_build_object('display_name', format('Phase 6 User %s', user_number)),
  now(),
  now()
from generate_series(1, 5) as users(user_number);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

insert into phase6_context (key, id)
select 'workspace_a', id from public.create_workspace('Phase 6 Workspace');

insert into phase6_context (key, id, token, stamp)
select 'bounded_invite', id, token, expires_at
from public.create_workspace_invite(
  (select id from phase6_context where key = 'workspace_a'),
  4,
  7
);

select is(
  (
    select max_uses
    from public.workspace_invites
    where id = (select id from phase6_context where key = 'bounded_invite')
  ),
  4,
  'bounded invitations store the chosen capacity'
);
select ok(
  (select stamp from phase6_context where key = 'bounded_invite')
    between statement_timestamp() + interval '6 days 23 hours'
      and statement_timestamp() + interval '7 days 1 hour',
  'bounded invitation expiry is calculated from database time'
);
select throws_ok(
  format(
    'select public.create_workspace_invite(%L::uuid, 4, 31)',
    (select id from phase6_context where key = 'workspace_a')
  ),
  'P0001',
  'INVITE_DAYS_INVALID',
  'invitation validity rejects more than thirty days'
);
select throws_ok(
  format(
    'select public.create_workspace_invite(%L::uuid, 51, 7)',
    (select id from phase6_context where key = 'workspace_a')
  ),
  'P0001',
  'INVITE_MAX_USES_INVALID',
  'invitation capacity rejects more than fifty joins'
);

insert into phase6_context (key, id, token, stamp)
select 'compat_invite', id, token, expires_at
from public.generate_workspace_invite(
  (select id from phase6_context where key = 'workspace_a')
);

select is(
  (
    select max_uses
    from public.workspace_invites
    where id = (select id from phase6_context where key = 'compat_invite')
  ),
  5,
  'the compatibility RPC defaults to five joins'
);
select ok(
  (select stamp from phase6_context where key = 'compat_invite')
    between statement_timestamp() + interval '6 days 23 hours'
      and statement_timestamp() + interval '7 days 1 hour',
  'the compatibility RPC defaults to seven days'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from phase6_context where key = 'bounded_invite')
  ),
  'a member can join with a bounded active invitation'
);
select is(
  (select count(*)::integer from public.workspace_invites),
  0,
  'non-admin members cannot list invitation tokens'
);
select throws_ok(
  format(
    'select public.manage_workspace_member(%L::uuid, %L::uuid, %L, null)',
    (select id from phase6_context where key = 'workspace_a'),
    '10000000-0000-4000-8000-000000000001',
    'member'
  ),
  'P0001',
  'WORKSPACE_ADMIN_REQUIRED',
  'non-admin members cannot manage memberships'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  format(
    'update public.workspace_members set status = %L where workspace_id = %L::uuid and user_id = %L::uuid',
    'inactive',
    (select id from phase6_context where key = 'workspace_a'),
    '10000000-0000-4000-8000-000000000002'
  ),
  '42501',
  null,
  'direct membership updates are denied even to admins'
);
select is(
  (
    select role
    from public.manage_workspace_member(
      (select id from phase6_context where key = 'workspace_a'),
      '10000000-0000-4000-8000-000000000002',
      'admin',
      null
    )
  ),
  'admin',
  'admins can promote another active member'
);
select is(
  (
    select role
    from public.manage_workspace_member(
      (select id from phase6_context where key = 'workspace_a'),
      '10000000-0000-4000-8000-000000000002',
      'member',
      null
    )
  ),
  'member',
  'admins can demote another administrator'
);
select is(
  (
    select status
    from public.manage_workspace_member(
      (select id from phase6_context where key = 'workspace_a'),
      '10000000-0000-4000-8000-000000000002',
      null,
      'inactive'
    )
  ),
  'inactive',
  'admins can deactivate another member'
);
select ok(
  (
    select deactivated_at
    from public.workspace_members
    where workspace_id = (select id from phase6_context where key = 'workspace_a')
      and user_id = '10000000-0000-4000-8000-000000000002'
  ) is not null,
  'deactivation timestamps are populated by the database'
);
select is(
  (
    select status
    from public.manage_workspace_member(
      (select id from phase6_context where key = 'workspace_a'),
      '10000000-0000-4000-8000-000000000002',
      null,
      'active'
    )
  ),
  'active',
  'admins can reactivate another member'
);
select is(
  (
    select deactivated_at
    from public.workspace_members
    where workspace_id = (select id from phase6_context where key = 'workspace_a')
      and user_id = '10000000-0000-4000-8000-000000000002'
  ),
  null,
  'reactivation clears the database-managed deactivation timestamp'
);

update phase6_context
set stamp = (
  select revoked_at
  from public.revoke_workspace_invite(
    (select id from phase6_context where key = 'workspace_a'),
    (select id from phase6_context where key = 'compat_invite')
  )
)
where key = 'compat_invite';

select ok(
  (select stamp from phase6_context where key = 'compat_invite') is not null,
  'revocation records a timestamp without deleting the invitation'
);
select is(
  (
    select revoked_at
    from public.revoke_workspace_invite(
      (select id from phase6_context where key = 'workspace_a'),
      (select id from phase6_context where key = 'compat_invite')
    )
  ),
  (select stamp from phase6_context where key = 'compat_invite'),
  'repeated revocation is idempotent'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from phase6_context where key = 'compat_invite')
  ),
  'P0001',
  'INVITE_REVOKED',
  'revoked invitation codes cannot be used'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  format(
    'delete from public.workspace_invites where id = %L::uuid',
    (select id from phase6_context where key = 'compat_invite')
  ),
  '42501',
  null,
  'invitation rows cannot be hard-deleted by clients'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (
    select status
    from public.leave_workspace(
      (select id from phase6_context where key = 'workspace_a')
    )
  ),
  'inactive',
  'a regular member can leave by self-deactivating'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  format(
    'select public.leave_workspace(%L::uuid)',
    (select id from phase6_context where key = 'workspace_a')
  ),
  'P0001',
  'LAST_ACTIVE_ADMIN',
  'the last active admin cannot leave'
);
select is(
  (
    select role
    from public.manage_workspace_member(
      (select id from phase6_context where key = 'workspace_a'),
      '10000000-0000-4000-8000-000000000002',
      'admin',
      'active'
    )
  ),
  'admin',
  'a replacement administrator can be promoted and reactivated atomically'
);
select lives_ok(
  format(
    'select public.leave_workspace(%L::uuid)',
    (select id from phase6_context where key = 'workspace_a')
  ),
  'an administrator can leave after another active admin exists'
);

reset role;
select is(
  (
    select status
    from public.workspace_members
    where workspace_id = (select id from phase6_context where key = 'workspace_a')
      and user_id = '10000000-0000-4000-8000-000000000001'
  ),
  'inactive',
  'self-leave preserves the historical membership row'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;

insert into phase6_context (key, id)
select 'workspace_b', id from public.create_workspace('Other Workspace');

select throws_ok(
  format(
    'select public.manage_workspace_member(%L::uuid, %L::uuid, null, %L)',
    (select id from phase6_context where key = 'workspace_a'),
    '10000000-0000-4000-8000-000000000002',
    'inactive'
  ),
  'P0001',
  'WORKSPACE_ADMIN_REQUIRED',
  'an admin of another workspace cannot manage these members'
);
select throws_ok(
  format(
    'select public.revoke_workspace_invite(%L::uuid, %L::uuid)',
    (select id from phase6_context where key = 'workspace_a'),
    (select id from phase6_context where key = 'bounded_invite')
  ),
  'P0001',
  'WORKSPACE_ADMIN_REQUIRED',
  'an admin of another workspace cannot revoke these invitations'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

insert into phase6_context (key, id)
select 'workspace_c', id from public.create_workspace('Five Members');
insert into phase6_context (key, id, token)
select 'five_member_invite', id, token
from public.create_workspace_invite(
  (select id from phase6_context where key = 'workspace_c'),
  5,
  7
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;
select lives_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from phase6_context where key = 'five_member_invite')
  ),
  'the second user joins the five-member workspace'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;
select lives_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from phase6_context where key = 'five_member_invite')
  ),
  'the third user joins the five-member workspace'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);
set local role authenticated;
select lives_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from phase6_context where key = 'five_member_invite')
  ),
  'the fourth user joins the five-member workspace'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000005","role":"authenticated"}',
  true
);
set local role authenticated;
select lives_ok(
  format(
    'select public.join_workspace_by_invite(%L)',
    (select token from phase6_context where key = 'five_member_invite')
  ),
  'the fifth user joins the five-member workspace'
);

reset role;
select is(
  (
    select count(*)::integer
    from public.workspace_members
    where workspace_id = (select id from phase6_context where key = 'workspace_c')
      and status = 'active'
  ),
  5,
  'one admin and four invitees produce five active members'
);
select is(
  (
    select usage_count
    from public.workspace_invites
    where id = (select id from phase6_context where key = 'five_member_invite')
  ),
  4,
  'four successful joins consume exactly four invitation uses'
);

select * from finish();
rollback;
