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
where not exists (
  select 1
  from public.chats
  where chats.event_id = meet_events.id
);

insert into public.chat_participants (chat_id, user_id)
select chats.id, meet_events.creator_id
from public.meet_events
join public.chats on chats.event_id = meet_events.id
where not exists (
  select 1
  from public.chat_participants
  where chat_participants.chat_id = chats.id
    and chat_participants.user_id = meet_events.creator_id
);

do $$
begin
  if not exists (
    select 1
    from public.chats
    where event_id is not null
    group by event_id
    having count(*) > 1
  ) and not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.chats'::regclass
      and conname = 'chats_event_id_key'
  ) then
    alter table public.chats
      add constraint chats_event_id_key unique (event_id);
  end if;

  if not exists (
    select 1
    from public.chat_participants
    group by chat_id, user_id
    having count(*) > 1
  ) and not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.chat_participants'::regclass
      and conname = 'chat_participants_chat_id_user_id_key'
  ) then
    alter table public.chat_participants
      add constraint chat_participants_chat_id_user_id_key unique (chat_id, user_id);
  end if;
end $$;
