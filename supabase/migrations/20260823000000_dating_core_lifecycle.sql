begin;

create or replace function public.dating_cooldown_interval()
returns interval
language sql
immutable
security invoker
set search_path = public
as $$ select interval '14 days' $$;

create table public.dating_interaction_cycles (
  id uuid primary key default gen_random_uuid(),
  user_low_id uuid not null references public.users(id) on delete cascade,
  user_high_id uuid not null references public.users(id) on delete cascade,
  cycle_number integer not null,
  status text not null check (status in ('pending','matched','rejected')),
  initiated_by_user_id uuid not null references public.users(id) on delete cascade,
  recipient_user_id uuid not null references public.users(id) on delete cascade,
  completed_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  cooldown_until timestamptz,
  check (user_low_id < user_high_id),
  check (initiated_by_user_id in (user_low_id,user_high_id)),
  check (recipient_user_id in (user_low_id,user_high_id)),
  check (initiated_by_user_id<>recipient_user_id),
  check (
    (status = 'pending' and completed_at is null and cooldown_until is null)
    or
    (status in ('matched','rejected') and completed_at is not null and cooldown_until is not null)
  ),
  unique (user_low_id,user_high_id,cycle_number),
  unique (id,user_low_id,user_high_id)
);

create unique index dating_one_pending_cycle_per_pair
  on public.dating_interaction_cycles(user_low_id,user_high_id)
  where status = 'pending';
create index dating_incoming_pending_idx
  on public.dating_interaction_cycles(recipient_user_id,created_at desc)
  where status = 'pending';
create index dating_outgoing_pending_idx
  on public.dating_interaction_cycles(initiated_by_user_id,created_at desc)
  where status = 'pending';
create index dating_pair_recent_idx
  on public.dating_interaction_cycles(user_low_id,user_high_id,cycle_number desc);
create index dating_cooldown_idx
  on public.dating_interaction_cycles(cooldown_until)
  where status in ('matched','rejected');
create index if not exists users_dating_feed_filter_idx
  on public.users(gender,looking,onboarding_completed,hide_profile);

alter table public.chats add column if not exists direct_user_low_id uuid;
alter table public.chats add column if not exists direct_user_high_id uuid;

create or replace function public.sync_chat_canonical_pair()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
  if new.event_id is null and new.user1_id is not null and new.user2_id is not null and new.user1_id<>new.user2_id then
    new.direct_user_low_id:=least(new.user1_id,new.user2_id);
    new.direct_user_high_id:=greatest(new.user1_id,new.user2_id);
  else
    new.direct_user_low_id:=null;
    new.direct_user_high_id:=null;
  end if;
  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_trigger triggers
    where triggers.tgrelid='public.chats'::regclass
      and triggers.tgname='chats_sync_canonical_pair'
      and not triggers.tgisinternal
  ) then
    raise exception 'CHAT_CANONICAL_TRIGGER_NAME_CONFLICT';
  end if;
end $$;

create trigger chats_sync_canonical_pair
before insert or update of event_id,user1_id,user2_id on public.chats
for each row execute function public.sync_chat_canonical_pair();

update public.chats
set direct_user_low_id = least(chats.user1_id,chats.user2_id),
    direct_user_high_id = greatest(chats.user1_id,chats.user2_id)
from public.users user1,public.users user2
where chats.event_id is null
  and chats.user1_id=user1.id
  and chats.user2_id=user2.id
  and chats.user1_id<>chats.user2_id;

do $$
begin
  if exists (
    select 1 from public.chats
    where event_id is null and user1_id=user2_id
  ) then
    raise exception 'SELF_DIRECT_CHATS_REQUIRE_MANUAL_REVIEW';
  end if;
  if exists (
    select 1 from public.chats
    where event_id is null and direct_user_low_id is not null and direct_user_high_id is not null
    group by direct_user_low_id,direct_user_high_id having count(*) > 1
  ) then
    raise exception 'DUPLICATE_DIRECT_CHAT_PAIRS_REQUIRE_MANUAL_REVIEW';
  end if;
end $$;

