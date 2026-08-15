"use client";

import {createContext,ReactNode,useContext,useEffect,useMemo,useState} from "react";
import {dictionaryFor,TranslationKey} from "../lib/i18n/dictionary";
import {DEFAULT_LOCALE,LOCALE_BY_CODE,normalizeLocale} from "../lib/i18n/locales";
import {assertDictionariesComplete} from "../lib/i18n/validate";

const STORAGE_KEY="aura-language";
const MANUAL_KEY="aura-language-manual";

type TranslationParams=Record<string,string|number>;
type I18nContextValue={locale:string;intlLocale:string;direction:"ltr"|"rtl";setLocale:(locale:string,manual?:boolean)=>void;t:(key:TranslationKey,params?:TranslationParams)=>string};
const I18nContext=createContext<I18nContextValue|null>(null);

function initialLocale(){
  if(typeof window==="undefined") return DEFAULT_LOCALE;
  const stored=window.localStorage.getItem(STORAGE_KEY);
  if(stored) return normalizeLocale(stored);
  const telegram=(window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  return normalizeLocale(telegram || navigator.language);
}

export default function I18nProvider({children}:{children:ReactNode}){
  const [locale,setLocaleState]=useState(initialLocale);
  const metadata=LOCALE_BY_CODE.get(locale) || LOCALE_BY_CODE.get(DEFAULT_LOCALE)!;

  const setLocale=(nextLocale:string,manual=true)=>{
    const normalized=normalizeLocale(nextLocale);
    localStorage.setItem(STORAGE_KEY,normalized);
    if(manual) localStorage.setItem(MANUAL_KEY,"1");
    setLocaleState(normalized);
  };

  useEffect(()=>{
    if(!performance.getEntriesByName("I18N_READY").length) performance.mark("I18N_READY");
    document.documentElement.lang=metadata.code;
    document.documentElement.dir=metadata.direction;
    if(!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY,locale);
  },[locale,metadata.code,metadata.direction]);

  useEffect(()=>{
    if(process.env.NODE_ENV !== "production") assertDictionariesComplete();
  },[]);

  const value=useMemo(()=>({locale,intlLocale:metadata.intlLocale,direction:metadata.direction,setLocale,t:(key:TranslationKey,params?:TranslationParams)=>{
    const localized=dictionaryFor(locale)[key];
    const fallback=dictionaryFor(DEFAULT_LOCALE)[key];
    if(!localized && process.env.NODE_ENV !== "production") console.warn(`[i18n] Missing ${locale}:${key}`);
    const template=localized || fallback || key;
    return params ? template.replace(/\{(\w+)\}/g,(match,name)=>params[name] === undefined ? match : String(params[name])) : template;
  }}),[locale,metadata.direction,metadata.intlLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(){const context=useContext(I18nContext);if(!context) throw new Error("useI18n must be used inside I18nProvider");return context;}
