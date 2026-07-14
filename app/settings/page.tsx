"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft2,
  ArrowRight2
} from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";
import {
  selection
} from "../../lib/haptic";

import BottomSheet from "../../components/BottomSheet";


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
      .select(`
theme,
language,
show_online,
show_last_seen,
notifications_enabled
`)
      .eq("telegram_id", telegramId)
      .single();

  if(data){

    setTheme(
      data.theme || "system"
    );

    setLanguage(
      data.language || "ru"
    );

    setShowOnline(
      data.show_online ?? true
    );

    setShowLastSeen(
      data.show_last_seen ?? true
    );

    setNotificationsEnabled(
      data.notifications_enabled ?? false
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

const [showOnline,setShowOnline] =
useState(true);

const [showLastSeen,setShowLastSeen] =
useState(true);

const [notificationsEnabled,setNotificationsEnabled] =
useState(true);

const [showThemeModal,setShowThemeModal] =
useState(false);

const [showLanguageModal,setShowLanguageModal] =
useState(false);


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

<div
  style={cardStyle}
  onClick={() =>
    setShowThemeModal(true)
  }
>

  <div>

    <div style={titleStyle}>
      🎨 Тема
    </div>

    <div style={subtitleStyle}>
      {
        theme === "light"
        ? "Светлая"
        : theme === "dark"
        ? "Тёмная"
        : "Системная"
      }
    </div>

  </div>

  <ArrowRight2
    size="18"
    color="#A0A8B5"
  />

</div>






<div
  style={cardStyle}
  onClick={() =>
    setShowLanguageModal(true)
  }
>


  

  <div>

    <div style={titleStyle}>
      🌍 Язык
    </div>

    <div style={subtitleStyle}>
      {
        language === "ru"
        ? "Русский"
        : "English"
      }
    </div>

  </div>

  <ArrowRight2
    size="18"
    color="#A0A8B5"
  />

</div>

<div
  style={cardStyle}
  onClick={() =>
    router.push("/blacklist")
  }
>
  <div>
    <div style={titleStyle}>
      🚫 Чёрный список
    </div>

    <div style={subtitleStyle}>
      Управление заблокированными пользователями
    </div>
  </div>

  <ArrowRight2
    size="18"
    color="#A0A8B5"
  />
</div>

      </div>
    </div>

    <BottomSheet
  open={showThemeModal}
  onClose={() => setShowThemeModal(false)}
>

  <h2
    style={{
      margin:0,
      textAlign:"center"
    }}
  >
    Выбор темы
  </h2>

  <div style={{ marginTop:20 }}>

    <div
      style={{
        ...sheetItem,
        background:
          theme === "light"
            ? "#EAF5FF"
            : "#F5F7FB",
        border:
          theme === "light"
            ? "1px solid #2AABEE"
            : "1px solid transparent"
      }}
      onClick={async()=>{

          selection();

        setTheme("light");

        await saveSetting(
          "theme",
          "light"
        );

        setShowThemeModal(false);

      }}
    >
      ☀️ Светлая
    </div>

    <div
      style={{
        ...sheetItem,
        background:
          theme === "dark"
            ? "#EAF5FF"
            : "#F5F7FB",
        border:
          theme === "dark"
            ? "1px solid #2AABEE"
            : "1px solid transparent"
      }}
     onClick={async()=>{

  selection();

  setTheme("dark");

        await saveSetting(
          "theme",
          "dark"
        );

        setShowThemeModal(false);

      }}
    >
      🌙 Тёмная
    </div>

    <div
      style={{
        ...sheetItem,
        background:
          theme === "system"
            ? "#EAF5FF"
            : "#F5F7FB",
        border:
          theme === "system"
            ? "1px solid #2AABEE"
            : "1px solid transparent"
      }}
      onClick={async()=>{

         selection();

        setTheme("system");

        await saveSetting(
          "theme",
          "system"
        );

        setShowThemeModal(false);

      }}
    >
      ⚙️ Системная
    </div>

  </div>

</BottomSheet>

<BottomSheet
  open={showLanguageModal}
  onClose={() => setShowLanguageModal(false)}
>

  <h2
    style={{
      margin:0,
      textAlign:"center"
    }}
  >
    Выбор языка
  </h2>

  <div style={{ marginTop:20 }}>

    <div
      style={{
        ...sheetItem,
        background:
          language === "ru"
            ? "#EAF5FF"
            : "#F5F7FB",
        border:
          language === "ru"
            ? "1px solid #2AABEE"
            : "1px solid transparent"
      }}
      onClick={async()=>{

         selection();

        setLanguage("ru");

        await saveSetting(
          "language",
          "ru"
        );

        setShowLanguageModal(false);

      }}
    >
      🇷🇺 Русский
    </div>

    <div
      style={{
        ...sheetItem,
        background:
          language === "en"
            ? "#EAF5FF"
            : "#F5F7FB",
        border:
          language === "en"
            ? "1px solid #2AABEE"
            : "1px solid transparent"
      }}
      onClick={async()=>{

          selection();

        setLanguage("en");

        await saveSetting(
          "language",
          "en"
        );

        setShowLanguageModal(false);

      }}
    >
      🇺🇸 English
    </div>

  </div>

</BottomSheet>
    
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
const sheetItem = {
  padding:"16px",
  borderRadius:"16px",
  background:"#F5F7FB",
  marginBottom:"10px",
  cursor:"pointer",
  fontWeight:600
};