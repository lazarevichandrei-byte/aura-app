begin;

-- Preflight: these rows are emitted when the migration is applied so existing
-- privileges can be reviewed in the migration log before the revokes below.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('reports', 'support_tickets', 'blocked_users')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

alter table public.reports enable row level security;
alter table public.support_tickets enable row level security;
alter table public.blocked_users enable row level security;

revoke all privileges on table public.reports from anon, authenticated;
revoke all privileges on table public.support_tickets from anon, authenticated;
revoke all privileges on table public.blocked_users from anon, authenticated;

commit;
