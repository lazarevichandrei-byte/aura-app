create table if not exists public.aura_brain_runtime_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  component text not null check (component in ('PRODUCTION_V2','READ_SIGNALS','SHADOW_V3','CANDIDATE','CANDIDATE_REGISTRY')),
  stage text not null,
  severity text not null default 'ERROR' check (severity in ('INFO','WARN','ERROR')),
  code text not null,
  viewer_user_id uuid null,
  candidate_user_id uuid null,
  snapshot_at timestamptz null,
  retryable boolean not null default false,
  retry_attempts integer not null default 0 check (retry_attempts >= 0),
  next_retry_at timestamptz null,
  resolved_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint aura_brain_runtime_events_pair_check check (viewer_user_id is null or candidate_user_id is null or viewer_user_id <> candidate_user_id)
);

create index if not exists aura_brain_runtime_events_occurred_idx
  on public.aura_brain_runtime_events (occurred_at desc);

create index if not exists aura_brain_runtime_events_open_idx
  on public.aura_brain_runtime_events (component, occurred_at desc)
  where resolved_at is null;

create index if not exists aura_brain_runtime_events_retry_idx
  on public.aura_brain_runtime_events (next_retry_at asc)
  where retryable = true and resolved_at is null;

create unique index if not exists aura_brain_runtime_events_dedupe_idx
  on public.aura_brain_runtime_events (
    component,
    stage,
    code,
    coalesce(viewer_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(candidate_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(snapshot_at, '-infinity'::timestamptz)
  );

alter table public.aura_brain_runtime_events enable row level security;

comment on table public.aura_brain_runtime_events is
  'Server-only sanitized runtime health telemetry for AURA brain components. Never stores raw message text and never drives production ranking directly.';
