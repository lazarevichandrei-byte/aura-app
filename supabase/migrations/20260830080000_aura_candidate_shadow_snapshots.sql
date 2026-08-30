create table if not exists public.aura_candidate_shadow_snapshots (
  id uuid primary key default gen_random_uuid(),
  viewer_user_id uuid not null,
  candidate_user_id uuid not null,
  snapshot_at timestamptz not null,
  candidate_version integer not null check (candidate_version >= 1),
  feature_schema_version integer not null check (feature_schema_version >= 1),
  active_score double precision not null check (active_score between 0 and 100),
  shadow_score double precision not null check (shadow_score between 0 and 100),
  candidate_score double precision not null check (candidate_score between 0 and 100),
  status text not null default 'SHADOW_ONLY' check (status = 'SHADOW_ONLY'),
  model jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint aura_candidate_shadow_pair_check check (viewer_user_id <> candidate_user_id),
  constraint aura_candidate_shadow_unique unique (viewer_user_id,candidate_user_id,snapshot_at,candidate_version)
);

create index if not exists aura_candidate_shadow_viewer_snapshot_idx
  on public.aura_candidate_shadow_snapshots(viewer_user_id,snapshot_at desc);
create index if not exists aura_candidate_shadow_candidate_snapshot_idx
  on public.aura_candidate_shadow_snapshots(candidate_user_id,snapshot_at desc);

alter table public.aura_candidate_shadow_snapshots enable row level security;

comment on table public.aura_candidate_shadow_snapshots is
  'Server-only shadow inference snapshots for AURA learning candidates. Never used directly for production ranking.';
