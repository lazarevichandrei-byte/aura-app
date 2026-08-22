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
  completed_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  cooldown_until timestamptz,
  check (user_low_id < user_high_id),
  check (initiated_by_user_id in (user_low_id,user_high_id)),
  unique (user_low_id,user_high_id,cycle_number)
);

create unique index dating_one_pending_cycle_per_pair
  on public.dating_interaction_cycles(user_low_id,user_high_id)
  where status = 'pending';
create index dating_incoming_pending_idx
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

update public.chats
set direct_user_low_id = least(user1_id,user2_id),
    direct_user_high_id = greatest(user1_id,user2_id)
where event_id is null and user1_id is not null and user2_id is not null;

do $$
begin
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
  check (event_id is not null or direct_user_low_id is null or direct_user_high_id is null or direct_user_low_id < direct_user_high_id) not valid;

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
  interaction_cycle_id uuid not null unique references public.dating_interaction_cycles(id) on delete cascade,
  user_low_id uuid not null references public.users(id) on delete cascade,
  user_high_id uuid not null references public.users(id) on delete cascade,
  chat_id uuid not null references public.chats(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (user_low_id < user_high_id)
);
create index dating_matches_pair_time_idx on public.dating_matches(user_low_id,user_high_id,created_at desc);

create table public.user_entitlements (
  user_id uuid primary key references public.users(id) on delete cascade,
  premium_until timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.dating_interaction_cycles(user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,completed_by_user_id,created_at,completed_at,cooldown_until)
select direct_user_low_id,direct_user_high_id,1,'matched',direct_user_low_id,direct_user_high_id,
       coalesce(created_at,now()),coalesce(created_at,now()),coalesce(created_at,now()) + public.dating_cooldown_interval()
from public.chats
where event_id is null and direct_user_low_id is not null and direct_user_high_id is not null
on conflict (user_low_id,user_high_id,cycle_number) do nothing;

insert into public.dating_matches(interaction_cycle_id,user_low_id,user_high_id,chat_id,created_at)
select cycles.id,cycles.user_low_id,cycles.user_high_id,chats.id,cycles.created_at
from public.dating_interaction_cycles cycles
join public.chats on chats.event_id is null and chats.direct_user_low_id = cycles.user_low_id and chats.direct_user_high_id = cycles.user_high_id
where cycles.status = 'matched'
on conflict (interaction_cycle_id) do nothing;

insert into public.chat_user_state(chat_id,user_id,updated_at)
select chats.id,members.user_id,now()
from public.chats
cross join lateral (values (chats.user1_id),(chats.user2_id)) members(user_id)
join public.users on users.id = members.user_id
where chats.event_id is null
on conflict (chat_id,user_id) do nothing;

do $$
begin
  if exists (
    select 1 from public.likes left_like
    join public.likes right_like on right_like.from_user_id=left_like.to_user_id and right_like.to_user_id=left_like.from_user_id and right_like.status='pending'
    where left_like.status='pending' and left_like.from_user_id<left_like.to_user_id
      and not exists (select 1 from public.chats where event_id is null and direct_user_low_id=left_like.from_user_id and direct_user_high_id=left_like.to_user_id)
  ) then
    raise exception 'RECIPROCAL_PENDING_LIKES_REQUIRE_MANUAL_REVIEW';
  end if;
end $$;

insert into public.dating_interaction_cycles(user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,created_at)
select distinct on (least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id))
  least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id),1,'pending',likes.from_user_id,now()
from public.likes
join public.users sender on sender.id=likes.from_user_id
join public.users recipient on recipient.id=likes.to_user_id
where likes.status='pending' and likes.from_user_id<>likes.to_user_id
  and not exists (
    select 1 from public.dating_interaction_cycles cycles
    where cycles.user_low_id=least(likes.from_user_id,likes.to_user_id)
      and cycles.user_high_id=greatest(likes.from_user_id,likes.to_user_id)
  )
order by least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id),likes.id;

insert into public.dating_interaction_cycles(user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,completed_by_user_id,created_at,completed_at,cooldown_until)
select distinct on (least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id))
  least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id),1,'rejected',likes.from_user_id,likes.to_user_id,now(),now(),now()+public.dating_cooldown_interval()
from public.likes
join public.users sender on sender.id=likes.from_user_id
join public.users recipient on recipient.id=likes.to_user_id
where likes.status='dismissed' and likes.from_user_id<>likes.to_user_id
  and not exists (
    select 1 from public.dating_interaction_cycles cycles
    where cycles.user_low_id=least(likes.from_user_id,likes.to_user_id)
      and cycles.user_high_id=greatest(likes.from_user_id,likes.to_user_id)
  )
order by least(likes.from_user_id,likes.to_user_id),greatest(likes.from_user_id,likes.to_user_id),likes.id;

