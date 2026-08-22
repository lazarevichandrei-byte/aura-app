begin;

create table public.aura_interaction_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in (
    'profile_impression','profile_open','profile_dwell_bucket','return_to_profile','meet_viewed','match_opened',
    'like','pass','match_created','chat_started','message_sent_metadata','meet_created','meet_join_request',
    'meet_join_accepted','meet_join_rejected','meet_chat_joined','meet_participant_left','meet_cancelled','meet_updated','block','report'
  )),
  schema_version integer not null default 1 check (schema_version=1),
  source_type text not null check (source_type in ('server','client')),
  actor_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete cascade,
  entity_type text check (entity_type is null or entity_type in ('user','dating_cycle','dating_match','chat','message','meet_event','meet_request','report','block')),
  entity_id uuid,
  client_event_id text,
  dedupe_key text,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now(),
  check ((source_type='client' and client_event_id is not null and dedupe_key is null) or (source_type='server' and client_event_id is null and dedupe_key is not null)),
  check (client_event_id is null or length(client_event_id) between 1 and 128),
  check (dedupe_key is null or length(dedupe_key) between 1 and 256),
  check (entity_type is null = (entity_id is null))
);

create unique index aura_events_client_idempotency_key
  on public.aura_interaction_events(actor_user_id,client_event_id)
  where client_event_id is not null;
create unique index aura_events_server_dedupe_key
  on public.aura_interaction_events(dedupe_key)
  where dedupe_key is not null;
create index aura_events_actor_time_idx on public.aura_interaction_events(actor_user_id,occurred_at desc);
create index aura_events_target_time_idx on public.aura_interaction_events(target_user_id,occurred_at desc) where target_user_id is not null;
create index aura_events_name_time_idx on public.aura_interaction_events(event_name,occurred_at desc);
create index aura_events_entity_idx on public.aura_interaction_events(entity_type,entity_id) where entity_id is not null;
create index aura_events_retention_idx on public.aura_interaction_events(received_at);

alter table public.aura_interaction_events enable row level security;
revoke all on table public.aura_interaction_events from public,anon,authenticated,service_role;
grant select,insert,delete on table public.aura_interaction_events to service_role;

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
    select id
    from public.aura_interaction_events
    where received_at<now()-interval '90 days'
    order by received_at
    limit greatest(1,least(coalesce(p_batch_size,5000),10000))
  )
  delete from public.aura_interaction_events events
  using expired
  where events.id=expired.id;
  get diagnostics deleted_count=row_count;
  return deleted_count;
end $$;

revoke all on function public.cleanup_aura_interaction_events(integer) from public,anon,authenticated,service_role;
grant execute on function public.cleanup_aura_interaction_events(integer) to service_role;

commit;
