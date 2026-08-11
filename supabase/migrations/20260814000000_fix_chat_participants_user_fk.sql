begin;

alter table public.chat_participants
  drop constraint if exists chat_participants_user_id_fkey;

alter table public.chat_participants
  add constraint chat_participants_user_id_fkey
  foreign key (user_id)
  references public.users(id)
  on delete cascade;

commit;
