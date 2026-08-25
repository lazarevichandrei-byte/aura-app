begin;

create table public.aura_user_feature_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  feature_schema_version integer not null check (feature_schema_version=1),
  snapshot_at timestamptz not null,
  features jsonb not null check (jsonb_typeof(features)='object'),
  created_at timestamptz not null default now(),
  unique (user_id,feature_schema_version,snapshot_at)
);

create index aura_user_feature_snapshots_user_time_idx
  on public.aura_user_feature_snapshots(user_id,snapshot_at desc);
create index aura_user_feature_snapshots_version_time_idx
  on public.aura_user_feature_snapshots(feature_schema_version,snapshot_at desc);
create index aura_user_feature_snapshots_retention_idx
  on public.aura_user_feature_snapshots(snapshot_at);

create table public.aura_pair_feature_snapshots (
  id uuid primary key default gen_random_uuid(),
  viewer_user_id uuid not null references public.users(id) on delete cascade,
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  feature_schema_version integer not null check (feature_schema_version=1),
  snapshot_at timestamptz not null,
  features jsonb not null check (jsonb_typeof(features)='object'),
  created_at timestamptz not null default now(),
  check (viewer_user_id<>candidate_user_id),
  unique (viewer_user_id,candidate_user_id,feature_schema_version,snapshot_at)
);

create index aura_pair_feature_snapshots_pair_time_idx
  on public.aura_pair_feature_snapshots(viewer_user_id,candidate_user_id,snapshot_at desc);
create index aura_pair_feature_snapshots_viewer_time_idx
  on public.aura_pair_feature_snapshots(viewer_user_id,snapshot_at desc);
create index aura_pair_feature_snapshots_version_time_idx
  on public.aura_pair_feature_snapshots(feature_schema_version,snapshot_at desc);
create index aura_pair_feature_snapshots_retention_idx
  on public.aura_pair_feature_snapshots(snapshot_at);

alter table public.aura_user_feature_snapshots enable row level security;
alter table public.aura_pair_feature_snapshots enable row level security;
revoke all on table public.aura_user_feature_snapshots from public,anon,authenticated,service_role;
revoke all on table public.aura_pair_feature_snapshots from public,anon,authenticated,service_role;
grant select,insert,delete on table public.aura_user_feature_snapshots to service_role;
grant select,insert,delete on table public.aura_pair_feature_snapshots to service_role;

