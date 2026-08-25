select * from (values
  ('audit table exists','true',(to_regclass('public.aura_admin_audit_log') is not null)::text,case when to_regclass('public.aura_admin_audit_log') is not null then 'PASS' else 'FAIL' end),
  ('audit RLS','true',(select relrowsecurity::text from pg_class where oid='public.aura_admin_audit_log'::regclass),case when (select relrowsecurity from pg_class where oid='public.aura_admin_audit_log'::regclass) then 'PASS' else 'FAIL' end),
  ('audit browser grants','0',(select count(*)::text from information_schema.role_table_grants where table_schema='public' and table_name='aura_admin_audit_log' and grantee in ('PUBLIC','anon','authenticated')),case when not exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name='aura_admin_audit_log' and grantee in ('PUBLIC','anon','authenticated')) then 'PASS' else 'FAIL' end),
  ('overview service execute','true',has_function_privilege('service_role','public.get_aura_admin_overview_v1(text,text)','EXECUTE')::text,case when has_function_privilege('service_role','public.get_aura_admin_overview_v1(text,text)','EXECUTE') then 'PASS' else 'FAIL' end)
) as checks(check_name,expected,actual,status);

select action,count(*) as read_count,min(created_at) as first_read,max(created_at) as latest_read
from public.aura_admin_audit_log group by action order by action;

select count(*) as audit_rows_past_retention from public.aura_admin_audit_log where created_at<now()-interval '365 days';
