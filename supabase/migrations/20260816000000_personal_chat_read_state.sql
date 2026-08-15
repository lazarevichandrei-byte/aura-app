begin;

create table if not exists public.chat_read_state (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_read_at timestamptz not null default to_timestamp(0),
  last_read_message_id uuid null references public.messages(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

alter table public.chat_read_state enable row level security;

revoke all on table public.chat_read_state from public;
revoke all on table public.chat_read_state from anon;
revoke all on table public.chat_read_state from authenticated;
grant select, insert, update, delete on table public.chat_read_state to service_role;

create or replace function public.ensure_meet_chat_participant(
  p_chat_id uuid,
  p_user_id uuid
)
returns table (
  participant_added boolean,
  read_state_initialized boolean
)
language sql
volatile
security invoker
set search_path = public
as $$
  with participant_insert as (
    insert into public.chat_participants (chat_id, user_id)
    values (p_chat_id, p_user_id)
    on conflict (chat_id, user_id) do nothing
    returning true as inserted
  ),
  initialization_needed as (
    select
      exists (select 1 from participant_insert) as participant_added,
      exists (select 1 from participant_insert)
        or not exists (
          select 1
          from public.chat_read_state
          where chat_read_state.chat_id = p_chat_id
            and chat_read_state.user_id = p_user_id
        ) as should_initialize
  ),
  initial_cursor as (
    select
      coalesce(latest_message.created_at, clock_timestamp()) as last_read_at,
      latest_message.id as last_read_message_id
    from initialization_needed
    left join lateral (
      select messages.id, messages.created_at
      from public.messages
      where messages.chat_id = p_chat_id
      order by messages.created_at desc, messages.id desc
      limit 1
    ) as latest_message on true
    where initialization_needed.should_initialize
  ),
  saved_state as (
    insert into public.chat_read_state (
      chat_id,
      user_id,
      last_read_at,
      last_read_message_id,
      updated_at
    )
    select
      p_chat_id,
      p_user_id,
      initial_cursor.last_read_at,
      initial_cursor.last_read_message_id,
      now()
    from initial_cursor
    on conflict (chat_id, user_id) do update
    set
      last_read_at = excluded.last_read_at,
      last_read_message_id = excluded.last_read_message_id,
      updated_at = now()
    where
      exists (select 1 from participant_insert)
      and (
        excluded.last_read_at > chat_read_state.last_read_at
        or (
          excluded.last_read_at = chat_read_state.last_read_at
          and coalesce(
            excluded.last_read_message_id,
            '00000000-0000-0000-0000-000000000000'::uuid
          ) > coalesce(
            chat_read_state.last_read_message_id,
            '00000000-0000-0000-0000-000000000000'::uuid
          )
        )
      )
    returning true as initialized
  )
  select
    initialization_needed.participant_added,
    exists (select 1 from saved_state) as read_state_initialized
  from initialization_needed;
$$;

revoke all on function public.ensure_meet_chat_participant(uuid, uuid) from public;
revoke all on function public.ensure_meet_chat_participant(uuid, uuid) from anon;
revoke all on function public.ensure_meet_chat_participant(uuid, uuid) from authenticated;
grant execute on function public.ensure_meet_chat_participant(uuid, uuid) to service_role;

with chat_members as (
  select chats.id as chat_id, chats.user1_id as user_id
  from public.chats
  join public.users as user1
    on user1.id = chats.user1_id
  where chats.user1_id is not null
  union
  select chats.id, chats.user2_id
  from public.chats
  join public.users as user2
    on user2.id = chats.user2_id
  where chats.user2_id is not null
  union
  select chat_participants.chat_id, chat_participants.user_id
  from public.chat_participants
  join public.users as participant_user
    on participant_user.id = chat_participants.user_id
),
initial_cursors as (
  select
    chat_members.chat_id,
    chat_members.user_id,
    coalesce(latest_message.created_at, chats.created_at, now()) as last_read_at,
    latest_message.id as last_read_message_id
  from chat_members
  join public.chats on chats.id = chat_members.chat_id
  left join lateral (
    select messages.id, messages.created_at
    from public.messages
    where messages.chat_id = chat_members.chat_id
    order by messages.created_at desc, messages.id desc
    limit 1
  ) as latest_message on true
)
insert into public.chat_read_state (
  chat_id,
  user_id,
  last_read_at,
  last_read_message_id,
  updated_at
)
select
  initial_cursors.chat_id,
  initial_cursors.user_id,
  initial_cursors.last_read_at,
  initial_cursors.last_read_message_id,
  now()
from initial_cursors
on conflict (chat_id, user_id) do nothing;

create or replace function public.get_chat_unread_counts(
  p_user_id uuid,
  p_chat_ids uuid[]
)
returns table (
  chat_id uuid,
  unread_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    requested_chat.id as chat_id,
    count(messages.id) as unread_count
  from unnest(p_chat_ids) as requested_chat(id)
  join public.chats on chats.id = requested_chat.id
  left join public.chat_read_state
    on chat_read_state.chat_id = requested_chat.id
   and chat_read_state.user_id = p_user_id
  left join public.messages
    on messages.chat_id = requested_chat.id
   and messages.sender_id <> p_user_id
   and (
     messages.created_at > coalesce(chat_read_state.last_read_at, chats.created_at, to_timestamp(0))
     or (
       messages.created_at = coalesce(chat_read_state.last_read_at, chats.created_at, to_timestamp(0))
       and messages.id > coalesce(
         chat_read_state.last_read_message_id,
         '00000000-0000-0000-0000-000000000000'::uuid
       )
     )
   )
  group by requested_chat.id;
$$;

revoke all on function public.get_chat_unread_counts(uuid, uuid[]) from public;
revoke all on function public.get_chat_unread_counts(uuid, uuid[]) from anon;
revoke all on function public.get_chat_unread_counts(uuid, uuid[]) from authenticated;
grant execute on function public.get_chat_unread_counts(uuid, uuid[]) to service_role;

create or replace function public.mark_chat_read(
  p_chat_id uuid,
  p_user_id uuid,
  p_message_id uuid
)
returns table (
  last_read_at timestamptz,
  last_read_message_id uuid
)
language sql
volatile
security invoker
set search_path = public
as $$
  with cursor_message as (
    select messages.id, messages.created_at
    from public.messages
    where messages.id = p_message_id
      and messages.chat_id = p_chat_id
    limit 1
  ),
  saved_cursor as (
    insert into public.chat_read_state (
      chat_id,
      user_id,
      last_read_at,
      last_read_message_id,
      updated_at
    )
    select
      p_chat_id,
      p_user_id,
      cursor_message.created_at,
      cursor_message.id,
      now()
    from cursor_message
    on conflict (chat_id, user_id) do update
    set
      last_read_at = excluded.last_read_at,
      last_read_message_id = excluded.last_read_message_id,
      updated_at = now()
    where
      (excluded.last_read_at, excluded.last_read_message_id) >
      (chat_read_state.last_read_at, coalesce(
        chat_read_state.last_read_message_id,
        '00000000-0000-0000-0000-000000000000'::uuid
      ))
    returning
      chat_read_state.last_read_at,
      chat_read_state.last_read_message_id
  )
  select saved_cursor.last_read_at, saved_cursor.last_read_message_id
  from saved_cursor
  union all
  select chat_read_state.last_read_at, chat_read_state.last_read_message_id
  from public.chat_read_state
  where chat_read_state.chat_id = p_chat_id
    and chat_read_state.user_id = p_user_id
    and exists (select 1 from cursor_message)
    and not exists (select 1 from saved_cursor)
  limit 1;
$$;

revoke all on function public.mark_chat_read(uuid, uuid, uuid) from public;
revoke all on function public.mark_chat_read(uuid, uuid, uuid) from anon;
revoke all on function public.mark_chat_read(uuid, uuid, uuid) from authenticated;
grant execute on function public.mark_chat_read(uuid, uuid, uuid) to service_role;

commit;
