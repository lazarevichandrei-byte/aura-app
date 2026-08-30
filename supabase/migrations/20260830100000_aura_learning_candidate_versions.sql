create table if not exists public.aura_learning_candidate_versions (
 id uuid primary key default gen_random_uuid(),
 candidate_version integer not null,
 training_schema_version integer not null default 1,
 feature_schema_version integer not null default 2,
 window_type text not null check (window_type in ('24h','7d','30d')),
 status text not null check (status in ('SHADOW_ELIGIBLE','HOLD','ARCHIVED')),
 sample_size integer not null check (sample_size >= 0),
 weights jsonb not null default '{}'::jsonb,
 diagnostics jsonb not null default '{}'::jsonb,
 evaluation jsonb not null default '{}'::jsonb,
 trained_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index if not exists aura_learning_candidate_versions_status_trained_idx on public.aura_learning_candidate_versions(status,trained_at desc);
alter table public.aura_learning_candidate_versions enable row level security;
comment on table public.aura_learning_candidate_versions is 'Immutable server-only registry of offline-trained AURA learning candidates. SHADOW_ELIGIBLE means eligible for shadow inference only, never automatic production promotion.';