create or replace function public.build_aura_user_features_v1(p_user_id uuid,p_snapshot_at timestamptz)
returns jsonb
language sql
stable
security invoker
set search_path=public
as $$
with profile as (
  select coalesce(jsonb_array_length(coalesce(users.photos,'[]'::jsonb)),0) as photo_count,
         nullif(btrim(coalesce(users.bio,'')),'') is not null as has_bio,
         nullif(btrim(coalesce(users.city,'')),'') is not null as has_city
  from public.users where users.id=p_user_id
), actor_events as (
  select event_name,occurred_at
  from public.aura_interaction_events
  where actor_user_id=p_user_id and occurred_at<=p_snapshot_at and occurred_at>=p_snapshot_at-interval '90 days'
), received_events as (
  select event_name,occurred_at
  from public.aura_interaction_events
  where target_user_id=p_user_id and occurred_at<=p_snapshot_at and occurred_at>=p_snapshot_at-interval '30 days'
), aggregates as (
  select
    count(*) filter(where event_name='like' and occurred_at>=p_snapshot_at-interval '7 days')::integer as likes_7d,
    count(*) filter(where event_name='pass' and occurred_at>=p_snapshot_at-interval '7 days')::integer as passes_7d,
    count(distinct (occurred_at at time zone 'UTC')::date) filter(where occurred_at>=p_snapshot_at-interval '7 days')::integer as active_days_7d,
    count(distinct (occurred_at at time zone 'UTC')::date) filter(where occurred_at>=p_snapshot_at-interval '30 days')::integer as active_days_30d,
    max(occurred_at) as last_activity,
    count(*) filter(where event_name='chat_started' and occurred_at>=p_snapshot_at-interval '30 days')::integer as chats_started_30d,
    count(*) filter(where event_name='message_sent_metadata' and occurred_at>=p_snapshot_at-interval '30 days')::integer as messages_sent_30d,
    count(*) filter(where event_name='meet_created' and occurred_at>=p_snapshot_at-interval '30 days')::integer as meet_created_30d,
    count(*) filter(where event_name='meet_join_request' and occurred_at>=p_snapshot_at-interval '30 days')::integer as meet_join_requests_30d,
    count(*) filter(where event_name='block')::integer as blocks_created_90d,
    count(*) filter(where event_name='report')::integer as reports_created_90d
  from actor_events
), received as (
  select count(*) filter(where event_name='profile_impression' and occurred_at>=p_snapshot_at-interval '7 days')::integer as impressions_7d,
         count(*) filter(where event_name='profile_open' and occurred_at>=p_snapshot_at-interval '7 days')::integer as opens_7d,
         count(*) filter(where event_name='meet_join_accepted' and occurred_at>=p_snapshot_at-interval '30 days')::integer as meet_join_accepted_30d
  from received_events
), matches as (
  select count(*)::integer as matches_30d
  from public.dating_matches
  where (user_low_id=p_user_id or user_high_id=p_user_id)
    and created_at<=p_snapshot_at and created_at>=p_snapshot_at-interval '30 days'
), participations as (
  select count(*)::integer as meet_participations_30d
  from public.meet_participants
  where user_id=p_user_id and joined_at<=p_snapshot_at and joined_at>=p_snapshot_at-interval '30 days'
)
select jsonb_build_object(
  'photo_count',profile.photo_count,'has_bio',profile.has_bio,'has_city',profile.has_city,
  'profile_completeness_bucket',case when (case when profile.photo_count>0 then 1 else 0 end)+(case when profile.has_bio then 1 else 0 end)+(case when profile.has_city then 1 else 0 end)<=1 then 'low' when (case when profile.photo_count>0 then 1 else 0 end)+(case when profile.has_bio then 1 else 0 end)+(case when profile.has_city then 1 else 0 end)=2 then 'medium' else 'high' end,
  'likes_7d',aggregates.likes_7d,'passes_7d',aggregates.passes_7d,'matches_30d',matches.matches_30d,
  'profile_impressions_received_7d',received.impressions_7d,'profile_opens_received_7d',received.opens_7d,
  'active_days_7d',aggregates.active_days_7d,'active_days_30d',aggregates.active_days_30d,
  'last_activity_age_bucket',case when aggregates.last_activity is null or aggregates.last_activity<p_snapshot_at-interval '30 days' then '30d_plus' when aggregates.last_activity>=p_snapshot_at-interval '1 day' then 'lt_1d' when aggregates.last_activity>=p_snapshot_at-interval '3 days' then '1_3d' when aggregates.last_activity>=p_snapshot_at-interval '7 days' then '3_7d' else '7_30d' end,
  'chats_started_30d',aggregates.chats_started_30d,'messages_sent_30d',aggregates.messages_sent_30d,
  'meet_created_30d',aggregates.meet_created_30d,'meet_join_requests_30d',aggregates.meet_join_requests_30d,'meet_join_accepted_30d',received.meet_join_accepted_30d,'meet_participations_30d',participations.meet_participations_30d,
  'blocks_created_90d',aggregates.blocks_created_90d,'reports_created_90d',aggregates.reports_created_90d
)
from profile cross join aggregates cross join received cross join matches cross join participations
$$;

