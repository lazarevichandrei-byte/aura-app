begin;

alter table public.meet_events enable row level security;
alter table public.meet_participants enable row level security;

drop policy if exists "meet_events_public_read" on public.meet_events;
create policy "meet_events_public_read"
on public.meet_events
for select
to anon, authenticated
using (true);

drop policy if exists "meet_participants_public_read" on public.meet_participants;
create policy "meet_participants_public_read"
on public.meet_participants
for select
to anon, authenticated
using (true);

revoke all privileges on table public.meet_events from public, anon, authenticated;
revoke all privileges on table public.meet_participants from public, anon, authenticated;

grant select on table public.meet_events to anon, authenticated;
grant select on table public.meet_participants to anon, authenticated;

grant select, insert, update, delete on table public.meet_events to service_role;
grant select, insert, update, delete on table public.meet_participants to service_role;

commit;
