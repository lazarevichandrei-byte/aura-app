begin;

create table public.aura_admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.users(id) on delete set null,
  admin_telegram_id text not null check (admin_telegram_id~'^[1-9][0-9]*$'),
  action text not null check (action in ('AURA_ADMIN_OVERVIEW_VIEW','AURA_ADMIN_PAIR_DEBUG_VIEW')),
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now()
);

create index aura_admin_audit_log_created_idx on public.aura_admin_audit_log(created_at desc);
create index aura_match_outcomes_window_evaluated_idx on public.aura_match_outcomes(window_type,evaluated_at desc);

alter table public.aura_admin_audit_log enable row level security;
revoke all on table public.aura_admin_audit_log from public,anon,authenticated,service_role;
grant select,insert,delete on table public.aura_admin_audit_log to service_role;

create or replace function public.get_aura_admin_overview_v1(p_timeframe text default '7d',p_outcome_window text default '24h')
returns jsonb
language plpgsql
stable
security invoker
set search_path=public
as $$
declare
  timeframe_interval interval;
  cutoff timestamptz;
  generated_at timestamptz:=now();
  result jsonb;
begin
  timeframe_interval:=case p_timeframe when '24h' then interval '24 hours' when '7d' then interval '7 days' when '30d' then interval '30 days' else null end;
  if timeframe_interval is null then raise exception 'INVALID_ADMIN_TIMEFRAME'; end if;
  if p_outcome_window not in ('24h','7d','30d') then raise exception 'INVALID_ADMIN_OUTCOME_WINDOW'; end if;
  cutoff:=generated_at-timeframe_interval;

  with
  score_buckets(bucket,low_score,high_score) as (values ('0-19',0,19),('20-39',20,39),('40-59',40,59),('60-79',60,79),('80-100',80,100)),
  horizon_windows(window_type,window_interval) as (values ('24h',interval '24 hours'),('7d',interval '7 days'),('30d',interval '30 days')),
  event_stats as (
    select count(*) filter(where received_at>=generated_at-interval '1 hour')::integer as last_1h,
      count(*) filter(where received_at>=generated_at-interval '24 hours')::integer as last_24h,
      count(*) filter(where received_at>=cutoff)::integer as timeframe_count,
      (select max(latest.received_at) from public.aura_interaction_events latest) as latest_received_at,
      count(*) filter(where received_at>=cutoff and source_type='client')::integer as client_count,
      count(*) filter(where received_at>=cutoff and source_type='server')::integer as server_count
    from public.aura_interaction_events where received_at>=least(cutoff,generated_at-interval '24 hours')
  ), feature_stats as (
    select
      (select count(*)::integer from public.aura_user_feature_snapshots where snapshot_at>=generated_at-interval '24 hours') as user_24h,
      (select count(*)::integer from public.aura_pair_feature_snapshots where snapshot_at>=generated_at-interval '24 hours') as pair_24h,
      greatest((select max(snapshot_at) from public.aura_user_feature_snapshots),(select max(snapshot_at) from public.aura_pair_feature_snapshots)) as latest_snapshot_at
  ), score_stats as (
    select count(*) filter(where snapshot_at>=generated_at-interval '24 hours')::integer as last_24h,
      count(*) filter(where snapshot_at>=cutoff)::integer as timeframe_count,(select max(latest.snapshot_at) from public.aura_match_score_snapshots latest) as latest_snapshot_at
    from public.aura_match_score_snapshots where snapshot_at>=least(cutoff,generated_at-interval '24 hours')
  ), score_distribution as (
    select bucket.bucket,count(score.id)::integer as count
    from score_buckets bucket left join public.aura_match_score_snapshots score on score.total_score between bucket.low_score and bucket.high_score and score.snapshot_at>=cutoff
    group by bucket.bucket,bucket.low_score order by bucket.low_score
  ), score_distribution_percent as (
    select bucket,count,case when sum(count) over()>0 then round(count::numeric*100/sum(count) over(),2) else 0 end as percent from score_distribution
  ), score_distribution_json as (
    select jsonb_agg(jsonb_build_object('bucket',bucket,'count',count,'percent',percent) order by case bucket when '0-19' then 1 when '20-39' then 2 when '40-59' then 3 when '60-79' then 4 else 5 end) as value from score_distribution_percent
  ), eligible as (
    select horizon.window_type,event.id
    from horizon_windows horizon join public.aura_interaction_events event on event.event_name='profile_impression' and event.source_type='client' and event.entity_type='user' and event.target_user_id is not null
      and event.occurred_at>=cutoff and event.occurred_at+horizon.window_interval<=generated_at
  ), coverage as (
    select horizon.window_type,count(eligible.id)::integer as eligible_anchors,count(outcome.id)::integer as materialized,(count(eligible.id)-count(outcome.id))::integer as missing
    from horizon_windows horizon left join eligible on eligible.window_type=horizon.window_type
    left join public.aura_match_outcomes outcome on outcome.anchor_event_id=eligible.id and outcome.outcome_schema_version=1 and outcome.window_type=horizon.window_type
    group by horizon.window_type
  ), coverage_json as (
    select jsonb_agg(jsonb_build_object('windowType',window_type,'eligibleAnchors',eligible_anchors,'materialized',materialized,'missing',missing,'coverageRate',case when eligible_anchors>0 then round(materialized::numeric/eligible_anchors,4) else 0 end) order by case window_type when '24h' then 1 when '7d' then 2 else 3 end) as value from coverage
  ), outcome_stats as (
    select count(*) filter(where window_type='24h')::integer as count_24h,count(*) filter(where window_type='7d')::integer as count_7d,count(*) filter(where window_type='30d')::integer as count_30d,
      max(evaluated_at) as latest_evaluated_at,count(*) filter(where score_snapshot_id is null)::integer as null_score_links,
      count(*) filter(where window_type=p_outcome_window and evaluated_at>=cutoff)::integer as selected_count
    from public.aura_match_outcomes
  ), linked_outcomes as (
    select score.total_score,outcome.outcomes
    from public.aura_match_outcomes outcome join public.aura_match_score_snapshots score on score.id=outcome.score_snapshot_id
    where outcome.window_type=p_outcome_window and outcome.evaluated_at>=cutoff
  ), bucket_outcomes as (
    select bucket.bucket,linked.outcomes
    from score_buckets bucket left join linked_outcomes linked on linked.total_score between bucket.low_score and bucket.high_score
  ), outcome_rates as (
    select bucket,count(outcomes)::integer as count,
      coalesce(round(avg(case when (outcomes->>'profile_opened')::boolean then 1 else 0 end),4),0) as open_rate,
      coalesce(round(avg(case when (outcomes->>'liked')::boolean then 1 else 0 end),4),0) as like_rate,
      coalesce(round(avg(case when (outcomes->>'passed')::boolean then 1 else 0 end),4),0) as pass_rate,
      coalesce(round(avg(case when (outcomes->>'matched')::boolean then 1 else 0 end),4),0) as match_rate,
      coalesce(round(avg(case when (outcomes->>'chat_started')::boolean then 1 else 0 end),4),0) as chat_rate,
      coalesce(round(avg(case when (outcomes->>'shared_meet_activity')::boolean then 1 else 0 end),4),0) as meet_rate,
      coalesce(round(avg(case when (outcomes->>'blocked')::boolean then 1 else 0 end),4),0) as block_rate,
      coalesce(round(avg(case when (outcomes->>'reported')::boolean then 1 else 0 end),4),0) as report_rate
    from bucket_outcomes group by bucket
  ), outcome_rates_json as (
    select jsonb_agg(jsonb_build_object('bucket',bucket,'count',count,'openRate',open_rate,'likeRate',like_rate,'passRate',pass_rate,'matchRate',match_rate,'chatStartRate',chat_rate,'meetActivityRate',meet_rate,'blockRate',block_rate,'reportRate',report_rate) order by case bucket when '0-19' then 1 when '20-39' then 2 when '40-59' then 3 when '60-79' then 4 else 5 end) as value from outcome_rates
  )
  select jsonb_build_object(
    'generatedAt',generated_at,'timeframe',p_timeframe,'outcomeWindow',p_outcome_window,
    'events',jsonb_build_object('last1h',event_stats.last_1h,'last24h',event_stats.last_24h,'timeframeCount',event_stats.timeframe_count,'latestReceivedAt',event_stats.latest_received_at,'clientCount',event_stats.client_count,'serverCount',event_stats.server_count,'health',case when event_stats.latest_received_at is null then 'empty' when event_stats.latest_received_at>=generated_at-interval '15 minutes' then 'healthy' else 'stale' end),
    'features',jsonb_build_object('userLast24h',feature_stats.user_24h,'pairLast24h',feature_stats.pair_24h,'latestSnapshotAt',feature_stats.latest_snapshot_at,'health',case when feature_stats.latest_snapshot_at is null then 'empty' when feature_stats.latest_snapshot_at>=generated_at-interval '36 hours' then 'healthy' else 'stale' end),
    'scores',jsonb_build_object('last24h',score_stats.last_24h,'timeframeCount',score_stats.timeframe_count,'latestSnapshotAt',score_stats.latest_snapshot_at,'health',case when score_stats.latest_snapshot_at is null then 'empty' when score_stats.latest_snapshot_at>=generated_at-interval '36 hours' then 'healthy' else 'stale' end,'distribution',score_distribution_json.value),
    'outcomes',jsonb_build_object('totalByWindow',jsonb_build_object('24h',outcome_stats.count_24h,'7d',outcome_stats.count_7d,'30d',outcome_stats.count_30d),'latestEvaluatedAt',outcome_stats.latest_evaluated_at,'nullScoreLinks',outcome_stats.null_score_links,'selectedCount',outcome_stats.selected_count,'health',case when selected_coverage.eligible_anchors=0 then 'empty' when selected_coverage.missing=0 then 'healthy' else 'gap' end),
    'coverage',coverage_json.value,'scoreOutcome',outcome_rates_json.value
  ) into result
  from event_stats cross join feature_stats cross join score_stats cross join score_distribution_json cross join outcome_stats cross join coverage_json cross join outcome_rates_json
  cross join lateral (select * from coverage where window_type=p_outcome_window) selected_coverage;
  return result;
end $$;

create or replace function public.cleanup_aura_admin_audit_log(p_batch_size integer default 5000)
returns integer language plpgsql volatile security invoker set search_path=public as $$
declare deleted_count integer;bounded_size integer:=greatest(1,least(coalesce(p_batch_size,5000),10000));
begin
  with expired as (select id from public.aura_admin_audit_log where created_at<now()-interval '365 days' order by created_at limit bounded_size)
  delete from public.aura_admin_audit_log audit using expired where audit.id=expired.id;
  get diagnostics deleted_count=row_count;return deleted_count;
end $$;

revoke all on function public.get_aura_admin_overview_v1(text,text) from public,anon,authenticated,service_role;
revoke all on function public.cleanup_aura_admin_audit_log(integer) from public,anon,authenticated,service_role;
grant execute on function public.get_aura_admin_overview_v1(text,text) to service_role;
grant execute on function public.cleanup_aura_admin_audit_log(integer) to service_role;

commit;