create or replace function public.build_aura_pair_features_v1(p_viewer_user_id uuid,p_candidate_user_id uuid,p_snapshot_at timestamptz)
returns jsonb
language plpgsql
stable
security invoker
set search_path=public
as $$
declare result jsonb;
begin
  if p_viewer_user_id=p_candidate_user_id then raise exception 'SELF_PAIR_NOT_ALLOWED'; end if;
  with pair_profiles as (
    select viewer.age as viewer_age,candidate.age as candidate_age,viewer.city as viewer_city,candidate.city as candidate_city
    from public.users viewer cross join public.users candidate
    where viewer.id=p_viewer_user_id and candidate.id=p_candidate_user_id
  ), interactions as (
    select event_name,occurred_at,metadata
    from public.aura_interaction_events
    where actor_user_id=p_viewer_user_id and target_user_id=p_candidate_user_id
      and occurred_at<=p_snapshot_at and occurred_at>=p_snapshot_at-interval '30 days'
  ), interaction_agg as (
    select
      count(*) filter(where event_name='profile_impression' and occurred_at>=p_snapshot_at-interval '7 days')::integer as impressions_7d,
      count(*) filter(where event_name='profile_impression')::integer as impressions_30d,
      count(*) filter(where event_name='profile_open' and occurred_at>=p_snapshot_at-interval '7 days')::integer as opens_7d,
      count(*) filter(where event_name='profile_open')::integer as opens_30d,
      count(*) filter(where event_name='return_to_profile')::integer as returns_30d,
      max(occurred_at) filter(where event_name='profile_impression') as last_impression,
      max(case metadata->>'bucket' when 'lt_2s' then 1 when '2_5s' then 2 when '5_15s' then 3 when '15_30s' then 4 when '30s_plus' then 5 else 0 end) filter(where event_name='profile_dwell_bucket') as dwell_rank
    from interactions
  ), cycles as (
    select cycles.*,
      case when cycles.completed_at is null or cycles.completed_at>p_snapshot_at then 'pending' else cycles.status end as status_at_snapshot
    from public.dating_interaction_cycles cycles
    where cycles.user_low_id=least(p_viewer_user_id,p_candidate_user_id)
      and cycles.user_high_id=greatest(p_viewer_user_id,p_candidate_user_id)
      and cycles.created_at<=p_snapshot_at
    order by cycles.cycle_number desc limit 1
  ), cycle_history as (
    select
      exists(select 1 from public.dating_interaction_cycles c where c.user_low_id=least(p_viewer_user_id,p_candidate_user_id) and c.user_high_id=greatest(p_viewer_user_id,p_candidate_user_id) and c.created_at<=p_snapshot_at and c.initiated_by_user_id=p_viewer_user_id) as viewer_liked,
      exists(select 1 from public.dating_interaction_cycles c where c.user_low_id=least(p_viewer_user_id,p_candidate_user_id) and c.user_high_id=greatest(p_viewer_user_id,p_candidate_user_id) and c.created_at<=p_snapshot_at and c.initiated_by_user_id=p_candidate_user_id) as candidate_liked,
      exists(select 1 from public.dating_interaction_cycles c where c.user_low_id=least(p_viewer_user_id,p_candidate_user_id) and c.user_high_id=greatest(p_viewer_user_id,p_candidate_user_id) and c.created_at<=p_snapshot_at and c.status='rejected' and c.completed_at<=p_snapshot_at) as rejected
  ), relation as (
    select
      exists(select 1 from public.dating_matches m where m.user_low_id=least(p_viewer_user_id,p_candidate_user_id) and m.user_high_id=greatest(p_viewer_user_id,p_candidate_user_id) and m.created_at<=p_snapshot_at) as matched,
      exists(select 1 from public.chats c where c.event_id is null and c.direct_user_low_id=least(p_viewer_user_id,p_candidate_user_id) and c.direct_user_high_id=greatest(p_viewer_user_id,p_candidate_user_id) and c.created_at<=p_snapshot_at) as direct_chat,
      exists(select 1 from public.aura_interaction_events e where e.event_name='chat_started' and e.occurred_at<=p_snapshot_at and ((e.actor_user_id=p_viewer_user_id and e.target_user_id=p_candidate_user_id) or (e.actor_user_id=p_candidate_user_id and e.target_user_id=p_viewer_user_id))) as chat_started
  ), viewer_meets as (
    select id from public.meet_events where creator_id=p_viewer_user_id and created_at<=p_snapshot_at and created_at>=p_snapshot_at-interval '90 days'
    union select event_id from public.meet_participants where user_id=p_viewer_user_id and joined_at<=p_snapshot_at and joined_at>=p_snapshot_at-interval '90 days'
  ), candidate_meets as (
    select id from public.meet_events where creator_id=p_candidate_user_id and created_at<=p_snapshot_at and created_at>=p_snapshot_at-interval '90 days'
    union select event_id from public.meet_participants where user_id=p_candidate_user_id and joined_at<=p_snapshot_at and joined_at>=p_snapshot_at-interval '90 days'
  ), meets as (
    select (select count(*)::integer from viewer_meets join candidate_meets using(id)) as shared_count,
      exists(select 1 from public.meet_events e join public.meet_participants p on p.event_id=e.id where e.creator_id=p_candidate_user_id and p.user_id=p_viewer_user_id and e.created_at>=p_snapshot_at-interval '90 days' and e.created_at<=p_snapshot_at and p.joined_at<=p_snapshot_at) as viewer_joined,
      exists(select 1 from public.meet_events e join public.meet_participants p on p.event_id=e.id where e.creator_id=p_viewer_user_id and p.user_id=p_candidate_user_id and e.created_at>=p_snapshot_at-interval '90 days' and e.created_at<=p_snapshot_at and p.joined_at<=p_snapshot_at) as candidate_joined
  )
  select jsonb_build_object(
    'impressions_7d',interaction_agg.impressions_7d,'impressions_30d',interaction_agg.impressions_30d,'opens_7d',interaction_agg.opens_7d,'opens_30d',interaction_agg.opens_30d,'return_to_profile_30d',interaction_agg.returns_30d,
    'max_dwell_bucket_30d',case coalesce(interaction_agg.dwell_rank,0) when 1 then 'lt_2s' when 2 then '2_5s' when 3 then '5_15s' when 4 then '15_30s' when 5 then '30s_plus' else 'none' end,
    'recent_impression_age_bucket',case when interaction_agg.last_impression is null then 'none' when interaction_agg.last_impression>=p_snapshot_at-interval '1 hour' then 'lt_1h' when interaction_agg.last_impression>=p_snapshot_at-interval '1 day' then '1_24h' when interaction_agg.last_impression>=p_snapshot_at-interval '7 days' then '1_7d' when interaction_agg.last_impression>=p_snapshot_at-interval '30 days' then '7_30d' else '30d_plus' end,
    'prior_like_from_viewer',cycle_history.viewer_liked,'prior_like_from_candidate',cycle_history.candidate_liked,'prior_match',relation.matched,'prior_reject',cycle_history.rejected,
    'current_cycle_status',coalesce(cycles.status_at_snapshot,'none'),'cooldown_active',coalesce(cycles.completed_at<=p_snapshot_at and cycles.cooldown_until>p_snapshot_at,false),
    'has_existing_direct_chat',relation.direct_chat,'prior_chat_started',relation.chat_started,
    'shared_meet_count_90d',meets.shared_count,'viewer_joined_candidate_meet_90d',meets.viewer_joined,'candidate_joined_viewer_meet_90d',meets.candidate_joined,
    'age_difference',case when pair_profiles.viewer_age is null or pair_profiles.candidate_age is null then null else abs(pair_profiles.viewer_age-pair_profiles.candidate_age) end,
    'same_city',case when nullif(btrim(coalesce(pair_profiles.viewer_city,'')),'') is null or nullif(btrim(coalesce(pair_profiles.candidate_city,'')),'') is null then null else lower(btrim(pair_profiles.viewer_city))=lower(btrim(pair_profiles.candidate_city)) end
  ) into result
  from pair_profiles cross join interaction_agg cross join cycle_history cross join relation cross join meets left join cycles on true;
  if result is null then raise exception 'PAIR_USER_NOT_FOUND'; end if;
  return result;
