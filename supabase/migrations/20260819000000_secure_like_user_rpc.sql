begin;

revoke execute on function public.like_user(uuid, uuid) from public;
revoke execute on function public.like_user(uuid, uuid) from anon;
revoke execute on function public.like_user(uuid, uuid) from authenticated;
grant execute on function public.like_user(uuid, uuid) to service_role;

commit;
