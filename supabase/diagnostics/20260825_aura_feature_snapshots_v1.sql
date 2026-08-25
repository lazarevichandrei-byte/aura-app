with checks(check_name,expected,actual,status) as (
  values
    ('user table exists','true',(to_regclass('public.aura_user_feature_snapshots') is not null)::text,case when to_regclass('public.aura_user_feature_snapshots') is not null then 'PASS' else 'FAIL' end),
    ('pair table exists','true',(to_regclass('public.aura_pair_feature_snapshots') is not null)::text,case when to_regclass('public.aura_pair_feature_snapshots') is not null then 'PASS' else 'FAIL' end),
    ('user RLS','true',(select relrowsecurity::text from pg_class where oid='public.aura_user_feature_snapshots'::regclass),case when (select relrowsecurity from pg_class where oid='public.aura_user_feature_snapshots'::regclass) then 'PASS' else 'FAIL' end),
    ('pair RLS','true',(select relrowsecurity::text from pg_class where oid='public.aura_pair_feature_snapshots'::regclass),case when (select relrowsecurity from pg_class where oid='public.aura_pair_feature_snapshots'::regclass) then 'PASS' else 'FAIL' end),
    ('browser table grants','0',(select count(*)::text from information_schema.role_table_grants where table_schema='public' and table_name in ('aura_user_feature_snapshots','aura_pair_feature_snapshots') and grantee in ('PUBLIC','anon','authenticated')),case when not exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name in ('aura_user_feature_snapshots','aura_pair_feature_snapshots') and grantee in ('PUBLIC','anon','authenticated')) then 'PASS' else 'FAIL' end),
    ('service table grants','DELETE,INSERT,SELECT',(select string_agg(distinct privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name in ('aura_user_feature_snapshots','aura_pair_feature_snapshots') and grantee='service_role'),case when (select string_agg(distinct privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name in ('aura_user_feature_snapshots','aura_pair_feature_snapshots') and grantee='service_role')='DELETE,INSERT,SELECT' then 'PASS' else 'FAIL' end),
    ('browser function execute','0',(select count(*)::text from information_schema.routine_privileges where specific_schema='public' and routine_name in ('build_aura_user_features_v1','build_aura_pair_features_v1','cleanup_aura_feature_snapshots') and grantee in ('PUBLIC','anon','authenticated')),case when not exists(select 1 from information_schema.routine_privileges where specific_schema='public' and routine_name in ('build_aura_user_features_v1','build_aura_pair_features_v1','cleanup_aura_feature_snapshots') and grantee in ('PUBLIC','anon','authenticated')) then 'PASS' else 'FAIL' end),
    ('service builder execute','true',(has_function_privilege('service_role','public.build_aura_user_features_v1(uuid,timestamptz)','EXECUTE') and has_function_privilege('service_role','public.build_aura_pair_features_v1(uuid,uuid,timestamptz)','EXECUTE'))::text,case when has_function_privilege('service_role','public.build_aura_user_features_v1(uuid,timestamptz)','EXECUTE') and has_function_privilege('service_role','public.build_aura_pair_features_v1(uuid,uuid,timestamptz)','EXECUTE') then 'PASS' else 'FAIL' end),
    ('service cleanup execute','true',has_function_privilege('service_role','public.cleanup_aura_feature_snapshots(integer)','EXECUTE')::text,case when has_function_privilege('service_role','public.cleanup_aura_feature_snapshots(integer)','EXECUTE') then 'PASS' else 'FAIL' end)
)
select * from checks order by check_name;

select feature_schema_version,count(*) as snapshot_count,min(snapshot_at) as oldest,max(snapshot_at) as newest
from public.aura_user_feature_snapshots group by feature_schema_version order by feature_schema_version;

select feature_schema_version,count(*) as snapshot_count,min(snapshot_at) as oldest,max(snapshot_at) as newest
from public.aura_pair_feature_snapshots group by feature_schema_version order by feature_schema_version;

select
  count(*) filter(where snapshot_at<now()-interval '180 days') as user_past_retention,
  (select count(*) from public.aura_pair_feature_snapshots where snapshot_at<now()-interval '180 days') as pair_past_retention
from public.aura_user_feature_snapshots;

