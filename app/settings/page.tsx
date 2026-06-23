"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../components/PageWrapper";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
  loadSettings();
}, []);

async function loadSettings(){

  const tg =
    (window as any)?.Telegram?.WebApp;

  const telegramId =
    tg?.initDataUnsafe?.user?.id;

  if(!telegramId) return;

  const { data } =
    await supabase
      .from("users")
      .select("theme, language")
      .eq("telegram_id", telegramId)
      .single();

  if(data){

    setTheme(
      data.theme || "system"
    );

    setLanguage(
      data.language || "ru"
    );

  }

}

async function saveSetting(
  field:string,
  value:string
){

  const tg =
    (window as any)?.Telegram?.WebApp;

  const telegramId =
    tg?.initDataUnsafe?.user?.id;

  if(!telegramId) return;

  await supabase
    .from("users")
    .update({
      [field]: value
    })
    .eq(
      "telegram_id",
      telegramId
    );

}


  const [theme,setTheme] =
useState("system");

const [language,setLanguage] =
useState("ru");


  return (
  <PageWrapper>
    <div
      style={{
        minHeight:"100vh",
        background:"#F5F7FB",
        padding:"20px"
      }}
    >
    
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto"
        }}
      >

        <div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: 24
  }}
>

  <div
    onClick={() => router.back()}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingRight: 10,
      cursor: "pointer"
    }}
  >
    <ArrowLeft2
      size="28"
      color="#2E7BFF"
      variant="Outline"
    />
  </div>

  <div
    style={{
      marginLeft: 14,
      fontSize: 24,
      fontWeight: 700
    }}
  >
    Настройки
  </div>

</div>

        <p
  style={{
    color:"#7B8595",
    fontSize:14,
    lineHeight:1.5,
    marginBottom:20
  }}
>
  Персонализируйте приложение под себя.
</p>

<div style={cardStyle}>

  <div style={{width:"100%"}}>

    <div style={titleStyle}>
      🎨 Тема
    </div>

    <div
      style={{
        display:"flex",
        gap:"8px",
        marginTop:"12px"
      }}
    >

      <button
        onClick={async()=>{

          setTheme("light");

          await saveSetting(
            "theme",
            "light"
          );

        }}
        style={{
          ...themeButton,
          ...(theme==="light"
            ? activeThemeButton
            : {})
        }}
      >
        Светлая
      </button>

      <button
        onClick={async()=>{

          setTheme("dark");

          await saveSetting(
            "theme",
            "dark"
          );

        }}
        style={{
          ...themeButton,
          ...(theme==="dark"
            ? activeThemeButton
            : {})
        }}
      >
        Тёмная
      </button>

      <button
        onClick={async()=>{

          setTheme("system");

          await saveSetting(
            "theme",
            "system"
          );

        }}
        style={{
          ...themeButton,
          ...(theme==="system"
            ? activeThemeButton
            : {})
        }}
      >
        Системная
      </button>

    </div>

  </div>

</div>

<div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      🌍 Язык
    </div>

    <div style={subtitleStyle}>
      {language}
    </div>
  </div>
</div>

<div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      🚫 Чёрный список
    </div>

    <div style={subtitleStyle}>
      Управление заблокированными пользователями
    </div>
  </div>
</div>

      </div>
    </div>
  </PageWrapper>
  );
}

const itemStyle = {
  background: "#fff",
  padding: "16px",
  borderRadius: 16,
  marginTop: 12,
  cursor: "pointer"
};

const cardStyle = {
  background:"#fff",
  borderRadius:"18px",
  padding:"18px",
  marginBottom:"14px",

  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",

  boxShadow:
    "0 4px 14px rgba(0,0,0,.04)"
};

const titleStyle = {
  fontSize:"15px",
  fontWeight:600
};

const subtitleStyle = {
  marginTop:"4px",
  fontSize:"12px",
  color:"#8B95A7"
};
const themeButton = {
  flex:1,
  height:"38px",
  border:"none",
  borderRadius:"12px",
  background:"#F3F5F8",
  cursor:"pointer"
};

const activeThemeButton = {
  background:"#2AABEE",
  color:"#fff"
};