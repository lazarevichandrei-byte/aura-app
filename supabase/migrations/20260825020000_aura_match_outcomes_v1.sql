begin;

create table public.aura_match_outcomes (
  id uuid primary key default gen_random_uuid(),
  viewer_user_id uuid not null references public.users(id) on delete cascade,
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  anchor_event_id uuid not null references public.aura_interaction_events(id) on delete cascade,
  outcome_schema_version integer not null check (outcome_schema_version=1),
  window_type text not null check (window_type in ('24h','7d','30d')),
  anchor_at timestamptz not null,
  window_ends_at timestamptz not null,
  evaluated_at timestamptz not null,
  is_window_complete boolean not null check (is_window_complete=true),
  score_version integer check (score_version is null or score_version=1),
  feature_schema_version integer check (feature_schema_version is null or feature_schema_version=1),
  score_snapshot_id uuid references public.aura_match_score_snapshots(id) on delete set null,
  anchor_context jsonb not null check (jsonb_typeof(anchor_context)='object'),
  outcomes jsonb not null check (
    jsonb_typeof(outcomes)='object'
    and outcomes ?& array['profile_opened','return_to_profile','liked','passed','matched','chat_started','messages_sent_by_viewer','messages_sent_by_candidate','shared_meet_activity','viewer_joined_candidate_meet','candidate_joined_viewer_meet','blocked','reported']
    and (outcomes-array['profile_opened','return_to_profile','liked','passed','matched','chat_started','messages_sent_by_viewer','messages_sent_by_candidate','shared_meet_activity','viewer_joined_candidate_meet','candidate_joined_viewer_meet','blocked','reported']::text[])='{}'::jsonb
    and jsonb_typeof(outcomes->'profile_opened')='boolean'
    and jsonb_typeof(outcomes->'return_to_profile')='boolean'
    and jsonb_typeof(outcomes->'liked')='boolean'
    and jsonb_typeof(outcomes->'passed')='boolean'
    and jsonb_typeof(outcomes->'matched')='boolean'
    and jsonb_typeof(outcomes->'chat_started')='boolean'
    and jsonb_typeof(outcomes->'messages_sent_by_viewer')='number'
    and jsonb_typeof(outcomes->'messages_sent_by_candidate')='number'
    and (outcomes->>'messages_sent_by_viewer')::numeric>=0
    and (outcomes->>'messages_sent_by_candidate')::numeric>=0
    and jsonb_typeof(outcomes->'shared_meet_activity')='boolean'
    and jsonb_typeof(outcomes->'viewer_joined_candidate_meet')='boolean'
    and jsonb_typeof(outcomes->'candidate_joined_viewer_meet')='boolean'
    and jsonb_typeof(outcomes->'blocked')='boolean'
    and jsonb_typeof(outcomes->'reported')='boolean'
  ),
  created_at timestamptz not null default now(),
  check (viewer_user_id<>candidate_user_id),
  check (window_ends_at>anchor_at and evaluated_at>=window_ends_at),
  check ((score_version is null and feature_schema_version is null) or (score_version=1 and feature_schema_version=1)),
  check (score_snapshot_id is null or (score_version=1 and feature_schema_version=1)),
  unique (anchor_event_id,outcome_schema_version,window_type)
);

create index aura_match_outcomes_pair_anchor_idx on public.aura_match_outcomes(viewer_user_id,candidate_user_id,anchor_at desc);
create index aura_match_outcomes_window_time_idx on public.aura_match_outcomes(window_type,anchor_at desc);
create index aura_match_outcomes_score_idx on public.aura_match_outcomes(score_snapshot_id) where score_snapshot_id is not null;
create index aura_match_outcomes_retention_idx on public.aura_match_outcomes(created_at);

-- Existing actor/target/name indexes cannot serve the combined directional window predicate.
create index aura_events_actor_target_name_time_idx
  on public.aura_interaction_events(actor_user_id,target_user_id,event_name,occurred_at)
  where target_user_id is not null;

alter table public.aura_match_outcomes enable row level security;
revoke all on table public.aura_match_outcomes from public,anon,authenticated,service_role;
grant select,insert,delete on table public.aura_match_outcomes to service_role;

