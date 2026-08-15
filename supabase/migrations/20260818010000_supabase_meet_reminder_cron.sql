begin;

create extension if not exists pg_net with schema extensions;

do $migration$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'aura-meet-reminders';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end
$migration$;

select cron.schedule(
  'aura-meet-reminders',
  '*/5 * * * *',
  $job$
    select net.http_get(
      url := rtrim(secrets.app_url, '/') || '/api/cron/meet-reminders',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || secrets.cron_secret
      ),
      timeout_milliseconds := 15000
    ) as request_id
    from (
      select
        max(decrypted_secret) filter (where name = 'aura_app_url') as app_url,
        max(decrypted_secret) filter (where name = 'aura_cron_secret') as cron_secret
      from vault.decrypted_secrets
      where name in ('aura_app_url', 'aura_cron_secret')
    ) as secrets
    where nullif(btrim(secrets.app_url), '') is not null
      and nullif(btrim(secrets.cron_secret), '') is not null;
  $job$
);

commit;
