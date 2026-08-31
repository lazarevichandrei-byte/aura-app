"use client";

import {useCallback,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getTelegramInitData} from "../../../../lib/telegram-init-data";

type BrainStatus="GREEN"|"YELLOW"|"RED";
type BrainRow={id:string;component:string;stage:string;severity:string;code:string;viewer_user_id:string|null;candidate_user_id:string|null;snapshot_at:string|null;retryable:boolean;retry_attempts:number;next_retry_at:string|null;occurred_at:string};
type BrainData={generatedAt:string;status:BrainStatus;productionRanking:string;automaticPromotion:boolean;last24h:{total:number;byComponent:Record<string,number>};last7d:{total:number;byComponent:Record<string,number>};unresolved:BrainRow[];retryQueue:number};

const card:React.CSSProperties={border:"1px solid rgba(255,255,255,.09)",borderRadius:20,padding:18,background:"rgba(22,22,28,.94)"};
const grid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12};
const muted:React.CSSProperties={color:"#969baa",fontSize:13,lineHeight:1.5};
const statusColor:Record<BrainStatus,string>={GREEN:"#38d787",YELLOW:"#f0b84b",RED:"#ef5968"};

export default function AuraBrainHealthPage(){
  const router=useRouter();
  const [data,setData]=useState<BrainData|null>(null);
  const [state,setState]=useState<"loading"|"ready"|"denied"|"error">("loading");

  const load=useCallback(async()=>{
    setState("loading");
    const initData=await getTelegramInitData();
    if(!initData){setState("denied");return;}
    const response=await fetch("/api/admin/aura/brain-health",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData})});
    if(response.status===404){setState("denied");return;}
    const body=await response.json().catch(()=>null);
    if(!response.ok||!body?.ok){setState("error");return;}
    setData(body);
    setState("ready");
  },[]);

  useEffect(()=>{load();},[load]);

  if(state==="denied")return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",background:"#09090c",color:"#fff"}}>Page not found.</main>;

  return <main style={{minHeight:"100dvh",background:"#09090c",color:"#f7f7fb",padding:"calc(18px + env(safe-area-inset-top)) 14px 40px"}}><div style={{maxWidth:1180,margin:"0 auto"}}>
    <header style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <div><div style={{fontSize:11,fontWeight:900,letterSpacing:1.5,color:"#8a95ff"}}>AURA INTERNAL · RELIABILITY</div><h1 style={{margin:"5px 0",fontSize:"clamp(30px,8vw,48px)"}}>Brain Health</h1><p style={muted}>Ошибки production V2, Shadow V3 и Candidate, автоматические повторные попытки и текущая очередь восстановления.</p></div>
      <div style={{display:"flex",gap:8}}><button onClick={()=>router.push("/admin/aura")} style={{padding:"10px 13px",borderRadius:12,border:"1px solid #333",background:"#17171d",color:"#fff",fontWeight:800}}>← AURA Match</button><button onClick={()=>router.push("/admin/aura/shadow")} style={{padding:"10px 13px",borderRadius:12,border:"1px solid #333",background:"#17171d",color:"#fff",fontWeight:800}}>Shadow Lab</button><button onClick={load} style={{padding:"10px 13px",borderRadius:12,border:0,background:"#fff",color:"#09090c",fontWeight:900}}>↻</button></div>
    </header>

    {state==="loading"&&!data?<div style={{padding:80,textAlign:"center",color:"#888"}}>Загрузка…</div>:state==="error"?<div style={{...card,marginTop:30}}>Не удалось загрузить Brain Health.</div>:data&&<>
      <section style={{...grid,marginTop:28}}>
        <article style={{...card,borderColor:`${statusColor[data.status]}66`}}><div style={muted}>Runtime status</div><div style={{fontSize:34,fontWeight:900,color:statusColor[data.status]}}>{data.status}</div><p style={muted}>Production ranking: V{data.productionRanking}</p></article>
        <article style={card}><div style={muted}>Failures · 24h</div><div style={{fontSize:34,fontWeight:900}}>{data.last24h.total}</div><p style={muted}>Все зарегистрированные runtime-события за сутки.</p></article>
        <article style={card}><div style={muted}>Failures · 7d</div><div style={{fontSize:34,fontWeight:900}}>{data.last7d.total}</div><p style={muted}>Накопленная история за 7 дней.</p></article>
        <article style={card}><div style={muted}>Retry queue</div><div style={{fontSize:34,fontWeight:900}}>{data.retryQueue}</div><p style={muted}>Автовосстановление, максимум 3 попытки. Auto promotion OFF.</p></article>
      </section>

      <h2 style={{margin:"30px 0 12px"}}>Компоненты · 24h</h2>
      <section style={grid}>{Object.entries(data.last24h.byComponent).length===0?<article style={card}><p style={muted}>Ошибок за 24 часа нет.</p></article>:Object.entries(data.last24h.byComponent).map(([component,count])=><article key={component} style={card}><div style={muted}>{component}</div><div style={{fontSize:30,fontWeight:900,marginTop:7}}>{count}</div></article>)}</section>

      <h2 style={{margin:"30px 0 12px"}}>Неразрешённые события</h2>
      <section style={card}>{data.unresolved.length===0?<p style={muted}>Открытых проблем нет.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:980,borderCollapse:"collapse",fontSize:12}}><thead><tr>{["Time","Component","Stage","Severity","Code","Retry","Attempts","Next retry"].map(x=><th key={x} style={{padding:9,textAlign:"left",borderBottom:"1px solid #333",color:"#999"}}>{x}</th>)}</tr></thead><tbody>{data.unresolved.map(row=><tr key={row.id}>{[new Date(row.occurred_at).toLocaleString("ru-RU"),row.component,row.stage,row.severity,row.code,row.retryable?"YES":"NO",row.retry_attempts,row.next_retry_at?new Date(row.next_retry_at).toLocaleString("ru-RU"):"—"].map((value,index)=><td key={index} style={{padding:9,borderBottom:"1px solid #222",fontWeight:index===1||index===3?800:500}}>{value}</td>)}</tr>)}</tbody></table></div>}</section>
    </>}
  </div></main>;
}
