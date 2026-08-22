with checks(check_name,expected,actual,status) as (
  values
    ('table exists','true',(to_regclass('public.aura_interaction_events') is not null)::text,case when to_regclass('public.aura_interaction_events') is not null then 'PASS' else 'FAIL' end),
    ('RLS enabled','true',coalesce((select relrowsecurity::text from pg_class where oid='public.aura_interaction_events'::regclass),'false'),case when (select relrowsecurity from pg_class where oid='public.aura_interaction_events'::regclass) then 'PASS' else 'FAIL' end),
    ('browser grants','0',(select count(*)::text from information_schema.role_table_grants where table_schema='public' and table_name='aura_interaction_events' and grantee in ('PUBLIC','anon','authenticated')),case when not exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name='aura_interaction_events' and grantee in ('PUBLIC','anon','authenticated')) then 'PASS' else 'FAIL' end),
    ('service grants','DELETE,INSERT,SELECT',coalesce((select string_agg(privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name='aura_interaction_events' and grantee='service_role'),''),case when (select string_agg(privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name='aura_interaction_events' and grantee='service_role')='DELETE,INSERT,SELECT' then 'PASS' else 'FAIL' end),
    ('UPDATE grant absent','true',(!has_table_privilege('service_role','public.aura_interaction_events','UPDATE'))::text,case when not has_table_privilege('service_role','public.aura_interaction_events','UPDATE') then 'PASS' else 'FAIL' end),
    ('required indexes','8',(select count(*)::text from pg_indexes where schemaname='public' and tablename='aura_interaction_events'),case when (select count(*) from pg_indexes where schemaname='public' and tablename='aura_interaction_events')=8 then 'PASS' else 'FAIL' end),
    ('retention function service-only','true',(has_function_privilege('service_role','public.cleanup_aura_interaction_events(integer)','EXECUTE') and not has_function_privilege('anon','public.cleanup_aura_interaction_events(integer)','EXECUTE') and not has_function_privilege('authenticated','public.cleanup_aura_interaction_events(integer)','EXECUTE'))::text,case when has_function_privilege('service_role','public.cleanup_aura_interaction_events(integer)','EXECUTE') and not has_function_privilege('anon','public.cleanup_aura_interaction_events(integer)','EXECUTE') and not has_function_privilege('authenticated','public.cleanup_aura_interaction_events(integer)','EXECUTE') then 'PASS' else 'FAIL' end)
)
select * from checks order by check_name;

select event_name,date_trunc('day',received_at) as day,count(*) as event_count
from public.aura_interaction_events group by event_name,date_trunc('day',received_at) order by day desc,event_name;

select source_type,count(*) from public.aura_interaction_events group by source_type order by source_type;

select min(received_at) as oldest_event,max(received_at) as newest_event,
  count(*) filter(where received_at<now()-interval '90 days') as past_retention,
  count(*) filter(where schema_version<>1) as unexpected_schema_versions
from public.aura_interaction_events;

select event_name,count(*) as missing_required_target
from public.aura_interaction_events
where event_name in ('profile_impression','profile_open','profile_dwell_bucket','return_to_profile','like','pass','match_created','chat_started','meet_join_request','meet_join_accepted','meet_join_rejected','meet_participant_left','block','report')
  and target_user_id is null
group by event_name;