create unique index chats_canonical_direct_pair_key
  on public.chats(direct_user_low_id,direct_user_high_id)
  where event_id is null and direct_user_low_id is not null and direct_user_high_id is not null;

alter table public.chats add constraint chats_direct_pair_order_check
  check (
    (event_id is not null and direct_user_low_id is null and direct_user_high_id is null)
    or
    (event_id is null and (
      (direct_user_low_id is null and direct_user_high_id is null)
      or (direct_user_low_id is not null and direct_user_high_id is not null and direct_user_low_id < direct_user_high_id)
    ))
  ) not valid;

create table public.chat_user_state (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  hidden_at timestamptz,
  new_match_at timestamptz,
  match_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (chat_id,user_id)
);
create index chat_user_state_visible_idx on public.chat_user_state(user_id,hidden_at,updated_at desc);

create table public.dating_matches (
  id uuid primary key default gen_random_uuid(),
  interaction_cycle_id uuid not null unique,
  user_low_id uuid not null references public.users(id) on delete cascade,
  user_high_id uuid not null references public.users(id) on delete cascade,
  chat_id uuid not null references public.chats(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (user_low_id < user_high_id),
  foreign key (interaction_cycle_id,user_low_id,user_high_id)
    references public.dating_interaction_cycles(id,user_low_id,user_high_id) on delete cascade
);
create index dating_matches_pair_time_idx on public.dating_matches(user_low_id,user_high_id,created_at desc);

create table public.user_entitlements (
  user_id uuid primary key references public.users(id) on delete cascade,
  premium_until timestamptz,
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from public.matches) then
    raise exception 'LEGACY_MATCHES_REQUIRE_MANUAL_REVIEW';
  end if;
end $$;

insert into public.chat_user_state(chat_id,user_id,updated_at)
select chats.id,members.user_id,now()
from public.chats
cross join lateral (values (chats.user1_id),(chats.user2_id)) members(user_id)
join public.users on users.id = members.user_id
where chats.event_id is null
on conflict (chat_id,user_id) do nothing;

do $$
begin
  if exists (select 1 from public.likes where status is distinct from 'pending') then
    raise exception 'UNEXPECTED_LEGACY_LIKE_STATUS_REQUIRE_MANUAL_REVIEW';
  end if;
  if exists (select 1 from public.likes where from_user_id=to_user_id) then
    raise exception 'SELF_LIKES_REQUIRE_MANUAL_REVIEW';
  end if;
  if exists (
    select 1 from public.likes
    left join public.users sender on sender.id=likes.from_user_id
    left join public.users recipient on recipient.id=likes.to_user_id
    where sender.id is null or recipient.id is null
  ) then
    raise exception 'ORPHAN_LIKES_REQUIRE_MANUAL_REVIEW';
  end if;
  if exists (
    select 1 from public.likes
    group by least(from_user_id,to_user_id),greatest(from_user_id,to_user_id)
    having count(*)>1
  ) then
    raise exception 'MULTIPLE_ACTIVE_LIKES_PER_PAIR_REQUIRE_MANUAL_REVIEW';
  end if;
  if exists (
    select 1 from public.likes left_like
    join public.likes right_like on right_like.from_user_id=left_like.to_user_id and right_like.to_user_id=left_like.from_user_id and right_like.status='pending'
    where left_like.status='pending' and left_like.from_user_id<left_like.to_user_id
      and not exists (select 1 from public.chats where event_id is null and direct_user_low_id=left_like.from_user_id and direct_user_high_id=left_like.to_user_id)
  ) then
    raise exception 'RECIPROCAL_PENDING_LIKES_REQUIRE_MANUAL_REVIEW';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='likes' and column_name='created_at'
  ) then
    execute $backfill$
      insert into public.dating_interaction_cycles(
        user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,recipient_user_id,created_at
      )
      select least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id),
             1,'pending',likes.from_user_id,likes.to_user_id,coalesce(likes.created_at,now())
      from public.likes
      join public.users sender on sender.id=likes.from_user_id
      join public.users recipient on recipient.id=likes.to_user_id
      where likes.status='pending' and likes.from_user_id<>likes.to_user_id
        and not exists (
          select 1 from public.dating_interaction_cycles cycles
          where cycles.user_low_id=least(likes.from_user_id,likes.to_user_id)
            and cycles.user_high_id=greatest(likes.from_user_id,likes.to_user_id)
        )
    $backfill$;
  else
    insert into public.dating_interaction_cycles(
      user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,recipient_user_id,created_at
    )
    select least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id),
           1,'pending',likes.from_user_id,likes.to_user_id,now()
    from public.likes
    join public.users sender on sender.id=likes.from_user_id
    join public.users recipient on recipient.id=likes.to_user_id
    where likes.status='pending' and likes.from_user_id<>likes.to_user_id
      and not exists (
        select 1 from public.dating_interaction_cycles cycles
        where cycles.user_low_id=least(likes.from_user_id,likes.to_user_id)
          and cycles.user_high_id=greatest(likes.from_user_id,likes.to_user_id)
      );
  end if;