end $$;

create or replace function public.cleanup_aura_feature_snapshots(p_batch_size integer default 5000)
returns jsonb
language plpgsql
volatile
security invoker
set search_path=public
as $$
declare user_deleted integer;pair_deleted integer;bounded_size integer:=greatest(1,least(coalesce(p_batch_size,5000),10000));
begin
  with expired as (select id from public.aura_user_feature_snapshots where snapshot_at<now()-interval '180 days' order by snapshot_at limit bounded_size)
  delete from public.aura_user_feature_snapshots snapshots using expired where snapshots.id=expired.id;
  get diagnostics user_deleted=row_count;
  with expired as (select id from public.aura_pair_feature_snapshots where snapshot_at<now()-interval '180 days' order by snapshot_at limit bounded_size)
  delete from public.aura_pair_feature_snapshots snapshots using expired where snapshots.id=expired.id;
  get diagnostics pair_deleted=row_count;
  return jsonb_build_object('user_deleted',user_deleted,'pair_deleted',pair_deleted);
end $$;

revoke all on function public.build_aura_user_features_v1(uuid,timestamptz) from public,anon,authenticated,service_role;
revoke all on function public.build_aura_pair_features_v1(uuid,uuid,timestamptz) from public,anon,authenticated,service_role;
revoke all on function public.cleanup_aura_feature_snapshots(integer) from public,anon,authenticated,service_role;
grant execute on function public.build_aura_user_features_v1(uuid,timestamptz) to service_role;
grant execute on function public.build_aura_pair_features_v1(uuid,uuid,timestamptz) to service_role;
grant execute on function public.cleanup_aura_feature_snapshots(integer) to service_role;

commit;
