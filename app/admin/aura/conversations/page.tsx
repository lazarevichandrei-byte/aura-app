"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {getTelegramInitData} from "../../../../lib/telegram-init-data";

type User={id:string;name:string;telegram_id?:string|number|null};
type Pair={viewer:User;candidate:User;snapshotAt:string;features:Record<string,any>;latestScore:any|null};
type Detail={users:User[];pairSnapshots:{snapshot_at:string;features:Record<string,any>}[];scores:any[];chat:any|null;messages:{id:string;sender_id:string;body:string|null;created_at:string;message_type:string}[]};

const card:React.CSSProperties={border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:16,background:"rgba(22,22,28,.94)"};
const muted:React.CSSProperties={color:"#969aa8",fontSize:12,lineHeight:1.45};
const fmt=(v:any)=>v===null||v===undefined?"—":typeof v==="boolean"?(v?"Да":"Нет"):String(v);
const date=(v:string)=>new Date(v).toLocaleString("ru-RU");

export default function AuraConversationDiagnostics(){
  const router=useRouter();
  const [pairs,setPairs]=useState<Pair[]>([]);const [selected,setSelected]=useState<Pair|null>(null);const [detail,setDetail]=useState<Detail|null>(null);const [state,setState]=useState("loading");
  const request=useCallback(async(payload:any)=>{const initData=await getTelegramInitData();if(!initData)throw new Error("NO_INIT_DATA");const r=await fetch("/api/admin/aura/conversations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,...payload})});if(r.status===404)throw new Error("DENIED");const b=await r.json();if(!r.ok||!b?.ok)throw new Error(b?.error||"FAILED");return b;},[]);
  const load=useCallback(async()=>{setState("loading");try{const b=await request({mode:"list"});setPairs(b.pairs??[]);setState("ready");}catch{setState("error");}},[request]);
  useEffect(()=>{load();},[load]);
  const openPair=async(pair:Pair)=>{setSelected(pair);setDetail(null);try{const b=await request({mode:"detail",viewerUserId:pair.viewer.id,candidateUserId:pair.candidate.id});setDetail(b.detail);}catch{setDetail(null);}};
  const conversationKeys=useMemo(()=>Object.keys(selected?.features??{}).filter(k=>k.includes("message")||k.includes("reply")||k.includes("conversation")||k.includes("chat_days")||k.includes("burst")||k.includes("balance")||k.includes("started_conversation")||k.includes("meet_intent")),[selected]);
  return <main style={{minHeight:"100dvh",background:"#09090c",color:"#f6f7fb",padding:"calc(16px + env(safe-area-inset-top)) 14px 40px"}}><div style={{maxWidth:1100,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:16}}><div><div style={{fontSize:11,color:"#8190ff",fontWeight:900,letterSpacing:1.4}}>AURA INTERNAL</div><h1 style={{margin:"3px 0",fontSize:30}}>Диалоги</h1><p style={{...muted,margin:0}}>Проверка того, что мозг реально считал из конкретной переписки.</p></div><button onClick={()=>router.push("/admin/aura")} style={{border:0,borderRadius:12,padding:"10px 12px",fontWeight:800}}>← Назад</button></div>
    {state==="loading"&&<p style={muted}>Загрузка…</p>}{state==="error"&&<div style={card}>Не удалось загрузить диагностику. <button onClick={load}>Повторить</button></div>}
    {state==="ready"&&<div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:12}}>{pairs.length===0?<div style={card}>Пока нет pair snapshots.</div>:pairs.map((p,i)=><button key={`${p.viewer.id}:${p.candidate.id}:${i}`} onClick={()=>openPair(p)} style={{...card,textAlign:"left",color:"inherit",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",gap:8}}><strong>{p.viewer.name||"User"} → {p.candidate.name||"User"}</strong><span style={{fontWeight:900,color:"#9aa5ff"}}>V{p.latestScore?.score_version??"—"} · {p.latestScore?.total_score??"—"}</span></div><div style={{...muted,marginTop:6}}>Pair snapshot: {date(p.snapshotAt)} · сообщений: {fmt(p.features.direct_message_count_30d)} · баланс: {fmt(p.features.message_balance_ratio)}</div></button>)}</div>}
    {selected&&<section style={{marginTop:22}}><h2>{selected.viewer.name} ↔ {selected.candidate.name}</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>{conversationKeys.map(k=><div key={k} style={card}><div style={muted}>{k}</div><div style={{fontSize:22,fontWeight:900,marginTop:6}}>{fmt(selected.features[k])}</div></div>)}</div>
      <div style={{...card,marginTop:12}}><strong>Score snapshots</strong>{detail?.scores?.length?<div style={{marginTop:10,display:"grid",gap:8}}>{detail.scores.map((s:any,i:number)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}><b>V{s.score_version} · {s.total_score}</b><div style={muted}>{date(s.snapshot_at)} · reciprocity {fmt(s.components?.reciprocity)} · engagement {fmt(s.components?.engagement)}</div></div>)}</div>:<p style={muted}>Нет score snapshots.</p>}</div>
      <div style={{...card,marginTop:12}}><div style={{display:"flex",justifyContent:"space-between",gap:8}}><strong>Последние сообщения</strong><span style={muted}>{detail?.messages?.length??0}</span></div><p style={muted}>Сырые сообщения доступны только в защищённой админке для проверки анализатора. Просмотр логируется на сервере.</p>{detail?.messages?.length?<div style={{display:"grid",gap:8,marginTop:10}}>{detail.messages.map(m=>{const u=detail.users.find(x=>x.id===m.sender_id);return <div key={m.id} style={{padding:10,borderRadius:12,background:"rgba(255,255,255,.045)"}}><div style={{fontSize:11,fontWeight:800,color:"#9ba5ff"}}>{u?.name??m.sender_id} · {date(m.created_at)}</div><div style={{marginTop:5,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.body||`[${m.message_type}]`}</div></div>})}</div>:<p style={muted}>Сообщений нет.</p>}</div>
    </section>}
  </div></main>;
}
