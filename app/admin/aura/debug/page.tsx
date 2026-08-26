"use client";

import {useEffect,useState} from "react";
import {getTelegramInitData} from "../../../../lib/telegram-init-data";

type Diagnostic={
  telegramSdk:boolean;
  hasInitData:boolean;
  telegramUserId:string;
  initDataLength:number;
  apiStatus:number|null;
  apiError:string;
};

export default function AuraAdminDebugPage(){
  const [diagnostic,setDiagnostic]=useState<Diagnostic|null>(null);

  useEffect(()=>{
    (async()=>{
      const webApp=(window as any)?.Telegram?.WebApp;
      const initData=await getTelegramInitData(2000);
      const telegramUserId=String(webApp?.initDataUnsafe?.user?.id??"");
      let apiStatus:number|null=null;
      let apiError="";
      if(initData){
        try{
          const response=await fetch("/api/admin/aura/overview",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({initData,timeframe:"7d",outcomeWindow:"24h"}),
          });
          apiStatus=response.status;
          const body=await response.json().catch(()=>null);
          apiError=String(body?.error??(response.ok?"OK":"UNKNOWN"));
        }catch(error){
          apiError=error instanceof Error?error.message:"FETCH_FAILED";
        }
      }else{
        apiError="NO_INIT_DATA";
      }
      setDiagnostic({telegramSdk:Boolean(webApp),hasInitData:Boolean(initData),telegramUserId,initDataLength:initData.length,apiStatus,apiError});
    })();
  },[]);

  return <main style={{minHeight:"100vh",padding:24,background:"#0b0b0d",color:"#fff",fontFamily:"system-ui,sans-serif"}}>
    <div style={{maxWidth:620,margin:"0 auto"}}>
      <h1>AURA Admin diagnostics</h1>
      {!diagnostic?<p>Checking Telegram authorization…</p>:<div style={{display:"grid",gap:12}}>
        <Row label="Telegram SDK" value={diagnostic.telegramSdk?"YES":"NO"}/>
        <Row label="Telegram initData" value={diagnostic.hasInitData?"YES":"NO"}/>
        <Row label="Telegram user ID" value={diagnostic.telegramUserId||"MISSING"}/>
        <Row label="initData length" value={String(diagnostic.initDataLength)}/>
        <Row label="Admin API HTTP" value={diagnostic.apiStatus===null?"NOT CALLED":String(diagnostic.apiStatus)}/>
        <Row label="Admin API result" value={diagnostic.apiError||"UNKNOWN"}/>
        <p style={{opacity:.65,fontSize:13}}>This page intentionally does not display Telegram initData or secrets.</p>
      </div>}
    </div>
  </main>;
}

function Row({label,value}:{label:string;value:string}){
  return <div style={{padding:16,border:"1px solid #333",borderRadius:14,background:"#151519"}}><div style={{opacity:.6,fontSize:12}}>{label}</div><div style={{fontSize:20,fontWeight:700,marginTop:5,wordBreak:"break-word"}}>{value}</div></div>;
}
