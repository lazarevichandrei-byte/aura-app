"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemePreference) => void;
};

const STORAGE_KEY = "aura-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme():ThemePreference{
  if(typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function systemTheme():EffectiveTheme{
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function syncTelegramTheme(theme:EffectiveTheme){
  const webApp = (window as any)?.Telegram?.WebApp;
  if(!webApp) return;
  const background = theme === "dark" ? "#0D0E13" : "#F7F9FC";
  const surface = theme === "dark" ? "#181A20" : "#FFFFFF";
  try{
    webApp.setHeaderColor?.(surface);
    webApp.setBackgroundColor?.(background);
    webApp.setBottomBarColor?.(surface);
  }catch{
    // Older Telegram WebViews may not support every color API.
  }
}

export default function ThemeProvider({children}:{children:ReactNode}){
  const [theme,setThemeState] = useState<ThemePreference>(readStoredTheme);
  const [effectiveTheme,setEffectiveTheme] = useState<EffectiveTheme>(()=>
    typeof window === "undefined" ? "light" : theme === "system" ? systemTheme() : theme
  );

  useEffect(()=>{
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = ()=>{
      const effective = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      setEffectiveTheme(effective);
      document.documentElement.dataset.theme = effective;
      document.documentElement.style.colorScheme = effective;
      syncTelegramTheme(effective);
    };
    apply();
    if(theme !== "system") return;
    media.addEventListener("change",apply);
    return ()=>media.removeEventListener("change",apply);
  },[theme]);

  const setTheme = (nextTheme:ThemePreference)=>{
    window.localStorage.setItem(STORAGE_KEY,nextTheme);
    setThemeState(nextTheme);
  };

  const value = useMemo(()=>({theme,effectiveTheme,setTheme}),[theme,effectiveTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(){
  const context = useContext(ThemeContext);
  if(!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
