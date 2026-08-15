"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft2} from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";
import {ListSkeleton} from "../../components/AppSkeletons";
import {useI18n} from "../../components/I18nProvider";
import {useNotification} from "../../components/NotificationContext";
import {selection} from "../../lib/haptic";
import {getTelegramInitData} from "../../lib/telegram-init-data";
import {DEFAULT_NOTIFICATION_PREFERENCES,type NotificationPreferences} from "../../lib/notifications/preferences";

const CACHE_KEY="aura-notification-preferences";
type PreferenceKey=keyof NotificationPreferences;
const sections=[
  {title:"navigation.chats",items:[
    ["privateMessages","💬","notificationSettings.messages","notificationSettings.messagesHint"],
    ["meetChatMessages","👥","meet.sharedChat","notifications.newMessage"],
  ]},
  {title:"meet.title",items:[
    ["meetRequestNew","📨","notifications.newRequest","notifications.newRequestText"],
    ["meetRequestApproved","✅","notifications.requestAccepted","notifications.chatAvailable"],
    ["meetRequestRejected","ℹ️","notifications.requestRejected","notifications.requestRejectedText"],
    ["meetParticipantJoined","👋","notifications.participantJoined","notifications.participantJoinedText"],
    ["meetParticipantLeft","🚪","notifications.participantLeft","notifications.participantLeftText"],
    ["meetUpdated","📅","notifications.meetChanged","notifications.newTime"],
    ["meetCancelled","⚠️","notifications.meetCancelled","notifications.meetCancelledText"],
    ["meetReminder","⏰","notifications.meetSoon","notifications.meetSoonText"],
  ]},
  {title:"likes.title",items:[
    ["likes","❤️","notificationSettings.likes","notificationSettings.likesHint"],
    ["matches","💙","notificationSettings.matches","notificationSettings.matchesHint"],
  ]},
  {title:"notificationSettings.news",items:[["system","📢","notificationSettings.news","notificationSettings.newsHint"]]},
] as const;

function cachedPreferences(){try{return {...DEFAULT_NOTIFICATION_PREFERENCES,...JSON.parse(localStorage.getItem(CACHE_KEY)||"null")};}catch{return null;}}

export default function NotificationsPage(){
  const router=useRouter();const {t}=useI18n();const {error:showError}=useNotification();
  const [preferences,setPreferences]=useState<NotificationPreferences|null>(()=>typeof window==="undefined"?null:cachedPreferences());
  const [loadError,setLoadError]=useState(false);const saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null);const lastSaved=useRef<NotificationPreferences|null>(preferences);

  const load=useCallback(async()=>{setLoadError(false);try{const initData=await getTelegramInitData();if(!initData)throw new Error("AUTH_REQUIRED");const response=await fetch("/api/notification-settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData})});const result=await response.json();if(!response.ok||!result?.ok)throw new Error(result?.error);setPreferences(result.preferences);lastSaved.current=result.preferences;localStorage.setItem(CACHE_KEY,JSON.stringify(result.preferences));}catch{setLoadError(true);}},[]);
  useEffect(()=>{void load();return()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};},[load]);

  const save=(next:NotificationPreferences)=>{if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(async()=>{try{const initData=await getTelegramInitData();if(!initData)throw new Error("AUTH_REQUIRED");const response=await fetch("/api/notification-settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,preferences:next})});const result=await response.json();if(!response.ok||!result?.ok)throw new Error(result?.error);lastSaved.current=result.preferences;localStorage.setItem(CACHE_KEY,JSON.stringify(result.preferences));window.dispatchEvent(new CustomEvent("notification-preferences-updated",{detail:result.preferences}));}catch{if(lastSaved.current)setPreferences(lastSaved.current);showError(t("common.error"),t("support.sendFailed"));}},350);};
  const toggle=(key:PreferenceKey)=>{if(!preferences)return;selection();const next={...preferences,[key]:!preferences[key]};setPreferences(next);localStorage.setItem(CACHE_KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent("notification-preferences-updated",{detail:next}));save(next);};

  if(!preferences&&!loadError)return <ListSkeleton rows={8}/>;
  if(!preferences)return <main className="app-page" style={{display:"grid",placeItems:"center",padding:24,textAlign:"center"}}><div><p>{t("common.error")}</p><button onClick={()=>void load()} style={retryStyle}>{t("common.retry")}</button></div></main>;
  return <PageWrapper><main className="app-page" style={{padding:"20px 20px 48px"}}><div style={{maxWidth:520,margin:"0 auto"}}>
    <header style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}><button onClick={()=>router.back()} aria-label={t("common.backAria")} style={backStyle}><ArrowLeft2 size={28} color="var(--primary)"/></button><div><h1 style={{fontSize:24}}>{t("notificationSettings.title")}</h1><p style={subtitleStyle}>{t("notificationSettings.subtitle")}</p></div></header>
    <PreferenceRow icon="🔔" title={t("notificationSettings.title")} subtitle={preferences.enabled?t("notificationSettings.subtitle"):t("settings.notificationsHint")} active={preferences.enabled} onClick={()=>toggle("enabled")} featured/>
    {sections.map((section)=><section key={section.title} style={{marginTop:26}}><h2 style={sectionTitleStyle}>{t(section.title)}</h2><div style={sectionStyle}>{section.items.map(([key,icon,title,hint])=><PreferenceRow key={key} icon={icon} title={t(title)} subtitle={t(hint)} active={preferences[key]} muted={!preferences.enabled} onClick={()=>toggle(key)}/>)}</div></section>)}
  </div></main></PageWrapper>;
}

function PreferenceRow({icon,title,subtitle,active,onClick,muted=false,featured=false}:{icon:string;title:string;subtitle:string;active:boolean;onClick:()=>void;muted?:boolean;featured?:boolean}){return <div style={{...rowStyle,opacity:muted ? .62 : 1,background:featured?"var(--primary-soft)":"var(--surface)"}}><span style={{fontSize:22}}>{icon}</span><div style={{minWidth:0,flex:1}}><strong style={{display:"block",fontSize:15}}>{title}</strong><small style={subtitleStyle}>{subtitle}</small></div><button type="button" role="switch" aria-checked={active} onClick={onClick} style={{...switchStyle,background:active?"var(--primary)":"var(--surface-secondary)"}}><span style={{...thumbStyle,transform:`translateX(${active?22:2}px)`}}/></button></div>}
const rowStyle={display:"flex",alignItems:"center",gap:12,minHeight:68,padding:"12px 14px",borderBottom:"1px solid var(--border-subtle)",transition:"opacity .16s ease"};
const sectionStyle={overflow:"hidden",borderRadius:20,border:"1px solid var(--border-subtle)",background:"var(--surface)",boxShadow:"var(--shadow-sm)"};
const sectionTitleStyle={fontSize:13,fontWeight:700,color:"var(--text-secondary)",margin:"0 4px 9px"};const subtitleStyle={display:"block",marginTop:3,fontSize:12,lineHeight:1.35,color:"var(--text-secondary)"};
const switchStyle={width:52,height:30,borderRadius:999,padding:0,position:"relative" as const,flexShrink:0,cursor:"pointer",transition:"background .18s ease"};const thumbStyle={position:"absolute" as const,top:3,left:0,width:24,height:24,borderRadius:"50%",background:"var(--surface-elevated)",boxShadow:"var(--shadow-sm)",transition:"transform .18s ease"};
const backStyle={width:38,height:38,display:"grid",placeItems:"center",background:"transparent",cursor:"pointer"};const retryStyle={marginTop:16,height:44,padding:"0 22px",borderRadius:14,background:"var(--primary)",color:"var(--text-inverse)"};