create or replace function public.get_or_create_direct_dating_chat(p_user_a uuid,p_user_b uuid)
returns uuid language plpgsql volatile security invoker set search_path=public as $$
declare low_id uuid:=least(p_user_a,p_user_b); high_id uuid:=greatest(p_user_a,p_user_b); result_id uuid;
begin
  if p_user_a=p_user_b then raise exception 'SELF_CHAT_NOT_ALLOWED' using errcode='P0001'; end if;
  insert into public.chats(event_id,user1_id,user2_id,direct_user_low_id,direct_user_high_id,last_message,liked_by,is_new_match,has_messages,unread_count)
  values(null,low_id,high_id,low_id,high_id,'',true,false,false,0)
  on conflict (direct_user_low_id,direct_user_high_id) where event_id is null and direct_user_low_id is not null and direct_user_high_id is not null
  do update set user1_id=excluded.user1_id,user2_id=excluded.user2_id
  returning id into result_id;
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
      on conflict(interaction_cycle_id) do update set chat_id=excluded.chat_id returning id into result_match;
      insert into public.chat_user_state(chat_id,user_id,hidden_at,new_match_at,match_seen_at,updated_at)
      values(result_chat,p_actor_id,null,now(),null,now()),(result_chat,p_target_id,null,now(),null,now())
      on conflict(chat_id,user_id) do update set hidden_at=null,new_match_at=now(),match_seen_at=null,updated_at=now();
      created_event:=true;
    end if;
  elsif current_cycle.id is not null and current_cycle.cooldown_until>now() then
    if current_cycle.status='matched' then select chat_id,id into result_chat,result_match from public.dating_matches where interaction_cycle_id=current_cycle.id; end if;
  else
    next_cycle:=coalesce(current_cycle.cycle_number,0)+1;
    insert into public.dating_interaction_cycles(user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,completed_by_user_id,completed_at,cooldown_until)
    values(low_id,high_id,next_cycle,case when p_action='like' then 'pending' else 'rejected' end,p_actor_id,
      case when p_action='reject' then p_actor_id end,case when p_action='reject' then now() end,
      case when p_action='reject' then now()+public.dating_cooldown_interval() end)
    returning * into current_cycle; created_event:=true;
  end if;
  return jsonb_build_object('state',current_cycle.status,'cycleId',current_cycle.id,'matchId',result_match,'chatId',result_chat,'eventCreated',created_event,'cooldownUntil',current_cycle.cooldown_until);
end $$;

create or replace function public.get_dating_feed(p_user_id uuid,p_limit integer default 30,p_exclude_ids uuid[] default '{}')
returns setof public.users language sql stable security invoker set search_path=public as $$
  with me as (select * from public.users where id=p_user_id), candidates as (
    select candidate.id as candidate_id,
      exists(select 1 from public.dating_interaction_cycles c where c.user_low_id=least(p_user_id,candidate.id) and c.user_high_id=greatest(p_user_id,candidate.id)) as interacted,
      (select c.cooldown_until from public.dating_interaction_cycles c where c.user_low_id=least(p_user_id,candidate.id) and c.user_high_id=greatest(p_user_id,candidate.id) order by c.cycle_number desc limit 1) as cooldown_until,
      (select c.status from public.dating_interaction_cycles c where c.user_low_id=least(p_user_id,candidate.id) and c.user_high_id=greatest(p_user_id,candidate.id) order by c.cycle_number desc limit 1) as interaction_status
    from public.users candidate cross join me
    where candidate.id<>p_user_id and candidate.onboarding_completed=true and coalesce(candidate.hide_profile,false)=false
      and (me.looking='any' or candidate.gender=me.looking)
      and (candidate.looking='any' or candidate.looking=me.gender)
      and not(candidate.id=any(coalesce(p_exclude_ids,'{}'::uuid[])))
      and not exists(select 1 from public.blocked_users b where (b.user_id=p_user_id and b.blocked_user_id=candidate.id) or (b.user_id=candidate.id and b.blocked_user_id=p_user_id))
      and (candidate.latitude is null or candidate.longitude is null or me.latitude is null or me.longitude is null or
        6371*2*asin(sqrt(power(sin(radians(candidate.latitude-me.latitude)/2),2)+cos(radians(me.latitude))*cos(radians(candidate.latitude))*power(sin(radians(candidate.longitude-me.longitude)/2),2)))<=coalesce(me.search_radius,50))
  )
  select candidate_user.* from candidates
  join public.users candidate_user on candidate_user.id=candidates.candidate_id
  where not candidates.interacted or (candidates.interaction_status in ('matched','rejected') and candidates.cooldown_until<=now())
  order by candidates.interacted asc, md5(candidates.candidate_id::text||p_user_id::text||current_date::text)
  limit greatest(1,least(p_limit,100));
$$;

alter table public.dating_interaction_cycles enable row level security;
alter table public.dating_matches enable row level security;
alter table public.chat_user_state enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.likes enable row level security;

revoke all on table public.dating_interaction_cycles,public.dating_matches,public.chat_user_state,public.user_entitlements from public,anon,authenticated;
grant select,insert,update,delete on table public.dating_interaction_cycles,public.dating_matches,public.chat_user_state to service_role;
grant select,insert,update,delete on table public.user_entitlements to service_role;
revoke all privileges on table public.likes from public,anon,authenticated;
grant select,insert,update,delete on table public.likes to service_role;
revoke all privileges on table public.chats from public,anon,authenticated;
grant select on table public.chats to anon,authenticated;

revoke all on function public.dating_cooldown_interval() from public,anon,authenticated;
revoke all on function public.get_or_create_direct_dating_chat(uuid,uuid) from public,anon,authenticated;
revoke all on function public.process_dating_action(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.get_dating_feed(uuid,integer,uuid[]) from public,anon,authenticated;
grant execute on function public.dating_cooldown_interval(),public.get_or_create_direct_dating_chat(uuid,uuid),public.process_dating_action(uuid,uuid,text),public.get_dating_feed(uuid,integer,uuid[]) to service_role;

revoke execute on function public.like_user(uuid,uuid) from public,anon,authenticated,service_role;

commit;
