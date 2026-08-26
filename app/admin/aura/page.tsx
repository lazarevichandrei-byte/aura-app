"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {getTelegramInitData} from "../../../lib/telegram-init-data";
import type {AuraAdminHealth,AuraAdminOverviewV1} from "../../../lib/server/admin/aura/types";

const WINDOWS=["24h","7d","30d"] as const;
const HEALTH_LABEL:Record<AuraAdminHealth,string>={healthy:"Норма",stale:"Устаревает",gap:"Есть пробелы",empty:"Нет данных"};
const HEALTH_DOT:Record<AuraAdminHealth,string>={healthy:"#2cc980",stale:"#f2a93b",gap:"#ef5968",empty:"#8b95a7"};
const card:React.CSSProperties={border:"1px solid rgba(255,255,255,.08)",borderRadius:22,padding:18,background:"rgba(22,22,28,.92)",boxShadow:"0 14px 44px rgba(0,0,0,.18)"};
const muted:React.CSSProperties={color:"#9498a6",fontSize:13,lineHeight:1.45};
const grid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12};
const pct=(value:number)=>`${(value*100).toFixed(1)}%`;
const date=(value:string|null)=>value?new Date(value).toLocaleString("ru-RU"):"Нет данных";

function Status({value}:{value:AuraAdminHealth}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,fontWeight:800,padding:"6px 9px",borderRadius:999,background:"rgba(255,255,255,.06)",color:"#d9dce5"}}><span style={{width:8,height:8,borderRadius:99,background:HEALTH_DOT[value],boxShadow:`0 0 14px ${HEALTH_DOT[value]}`}}/>{HEALTH_LABEL[value]}</span>;
}
function Metric({label,value,sub}:{label:string;value:string|number;sub?:string}){
  return <div style={{minWidth:0}}><div style={muted}>{label}</div><div style={{fontSize:28,fontWeight:850,marginTop:5,letterSpacing:-.6}}>{value}</div>{sub&&<div style={{...muted,marginTop:3,fontSize:11}}>{sub}</div>}</div>;
}
function SectionTitle({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle?:string}){
  return <div style={{margin:"28px 0 12px"}}><div style={{fontSize:11,fontWeight:850,letterSpacing:1.5,textTransform:"uppercase",color:"#7d8bff"}}>{eyebrow}</div><h2 style={{fontSize:24,margin:"5px 0 0",letterSpacing:-.5}}>{title}</h2>{subtitle&&<p style={{...muted,margin:"6px 0 0"}}>{subtitle}</p>}</div>;
}
function MiniBar({value}:{value:number}){
  const width=Math.max(0,Math.min(100,value*100));
  return <div style={{height:7,borderRadius:999,background:"rgba(255,255,255,.07)",overflow:"hidden"}}><div style={{height:"100%",width:`${width}%`,borderRadius:999,background:"linear-gradient(90deg,#6c7cff,#a86dff)"}}/></div>;
}

