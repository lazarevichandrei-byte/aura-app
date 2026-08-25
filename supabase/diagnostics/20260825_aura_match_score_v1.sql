select * from (values
  ('score table exists','true',(to_regclass('public.aura_match_score_snapshots') is not null)::text,case when to_regclass('public.aura_match_score_snapshots') is not null then 'PASS' else 'FAIL' end),
  ('RLS','true',(select relrowsecurity::text from pg_class where oid='public.aura_match_score_snapshots'::regclass),case when (select relrowsecurity from pg_class where oid='public.aura_match_score_snapshots'::regclass) then 'PASS' else 'FAIL' end),
  ('browser grants','0',(select count(*)::text from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_score_snapshots' and grantee in ('PUBLIC','anon','authenticated')),case when not exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_score_snapshots' and grantee in ('PUBLIC','anon','authenticated')) then 'PASS' else 'FAIL' end),
  ('service grants','DELETE,INSERT,SELECT',(select string_agg(privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_score_snapshots' and grantee='service_role'),case when (select string_agg(privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_score_snapshots' and grantee='service_role')='DELETE,INSERT,SELECT' then 'PASS' else 'FAIL' end),
  ('cleanup execute','true',has_function_privilege('service_role','public.cleanup_aura_match_score_snapshots(integer)','EXECUTE')::text,case when has_function_privilege('service_role','public.cleanup_aura_match_score_snapshots(integer)','EXECUTE') then 'PASS' else 'FAIL' end)
) as checks(check_name,expected,actual,status);

select feature_schema_version,score_version,count(*) as rows,min(total_score) as min_score,max(total_score) as max_score
from public.aura_match_score_snapshots group by feature_schema_version,score_version order by feature_schema_version,score_version;

select count(*) as past_retention from public.aura_match_score_snapshots where snapshot_at<now()-interval '180 days';
