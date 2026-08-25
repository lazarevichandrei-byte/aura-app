begin;

create table public.aura_match_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  viewer_user_id uuid not null references public.users(id) on delete cascade,
  candidate_user_id uuid not null references public.users(id) on delete cascade,
  feature_schema_version integer not null check (feature_schema_version=1),
  score_version integer not null check (score_version=1),
  snapshot_at timestamptz not null,
  total_score integer not null check (total_score between 0 and 100),
  components jsonb not null check (jsonb_typeof(components)='object'),
  reasons jsonb not null check (jsonb_typeof(reasons)='array'),
  flags jsonb not null check (jsonb_typeof(flags)='object'),
  created_at timestamptz not null default now(),
  check (viewer_user_id<>candidate_user_id),
  unique (viewer_user_id,candidate_user_id,feature_schema_version,score_version,snapshot_at)
);

create index aura_match_score_snapshots_pair_time_idx on public.aura_match_score_snapshots(viewer_user_id,candidate_user_id,snapshot_at desc);
create index aura_match_score_snapshots_version_time_idx on public.aura_match_score_snapshots(feature_schema_version,score_version,snapshot_at desc);
create index aura_match_score_snapshots_retention_idx on public.aura_match_score_snapshots(snapshot_at);

alter table public.aura_match_score_snapshots enable row level security;
revoke all on table public.aura_match_score_snapshots from public,anon,authenticated,service_role;
grant select,insert,delete on table public.aura_match_score_snapshots to service_role;

create or replace function public.cleanup_aura_match_score_snapshots(p_batch_size integer default 5000)
returns integer
language plpgsql
volatile
security invoker
set search_path=public
as $$
declare deleted_count integer; bounded_size integer:=greatest(1,least(coalesce(p_batch_size,5000),10000));
begin
  with expired as (
    select id from public.aura_match_score_snapshots
    where snapshot_at<now()-interval '180 days'
    order by snapshot_at limit bounded_size
  )
  delete from public.aura_match_score_snapshots snapshots using expired where snapshots.id=expired.id;
  get diagnostics deleted_count=row_count;
  return deleted_count;
end $$;

revoke all on function public.cleanup_aura_match_score_snapshots(integer) from public,anon,authenticated,service_role;
grant execute on function public.cleanup_aura_match_score_snapshots(integer) to service_role;

commit;
