begin;

create or replace function public.reserve_meet_guest_slot(
  p_event_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  target_event public.meet_events%rowtype;
  guest_count bigint;
begin
  select *
  into target_event
  from public.meet_events
  where meet_events.id = p_event_id
  for update;

  if not found then
    raise exception 'MEET_NOT_FOUND' using errcode = 'P0002';
  end if;

  if target_event.creator_id = p_user_id then
    return false;
  end if;

  if exists (
    select 1
    from public.meet_participants
    where meet_participants.event_id = p_event_id
      and meet_participants.user_id = p_user_id
  ) then
    return false;
  end if;

  select count(*)
  into guest_count
  from public.meet_participants
  where meet_participants.event_id = p_event_id
    and meet_participants.user_id <> target_event.creator_id;

  if guest_count >= target_event.max_people then
    raise exception 'MEET_FULL' using errcode = 'P0001';
  end if;

  insert into public.meet_participants (event_id, user_id)
  values (p_event_id, p_user_id)
  on conflict (event_id, user_id) do nothing;

  return true;
end;
$$;

revoke all on function public.reserve_meet_guest_slot(uuid, uuid) from public;
revoke all on function public.reserve_meet_guest_slot(uuid, uuid) from anon;
revoke all on function public.reserve_meet_guest_slot(uuid, uuid) from authenticated;
grant execute on function public.reserve_meet_guest_slot(uuid, uuid) to service_role;

commit;
