select 'legacy_pending_likes_mapped' as check_name,
       count(*) as expected_count,
       count(*) filter (where cycles.id is not null) as actual_count,
       case when count(*)=count(*) filter (where cycles.id is not null) then 'PASS' else 'FAIL' end as status
from public.likes likes
left join public.dating_interaction_cycles cycles
  on cycles.user_low_id=least(likes.from_user_id,likes.to_user_id)
 and cycles.user_high_id=greatest(likes.from_user_id,likes.to_user_id)
 and cycles.initiated_by_user_id=likes.from_user_id
 and cycles.recipient_user_id=likes.to_user_id
 and cycles.status='pending'
where likes.status='pending';

select 'confirmed_three_legacy_likes_mapped' as check_name,
       (select count(*) from public.likes where status='pending') as legacy_pending_count,
       (select count(*) from public.dating_interaction_cycles where status='pending') as pending_cycle_count,
       case when (select count(*) from public.likes where status='pending')=3
              and (select count(*) from public.dating_interaction_cycles where status='pending')=3
            then 'PASS' else 'FAIL' end as status;

select 'legacy_matches_remain_legacy_only' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from public.matches;

select 'duplicate_canonical_direct_chats' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from (
  select direct_user_low_id,direct_user_high_id
  from public.chats
  where event_id is null and direct_user_low_id is not null and direct_user_high_id is not null
  group by direct_user_low_id,direct_user_high_id
  having count(*)>1
) duplicates;

select 'self_canonical_direct_chats' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from public.chats
where event_id is null and direct_user_low_id=direct_user_high_id;

select 'valid_direct_chats_have_canonical_pair' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from public.chats chats
join public.users user1 on user1.id=chats.user1_id
join public.users user2 on user2.id=chats.user2_id
where chats.event_id is null
  and chats.user1_id<>chats.user2_id
  and (chats.direct_user_low_id is distinct from least(chats.user1_id,chats.user2_id)
    or chats.direct_user_high_id is distinct from greatest(chats.user1_id,chats.user2_id));

select 'meet_chats_have_no_direct_pair' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from public.chats
where event_id is not null and (direct_user_low_id is not null or direct_user_high_id is not null);

select 'duplicate_active_pending_cycles' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from (
  select user_low_id,user_high_id
  from public.dating_interaction_cycles
  where status='pending'
  group by user_low_id,user_high_id
  having count(*)>1
) duplicates;

select 'invalid_cycle_state_timestamps' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from public.dating_interaction_cycles
where (status='pending' and (completed_at is not null or cooldown_until is not null))
   or (status in ('matched','rejected') and (completed_at is null or cooldown_until is null));

select 'invalid_cycle_direction' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from public.dating_interaction_cycles
where initiated_by_user_id=recipient_user_id
   or initiated_by_user_id not in (user_low_id,user_high_id)
   or recipient_user_id not in (user_low_id,user_high_id);

select 'duplicate_matches_per_cycle' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from (
  select interaction_cycle_id
  from public.dating_matches
  group by interaction_cycle_id
  having count(*)>1
) duplicates;

select 'dating_match_cycle_or_chat_mismatch' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from public.dating_matches matches
join public.dating_interaction_cycles cycles on cycles.id=matches.interaction_cycle_id
join public.chats chats on chats.id=matches.chat_id
where cycles.status<>'matched'
   or matches.user_low_id<>cycles.user_low_id
   or matches.user_high_id<>cycles.user_high_id
   or chats.event_id is not null
   or chats.direct_user_low_id<>matches.user_low_id
   or chats.direct_user_high_id<>matches.user_high_id;

select 'dating_rls' as check_name,
       classes.relname as object_name,
       classes.relrowsecurity as enabled,
       case when classes.relrowsecurity then 'PASS' else 'FAIL' end as status
from pg_class classes
join pg_namespace namespaces on namespaces.oid=classes.relnamespace
where namespaces.nspname='public'
  and classes.relname in ('dating_interaction_cycles','dating_matches','chat_user_state','user_entitlements')
order by classes.relname;

select 'canonical_chat_unique_index' as check_name,
       coalesce(bool_or(indexes.indexdef ilike '%unique index%'
         and indexes.indexdef ilike '%direct_user_low_id%'
         and indexes.indexdef ilike '%direct_user_high_id%'
         and indexes.indexdef ilike '%where%event_id is null%'),false) as present,
       case when coalesce(bool_or(indexes.indexdef ilike '%unique index%'
         and indexes.indexdef ilike '%direct_user_low_id%'
         and indexes.indexdef ilike '%direct_user_high_id%'
         and indexes.indexdef ilike '%where%event_id is null%'),false) then 'PASS' else 'FAIL' end as status
from pg_indexes indexes
where indexes.schemaname='public' and indexes.tablename='chats';

select 'browser_table_grant_count' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from information_schema.role_table_grants grants
where grants.table_schema='public'
  and grants.table_name in ('dating_interaction_cycles','dating_matches','chat_user_state','user_entitlements')
  and grants.grantee in ('PUBLIC','anon','authenticated');

select 'unexpected_browser_table_grant' as check_name,
       grants.table_name as object_name,
       grants.grantee,
       grants.privilege_type,
       'FAIL' as status
from information_schema.role_table_grants grants
where grants.table_schema='public'
  and grants.table_name in ('dating_interaction_cycles','dating_matches','chat_user_state','user_entitlements')
  and grants.grantee in ('PUBLIC','anon','authenticated')
order by grants.table_name,grants.grantee,grants.privilege_type;

