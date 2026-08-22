begin;

create or replace function public.dating_reject_cooldown_interval()
returns interval
language sql
immutable
security invoker
set search_path=public
as $$ select interval '2 minutes' $$;

create or replace function public.dating_match_cooldown_interval()
returns interval
language sql
immutable
security invoker
set search_path=public
as $$ select interval '2 days' $$;

do $$
begin
  if exists (
    select 1
    from public.dating_interaction_cycles
    where status='pending'
      and (completed_at is not null or cooldown_until is not null)
  ) then
    raise exception 'INVALID_PENDING_DATING_CYCLE_STATE';
  end if;

  if exists (
    select 1
    from public.dating_interaction_cycles
    where status in ('matched','rejected')
      and (completed_at is null or cooldown_until is null)
  ) then
    raise exception 'INVALID_COMPLETED_DATING_CYCLE_STATE';
  end if;
end $$;

update public.dating_interaction_cycles
set cooldown_until=least(
  cooldown_until,
  completed_at+public.dating_reject_cooldown_interval()
)
where status='rejected'
  and cooldown_until>completed_at+public.dating_reject_cooldown_interval();

update public.dating_interaction_cycles
set cooldown_until=least(
  cooldown_until,
  completed_at+public.dating_match_cooldown_interval()
)
where status='matched'
  and cooldown_until>completed_at+public.dating_match_cooldown_interval();

revoke all on function public.dating_reject_cooldown_interval()
  from public,anon,authenticated,service_role;
revoke all on function public.dating_match_cooldown_interval()
  from public,anon,authenticated,service_role;
revoke all on function public.process_dating_action(uuid,uuid,text)
  from public,anon,authenticated,service_role;
revoke all on function public.get_dating_feed(uuid,integer,uuid[])
  from public,anon,authenticated,service_role;

grant execute on function
  public.dating_reject_cooldown_interval(),
  public.dating_match_cooldown_interval(),
  public.process_dating_action(uuid,uuid,text),
  public.get_dating_feed(uuid,integer,uuid[])
to service_role;

commit;
