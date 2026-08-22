select 'contract_legacy_rpc_execute_revoked' as check_name,
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

select 'contract_browser_legacy_table_grants' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from information_schema.role_table_grants grants
where grants.table_schema='public'
  and grants.table_name in ('likes','matches')
  and grants.grantee in ('PUBLIC','anon','authenticated');

select 'contract_browser_chat_write_grants' as check_name,
       count(*) as actual_count,
       case when count(*)=0 then 'PASS' else 'FAIL' end as status
from information_schema.role_table_grants grants
where grants.table_schema='public' and grants.table_name='chats'
  and grants.grantee in ('PUBLIC','anon','authenticated')
  and grants.privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER');

select 'contract_chat_select_and_rls_status' as check_name,
       classes.relrowsecurity as rls_enabled,
       has_table_privilege('anon','public.chats','SELECT') as anon_can_select,
       has_table_privilege('authenticated','public.chats','SELECT') as authenticated_can_select,
       'INFO' as status
from pg_class classes
where classes.oid='public.chats'::regclass;

select 'contract_new_rpc_permissions' as check_name,
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

select 'contract_delete_account_permissions' as check_name,
       has_function_privilege('service_role',routines.oid,'EXECUTE') as service_role_can_execute,
       has_function_privilege('anon',routines.oid,'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated',routines.oid,'EXECUTE') as authenticated_can_execute,
       case when has_function_privilege('service_role',routines.oid,'EXECUTE')
                  and not has_function_privilege('anon',routines.oid,'EXECUTE')
                  and not has_function_privilege('authenticated',routines.oid,'EXECUTE')
            then 'PASS' else 'FAIL' end as status
from pg_proc routines
join pg_namespace namespaces on namespaces.oid=routines.pronamespace
where namespaces.nspname='public' and routines.proname='delete_my_account';

select 'contract_service_likes_grants' as check_name,
       string_agg(grants.privilege_type,',' order by grants.privilege_type) as actual_grants,
       case when string_agg(grants.privilege_type,',' order by grants.privilege_type)='DELETE,INSERT,SELECT'
            then 'PASS' else 'FAIL' end as status
from information_schema.role_table_grants grants
where grants.table_schema='public' and grants.table_name='likes' and grants.grantee='service_role';