select 'service_role_table_grants' as check_name,
       grants.table_name as object_name,
       string_agg(grants.privilege_type,',' order by grants.privilege_type) as actual_grants,
       'INFO' as status
from information_schema.role_table_grants grants
where grants.table_schema='public'
  and grants.table_name in ('dating_interaction_cycles','dating_matches','chat_user_state','user_entitlements','likes','matches')
  and grants.grantee='service_role'
group by grants.table_name
order by grants.table_name;

select 'expand_legacy_rpc_locked' as check_name,
       routines.proname as object_name,
       has_function_privilege('anon',routines.oid,'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated',routines.oid,'EXECUTE') as authenticated_can_execute,
       has_function_privilege('service_role',routines.oid,'EXECUTE') as service_role_can_execute,
       case when not has_function_privilege('anon',routines.oid,'EXECUTE')
                  and not has_function_privilege('authenticated',routines.oid,'EXECUTE')
                  and not has_function_privilege('service_role',routines.oid,'EXECUTE')
            then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public' and routines.proname in ('get_feed','like_user')
order by routines.proname;

select 'expand_like_user_bridge' as check_name,
       routines.prosecdef as security_definer,
       case when routines.prosecdef
                  and lower(pg_get_functiondef(routines.oid)) like '%process_dating_action%'
            then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public' and routines.proname='like_user';

with expected(table_name,expected_grants) as (
  values
    ('dating_interaction_cycles','INSERT,SELECT,UPDATE'),
    ('dating_matches','INSERT,SELECT'),
    ('chat_user_state','INSERT,SELECT,UPDATE'),
    ('user_entitlements','SELECT'),
    ('likes','DELETE,INSERT,SELECT'),
    ('matches','')
), actual as (
  select grants.table_name,string_agg(grants.privilege_type,',' order by grants.privilege_type) as actual_grants
  from information_schema.role_table_grants grants
  where grants.table_schema='public' and grants.grantee='service_role'
    and grants.table_name in (select table_name from expected)
  group by grants.table_name
)
select 'expand_service_role_table_grants' as check_name,
       expected.table_name as object_name,
       expected.expected_grants,
       coalesce(actual.actual_grants,'') as actual_grants,
       case when expected.expected_grants=coalesce(actual.actual_grants,'') then 'PASS' else 'FAIL' end as status
from expected left join actual using(table_name)
order by expected.table_name;

select 'dating_function_security' as check_name,
       routines.proname as object_name,
       routines.prosecdef as security_definer,
       case when not routines.prosecdef then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public'
  and routines.proname in ('dating_cooldown_interval','sync_chat_canonical_pair','get_or_create_direct_dating_chat','process_dating_action','get_dating_feed')
order by routines.proname;

select 'unexpected_browser_dating_function_grant' as check_name,
       routines.routine_name as object_name,
       routines.grantee,
       'FAIL' as status
from information_schema.routine_privileges routines
where routines.specific_schema='public'
  and routines.routine_name in ('dating_cooldown_interval','sync_chat_canonical_pair','get_or_create_direct_dating_chat','process_dating_action','get_dating_feed')
  and routines.grantee in ('PUBLIC','anon','authenticated')
order by routines.routine_name,routines.grantee;

select 'expand_new_rpc_permissions' as check_name,
       routines.proname as object_name,
       has_function_privilege('service_role',routines.oid,'EXECUTE') as service_role_can_execute,
       has_function_privilege('anon',routines.oid,'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated',routines.oid,'EXECUTE') as authenticated_can_execute,
       case when has_function_privilege('service_role',routines.oid,'EXECUTE')
                  and not has_function_privilege('anon',routines.oid,'EXECUTE')
                  and not has_function_privilege('authenticated',routines.oid,'EXECUTE')
            then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public'
  and routines.proname in ('get_or_create_direct_dating_chat','process_dating_action','get_dating_feed')
order by routines.proname;

select 'get_dating_feed_has_no_chat_exclusion' as check_name,
       case when lower(pg_get_functiondef(routines.oid)) not like '%public.chats%' then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public'
  and routines.proname='get_dating_feed'
  and pg_get_function_identity_arguments(routines.oid)='p_user_id uuid, p_limit integer, p_exclude_ids uuid[]';

select 'get_dating_feed_uses_jsonb_photos' as check_name,
       case when lower(pg_get_functiondef(routines.oid)) like '%jsonb_array_length%candidate.photos%'
              and lower(pg_get_functiondef(routines.oid)) not like '%cardinality(candidate.photos)%'
            then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public' and routines.proname='get_dating_feed';

select 'dating_action_rpc_exists' as check_name,
       case when to_regprocedure('public.process_dating_action(uuid,uuid,text)') is not null then 'PASS' else 'FAIL' end as status;

select 'delete_my_account_handles_dating_state' as check_name,
       case when lower(pg_get_functiondef(routines.oid)) like '%delete from public.dating_interaction_cycles%'
              and lower(pg_get_functiondef(routines.oid)) like '%delete from public.chat_user_state%'
              and lower(pg_get_functiondef(routines.oid)) like '%delete from public.user_entitlements%'
            then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public'
  and routines.proname='delete_my_account'
  and pg_get_function_identity_arguments(routines.oid)='p_user_id uuid';

select 'dating_object_counts' as check_name,'dating_interaction_cycles' as object_name,count(*) as actual_count,'INFO' as status from public.dating_interaction_cycles
union all
select 'dating_object_counts','dating_matches',count(*),'INFO' from public.dating_matches
union all
select 'dating_object_counts','chat_user_state',count(*),'INFO' from public.chat_user_state
union all
select 'dating_object_counts','user_entitlements',count(*),'INFO' from public.user_entitlements;
