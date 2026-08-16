"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import HomeSkeleton from "../components/HomeSkeleton";
import LanguagePickerSheet from "../components/LanguagePickerSheet";
import {useNotification} from "../components/NotificationContext";
import {useI18n} from "../components/I18nProvider";
import {LOCALE_BY_CODE} from "../lib/i18n/locales";
import {DELETED_SESSION_KEY,loadCurrentUser,setCurrentUserCache} from "../lib/useCurrentUser";
import {getTelegramInitData} from "../lib/telegram-init-data";

type StartupState="loading"|"new_user"|"deleted_session"|"error";

export default function Page(){
  const router=useRouter();
  const {t,locale}=useI18n();
  const {error:showError}=useNotification();
  const [state,setState]=useState<StartupState>("loading");
  const [languageOpen,setLanguageOpen]=useState(false);
  const [loginPending,setLoginPending]=useState(false);

  useEffect(()=>{
    performance.mark("APP_START");
    const telegram=(window as any).Telegram?.WebApp;
    telegram?.ready?.();
    telegram?.expand?.();
    if(sessionStorage.getItem(DELETED_SESSION_KEY)==="1"){setState("deleted_session");return;}
    loadCurrentUser({force:true}).then((user)=>{
      if(!user){setState("new_user");return;}
      router.replace(user.onboarding_completed?"/home":"/profile");
    }).catch(()=>setState("error"));
  },[router]);

  const login=async()=>{
    if(loginPending)return;
    setLoginPending(true);
    try{
      const initData=await getTelegramInitData();
      if(!initData)throw new Error("NO_INIT_DATA");
      const response=await fetch("/api/auth/telegram",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,action:"create",language:locale})});
      const result=await response.json().catch(()=>null);
      if(!response.ok||!result?.ok||!result.user)throw new Error(result?.error||"AUTH_FAILED");
      sessionStorage.removeItem(DELETED_SESSION_KEY);
      setCurrentUserCache(result.user);
      router.replace(result.user.onboarding_completed?"/home":"/profile");
    }catch{
      showError(t("common.error"),t("auth.loginError"));
      setState("new_user");
    }finally{setLoginPending(false);}
  };

  if(state==="loading")return <HomeSkeleton/>;

  if(state==="deleted_session")return <main className="welcome-shell"><section className="welcome-center"><img className="welcome-mark" src="/favicon.ico" alt="Aura"/><h1>Aura</h1><p>{t("account.deleted")}</p><button className="welcome-cta" onClick={()=>{sessionStorage.removeItem(DELETED_SESSION_KEY);const telegram=(window as any).Telegram?.WebApp;if(typeof telegram?.close==="function")telegram.close();else setState("new_user");}}>{t("account.close")}</button></section></main>;

  return <main className="welcome-shell">
    <section className="welcome-center">
      <img className="welcome-mark" src="/favicon.ico" alt="Aura"/>
      <h1>Aura</h1>
      <p>{t(state==="error"?"auth.loginError":"auth.welcome")}</p>
      <button className="welcome-cta" disabled={loginPending} onClick={login}>{loginPending?t("common.loading"):t("auth.loginWithTelegram")}</button>
    </section>
    <footer className="welcome-footer">
      <button type="button" onClick={()=>setLanguageOpen(true)}>🌐 <span dir="auto">{LOCALE_BY_CODE.get(locale)?.nativeName||locale}</span></button>
      <button type="button" className="welcome-legal" onClick={()=>router.push("/privacy-policy")}>{t("account.privacyPolicy")}</button>
    </footer>
    <LanguagePickerSheet open={languageOpen} onClose={()=>setLanguageOpen(false)}/>
    <style jsx>{`
      .welcome-shell{min-height:var(--tg-viewport-stable-height,100dvh);background:var(--app-bg);color:var(--text-primary);display:flex;flex-direction:column;padding:calc(24px + env(safe-area-inset-top)) 24px calc(18px + env(safe-area-inset-bottom));overflow:hidden}
      .welcome-center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:0}
      .welcome-mark{width:88px;height:88px;border-radius:24px;box-shadow:0 16px 40px color-mix(in srgb,var(--brand-primary) 24%,transparent)}
      h1{font-size:46px;line-height:1;margin:20px 0 0;letter-spacing:-1.5px}
      p{max-width:320px;margin:12px 0 34px;color:var(--text-secondary);font-size:16px;line-height:1.5}
      .welcome-cta{width:min(100%,340px);min-height:56px;padding:0 20px;border:0;border-radius:18px;background:var(--brand-gradient);color:var(--text-inverse);font-size:16px;font-weight:750;cursor:pointer;box-shadow:0 12px 28px color-mix(in srgb,var(--brand-primary) 22%,transparent)}
      .welcome-cta:disabled{opacity:.65;cursor:default}
      .welcome-footer{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;flex-shrink:0}
      .welcome-footer button{min-height:44px;padding:8px 16px;border:1px solid var(--border);border-radius:999px;background:var(--surface);color:var(--text-primary);font-weight:650;cursor:pointer}
      .welcome-footer .welcome-legal{min-height:36px;border:0;background:transparent;color:var(--text-secondary);font-size:12px}
    `}</style>
  </main>;
}
