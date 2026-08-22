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

-- Production public.matches was created outside the local migration history.
-- Keep this audit structural: it exposes no message, profile, or other user content.
select 'matches_columns' as check_name,
       columns.ordinal_position,
       columns.column_name,
       columns.data_type,
       columns.udt_name,
       columns.is_nullable,
       columns.column_default
from information_schema.columns
where columns.table_schema='public' and columns.table_name='matches'
order by columns.ordinal_position;

select 'matches_constraints' as check_name,
       constraints.conname as constraint_name,
       constraints.contype as constraint_type,
       pg_get_constraintdef(constraints.oid) as definition
from pg_constraint constraints
where constraints.conrelid='public.matches'::regclass
order by constraints.contype,constraints.conname;

select 'matches_indexes' as check_name,indexname,indexdef
from pg_indexes
where schemaname='public' and tablename='matches'
order by indexname;

select 'matches_rls' as check_name,
       classes.relrowsecurity as enabled,
       classes.relforcerowsecurity as forced
from pg_class classes
where classes.oid='public.matches'::regclass;

select 'matches_grants' as check_name,grantee,privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name='matches'
order by grantee,privilege_type;

select 'matches_policies' as check_name,policyname,roles,cmd,qual,with_check
from pg_policies
where schemaname='public' and tablename='matches'
order by policyname;

select 'matches_row_count' as check_name,count(*) as row_count
from public.matches;

select 'matches_structural_shape' as check_name,
       attributes.key as column_name,
       jsonb_typeof(attributes.value) as json_type,
       count(*) as populated_row_count
from public.matches matches
cross join lateral jsonb_each(to_jsonb(matches)) attributes
where attributes.value <> 'null'::jsonb
group by attributes.key,jsonb_typeof(attributes.value)
order by attributes.key,json_type;

select 'likes_status_distribution' as check_name,status,count(*) as row_count
from public.likes
group by status
order by status;

select 'likes_constraints' as check_name,
       constraints.conname as constraint_name,
       constraints.contype as constraint_type,
       pg_get_constraintdef(constraints.oid) as definition
from pg_constraint constraints
where constraints.conrelid='public.likes'::regclass
order by constraints.contype,constraints.conname;

select 'direct_chats_summary' as check_name,
       count(*) as direct_chat_count,
       count(*) filter (where chats.user1_id is null or chats.user2_id is null) as missing_user_id_count,
       count(*) filter (where user1.id is null or user2.id is null) as orphan_user_count,
       count(*) filter (where coalesce(chats.is_new_match,false)) as new_match_count,
       count(*) filter (where coalesce(chats.liked_by,false)) as liked_by_count,
       count(*) filter (where exists (select 1 from public.messages where messages.chat_id=chats.id)) as chats_with_messages
from public.chats chats
left join public.users user1 on user1.id=chats.user1_id
left join public.users user2 on user2.id=chats.user2_id
where chats.event_id is null;

select 'direct_chat_participant_coverage' as check_name,
       count(*) as direct_chat_count,
       count(*) filter (where coverage.user1_is_participant) as user1_covered,
       count(*) filter (where coverage.user2_is_participant) as user2_covered,
       count(*) filter (where not coverage.user1_is_participant or not coverage.user2_is_participant) as missing_either_user
from public.chats chats
cross join lateral (
  select
    exists(select 1 from public.chat_participants where chat_id=chats.id and user_id=chats.user1_id) as user1_is_participant,
    exists(select 1 from public.chat_participants where chat_id=chats.id and user_id=chats.user2_id) as user2_is_participant
) coverage
where chats.event_id is null;

select 'direct_chat_message_distribution' as check_name,
       count(*) filter (where message_counts.message_count=0) as empty_chat_count,
       count(*) filter (where message_counts.message_count>0) as nonempty_chat_count,
       coalesce(sum(message_counts.message_count),0) as total_message_count,
       coalesce(max(message_counts.message_count),0) as max_messages_in_chat
from (
  select chats.id,count(messages.id) as message_count
  from public.chats chats
  left join public.messages messages on messages.chat_id=chats.id
  where chats.event_id is null
  group by chats.id
) message_counts;

select 'function_execute_grants' as check_name,
       routines.routine_name as function_name,
       routines.specific_name,
       routines.grantee as role_name,
       routines.privilege_type
from information_schema.routine_privileges routines
where routines.specific_schema='public'
  and routines.routine_name in ('get_feed','like_user','delete_my_account')
  and routines.grantee in ('PUBLIC','anon','authenticated','service_role')
order by routines.routine_name,routines.specific_name,routines.grantee;

select 'dating_column_types' as check_name,
       columns.table_name,
       columns.column_name,
       columns.data_type,
       columns.udt_name,
       columns.is_nullable,
       columns.column_default
from information_schema.columns
where columns.table_schema='public'
  and (columns.table_name,columns.column_name) in (
    ('users','id'),('users','photos'),('users','interests'),('users','avatar_url'),
    ('users','latitude'),('users','longitude'),('users','search_radius'),
    ('likes','from_user_id'),('likes','to_user_id'),('likes','status'),('likes','created_at'),
    ('chats','id'),('chats','event_id'),('chats','user1_id'),('chats','user2_id'),
    ('chats','created_at'),('chats','liked_by'),('chats','is_new_match')
  )
order by columns.table_name,columns.ordinal_position;

select 'distance_helpers' as check_name,
       routines.proname as function_name,
       pg_get_function_identity_arguments(routines.oid) as arguments,
       pg_get_function_result(routines.oid) as result_type,
       routines.prosecdef as security_definer,
       pg_get_functiondef(routines.oid) as definition
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public' and routines.proname='distance_km'
order by arguments;

select 'chat_trigger_name_conflict' as check_name,
       triggers.tgname as trigger_name,
       pg_get_triggerdef(triggers.oid) as definition
from pg_trigger triggers
where triggers.tgrelid='public.chats'::regclass
  and triggers.tgname='chats_sync_canonical_pair'
  and not triggers.tgisinternal;
