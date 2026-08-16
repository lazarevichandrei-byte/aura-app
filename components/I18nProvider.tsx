"use client";

import {createContext,ReactNode,useContext,useEffect,useMemo,useState} from "react";
import {dictionaryFor,TranslationKey} from "../lib/i18n/dictionary";
import {DEFAULT_LOCALE,LOCALE_BY_CODE,normalizeLocale,resolveSupportedLocale} from "../lib/i18n/locales";
import {assertDictionariesComplete,dictionaryAudit} from "../lib/i18n/validate";

const STORAGE_KEY="aura-language";
const MANUAL_KEY="aura-language-manual";
const SOURCE_KEY="aura-language-source";
const reportedFallbacks=new Set<string>();

export function hasManualLocalePreference(){return typeof window!=="undefined"&&localStorage.getItem(SOURCE_KEY)==="manual";}

type TranslationParams=Record<string,string|number>;
type I18nContextValue={locale:string;intlLocale:string;direction:"ltr"|"rtl";setLocale:(locale:string,manual?:boolean)=>void;t:(key:TranslationKey,params?:TranslationParams)=>string};
const I18nContext=createContext<I18nContextValue|null>(null);

function initialLocale(){
  if(typeof window==="undefined") return DEFAULT_LOCALE;
  const stored=window.localStorage.getItem(STORAGE_KEY);
  if(hasManualLocalePreference()&&stored)return normalizeLocale(stored);
  const bootstrapped=(window as any).__AURA_INITIAL_LOCALE__;
  if(bootstrapped)return normalizeLocale(bootstrapped);
  const telegram=(window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  return resolveSupportedLocale(telegram,...(navigator.languages||[]),navigator.language);
}

export default function I18nProvider({children}:{children:ReactNode}){
  const [locale,setLocaleState]=useState(initialLocale);
  const [localeResolved,setLocaleResolved]=useState(()=>typeof window==="undefined"||hasManualLocalePreference()||Boolean((window as any).__AURA_TELEGRAM_LOCALE__));
  const metadata=LOCALE_BY_CODE.get(locale) || LOCALE_BY_CODE.get(DEFAULT_LOCALE)!;

  const setLocale=(nextLocale:string,manual=true)=>{
    const normalized=normalizeLocale(nextLocale);
    localStorage.setItem(STORAGE_KEY,normalized);
    localStorage.setItem(SOURCE_KEY,manual?"manual":"auto");
    if(manual)localStorage.setItem(MANUAL_KEY,"1");else localStorage.removeItem(MANUAL_KEY);
    setLocaleState(normalized);
    setLocaleResolved(true);
  };

  useEffect(()=>{
    if(localeResolved)return;
    let stopped=false;
    const started=Date.now();
    const resolve=()=>{
      const telegram=(window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code||(window as any).__AURA_TELEGRAM_LOCALE__;
      if(telegram||Date.now()-started>=400){
        const resolved=resolveSupportedLocale(telegram,...(navigator.languages||[]),navigator.language);
        localStorage.setItem(STORAGE_KEY,resolved);localStorage.setItem(SOURCE_KEY,"auto");localStorage.removeItem(MANUAL_KEY);
        if(!stopped){setLocaleState(resolved);setLocaleResolved(true);}return;
      }
      window.setTimeout(resolve,40);
    };
    resolve();
    return()=>{stopped=true;};
  },[localeResolved]);

  useEffect(()=>{
    if(!localeResolved)return;
    if(!performance.getEntriesByName("I18N_READY").length) performance.mark("I18N_READY");
    document.documentElement.lang=metadata.code;
    document.documentElement.dir=metadata.direction;
    document.documentElement.dataset.auraI18nReady="1";
    if(!hasManualLocalePreference()){localStorage.setItem(STORAGE_KEY,locale);localStorage.setItem(SOURCE_KEY,"auto");}
  },[locale,localeResolved,metadata.code,metadata.direction]);

  useEffect(()=>{
    if(!localeResolved)return;
    if(process.env.NODE_ENV !== "production"){
      const telegramLanguage=(window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code||(window as any).__AURA_TELEGRAM_LOCALE__||null;
      let cachedUserLanguage=null;try{cachedUserLanguage=JSON.parse(localStorage.getItem("aura-current-user-snapshot")||"null")?.language||null;}catch{}
      console.info("[I18N_BOOTSTRAP]",{telegramLanguage,browserLanguages:[...(navigator.languages||[]),navigator.language].filter(Boolean),storedLanguage:localStorage.getItem(STORAGE_KEY),storedLanguageSource:localStorage.getItem(SOURCE_KEY),cachedUserLanguage,resolvedLanguage:locale,resolutionReason:hasManualLocalePreference()?"manual":telegramLanguage?"telegram":"browser_or_default"});
      assertDictionariesComplete();
      console.info("[I18N_AUDIT]",dictionaryAudit().map(({locale,totalKeys,missing,extra,suspiciousSameAsEnglish,coreSuspiciousSameAsEnglish,sameAsEnglishPercentage})=>({locale,totalKeys,missing:missing.length,extra:extra.length,suspiciousSameAsEnglish:suspiciousSameAsEnglish.length,coreSuspiciousSameAsEnglish:coreSuspiciousSameAsEnglish.length,sameAsEnglishPercentage})));
    }
  },[locale,localeResolved]);

  const value=useMemo(()=>({locale,intlLocale:metadata.intlLocale,direction:metadata.direction,setLocale,t:(key:TranslationKey,params?:TranslationParams)=>{
    const localized=dictionaryFor(locale)[key];
    const fallback=dictionaryFor(DEFAULT_LOCALE)[key];
    if(!localized && process.env.NODE_ENV !== "production") console.warn(`[i18n] Missing ${locale}:${key}`);
    if(process.env.NODE_ENV !== "production"&&locale!==DEFAULT_LOCALE&&localized===fallback){
      const signature=`${locale}:${key}`;
      if(!reportedFallbacks.has(signature)){reportedFallbacks.add(signature);console.warn(`[I18N_FALLBACK] locale=${locale} key=${key}`);}
    }
    const template=localized || fallback || key;
    return params ? template.replace(/\{(\w+)\}/g,(match,name)=>params[name] === undefined ? match : String(params[name])) : template;
  }}),[locale,metadata.direction,metadata.intlLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(){const context=useContext(I18nContext);if(!context) throw new Error("useI18n must be used inside I18nProvider");return context;}