-- Preserve only impression anchors referenced by retained outcomes; otherwise the
-- requested ON DELETE CASCADE FK would reduce outcome retention to event retention.
create or replace function public.cleanup_aura_interaction_events(p_batch_size integer default 5000)
returns integer
language plpgsql
volatile
security invoker
set search_path=public
as $$
declare deleted_count integer;
begin
  with expired as (
    select event.id
    from public.aura_interaction_events event
    where event.received_at<now()-interval '90 days'
      and not exists(select 1 from public.aura_match_outcomes outcome where outcome.anchor_event_id=event.id)
    order by event.received_at
    limit greatest(1,least(coalesce(p_batch_size,5000),10000))
  )
  delete from public.aura_interaction_events events using expired where events.id=expired.id;
  get diagnostics deleted_count=row_count;
  return deleted_count;
end $$;

create or replace function public.build_aura_match_outcome_v1(p_anchor_event_id uuid,p_window_type text,p_evaluated_at timestamptz)
returns jsonb
language plpgsql
stable
security invoker
set search_path=public
as $$
declare
  anchor public.aura_interaction_events%rowtype;
  window_ends timestamptz;
  linked_score public.aura_match_score_snapshots%rowtype;
  result jsonb;
begin
  if p_window_type not in ('24h','7d','30d') then raise exception 'INVALID_OUTCOME_WINDOW'; end if;
  select * into anchor from public.aura_interaction_events where id=p_anchor_event_id;
  if not found then raise exception 'OUTCOME_ANCHOR_NOT_FOUND'; end if;
  if anchor.event_name<>'profile_impression' or anchor.source_type<>'client' or anchor.entity_type<>'user' or anchor.target_user_id is null then raise exception 'INVALID_OUTCOME_ANCHOR'; end if;
  window_ends:=anchor.occurred_at+case p_window_type when '24h' then interval '24 hours' when '7d' then interval '7 days' else interval '30 days' end;
  if p_evaluated_at<window_ends then raise exception 'WINDOW_NOT_COMPLETE'; end if;

  select * into linked_score
  from public.aura_match_score_snapshots score
  where score.viewer_user_id=anchor.actor_user_id and score.candidate_user_id=anchor.target_user_id
    and score.feature_schema_version=1 and score.score_version=1 and score.snapshot_at<=anchor.occurred_at
  order by score.snapshot_at desc limit 1;

  with pair_events as (
    select event_name,actor_user_id,target_user_id,metadata
    from public.aura_interaction_events
    where occurred_at>anchor.occurred_at and occurred_at<=window_ends
      and ((actor_user_id=anchor.actor_user_id and target_user_id=anchor.target_user_id)
        or (actor_user_id=anchor.target_user_id and target_user_id=anchor.actor_user_id))
  ), messages as (
    select
      count(*) filter(where event.actor_user_id=anchor.actor_user_id)::integer as viewer_count,
      count(*) filter(where event.actor_user_id=anchor.target_user_id)::integer as candidate_count
    from public.aura_interaction_events event
    join public.chats chat on chat.id::text=event.metadata->>'chat_id'
      and chat.event_id is null
      and chat.direct_user_low_id=least(anchor.actor_user_id,anchor.target_user_id)
      and chat.direct_user_high_id=greatest(anchor.actor_user_id,anchor.target_user_id)
    where event.event_name='message_sent_metadata'
      and event.occurred_at>anchor.occurred_at and event.occurred_at<=window_ends
      and event.actor_user_id in (anchor.actor_user_id,anchor.target_user_id)
  ), outcome_values as (
    select
      exists(select 1 from pair_events where event_name='profile_open' and actor_user_id=anchor.actor_user_id) as profile_opened,
      exists(select 1 from pair_events where event_name='return_to_profile' and actor_user_id=anchor.actor_user_id) as returned,
      exists(select 1 from pair_events where event_name='like' and actor_user_id=anchor.actor_user_id) as liked,
      exists(select 1 from pair_events where event_name='pass' and actor_user_id=anchor.actor_user_id) as passed,
      exists(select 1 from pair_events where event_name='match_created') as matched,
      exists(select 1 from pair_events where event_name='chat_started') as chat_started,
      exists(select 1 from pair_events where event_name='meet_join_accepted' and actor_user_id=anchor.target_user_id and target_user_id=anchor.actor_user_id) as viewer_joined,
      exists(select 1 from pair_events where event_name='meet_join_accepted' and actor_user_id=anchor.actor_user_id and target_user_id=anchor.target_user_id) as candidate_joined,
      exists(select 1 from pair_events where event_name='block' and actor_user_id=anchor.actor_user_id) as blocked,
      exists(select 1 from pair_events where event_name='report' and actor_user_id=anchor.actor_user_id) as reported
  )
  select jsonb_build_object(
    'outcomeSchemaVersion',1,
    'viewerUserId',anchor.actor_user_id,
    'candidateUserId',anchor.target_user_id,
    'anchorEventId',anchor.id,
    'anchorAt',anchor.occurred_at,
    'windowType',p_window_type,
    'windowEndsAt',window_ends,
    'evaluatedAt',p_evaluated_at,
    'scoreSnapshotId',case when linked_score.id is null then null else linked_score.id end,
    'scoreVersion',case when linked_score.id is null then null else linked_score.score_version end,
    'featureSchemaVersion',case when linked_score.id is null then null else linked_score.feature_schema_version end,
    'anchorContext',jsonb_build_object('source',anchor.metadata->>'source','position_bucket',anchor.metadata->>'position_bucket'),
    'outcomes',jsonb_build_object(
      'profile_opened',outcome_values.profile_opened,
      'return_to_profile',outcome_values.returned,
      'liked',outcome_values.liked,
      'passed',outcome_values.passed,
      'matched',outcome_values.matched,
      'chat_started',outcome_values.chat_started,
      'messages_sent_by_viewer',messages.viewer_count,
      'messages_sent_by_candidate',messages.candidate_count,
      'shared_meet_activity',outcome_values.viewer_joined or outcome_values.candidate_joined,
      'viewer_joined_candidate_meet',outcome_values.viewer_joined,
      'candidate_joined_viewer_meet',outcome_values.candidate_joined,
      'blocked',outcome_values.blocked,
      'reported',outcome_values.reported
    )
  ) into result from outcome_values cross join messages;
  return result;
