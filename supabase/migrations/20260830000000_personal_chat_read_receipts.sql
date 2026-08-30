begin;

alter table public.messages
  add column if not exists read_at timestamptz null;

create index if not exists messages_chat_sender_read_at_idx
  on public.messages (chat_id, sender_id, read_at, created_at);

create or replace function public.sync_personal_chat_read_receipts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.messages as m
  set
    is_read = true,
    read_at = coalesce(m.read_at, now())
  where m.chat_id = new.chat_id
    and m.sender_id <> new.user_id
    and m.is_read is not true
    and (
      m.created_at < new.last_read_at
      or (
        m.created_at = new.last_read_at
        and m.id <= coalesce(
          new.last_read_message_id,
          'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
        )
      )
    );

  return new;
end;
$$;

revoke all on function public.sync_personal_chat_read_receipts() from public;
revoke all on function public.sync_personal_chat_read_receipts() from anon;
revoke all on function public.sync_personal_chat_read_receipts() from authenticated;

DROP TRIGGER IF EXISTS trg_sync_personal_chat_read_receipts
  ON public.chat_read_state;

create trigger trg_sync_personal_chat_read_receipts
after insert or update of last_read_at, last_read_message_id
on public.chat_read_state
for each row
execute function public.sync_personal_chat_read_receipts();

-- Reconcile unread/read state already represented by existing cursors without
-- inventing historical read_at timestamps. Future reads receive a precise read_at.
update public.messages as m
set is_read = true
from public.chat_read_state as rs
where m.chat_id = rs.chat_id
  and m.sender_id <> rs.user_id
  and m.is_read is not true
  and (
    m.created_at < rs.last_read_at
    or (
      m.created_at = rs.last_read_at
      and m.id <= coalesce(
        rs.last_read_message_id,
        'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
      )
    )
  );

commit;