end $$;

alter table public.chats validate constraint chats_direct_pair_order_check;

create or replace function public.get_or_create_direct_dating_chat(p_user_a uuid,p_user_b uuid)
returns uuid language plpgsql volatile security invoker set search_path=public as $$
declare low_id uuid:=least(p_user_a,p_user_b); high_id uuid:=greatest(p_user_a,p_user_b); result_id uuid;
begin
  if p_user_a=p_user_b then raise exception 'SELF_CHAT_NOT_ALLOWED' using errcode='P0001'; end if;

  select id into result_id
  from public.chats
  where event_id is null
    and direct_user_low_id=low_id
    and direct_user_high_id=high_id;
  if result_id is not null then return result_id; end if;

  insert into public.chats(event_id,user1_id,user2_id,direct_user_low_id,direct_user_high_id,last_message,liked_by,is_new_match,has_messages,unread_count)
  values(null,low_id,high_id,low_id,high_id,'',false,false,false,0)
  on conflict (direct_user_low_id,direct_user_high_id) where event_id is null and direct_user_low_id is not null and direct_user_high_id is not null
  do nothing
  returning id into result_id;

  if result_id is null then
    select id into result_id
    from public.chats
    where event_id is null
      and direct_user_low_id=low_id
      and direct_user_high_id=high_id;
  end if;
  if result_id is null then
    raise exception 'DIRECT_CHAT_CREATE_FAILED' using errcode='P0001';
  end if;
  return result_id;
end $$;

create or replace function public.process_dating_action(p_actor_id uuid,p_target_id uuid,p_action text)
returns jsonb language plpgsql volatile security invoker set search_path=public as $$
declare low_id uuid:=least(p_actor_id,p_target_id); high_id uuid:=greatest(p_actor_id,p_target_id);
  current_cycle public.dating_interaction_cycles%rowtype; next_cycle integer; result_chat uuid; result_match uuid; created_event boolean:=false;