end $$;

create or replace function public.find_pending_aura_outcome_anchors_v1(p_window_type text,p_evaluated_at timestamptz,p_batch_size integer default 100)
returns table(anchor_event_id uuid)
language plpgsql
stable
security invoker
set search_path=public
as $$
declare window_interval interval; bounded_size integer:=greatest(1,least(coalesce(p_batch_size,100),500));
begin
  window_interval:=case p_window_type when '24h' then interval '24 hours' when '7d' then interval '7 days' when '30d' then interval '30 days' else null end;
  if window_interval is null then raise exception 'INVALID_OUTCOME_WINDOW'; end if;
  return query
  select event.id
  from public.aura_interaction_events event
  where event.event_name='profile_impression' and event.source_type='client' and event.entity_type='user' and event.target_user_id is not null
    and event.occurred_at+window_interval<=p_evaluated_at
    and not exists(select 1 from public.aura_match_outcomes outcome where outcome.anchor_event_id=event.id and outcome.outcome_schema_version=1 and outcome.window_type=p_window_type)
  order by event.occurred_at
  limit bounded_size;
end $$;

create or replace function public.cleanup_aura_match_outcomes(p_batch_size integer default 5000)
returns integer
language plpgsql
volatile
security invoker
set search_path=public
as $$
declare deleted_count integer; bounded_size integer:=greatest(1,least(coalesce(p_batch_size,5000),10000));
begin
  with expired as (select id from public.aura_match_outcomes where created_at<now()-interval '365 days' order by created_at limit bounded_size)
  delete from public.aura_match_outcomes outcomes using expired where outcomes.id=expired.id;
  get diagnostics deleted_count=row_count;
  return deleted_count;
end $$;

revoke all on function public.build_aura_match_outcome_v1(uuid,text,timestamptz) from public,anon,authenticated,service_role;
revoke all on function public.find_pending_aura_outcome_anchors_v1(text,timestamptz,integer) from public,anon,authenticated,service_role;
revoke all on function public.cleanup_aura_match_outcomes(integer) from public,anon,authenticated,service_role;
grant execute on function public.build_aura_match_outcome_v1(uuid,text,timestamptz) to service_role;
grant execute on function public.find_pending_aura_outcome_anchors_v1(text,timestamptz,integer) to service_role;
grant execute on function public.cleanup_aura_match_outcomes(integer) to service_role;

commit;
