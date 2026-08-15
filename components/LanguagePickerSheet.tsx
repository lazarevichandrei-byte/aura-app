"use client";

import {useMemo,useState} from "react";
import BottomSheet from "./BottomSheet";
import {useI18n} from "./I18nProvider";
import {SUPPORTED_LOCALES} from "../lib/i18n/locales";

export default function LanguagePickerSheet({open,onClose,onPersist}:{open:boolean;onClose:()=>void;onPersist?:(locale:string)=>Promise<void>|void}){
  const {locale,setLocale,t}=useI18n();
  const [query,setQuery]=useState("");
  const locales=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase();
    const filtered=normalized ? SUPPORTED_LOCALES.filter((item)=>`${item.nativeName} ${item.name} ${item.code}`.toLocaleLowerCase().includes(normalized)) : SUPPORTED_LOCALES;
    return [...filtered].sort((left,right)=>left.code===locale ? -1 : right.code===locale ? 1 : left.nativeName.localeCompare(right.nativeName));
  },[locale,query]);

  const choose=async(nextLocale:string)=>{
    setLocale(nextLocale,true);
    await onPersist?.(nextLocale);
    setQuery("");
    onClose();
  };

  return <BottomSheet open={open} onClose={onClose} height="min(82dvh, 720px)">
    <h2 style={{textAlign:"center",fontSize:20}}>{t("settings.language")}</h2>
    <div style={{marginTop:16,height:46,borderRadius:15,background:"var(--input-bg)",border:"1px solid var(--border)",display:"flex",alignItems:"center",padding:"0 14px",gap:9}}>
      <span aria-hidden>🔎</span>
      <input autoFocus value={query} onChange={(event)=>setQuery(event.target.value)} placeholder={t("language.search")} style={{width:"100%",background:"transparent",color:"var(--text-primary)"}} />
    </div>
    <div style={{marginTop:14,overflowY:"auto",overscrollBehavior:"contain",paddingBottom:8}}>
      {locales.map((item)=><button key={item.code} type="button" onClick={()=>void choose(item.code)} style={{width:"100%",minHeight:54,display:"grid",gridTemplateColumns:"32px 1fr auto",alignItems:"center",gap:10,padding:"8px 12px",marginBottom:6,borderRadius:14,background:item.code===locale ? "var(--primary-soft)" : "var(--surface-secondary)",border:`1px solid ${item.code===locale ? "var(--brand-primary)" : "transparent"}`,textAlign:"start",cursor:"pointer"}}>
        <span style={{fontSize:21}}>{item.flag}</span>
        <span><strong style={{display:"block",fontSize:14}}>{item.nativeName}</strong><small style={{color:"var(--text-secondary)"}}>{item.name} · {item.code}</small></span>
        <span style={{color:"var(--brand-primary)"}}>{item.code===locale ? "✓" : ""}</span>
      </button>)}
    </div>
  </BottomSheet>;
}
