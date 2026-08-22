with function_definitions as (
  select
    pg_get_functiondef('public.dating_reject_cooldown_interval()'::regprocedure) as reject_definition,
    pg_get_functiondef('public.dating_match_cooldown_interval()'::regprocedure) as match_definition,
    pg_get_functiondef('public.process_dating_action(uuid,uuid,text)'::regprocedure) as action_definition,
    pg_get_functiondef('public.get_dating_feed(uuid,integer,uuid[])'::regprocedure) as feed_definition
), checks(check_name,expected,actual,status) as (
  select
    'reject cooldown definition','2 minutes',reject_definition,
    case when reject_definition like '%2 minutes%' then 'PASS' else 'FAIL' end
  from function_definitions

  union all
  select
    'match cooldown definition','2 days',match_definition,
    case when match_definition like '%2 days%' then 'PASS' else 'FAIL' end
  from function_definitions

  union all
  select
    'pending cycles without cooldown','0',count(*)::text,
    case when count(*)=0 then 'PASS' else 'FAIL' end
  from public.dating_interaction_cycles
  where status='pending' and (completed_at is not null or cooldown_until is not null)

  union all
  select
    'rejected cooldown upper bound','0',count(*)::text,
    case when count(*)=0 then 'PASS' else 'FAIL' end
  from public.dating_interaction_cycles
  where status='rejected' and cooldown_until>completed_at+interval '2 minutes'

  union all
  select
    'matched cooldown upper bound','0',count(*)::text,
    case when count(*)=0 then 'PASS' else 'FAIL' end
  from public.dating_interaction_cycles
  where status='matched' and cooldown_until>completed_at+interval '2 days'

  union all
  select
    'process action uses cooldown functions','reject + match functions',action_definition,
    case when action_definition like '%dating_reject_cooldown_interval()%'
           and action_definition like '%dating_match_cooldown_interval()%'
         then 'PASS' else 'FAIL' end
  from function_definitions

  union all
  select
    'directional feed preserved','incoming pending recipient visible',feed_definition,
    case when feed_definition like '%interaction_status=''pending''%'
           and feed_definition like '%recipient_user_id=p_user_id%'
         then 'PASS' else 'FAIL' end
  from function_definitions

  union all
  select
    'feed has no chat exclusion','no public.chats reference',feed_definition,
    case when feed_definition not like '%public.chats%' then 'PASS' else 'FAIL' end
  from function_definitions

  union all
  select
    'browser RPC execute','0',count(*)::text,
    case when count(*)=0 then 'PASS' else 'FAIL' end
  from information_schema.routine_privileges
  where specific_schema='public'
    and routine_name in (
      'dating_reject_cooldown_interval',
      'dating_match_cooldown_interval',
      'process_dating_action',
      'get_dating_feed'
    )
    and grantee in ('PUBLIC','anon','authenticated')
    and privilege_type='EXECUTE'

  union all
  select
    'service role RPC execute','4',count(distinct routine_name)::text,
    case when count(distinct routine_name)=4 then 'PASS' else 'FAIL' end
  from information_schema.routine_privileges
  where specific_schema='public'
    and routine_name in (
      'dating_reject_cooldown_interval',
      'dating_match_cooldown_interval',
      'process_dating_action',
      'get_dating_feed'
    )
    and grantee='service_role'
    and privilege_type='EXECUTE'
)
select check_name,expected,actual,status
from checks
order by check_name;
