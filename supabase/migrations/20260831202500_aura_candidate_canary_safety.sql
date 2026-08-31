create table if not exists public.aura_candidate_canary_state (
  id boolean primary key default true check (id = true),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','KILLED')),
  killed_at timestamptz,
  reason text,
  metrics jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.aura_candidate_canary_state (id,status)
values (true,'ACTIVE')
on conflict (id) do nothing;

alter table public.aura_candidate_canary_state enable row level security;
comment on table public.aura_candidate_canary_state is 'Server-only Candidate canary kill switch state.';

create table if not exists public.aura_candidate_canary_exposures (
  id uuid primary key default gen_random_uuid(),
  viewer_user_id uuid not null,
  snapshot_at timestamptz not null,
  arm text not null check (arm in ('CONTROL','CANDIDATE','FALLBACK_V2')),
  canary_percent double precision not null default 0 check (canary_percent >= 0 and canary_percent <= 10),
  candidate_count integer not null default 0 check (candidate_count >= 0),
  scored_count integer not null default 0 check (scored_count >= 0),
  top_candidate_id uuid,
  active_top_candidate_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (viewer_user_id,snapshot_at)
);

create index if not exists aura_candidate_canary_exposures_created_idx
  on public.aura_candidate_canary_exposures (created_at desc);
create index if not exists aura_candidate_canary_exposures_arm_created_idx
  on public.aura_candidate_canary_exposures (arm,created_at desc);
create index if not exists aura_candidate_canary_exposures_pair_idx
  on public.aura_candidate_canary_exposures (viewer_user_id,top_candidate_id,snapshot_at desc);

alter table public.aura_candidate_canary_exposures enable row level security;
comment on table public.aura_candidate_canary_exposures is 'Server-only Candidate canary exposure telemetry; no raw messages.';
