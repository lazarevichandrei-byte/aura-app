create table if not exists public.aura_shadow_evaluation_snapshots (
 id uuid primary key default gen_random_uuid(),
 window_type text not null check (window_type in ('24h','7d','30d')),
 evaluated_at timestamptz not null default now(),
 paired_count integer not null default 0,
 verdict text not null,
 evaluation jsonb not null,
 created_at timestamptz not null default now()
);
create index if not exists aura_shadow_evaluation_window_time_idx on public.aura_shadow_evaluation_snapshots(window_type,evaluated_at desc);
alter table public.aura_shadow_evaluation_snapshots enable row level security;
comment on table public.aura_shadow_evaluation_snapshots is 'Server-only immutable history of AURA V2 vs V3 shadow evaluations across outcome windows.';
