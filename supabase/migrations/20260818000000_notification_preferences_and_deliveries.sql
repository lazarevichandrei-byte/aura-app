begin;

create table if not exists public.user_notification_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  preferences jsonb not null default '{"enabled":true,"privateMessages":true,"meetChatMessages":true,"meetRequestNew":true,"meetRequestApproved":true,"meetRequestRejected":true,"meetParticipantJoined":true,"meetParticipantLeft":false,"meetUpdated":true,"meetCancelled":true,"meetReminder":true,"likes":true,"matches":true,"system":true}'::jsonb,
  updated_at timestamptz not null default now()
);

do $migration$
declare
  default_preferences constant jsonb := '{"enabled":true,"privateMessages":true,"meetChatMessages":true,"meetRequestNew":true,"meetRequestApproved":true,"meetRequestRejected":true,"meetParticipantJoined":true,"meetParticipantLeft":false,"meetUpdated":true,"meetCancelled":true,"meetReminder":true,"likes":true,"matches":true,"system":true}'::jsonb;
  legacy_expression text := '''{}''::jsonb';
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'messages_notifications'
  ) then
    legacy_expression := legacy_expression || ' || jsonb_build_object(''privateMessages'', coalesce(users.messages_notifications, true), ''meetChatMessages'', coalesce(users.messages_notifications, true))';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'likes_notifications'
  ) then
    legacy_expression := legacy_expression || ' || jsonb_build_object(''likes'', coalesce(users.likes_notifications, true))';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'matches_notifications'
  ) then
    legacy_expression := legacy_expression || ' || jsonb_build_object(''matches'', coalesce(users.matches_notifications, true))';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'news_notifications'
  ) then
    legacy_expression := legacy_expression || ' || jsonb_build_object(''system'', coalesce(users.news_notifications, true))';
  end if;

  execute format(
    'insert into public.user_notification_preferences (user_id, preferences)
     select users.id, $1 || (%s)
     from public.users
     on conflict (user_id) do nothing',
    legacy_expression
  ) using default_preferences;
end
$migration$;

alter table public.user_notification_preferences enable row level security;

revoke all on table public.user_notification_preferences from public;
revoke all on table public.user_notification_preferences from anon;
revoke all on table public.user_notification_preferences from authenticated;

grant select, insert, update on table public.user_notification_preferences to service_role;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  notification_type text not null,
  recipient_user_id uuid not null references public.users(id) on delete cascade,
  entity_id text,
  delivered_at timestamptz not null default now(),
  delivery_channel text not null default 'telegram'
);

create index if not exists idx_notification_deliveries_recipient_time
  on public.notification_deliveries(recipient_user_id, delivered_at desc);

alter table public.notification_deliveries enable row level security;

revoke all on table public.notification_deliveries from public;
revoke all on table public.notification_deliveries from anon;
revoke all on table public.notification_deliveries from authenticated;

grant select, insert, delete on table public.notification_deliveries to service_role;

commit;
