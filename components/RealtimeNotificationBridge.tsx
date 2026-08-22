"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {loadChatsBootstrap} from "../lib/chats/bootstrap";
import { supabase } from "../lib/supabase";
import { useCurrentUser } from "../lib/useCurrentUser";
import { useNotification } from "./NotificationContext";
import {useI18n} from "./I18nProvider";
import {formatDateTime} from "../lib/i18n/format";
import {DEFAULT_NOTIFICATION_PREFERENCES,notificationEnabled,normalizeNotificationPreferences,type NotificationPreferences} from "../lib/notifications/preferences";
import {loadNotificationPreferences} from "../lib/notifications/settings-api";

export default function RealtimeNotificationBridge(){
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { notify } = useNotification();
  const {t,intlLocale}=useI18n();
  const notifyRef = useRef(notify);
  const [chats,setChats] = useState<any[]>([]);
  const [settings,setSettings] = useState<NotificationPreferences>(()=>{try{return normalizeNotificationPreferences(JSON.parse(localStorage.getItem("aura-notification-preferences")||"null"));}catch{return DEFAULT_NOTIFICATION_PREFERENCES;}});
  const reconcileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatsRef = useRef<any[]>([]);
  const reconcileSequence = useRef(0);

  useEffect(()=>{ if(user?.id) performance.mark("REALTIME_START"); },[user?.id]);

  useEffect(()=>{ chatsRef.current = chats; },[chats]);
  useEffect(()=>{ notifyRef.current = notify; },[notify]);

  const chatIds = useMemo(()=>chats.map((chat)=>chat.id).sort(),[chats]);
  const chatKey = chatIds.join("|");
  const meetChats = useMemo(()=>chats.filter((chat)=>chat.is_meet_chat),[chats]);
  const meetKey = meetChats.map((chat)=>chat.event_id).sort().join("|");
  const meetTimingKey = meetChats
    .map((chat)=>`${chat.event_id}:${chat.event_starts_at || ""}:${chat.event_expires_at || ""}`)
    .sort()
    .join("|");
  const creatorMeetChats = useMemo(()=>meetChats.filter((chat)=>chat.is_meet_creator),[meetChats]);

  async function reconcile(){
    const sequence=++reconcileSequence.current;
    const result=await loadChatsBootstrap({force:true}).catch(()=>null);
    if(!result)return;
    if(result?.ok&&sequence===reconcileSequence.current) setChats(result.chats || []);
  }

  useEffect(()=>{
    void reconcile();
    void loadNotificationPreferences().then(setSettings).catch(()=>null);
  },[user?.id]);

  useEffect(()=>{const update=(event:Event)=>setSettings(normalizeNotificationPreferences((event as CustomEvent).detail));window.addEventListener("notification-preferences-updated",update);return()=>window.removeEventListener("notification-preferences-updated",update);},[]);

  useEffect(()=>{
    if(!user?.id) return;
    const schedule = ()=>{
      if(reconcileTimer.current) clearTimeout(reconcileTimer.current);
      reconcileTimer.current = setTimeout(()=>void reconcile(),200);
    };
    let channel = supabase
      .channel(`notification-membership-${user.id}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"chats",filter:`user1_id=eq.${user.id}`},schedule)
      .on("postgres_changes",{event:"*",schema:"public",table:"chats",filter:`user2_id=eq.${user.id}`},schedule)
      .on("postgres_changes",{event:"*",schema:"public",table:"chat_participants",filter:`user_id=eq.${user.id}`},schedule)
      .subscribe((status)=>{
        if(status === "CHANNEL_ERROR" || status === "TIMED_OUT") schedule();
      });
    const resume = ()=>{ if(!document.hidden) schedule(); };
    document.addEventListener("visibilitychange",resume);
    window.addEventListener("online",resume);
    return ()=>{
      if(reconcileTimer.current) clearTimeout(reconcileTimer.current);
      document.removeEventListener("visibilitychange",resume);
      window.removeEventListener("online",resume);
      void supabase.removeChannel(channel);
    };
  },[user?.id]);

  useEffect(()=>{
    if(!user?.id || !chatIds.length) return;
    let ready = false;
    let channel = supabase.channel(`notification-messages-${user.id}`);
    chatIds.forEach((chatId)=>{
      channel = channel.on("postgres_changes",{
        event:"INSERT",
        schema:"public",
        table:"messages",
        filter:`chat_id=eq.${chatId}`,
      },(payload:any)=>{
        const message = payload.new;
        window.dispatchEvent(new CustomEvent("aura-chat-message",{detail:message}));
        const chat = chatsRef.current.find((item)=>item.id === chatId);
        const eventType=chat?.is_meet_chat?"meet_chat_message":"private_message";
        if(!ready || !notificationEnabled(settings,eventType) || message.sender_id === user.id || pathname === `/chat/${chatId}`) return;
        notifyRef.current({
          id:`message:${message.id}`,
          title:chat?.is_meet_chat ? `${t("notifications.meetingPrefix")}: ${chat.name}` : chat?.name || t("notifications.newMessage"),
          text:String(message.body || t("notifications.newMessage")).slice(0,100),
          icon:"💬",
          type:"info",
          href:`/chat/${chatId}`,
        });
      });
    });
    channel.subscribe((status)=>{
      if(status === "SUBSCRIBED") ready = true;
      if(status === "CHANNEL_ERROR" || status === "TIMED_OUT") void reconcile();
    });
    return ()=>{ void supabase.removeChannel(channel); };
  },[chatKey,pathname,settings,user?.id]);

  useEffect(()=>{
    if(!user?.id) return;
    let ready = false;
    const channel = supabase
      .channel(`notification-user-events-${user.id}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"meet_join_requests",filter:`user_id=eq.${user.id}`},(payload:any)=>{
        if(!ready) return;
        window.dispatchEvent(new CustomEvent("aura-meet-request-user",{detail:payload}));
        if(payload.eventType !== "UPDATE") return;
        const status = payload.new?.status;
        if(status !== "approved" && status !== "rejected") return;
        if(!notificationEnabled(settings,status === "approved" ? "meet_request_approved" : "meet_request_rejected")) return;
        notifyRef.current({
          id:`request:${payload.new.id}:${status}`,
          title:status === "approved" ? t("notifications.requestAccepted") : t("notifications.requestRejected"),
          text:status === "approved" ? t("notifications.chatAvailable") : t("notifications.requestRejectedText"),
          icon:status === "approved" ? "✅" : "ℹ️",
          type:status === "approved" ? "success" : "info",
          href:`/meet/${payload.new.event_id}`,
        });
      })
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"likes",filter:`to_user_id=eq.${user.id}`},(payload:any)=>{
        if(!ready) return;
        window.dispatchEvent(new CustomEvent("aura-like-realtime",{detail:payload}));
        if(!notificationEnabled(settings,"like_received") || payload.new?.from_user_id === user.id) return;
        notifyRef.current({id:`like:${payload.new.id}`,title:t("notifications.newLike"),text:t("notifications.newLikeText"),icon:"❤️",type:"info",href:"/likes"});
      })
      .subscribe((status)=>{ if(status === "SUBSCRIBED") ready = true; });
    return ()=>{ void supabase.removeChannel(channel); };
  },[settings,user?.id]);

  useEffect(()=>{
    if(!user?.id) return;
    let ready = false;
    const channel = supabase
      .channel(`notification-matches-${user.id}`)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"chats",filter:`user1_id=eq.${user.id}`},(payload:any)=>{
        if(ready && notificationEnabled(settings,"match_created") && payload.new?.is_new_match) notifyRef.current({id:`match:${payload.new.id}`,title:t("notifications.newMatch"),text:t("notifications.newMatchText"),icon:"💙",type:"success",href:`/chat/${payload.new.id}`});
      })
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"chats",filter:`user2_id=eq.${user.id}`},(payload:any)=>{
        if(ready && notificationEnabled(settings,"match_created") && payload.new?.is_new_match) notifyRef.current({id:`match:${payload.new.id}`,title:t("notifications.newMatch"),text:t("notifications.newMatchText"),icon:"💙",type:"success",href:`/chat/${payload.new.id}`});
      })
      .subscribe((status)=>{ if(status === "SUBSCRIBED") ready = true; });
    return ()=>{ void supabase.removeChannel(channel); };
  },[settings,user?.id]);

  useEffect(()=>{
    if(!user?.id || !meetChats.length) return;
    let ready = false;
    let channel = supabase.channel(`notification-meets-${user.id}`);
    meetChats.forEach((chat)=>{
      channel = channel.on("postgres_changes",{event:"*",schema:"public",table:"meet_events",filter:`id=eq.${chat.event_id}`},(payload:any)=>{
        if(!ready || chat.is_meet_creator) return;
        if(payload.eventType === "DELETE"){
          if(!notificationEnabled(settings,"meet_cancelled"))return;
          notifyRef.current({id:`meet-delete:${chat.event_id}`,title:t("notifications.meetCancelled"),text:`${chat.name}: ${t("notifications.meetCancelledText")}`,icon:"⚠️",type:"warning",href:"/meet"});
          return;
        }
        if(payload.eventType === "UPDATE"){
          const changedTime = chat.event_starts_at !== payload.new?.starts_at;
          const changedPlace = chat.event_place !== payload.new?.place;
          if(changedTime || changedPlace){
            if(!notificationEnabled(settings,"meet_updated")){void reconcile();return;}
            const details = changedTime ? `${t("notifications.newTime")}: ${formatDateTime(payload.new.starts_at,intlLocale)}` : `${t("notifications.newPlace")}: ${payload.new.place || t("notifications.placePending")}`;
            notifyRef.current({id:`meet-update:${chat.event_id}:${payload.new.starts_at}:${payload.new.place}`,title:`${t("notifications.meetChanged")}: ${chat.name}`,text:details,icon:"📅",type:"info",href:`/meet/${chat.event_id}`});
            void reconcile();
          }
        }
      });
    });
    creatorMeetChats.forEach((chat)=>{
      channel = channel.on("postgres_changes",{event:"INSERT",schema:"public",table:"meet_join_requests",filter:`event_id=eq.${chat.event_id}`},(payload:any)=>{
        if(!ready || payload.new?.user_id === user.id || !notificationEnabled(settings,"meet_request_new")) return;
        if(pathname.startsWith("/meet/requests/") || pathname === `/chat/${chat.id}`) return;
        notifyRef.current({id:`request-new:${payload.new.id}`,title:t("notifications.newRequest"),text:`${chat.name}: ${t("notifications.newRequestText")}`,icon:"👤",type:"info",href:`/chat/${chat.id}`});
      });
      channel = channel.on("postgres_changes",{event:"*",schema:"public",table:"meet_participants",filter:`event_id=eq.${chat.event_id}`},(payload:any)=>{
        if(!ready || pathname === `/chat/${chat.id}`) return;
        const participantId = payload.new?.user_id || payload.old?.user_id;
        if(!participantId || participantId === user.id) return;
        const joined = payload.eventType === "INSERT";
        const left = payload.eventType === "DELETE";
        if(!joined && !left) return;
        if(!notificationEnabled(settings,joined?"meet_participant_joined":"meet_participant_left"))return;
        notifyRef.current({
          id:`participant:${chat.event_id}:${participantId}:${payload.eventType}`,
          title:joined ? t("notifications.participantJoined") : t("notifications.participantLeft"),
          text:`${chat.name}: ${t(joined ? "notifications.participantJoinedText" : "notifications.participantLeftText")}`,
          icon:joined ? "👋" : "ℹ️",
          type:"info",
          href:`/meet/${chat.event_id}`,
        });
      });
    });
    channel.subscribe((status)=>{ if(status === "SUBSCRIBED") ready = true; });
    return ()=>{ void supabase.removeChannel(channel); };
  },[meetKey,pathname,settings,user?.id]);

  useEffect(()=>{
    const timers = meetChats.flatMap((chat)=>{
        const chatTimers:ReturnType<typeof setTimeout>[] = [];
        const delay = new Date(chat.event_starts_at).getTime() - Date.now() - 30*60*1000;
        if(notificationEnabled(settings,"meet_reminder") && chat.event_starts_at && delay > 0 && delay <= 24*60*60*1000){
          chatTimers.push(setTimeout(()=>notifyRef.current({id:`meet-soon:${chat.event_id}`,title:t("notifications.meetSoon"),text:`${chat.name}: ${t("notifications.meetSoonText")}`,icon:"⏰",type:"info",href:`/meet/${chat.event_id}`}),delay));
        }
        const endDelay = new Date(chat.event_expires_at).getTime() - Date.now();
        if(chat.event_expires_at && endDelay > 0 && endDelay <= 24*60*60*1000){
          chatTimers.push(setTimeout(()=>notifyRef.current({id:`meet-ended:${chat.event_id}`,title:t("notifications.meetEnded"),text:chat.name,icon:"🏁",type:"info",href:"/meet"}),endDelay));
        }
        return chatTimers;
      });
    return ()=>timers.forEach(clearTimeout);
  },[meetTimingKey,settings]);

  return null;
}
