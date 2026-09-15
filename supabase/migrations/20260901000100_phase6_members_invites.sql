-- Flatdues Phase 6: bounded invitations and RPC-only membership management.

alter table public.workspace_invites
  add column revoked_at timestamptz;

alter table public.workspace_invites
  add constraint workspace_invites_revocation_consistent
  check (revoked_at is null or revoked_at >= created_at);

create index workspace_invites_active_workspace_idx
  on public.workspace_invites (workspace_id, created_at desc)
  where revoked_at is null;

drop policy if exists workspace_invites_delete_active_admins
  on public.workspace_invites;
revoke delete on table public.workspace_invites from authenticated;

drop policy if exists workspace_members_update_active_admins
  on public.workspace_members;
revoke update (role, status, deactivated_at)
  on table public.workspace_members from authenticated;

create or replace function public.create_workspace_invite(
  p_workspace_id uuid,
  p_max_uses integer,
  p_expires_in_days integer
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

  if p_expires_in_days is null or p_expires_in_days not between 1 and 30 then
    raise exception using errcode = 'P0001', message = 'INVITE_DAYS_INVALID';
  end if;

  if p_max_uses is null or p_max_uses not between 1 and 50 then
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
    statement_timestamp() + make_interval(days => p_expires_in_days),
    p_max_uses
  )
  returning * into created_invite;

  return created_invite;
end;
$$;

revoke all on function public.create_workspace_invite(uuid, integer, integer)
  from public, anon;
grant execute on function public.create_workspace_invite(uuid, integer, integer)
  to authenticated;

-- Compatibility entry point for Phase 5 clients. New clients use
-- create_workspace_invite so expiry is calculated from database time.
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
  resolved_expires_at timestamptz := coalesce(
    p_expires_at,
    statement_timestamp() + interval '7 days'
  );
  resolved_max_uses integer := coalesce(p_max_uses, 5);
  created_invite public.workspace_invites;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  if not private.is_workspace_admin(p_workspace_id, caller_id) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_ADMIN_REQUIRED';
  end if;

  if resolved_expires_at <= statement_timestamp()
    or resolved_expires_at > statement_timestamp() + interval '30 days'
  then
    raise exception using errcode = 'P0001', message = 'INVITE_EXPIRY_INVALID';
  end if;

  if resolved_max_uses not between 1 and 50 then
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
    resolved_expires_at,
    resolved_max_uses
  )
  returning * into created_invite;

  return created_invite;
end;
$$;

revoke all on function public.generate_workspace_invite(uuid, timestamptz, integer)
  from public, anon;
grant execute on function public.generate_workspace_invite(uuid, timestamptz, integer)
  to authenticated;

create or replace function public.revoke_workspace_invite(
  p_workspace_id uuid,
  p_invite_id uuid
)
returns public.workspace_invites
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  revoked_invite public.workspace_invites;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  perform 1
  from public.workspaces
  where id = p_workspace_id
  for update;

  if not private.is_workspace_admin(p_workspace_id, caller_id) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_ADMIN_REQUIRED';
  end if;

  select invite.*
  into revoked_invite
  from public.workspace_invites as invite
  where invite.id = p_invite_id
    and invite.workspace_id = p_workspace_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'INVITE_NOT_FOUND';
  end if;

  if revoked_invite.revoked_at is null then
    update public.workspace_invites
    set revoked_at = statement_timestamp()
    where id = revoked_invite.id
    returning * into revoked_invite;
  end if;

  return revoked_invite;
end;
$$;

revoke all on function public.revoke_workspace_invite(uuid, uuid)
  from public, anon;
grant execute on function public.revoke_workspace_invite(uuid, uuid)
  to authenticated;

create or replace function public.manage_workspace_member(
  p_workspace_id uuid,
  p_user_id uuid,
  p_role text default null,
  p_status text default null
)
returns public.workspace_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  target_member public.workspace_members;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  perform 1
  from public.workspaces
  where id = p_workspace_id
  for update;

  if not private.is_workspace_admin(p_workspace_id, caller_id) then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_ADMIN_REQUIRED';
  end if;

  if p_user_id = caller_id then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_SELF_MANAGEMENT';
  end if;

  if p_role is null and p_status is null then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_CHANGE_REQUIRED';
  end if;

  if p_role is not null and p_role not in ('admin', 'member') then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_ROLE_INVALID';
  end if;

  if p_status is not null and p_status not in ('active', 'inactive') then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_STATUS_INVALID';
  end if;

  select member.*
  into target_member
  from public.workspace_members as member
  where member.workspace_id = p_workspace_id
    and member.user_id = p_user_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_NOT_FOUND';
  end if;

  update public.workspace_members
  set
    role = coalesce(p_role, role),
    status = coalesce(p_status, status)
  where workspace_id = p_workspace_id
    and user_id = p_user_id
  returning * into target_member;

  return target_member;
end;
$$;

revoke all on function public.manage_workspace_member(uuid, uuid, text, text)
  from public, anon;
grant execute on function public.manage_workspace_member(uuid, uuid, text, text)
  to authenticated;

create or replace function public.leave_workspace(p_workspace_id uuid)
returns public.workspace_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  leaving_member public.workspace_members;
begin
  if caller_id is null then
    raise exception using errcode = 'P0001', message = 'AUTH_REQUIRED';
  end if;

  perform 1
  from public.workspaces
  where id = p_workspace_id
  for update;

  select member.*
  into leaving_member
  from public.workspace_members as member
  where member.workspace_id = p_workspace_id
    and member.user_id = caller_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBER_NOT_FOUND';
  end if;

  if leaving_member.status <> 'active' then
    raise exception using errcode = 'P0001', message = 'WORKSPACE_MEMBERSHIP_INACTIVE';
  end if;

  update public.workspace_members
  set status = 'inactive'
  where workspace_id = p_workspace_id
    and user_id = caller_id
  returning * into leaving_member;

  return leaving_member;
end;
$$;

revoke all on function public.leave_workspace(uuid) from public, anon;
grant execute on function public.leave_workspace(uuid) to authenticated;

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

  if locked_invite.revoked_at is not null then
    raise exception using errcode = 'P0001', message = 'INVITE_REVOKED';
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