begin
  if p_actor_id=p_target_id then raise exception 'SELF_ACTION_NOT_ALLOWED' using errcode='P0001'; end if;
  if p_action not in ('like','reject') then raise exception 'INVALID_DATING_ACTION' using errcode='P0001'; end if;
  perform pg_advisory_xact_lock(hashtextextended(low_id::text||':'||high_id::text,0));
  select * into current_cycle from public.dating_interaction_cycles
  where user_low_id=low_id and user_high_id=high_id order by cycle_number desc limit 1 for update;

  if current_cycle.id is not null and current_cycle.status='pending' then
    if p_action='reject' then
      update public.dating_interaction_cycles set status='rejected',completed_by_user_id=p_actor_id,completed_at=now(),cooldown_until=now()+public.dating_cooldown_interval()
      where id=current_cycle.id returning * into current_cycle; created_event:=true;
    elsif current_cycle.initiated_by_user_id=p_actor_id then
      null;
    else
      result_chat:=public.get_or_create_direct_dating_chat(p_actor_id,p_target_id);
      update public.dating_interaction_cycles set status='matched',completed_by_user_id=p_actor_id,completed_at=now(),cooldown_until=now()+public.dating_cooldown_interval()
      where id=current_cycle.id returning * into current_cycle;
      insert into public.dating_matches(interaction_cycle_id,user_low_id,user_high_id,chat_id)
      values(current_cycle.id,low_id,high_id,result_chat)
      on conflict(interaction_cycle_id) do nothing returning id into result_match;
      if result_match is null then
        select id,chat_id into result_match,result_chat
        from public.dating_matches where interaction_cycle_id=current_cycle.id;
      end if;
      if result_match is null or result_chat is null then
        raise exception 'MATCH_STATE_INCONSISTENT' using errcode='P0001';
      end if;
      insert into public.chat_user_state(chat_id,user_id,hidden_at,new_match_at,match_seen_at,updated_at)
      values(result_chat,p_actor_id,null,now(),null,now()),(result_chat,p_target_id,null,now(),null,now())
      on conflict(chat_id,user_id) do update set hidden_at=null,new_match_at=now(),match_seen_at=null,updated_at=now();
      created_event:=true;
    end if;
  elsif current_cycle.id is not null and current_cycle.cooldown_until>now() then
    if current_cycle.status='matched' then
      select chat_id,id into result_chat,result_match
      from public.dating_matches where interaction_cycle_id=current_cycle.id;
      if result_match is null or result_chat is null then
        raise exception 'MATCH_STATE_INCONSISTENT' using errcode='P0001';
      end if;
    end if;
  else
    next_cycle:=coalesce(current_cycle.cycle_number,0)+1;
    insert into public.dating_interaction_cycles(user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,recipient_user_id,completed_by_user_id,completed_at,cooldown_until)
    values(low_id,high_id,next_cycle,case when p_action='like' then 'pending' else 'rejected' end,p_actor_id,p_target_id,
      case when p_action='reject' then p_actor_id end,case when p_action='reject' then now() end,
      case when p_action='reject' then now()+public.dating_cooldown_interval() end)
    returning * into current_cycle; created_event:=true;
  end if;

  if current_cycle.status='pending' then
    insert into public.likes(from_user_id,to_user_id,status)
    select current_cycle.initiated_by_user_id,current_cycle.recipient_user_id,'pending'
    where not exists (
      select 1 from public.likes
      where from_user_id=current_cycle.initiated_by_user_id
        and to_user_id=current_cycle.recipient_user_id
        and status='pending'
    );
  elsif created_event and current_cycle.status in ('matched','rejected') then
    delete from public.likes
    where status='pending'
      and least(from_user_id,to_user_id)=low_id
      and greatest(from_user_id,to_user_id)=high_id;
  end if;

  return jsonb_build_object('state',current_cycle.status,'cycleId',current_cycle.id,'matchId',result_match,'chatId',result_chat,'eventCreated',created_event,'cooldownUntil',current_cycle.cooldown_until);
end $$;

