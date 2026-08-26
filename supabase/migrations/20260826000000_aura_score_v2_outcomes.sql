begin;

-- Score V2 is still feature schema V1. Outcomes must be able to reference both
-- the historical V1 baseline and the current V2 shadow score.
do $$
declare constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid='public.aura_match_outcomes'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%score_version%'
  loop
    execute format('alter table public.aura_match_outcomes drop constraint %I',constraint_row.conname);
  end loop;
end $$;

alter table public.aura_match_outcomes
  add constraint aura_match_outcomes_score_version_v2_check
    check (score_version is null or score_version in (1,2)),
  add constraint aura_match_outcomes_score_feature_pair_v2_check
    check ((score_version is null and feature_schema_version is null)
      or (score_version in (1,2) and feature_schema_version=1)),
  add constraint aura_match_outcomes_score_snapshot_v2_check
    check (score_snapshot_id is null or (score_version in (1,2) and feature_schema_version=1));

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
    and score.feature_schema_version=1 and score.score_version in (1,2) and score.snapshot_at<=anchor.occurred_at
  order by score.snapshot_at desc, score.score_version desc
  limit 1;

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

revoke all on function public.build_aura_match_outcome_v1(uuid,text,timestamptz) from public,anon,authenticated,service_role;
grant execute on function public.build_aura_match_outcome_v1(uuid,text,timestamptz) to service_role;

commit;
