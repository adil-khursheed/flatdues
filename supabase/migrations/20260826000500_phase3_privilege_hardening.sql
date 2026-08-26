-- Flatdues Phase 3: make function exposure explicit and future-safe.

revoke execute on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid, uuid) to authenticated;
grant execute on function private.is_workspace_admin(uuid, uuid) to authenticated;
grant execute on function private.can_view_profile(uuid) to authenticated;
grant execute on function private.can_manage_settlement(uuid, uuid, uuid) to authenticated;
grant execute on function private.can_access_expense(uuid) to authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.create_workspace(text, text) to authenticated;
grant execute on function public.generate_workspace_invite(uuid, timestamptz, integer)
  to authenticated;
grant execute on function public.join_workspace_by_invite(text) to authenticated;
grant execute on function public.create_expense(uuid, text, numeric, uuid, date, text, text, uuid[])
  to authenticated;
grant execute on function public.update_expense(uuid, text, numeric, uuid, date, text, text, uuid[])
  to authenticated;
grant execute on function public.delete_expense(uuid) to authenticated;
grant execute on function public.get_workspace_balances(uuid) to authenticated;
grant execute on function public.get_monthly_spending(uuid, date) to authenticated;
grant execute on function public.get_daily_spending(uuid, date) to authenticated;
grant execute on function public.get_recent_activity(uuid, integer) to authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema private
  revoke execute on functions from public, anon, authenticated;

