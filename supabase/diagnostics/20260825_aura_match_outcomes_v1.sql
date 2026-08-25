with windows(window_type,window_interval) as (values ('24h',interval '24 hours'),('7d',interval '7 days'),('30d',interval '30 days')),
eligible as (
  select windows.window_type,event.id
  from windows cross join public.aura_interaction_events event
  where event.event_name='profile_impression' and event.source_type='client' and event.entity_type='user' and event.target_user_id is not null
    and event.occurred_at+windows.window_interval<=now()
)
select eligible.window_type,count(*) as eligible_anchors,count(*) filter(where outcome.id is null) as missing_outcomes
from eligible left join public.aura_match_outcomes outcome on outcome.anchor_event_id=eligible.id and outcome.outcome_schema_version=1 and outcome.window_type=eligible.window_type
group by eligible.window_type order by eligible.window_type;

select window_type,count(*) as outcome_count,count(*) filter(where score_snapshot_id is null) as null_score_links,
  round(avg(case when (outcomes->>'liked')::boolean then 1 else 0 end),4) as like_rate,
  round(avg(case when (outcomes->>'matched')::boolean then 1 else 0 end),4) as matched_rate
from public.aura_match_outcomes
where outcome_schema_version=1
group by window_type order by window_type;

select * from (values
  ('outcomes table exists','true',(to_regclass('public.aura_match_outcomes') is not null)::text,case when to_regclass('public.aura_match_outcomes') is not null then 'PASS' else 'FAIL' end),
  ('RLS','true',(select relrowsecurity::text from pg_class where oid='public.aura_match_outcomes'::regclass),case when (select relrowsecurity from pg_class where oid='public.aura_match_outcomes'::regclass) then 'PASS' else 'FAIL' end),
  ('browser grants','0',(select count(*)::text from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_outcomes' and grantee in ('PUBLIC','anon','authenticated')),case when not exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_outcomes' and grantee in ('PUBLIC','anon','authenticated')) then 'PASS' else 'FAIL' end),
  ('service grants','DELETE,INSERT,SELECT',(select string_agg(privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_outcomes' and grantee='service_role'),case when (select string_agg(privilege_type,',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name='aura_match_outcomes' and grantee='service_role')='DELETE,INSERT,SELECT' then 'PASS' else 'FAIL' end)
) as checks(check_name,expected,actual,status);
