"use client";

import BottomSheet from "./BottomSheet";
import {useI18n} from "./I18nProvider";
import {SUPPORTED_LOCALES} from "../lib/i18n/locales";

export default function LanguagePickerSheet({open,onClose,onPersist}:{open:boolean;onClose:()=>void;onPersist?:(locale:string)=>Promise<void>|void}){
  const {locale,setLocale,t}=useI18n();

  const choose=(nextLocale:string)=>{
    setLocale(nextLocale,true);
    onClose();
    Promise.resolve(onPersist?.(nextLocale)).catch((error)=>console.error("LANGUAGE PERSIST ERROR",error));
  };

  return <BottomSheet open={open} onClose={onClose} height="min(84dvh, 720px)">
    <div style={{textAlign:"center",flexShrink:0}}>
      <h2 style={{margin:0,fontSize:20}}>{t("settings.language")}</h2>
      <div style={{marginTop:5,fontSize:13,color:"var(--text-secondary)"}}>{t("language.current")}</div>
    </div>
    <div style={{marginTop:16,minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",paddingBottom:8}}>
      {SUPPORTED_LOCALES.map((item)=><button key={item.code} type="button" aria-pressed={item.code===locale} onClick={()=>choose(item.code)} style={{width:"100%",minHeight:56,display:"grid",gridTemplateColumns:"32px minmax(0, 1fr) 24px",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:6,borderRadius:14,color:"var(--text-primary)",background:item.code===locale ? "var(--primary-soft)" : "var(--surface-secondary)",border:`1px solid ${item.code===locale ? "var(--brand-primary)" : "transparent"}`,textAlign:"start",cursor:"pointer"}}>
        <span style={{fontSize:21}}>{item.flag}</span>
        <span style={{minWidth:0}}><strong dir={item.direction} style={{display:"block",fontSize:15,overflowWrap:"anywhere"}}>{item.nativeName}</strong><small style={{color:"var(--text-secondary)"}}>{item.name} · {item.code}</small></span>
        <span aria-hidden style={{color:"var(--brand-primary)",fontSize:18,fontWeight:700,textAlign:"center"}}>{item.code===locale ? "✓" : ""}</span>
      </button>)}
    </div>
  </BottomSheet>;
}
