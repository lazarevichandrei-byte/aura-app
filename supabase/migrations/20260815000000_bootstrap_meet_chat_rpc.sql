begin;

create or replace function public.bootstrap_meet_chat(
  p_chat_id uuid,
  p_user_id uuid
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with target_chat as (
    select
      chats.id,
      chats.event_id,
      chats.user1_id,
      chats.user2_id
    from public.chats
    where chats.id = p_chat_id
      and chats.event_id is not null
    limit 1
  ),
  membership as (
    select exists (
      select 1
      from public.chat_participants
      join target_chat on target_chat.id = chat_participants.chat_id
      where chat_participants.user_id = p_user_id
    ) as is_member
  )
  select jsonb_build_object(
    'chat', jsonb_build_object(
      'id', target_chat.id,
      'event_id', target_chat.event_id,
      'user1_id', target_chat.user1_id,
      'user2_id', target_chat.user2_id
    ),
    'event', case
      when membership.is_member then (
        select jsonb_build_object(
          'id', meet_events.id,
          'title', meet_events.title,
          'category', meet_events.category
        )
        from public.meet_events
        where meet_events.id = target_chat.event_id
        limit 1
      )
      else null
    end,
    'is_member', membership.is_member,
    'participant_count', case
      when membership.is_member then (
        select count(*)
        from public.chat_participants
        where chat_participants.chat_id = target_chat.id
      )
      else 0
    end,
    'messages', case
      when membership.is_member then coalesce((
        select jsonb_agg(to_jsonb(recent_message) order by recent_message.created_at desc)
        from (
          select
            messages.id,
            messages.chat_id,
            messages.sender_id,
            messages.body,
            messages.message_type,
            messages.created_at,
            messages.is_read,
            messages.reply_to_id,
            messages.reply_preview
          from public.messages
          where messages.chat_id = target_chat.id
          order by messages.created_at desc
          limit 30
        ) as recent_message
      ), '[]'::jsonb)
      else '[]'::jsonb
    end
  )
  from target_chat
  cross join membership;
$$;

revoke all on function public.bootstrap_meet_chat(uuid, uuid) from public;
revoke all on function public.bootstrap_meet_chat(uuid, uuid) from anon;
revoke all on function public.bootstrap_meet_chat(uuid, uuid) from authenticated;
grant execute on function public.bootstrap_meet_chat(uuid, uuid) to service_role;

commit;
