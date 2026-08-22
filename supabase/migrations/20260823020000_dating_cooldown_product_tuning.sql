begin;

create or replace function public.dating_reject_cooldown_interval()
returns interval
language sql
immutable
security invoker
set search_path=public
as $$ select interval '15 minutes' $$;

create or replace function public.dating_match_cooldown_interval()
returns interval
language sql
immutable
security invoker
set search_path=public
as $$ select interval '7 days' $$;

do $$
begin
  if exists (
    select 1 from public.dating_interaction_cycles
    where status='pending' and (completed_at is not null or cooldown_until is not null)
  ) then
    raise exception 'INVALID_PENDING_DATING_CYCLE_STATE';
  end if;
  if exists (
    select 1 from public.dating_interaction_cycles
    where status in ('matched','rejected') and (completed_at is null or cooldown_until is null)
  ) then
    raise exception 'INVALID_COMPLETED_DATING_CYCLE_STATE';
  end if;
end $$;

update public.dating_interaction_cycles
set cooldown_until=least(cooldown_until,completed_at+public.dating_reject_cooldown_interval())
where status='rejected'
  and cooldown_until>completed_at+public.dating_reject_cooldown_interval();

update public.dating_interaction_cycles
set cooldown_until=least(cooldown_until,completed_at+public.dating_match_cooldown_interval())
where status='matched'
  and cooldown_until>completed_at+public.dating_match_cooldown_interval();

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
      update public.dating_interaction_cycles set status='rejected',completed_by_user_id=p_actor_id,completed_at=now(),cooldown_until=now()+public.dating_reject_cooldown_interval()
      where id=current_cycle.id returning * into current_cycle; created_event:=true;
    elsif current_cycle.initiated_by_user_id=p_actor_id then
      null;
    else
      result_chat:=public.get_or_create_direct_dating_chat(p_actor_id,p_target_id);
      update public.dating_interaction_cycles set status='matched',completed_by_user_id=p_actor_id,completed_at=now(),cooldown_until=now()+public.dating_match_cooldown_interval()
      where id=current_cycle.id returning * into current_cycle;
      insert into public.dating_matches(interaction_cycle_id,user_low_id,user_high_id,chat_id)
      values(current_cycle.id,low_id,high_id,result_chat)
      on conflict(interaction_cycle_id) do nothing returning id into result_match;
      if result_match is null then
        select id,chat_id into result_match,result_chat from public.dating_matches where interaction_cycle_id=current_cycle.id;
      end if;
      if result_match is null or result_chat is null then raise exception 'MATCH_STATE_INCONSISTENT' using errcode='P0001'; end if;
      insert into public.chat_user_state(chat_id,user_id,hidden_at,new_match_at,match_seen_at,updated_at)
      values(result_chat,p_actor_id,null,now(),null,now()),(result_chat,p_target_id,null,now(),null,now())
      on conflict(chat_id,user_id) do update set hidden_at=null,new_match_at=now(),match_seen_at=null,updated_at=now();
      created_event:=true;
    end if;
  elsif current_cycle.id is not null and current_cycle.cooldown_until>now() then
    if current_cycle.status='matched' then
      select chat_id,id into result_chat,result_match from public.dating_matches where interaction_cycle_id=current_cycle.id;
      if result_match is null or result_chat is null then raise exception 'MATCH_STATE_INCONSISTENT' using errcode='P0001'; end if;
    end if;
  else
    next_cycle:=coalesce(current_cycle.cycle_number,0)+1;
    insert into public.dating_interaction_cycles(user_low_id,user_high_id,cycle_number,status,initiated_by_user_id,recipient_user_id,completed_by_user_id,completed_at,cooldown_until)
    values(low_id,high_id,next_cycle,case when p_action='like' then 'pending' else 'rejected' end,p_actor_id,p_target_id,
      case when p_action='reject' then p_actor_id end,case when p_action='reject' then now() end,
      case when p_action='reject' then now()+public.dating_reject_cooldown_interval() end)
    returning * into current_cycle; created_event:=true;
  end if;

  if current_cycle.status='pending' then
    insert into public.likes(from_user_id,to_user_id,status)
    select current_cycle.initiated_by_user_id,current_cycle.recipient_user_id,'pending'
    where not exists (
      select 1 from public.likes where from_user_id=current_cycle.initiated_by_user_id
        and to_user_id=current_cycle.recipient_user_id and status='pending'
    );
  elsif created_event and current_cycle.status in ('matched','rejected') then
    delete from public.likes where status='pending' and least(from_user_id,to_user_id)=low_id and greatest(from_user_id,to_user_id)=high_id;
  end if;

  return jsonb_build_object('state',current_cycle.status,'cycleId',current_cycle.id,'matchId',result_match,'chatId',result_chat,'eventCreated',created_event,'cooldownUntil',current_cycle.cooldown_until);
end $$;

create or replace function public.get_dating_feed(p_user_id uuid,p_limit integer default 30,p_exclude_ids uuid[] default '{}')
returns setof public.users language sql stable security invoker set search_path=public as $$
  with me as (select * from public.users where id=p_user_id), candidates as (
    select candidate.id as candidate_id,
      latest_cycle.id is not null as interacted,
      latest_cycle.cooldown_until,
      latest_cycle.status as interaction_status,
      latest_cycle.initiated_by_user_id,
      latest_cycle.recipient_user_id,
      latest_cycle.cycle_number
    from public.users candidate cross join me
    left join lateral (
      select cycles.id,cycles.status,cycles.cooldown_until,cycles.initiated_by_user_id,cycles.recipient_user_id,cycles.cycle_number
      from public.dating_interaction_cycles cycles
      where cycles.user_low_id=least(p_user_id,candidate.id) and cycles.user_high_id=greatest(p_user_id,candidate.id)
      order by cycles.cycle_number desc limit 1
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
  select candidate_user.* from candidates join public.users candidate_user on candidate_user.id=candidates.candidate_id
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

revoke all on function public.dating_reject_cooldown_interval() from public,anon,authenticated,service_role;
revoke all on function public.dating_match_cooldown_interval() from public,anon,authenticated,service_role;
revoke all on function public.process_dating_action(uuid,uuid,text) from public,anon,authenticated,service_role;
revoke all on function public.get_dating_feed(uuid,integer,uuid[]) from public,anon,authenticated,service_role;
grant execute on function public.dating_reject_cooldown_interval(),public.dating_match_cooldown_interval(),public.process_dating_action(uuid,uuid,text),public.get_dating_feed(uuid,integer,uuid[]) to service_role;

commit;