create or replace function public.like_user(from_id uuid,to_id uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path=public
as $$
declare result jsonb;
begin
  if from_id=to_id then return null; end if;
  result:=public.process_dating_action(from_id,to_id,'like');
  if result->>'state'='matched' then
    return nullif(result->>'chatId','')::uuid;
  end if;
  return null;
end;
$$;

create or replace function public.get_dating_feed(p_user_id uuid,p_limit integer default 30,p_exclude_ids uuid[] default '{}')
returns setof public.users language sql stable security invoker set search_path=public as $$
  with me as (select * from public.users where id=p_user_id), candidates as (
    select candidate.id as candidate_id,
      latest_cycle.id is not null as interacted,
      latest_cycle.cooldown_until,
      latest_cycle.status as interaction_status,
      latest_cycle.initiated_by_user_id,
      latest_cycle.recipient_user_id,
      latest_cycle.cycle_number,
      latest_cycle.created_at as interaction_created_at
    from public.users candidate cross join me
    left join lateral (
      select cycles.id,cycles.status,cycles.cooldown_until,cycles.initiated_by_user_id,
             cycles.recipient_user_id,cycles.cycle_number,cycles.created_at
      from public.dating_interaction_cycles cycles
      where cycles.user_low_id=least(p_user_id,candidate.id)
        and cycles.user_high_id=greatest(p_user_id,candidate.id)
      order by cycles.cycle_number desc
      limit 1
    ) latest_cycle on true
    where candidate.id<>p_user_id and candidate.onboarding_completed=true and coalesce(candidate.hide_profile,false)=false
      and (candidate.avatar_url is not null or jsonb_array_length(coalesce(candidate.photos,'[]'::jsonb))>0)
      and (me.looking='any' or candidate.gender=me.looking)
      and (candidate.looking='any' or candidate.looking=me.gender)
      and not(candidate.id=any(coalesce(p_exclude_ids,'{}'::uuid[])))
      and not exists(select 1 from public.blocked_users b where (b.user_id=p_user_id and b.blocked_user_id=candidate.id) or (b.user_id=candidate.id and b.blocked_user_id=p_user_id))
      and (candidate.latitude is null or candidate.longitude is null or me.latitude is null or me.longitude is null or
        6371*2*asin(sqrt(power(sin(radians(candidate.latitude-me.latitude)/2),2)+cos(radians(me.latitude))*cos(radians(candidate.latitude))*power(sin(radians(candidate.longitude-me.longitude)/2),2)))<=coalesce(me.search_radius,50))
  )
  select candidate_user.* from candidates
  join public.users candidate_user on candidate_user.id=candidates.candidate_id
  where not candidates.interacted
     or (candidates.interaction_status='pending' and candidates.recipient_user_id=p_user_id)
     or (candidates.interaction_status in ('matched','rejected') and candidates.cooldown_until<=now())
  order by
    case
      when candidates.interaction_status='pending' and candidates.recipient_user_id=p_user_id then 0
      when not candidates.interacted then 1
      else 2
    end,
    md5(candidates.candidate_id::text||p_user_id::text||current_date::text)
  limit greatest(1,least(p_limit,100));
$$;

create or replace function public.delete_my_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  delete from public.likes
  where from_user_id=p_user_id or to_user_id=p_user_id;

  delete from public.matches
  where user1_id=p_user_id or user2_id=p_user_id;

  delete from public.chat_user_state
  where user_id=p_user_id;

  delete from public.user_entitlements
  where user_id=p_user_id;

  delete from public.dating_interaction_cycles
  where user_low_id=p_user_id or user_high_id=p_user_id;

  delete from public.typing_status
  where user_id=p_user_id;

  delete from public.messages
  where sender_id=p_user_id;

  delete from public.chat_participants
  where user_id=p_user_id;

  delete from public.users
  where id=p_user_id;
end;
$$;

alter table public.dating_interaction_cycles enable row level security;
alter table public.dating_matches enable row level security;
alter table public.chat_user_state enable row level security;
alter table public.user_entitlements enable row level security;

revoke all on table public.dating_interaction_cycles,public.dating_matches,public.chat_user_state,public.user_entitlements from public,anon,authenticated;
revoke all on table public.dating_interaction_cycles,public.dating_matches,public.chat_user_state,public.user_entitlements from service_role;
grant select,insert,update on table public.dating_interaction_cycles to service_role;
grant select,insert on table public.dating_matches to service_role;
grant select,insert,update on table public.chat_user_state to service_role;
grant select on table public.user_entitlements to service_role;
revoke all on table public.likes,public.matches from service_role;
grant select,insert,delete on table public.likes to service_role;

revoke all on function public.dating_cooldown_interval() from public,anon,authenticated;
revoke all on function public.sync_chat_canonical_pair() from public,anon,authenticated;
revoke all on function public.get_or_create_direct_dating_chat(uuid,uuid) from public,anon,authenticated;
revoke all on function public.process_dating_action(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.get_dating_feed(uuid,integer,uuid[]) from public,anon,authenticated;
grant execute on function public.dating_cooldown_interval(),public.get_or_create_direct_dating_chat(uuid,uuid),public.process_dating_action(uuid,uuid,text),public.get_dating_feed(uuid,integer,uuid[]) to service_role;

revoke execute on function public.like_user(uuid,uuid)
  from public,anon,authenticated,service_role;
revoke execute on function public.get_feed(uuid,integer)
  from public,anon,authenticated,service_role;
revoke execute on function public.delete_my_account(uuid)
  from public,anon,authenticated;
grant execute on function public.delete_my_account(uuid) to service_role;

commit;
