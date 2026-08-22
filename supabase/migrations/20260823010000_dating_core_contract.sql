begin;

alter table public.likes enable row level security;
alter table public.matches enable row level security;

revoke all privileges on table public.likes from public,anon,authenticated;
revoke all privileges on table public.matches from public,anon,authenticated;
revoke all privileges on table public.likes from service_role;
revoke all privileges on table public.matches from service_role;
grant select,insert,delete on table public.likes to service_role;

revoke insert,update,delete,truncate,references,trigger
  on table public.chats from public,anon,authenticated;

revoke execute on function public.like_user(uuid,uuid)
  from public,anon,authenticated,service_role;
revoke execute on function public.get_feed(uuid,integer)
  from public,anon,authenticated,service_role;
revoke execute on function public.delete_my_account(uuid)
  from public,anon,authenticated;
grant execute on function public.delete_my_account(uuid) to service_role;

commit;
