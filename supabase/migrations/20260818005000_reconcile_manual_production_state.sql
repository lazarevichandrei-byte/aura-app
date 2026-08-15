begin;

do $migration$
declare
  target_table text;
begin
  foreach target_table in array array[
    'meet_events',
    'meet_participants',
    'meet_join_requests'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        target_table
      );
    end if;
  end loop;
end
$migration$;

do $migration$
begin
  if exists (
    select 1
    from public.chats
    where event_id is not null
    group by event_id
    having count(*) > 1
  ) then
    raise exception 'DUPLICATE_MEET_CHATS_REQUIRE_MANUAL_REVIEW';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.chats'::regclass
      and conname = 'chats_event_id_key'
  ) then
    execute 'alter table public.chats add constraint chats_event_id_key unique (event_id)';
  end if;
end
$migration$;

insert into public.chats (
  event_id,
  user1_id,
  user2_id,
  last_message,
  liked_by,
  is_new_match,
  has_messages,
  unread_count
)
select
  meet_events.id,
  null,
  null,
  '',
  true,
  false,
  false,
  0
from public.meet_events
join public.users
  on users.id = meet_events.creator_id
where meet_events.id in (
  'c135a886-4ff2-4351-81a5-c4b62a20499d'::uuid,
  '93a9c212-a2ed-4fbb-8b1c-0494499965e5'::uuid
)
on conflict on constraint chats_event_id_key do nothing;

do $migration$
declare
  target record;
begin
  for target in
    select
      meet_events.id as event_id,
      meet_events.creator_id,
      chats.id as chat_id
    from public.meet_events
    join public.users
      on users.id = meet_events.creator_id
    join public.chats
      on chats.event_id = meet_events.id
    where meet_events.id in (
      'c135a886-4ff2-4351-81a5-c4b62a20499d'::uuid,
      '93a9c212-a2ed-4fbb-8b1c-0494499965e5'::uuid,
      '654be76e-c2fa-4eab-8724-662e637ee5b9'::uuid,
      'e01bf73d-2dfd-4997-9609-29da5c9fe66f'::uuid
    )
  loop
    perform public.ensure_meet_chat_participant(
      target.chat_id,
      target.creator_id
    );
  end loop;

  if (
    select count(*)
    from public.meet_events
    join public.users
      on users.id = meet_events.creator_id
    join public.chats
      on chats.event_id = meet_events.id
    join public.chat_participants
      on chat_participants.chat_id = chats.id
     and chat_participants.user_id = meet_events.creator_id
    join public.chat_read_state
      on chat_read_state.chat_id = chats.id
     and chat_read_state.user_id = meet_events.creator_id
    where meet_events.id in (
      'c135a886-4ff2-4351-81a5-c4b62a20499d'::uuid,
      '93a9c212-a2ed-4fbb-8b1c-0494499965e5'::uuid,
      '654be76e-c2fa-4eab-8724-662e637ee5b9'::uuid,
      'e01bf73d-2dfd-4997-9609-29da5c9fe66f'::uuid
    )
  ) <> 4 then
    raise exception 'MEET_CHAT_RECONCILIATION_INCOMPLETE';
  end if;
end
$migration$;

revoke all on table public.chat_read_state from service_role;
grant select, insert, update, delete
  on table public.chat_read_state
  to service_role;

commit;
