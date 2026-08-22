select 'duplicate_direct_chat_pairs' as check_name, least(user1_id,user2_id) as user_low, greatest(user1_id,user2_id) as user_high, count(*) as row_count
from public.chats
where event_id is null and user1_id is not null and user2_id is not null
group by least(user1_id,user2_id), greatest(user1_id,user2_id)
having count(*) > 1;

select 'duplicate_pending_likes' as check_name, from_user_id, to_user_id, count(*) as row_count
from public.likes
where status = 'pending'
group by from_user_id, to_user_id
having count(*) > 1;

select 'reciprocal_pending_without_chat' as check_name, left_like.from_user_id, left_like.to_user_id
from public.likes left_like
join public.likes right_like on right_like.from_user_id = left_like.to_user_id and right_like.to_user_id = left_like.from_user_id and right_like.status = 'pending'
where left_like.status = 'pending'
  and left_like.from_user_id < left_like.to_user_id
  and not exists (
    select 1 from public.chats
    where event_id is null
      and least(user1_id,user2_id) = least(left_like.from_user_id,left_like.to_user_id)
      and greatest(user1_id,user2_id) = greatest(left_like.from_user_id,left_like.to_user_id)
  );

select 'self_relations' as check_name, 'likes' as source, count(*) as row_count from public.likes where from_user_id = to_user_id
union all
select 'self_relations', 'chats', count(*) from public.chats where event_id is null and user1_id = user2_id;

select 'orphan_direct_chat_users' as check_name, chats.id as chat_id, chats.user1_id, chats.user2_id
from public.chats
left join public.users user1 on user1.id = chats.user1_id
left join public.users user2 on user2.id = chats.user2_id
where chats.event_id is null and (user1.id is null or user2.id is null);

select 'orphan_likes' as check_name, likes.id as like_id, likes.from_user_id, likes.to_user_id
from public.likes
left join public.users sender on sender.id = likes.from_user_id
left join public.users recipient on recipient.id = likes.to_user_id
where sender.id is null or recipient.id is null;

select 'direct_chat_message_counts' as check_name, chats.id as chat_id, least(chats.user1_id,chats.user2_id) as user_low,
       greatest(chats.user1_id,chats.user2_id) as user_high, count(messages.id) as message_count
from public.chats
left join public.messages on messages.chat_id = chats.id
where chats.event_id is null
group by chats.id, least(chats.user1_id,chats.user2_id), greatest(chats.user1_id,chats.user2_id);

select 'constraints' as check_name, table_name, constraint_name, pg_get_constraintdef(pg_constraint.oid) as definition
from information_schema.table_constraints
join pg_constraint on pg_constraint.conname=constraint_name and pg_constraint.conrelid=(table_schema||'.'||table_name)::regclass
where table_schema='public' and table_name in ('users','likes','chats','chat_participants','messages','notification_deliveries')
order by table_name,constraint_name;

select 'indexes' as check_name, tablename, indexname, indexdef
from pg_indexes
where schemaname='public' and tablename in ('users','likes','chats','chat_participants','messages','notification_deliveries')
order by tablename,indexname;

select 'rls' as check_name, relname as table_name, relrowsecurity as enabled, relforcerowsecurity as forced
from pg_class join pg_namespace on pg_namespace.oid=pg_class.relnamespace
where nspname='public' and relname in ('users','likes','chats','chat_participants','messages','notification_deliveries');

select 'grants' as check_name, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name in ('users','likes','chats','chat_participants','messages','notification_deliveries')
order by table_name,grantee,privilege_type;

select 'policies' as check_name, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname='public' and tablename in ('users','likes','chats','chat_participants','messages','notification_deliveries')
order by tablename,policyname;

select 'legacy_functions' as check_name, proname, pg_get_function_identity_arguments(pg_proc.oid) as arguments,
       prosecdef as security_definer, pg_get_functiondef(pg_proc.oid) as definition
from pg_proc join pg_namespace on pg_namespace.oid=pg_proc.pronamespace
where nspname='public' and proname in ('get_feed','like_user','delete_my_account')
order by proname,arguments;
