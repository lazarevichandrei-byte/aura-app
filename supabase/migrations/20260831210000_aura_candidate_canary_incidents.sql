create table if not exists public.aura_candidate_canary_incidents (
 id uuid primary key default gen_random_uuid(),
 occurred_at timestamptz not null default now(),
 event_type text not null check (event_type in ('KILLED','REARMED')),
 reason text,
 metrics jsonb not null default '{}'::jsonb,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists aura_candidate_canary_incidents_occurred_idx on public.aura_candidate_canary_incidents (occurred_at desc);
alter table public.aura_candidate_canary_incidents enable row level security;
revoke all on table public.aura_candidate_canary_incidents from anon, authenticated;
grant all on table public.aura_candidate_canary_incidents to service_role;