export default function AuraAdminPage(){
  const [timeframe,setTimeframe]=useState<(typeof WINDOWS)[number]>("7d");
  const [outcomeWindow,setOutcomeWindow]=useState<(typeof WINDOWS)[number]>("24h");
  const [overview,setOverview]=useState<AuraAdminOverviewV1|null>(null);
  const [state,setState]=useState<"loading"|"ready"|"denied"|"error">("loading");
  const [refreshKey,setRefreshKey]=useState(0);

  const load=useCallback(async()=>{
    setState("loading");
    const initData=await getTelegramInitData();
    if(!initData){setState("denied");return;}
    const response=await fetch("/api/admin/aura/overview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,timeframe,outcomeWindow})});
    if(response.status===404){setState("denied");return;}
    const body=await response.json().catch(()=>null);
    if(!response.ok||!body?.ok){setState("error");return;}
    setOverview(body.overview);
    setState("ready");
  },[timeframe,outcomeWindow]);

  useEffect(()=>{let active=true;(async()=>{try{await load();}catch{if(active)setState("error");}})();return()=>{active=false;};},[load,refreshKey]);

  const systemHealth=useMemo(()=>{
    if(!overview)return "empty" as AuraAdminHealth;
    const list=[overview.events.health,overview.features.health,overview.scores.health,overview.outcomes.health];
    if(list.includes("gap"))return "gap" as AuraAdminHealth;
    if(list.includes("stale"))return "stale" as AuraAdminHealth;
    if(list.every(v=>v==="empty"))return "empty" as AuraAdminHealth;
    return "healthy" as AuraAdminHealth;
  },[overview]);

  if(state==="denied")return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",background:"#09090c",color:"#fff"}}><p>Page not found.</p></main>;
  if(state==="error")return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",background:"#09090c",color:"#fff",padding:24,textAlign:"center"}}><div><h2 style={{margin:0}}>Админка временно недоступна</h2><p style={{...muted,maxWidth:360}}>Не удалось получить данные AURA Match.</p><button onClick={()=>setRefreshKey(v=>v+1)} style={{marginTop:8,border:0,borderRadius:14,padding:"12px 16px",fontWeight:800,background:"#fff",color:"#09090c"}}>Повторить</button></div></main>;

  return <main style={{minHeight:"100dvh",background:"radial-gradient(circle at 20% -10%,rgba(100,86,255,.18),transparent 34%),#09090c",color:"#f5f6fa",padding:"calc(18px + env(safe-area-inset-top)) 14px calc(38px + env(safe-area-inset-bottom))"}}>
    <div style={{maxWidth:1180,margin:"0 auto"}}>
      <header style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start",flexWrap:"wrap",padding:"2px 2px 8px"}}>
        <div>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:1.7,color:"#7d8bff",textTransform:"uppercase"}}>AURA INTERNAL</div>
          <h1 style={{fontSize:"clamp(30px,8vw,52px)",margin:"4px 0 0",letterSpacing:-1.6}}>AURA Match</h1>
          <p style={{...muted,margin:"6px 0 0",maxWidth:520}}>Состояние умного подбора, качество данных и реальные результаты рекомендаций.</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {overview&&<Status value={systemHealth}/>}<button onClick={()=>setRefreshKey(v=>v+1)} disabled={state==="loading"} style={{border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"#fff",borderRadius:13,padding:"9px 12px",fontWeight:800}}>{state==="loading"?"Обновление…":"↻ Обновить"}</button>
        </div>
      </header>

      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"10px 1px 4px",scrollbarWidth:"none"}}>
        <label style={{...muted,whiteSpace:"nowrap"}}>Период&nbsp;<select value={timeframe} onChange={e=>setTimeframe(e.target.value as typeof timeframe)} style={{marginLeft:6,padding:"8px 10px",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",background:"#16161c",color:"#fff",fontWeight:800}}>{WINDOWS.map(v=><option key={v}>{v}</option>)}</select></label>
        <label style={{...muted,whiteSpace:"nowrap"}}>Окно результата&nbsp;<select value={outcomeWindow} onChange={e=>setOutcomeWindow(e.target.value as typeof outcomeWindow)} style={{marginLeft:6,padding:"8px 10px",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",background:"#16161c",color:"#fff",fontWeight:800}}>{WINDOWS.map(v=><option key={v}>{v}</option>)}</select></label>
      </div>

      {state==="loading"&&!overview?<div style={{padding:"90px 0",textAlign:"center",color:"#858a99"}}>Загружаю состояние AURA…</div>:overview&&<>
        <SectionTitle eyebrow="01 · МОЗГ" title="Состояние системы" subtitle="Главный экран: работает ли сбор данных, расчёт признаков и скоринг."/>
        <section style={grid}>
          <article style={{...card,background:"linear-gradient(145deg,rgba(103,91,255,.18),rgba(22,22,28,.94))"}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><strong>Режим ранжирования</strong><span style={{fontSize:11,fontWeight:900,textTransform:"uppercase",padding:"5px 8px",borderRadius:999,background:"rgba(125,139,255,.15)",color:"#9ea8ff"}}>{overview.ranking.mode}</span></div><div style={{fontSize:30,fontWeight:900,marginTop:16}}>{overview.ranking.mode==="enabled"?"Активный":"Shadow"}</div><p style={muted}>{overview.ranking.mode==="enabled"?"Скоринг влияет на порядок рекомендаций.":"Система считает рекомендации, но ещё не меняет основной порядок выдачи."}</p></article>
          <article style={card}><div style={{display:"flex",justifyContent:"space-between"}}><strong>События</strong><Status value={overview.events.health}/></div><div style={{...grid,marginTop:17}}><Metric label="За час" value={overview.events.last1h}/><Metric label="За 24 ч" value={overview.events.last24h}/></div><p style={muted}>Последнее: {date(overview.events.latestReceivedAt)}</p></article>
          <article style={card}><div style={{display:"flex",justifyContent:"space-between"}}><strong>Признаки</strong><Status value={overview.features.health}/></div><div style={{...grid,marginTop:17}}><Metric label="User · 24 ч" value={overview.features.userLast24h}/><Metric label="Pair · 24 ч" value={overview.features.pairLast24h}/></div><p style={muted}>Последнее: {date(overview.features.latestSnapshotAt)}</p></article>
          <article style={card}><div style={{display:"flex",justifyContent:"space-between"}}><strong>Скоринг</strong><Status value={overview.scores.health}/></div><div style={{...grid,marginTop:17}}><Metric label="За 24 ч" value={overview.scores.last24h}/><Metric label={`За ${timeframe}`} value={overview.scores.timeframeCount}/></div><p style={muted}>Последнее: {date(overview.scores.latestSnapshotAt)}</p></article>
        </section>

        <SectionTitle eyebrow="02 · ДАННЫЕ" title="Покрытие обучения" subtitle="Сколько подходящих взаимодействий получили итоговый outcome и могут использоваться для оценки качества."/>
        <section style={grid}>{overview.coverage.map(row=><article key={row.windowType} style={card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><strong>{row.windowType}</strong><span style={{fontSize:20,fontWeight:900}}>{pct(row.coverageRate)}</span></div><div style={{margin:"15px 0 12px"}}><MiniBar value={row.coverageRate}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}><Metric label="Готово" value={row.materialized}/><Metric label="Не хватает" value={row.missing}/><Metric label="Всего" value={row.eligibleAnchors}/></div></article>)}</section>

        <SectionTitle eyebrow="03 · РЕЗУЛЬТАТ" title="Что происходит после рекомендации" subtitle="Реальные исходы: лайк, мэтч, начало чата, активность встречи, блок и жалоба."/>
        <section style={{...grid,marginBottom:12}}>
          <article style={card}><div style={{display:"flex",justifyContent:"space-between"}}><strong>Outcomes</strong><Status value={overview.outcomes.health}/></div><div style={{...grid,marginTop:17}}><Metric label={`${outcomeWindow} выбрано`} value={overview.outcomes.selectedCount}/><Metric label="Без score link" value={overview.outcomes.nullScoreLinks}/></div><p style={muted}>Последнее: {date(overview.outcomes.latestEvaluatedAt)}</p></article>
          <article style={card}><strong>Всего рассчитанных outcomes</strong><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:17}}>{WINDOWS.map(w=><Metric key={w} label={w} value={overview.outcomes.totalByWindow[w]}/>)}</div></article>
        </section>

        <section style={card}><div><strong>Score → outcome</strong><p style={{...muted,margin:"5px 0 16px"}}>Наблюдаемая связь между диапазоном score и дальнейшим поведением. Это не причинный вывод.</p></div><div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:830}}><thead><tr>{["Score","N","Open","Like","Pass","Match","Chat","Meet","Block","Report"].map(v=><th key={v} style={{textAlign:"right",padding:"10px 7px",borderBottom:"1px solid rgba(255,255,255,.09)",color:"#8f94a3",fontWeight:800}}>{v}</th>)}</tr></thead><tbody>{overview.scoreOutcome.map(row=><tr key={row.bucket}>{[row.bucket,row.count,pct(row.openRate),pct(row.likeRate),pct(row.passRate),pct(row.matchRate),pct(row.chatStartRate),pct(row.meetActivityRate),pct(row.blockRate),pct(row.reportRate)].map((v,i)=><td key={i} style={{textAlign:"right",padding:"11px 7px",borderBottom:"1px solid rgba(255,255,255,.055)",fontWeight:i<2?800:600}}>{v}</td>)}</tr>)}</tbody></table></div></section>

        <SectionTitle eyebrow="04 · РАСПРЕДЕЛЕНИЕ" title={`Score за ${timeframe}`} subtitle="Проверка, не схлопнулся ли скоринг в один диапазон."/>
        <section style={card}><div style={{display:"grid",gap:12}}>{overview.scores.distribution.map(row=><div key={row.bucket} style={{display:"grid",gridTemplateColumns:"52px 1fr 84px",gap:9,alignItems:"center"}}><span style={{...muted,fontWeight:800}}>{row.bucket}</span><div style={{height:9,borderRadius:999,background:"rgba(255,255,255,.07)",overflow:"hidden"}}><div style={{height:"100%",width:`${row.percent}%`,background:"linear-gradient(90deg,#6c7cff,#a86dff)",borderRadius:999}}/></div><span style={{...muted,textAlign:"right"}}>{row.count} · {row.percent}%</span></div>)}</div></section>

        <footer style={{...muted,textAlign:"center",padding:"28px 0 0",fontSize:11}}>Сформировано: {new Date(overview.generatedAt).toLocaleString("ru-RU")} · доступ только администраторам AURA</footer>
      </>}
    </div>
  </main>;
}
