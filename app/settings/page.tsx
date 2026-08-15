"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft2
} from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";
import {
  selection
} from "../../lib/haptic";

import BottomSheet from "../../components/BottomSheet";
import { useTheme } from "../../components/ThemeProvider";




export default function SettingsPage() {
  const router = useRouter();
  const {theme,setTheme} = useTheme();

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
show_last_seen
`)
      .eq("telegram_id", telegramId)
      .single();

  if(data){

    const savedTheme = data.theme;
    if(savedTheme === "system" || savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

    setLanguage(
      data.language || "ru"
    );

    setShowOnline(
      data.show_online ?? true
    );

    setShowLastSeen(
      data.show_last_seen ?? true
    );

    

}

}

async function saveSetting(
  field:string,
  value:any
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


const [language,setLanguage] =
useState("ru");

const [showOnline,setShowOnline] =
useState(true);

const [showLastSeen,setShowLastSeen] =
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
        background:"var(--app-bg)",
        color:"var(--text-primary)",
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
      color="var(--primary)"
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
    color:"var(--text-secondary)",
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
      🎨 Оформление
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

</div>


<div
  style={cardStyle}
  onClick={() => router.push("/notifications")}
>

  <div>

    <div style={titleStyle}>
      🔔 Уведомления
    </div>

    <div style={subtitleStyle}>
      Лайки, сообщения, матчи и новости
    </div>

  </div>

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
    Оформление
  </h2>

  <div style={{ marginTop:20 }}>

    <div
      style={{
        ...sheetItem,
        background:
          theme === "light"
            ? "var(--primary-soft)"
            : "var(--surface-secondary)",
        border:
          theme === "light"
            ? "1px solid var(--primary)"
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
      <span>☀️ Светлая</span><span>{theme === "light" ? "●" : "○"}</span>
    </div>

    <div
      style={{
        ...sheetItem,
        background:
          theme === "dark"
            ? "var(--primary-soft)"
            : "var(--surface-secondary)",
        border:
          theme === "dark"
            ? "1px solid var(--primary)"
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
      <span>🌙 Тёмная</span><span>{theme === "dark" ? "●" : "○"}</span>
    </div>

    <div
      style={{
        ...sheetItem,
        background:
          theme === "system"
            ? "var(--primary-soft)"
            : "var(--surface-secondary)",
        border:
          theme === "system"
            ? "1px solid var(--primary)"
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
      <span>⚙️ Системная</span><span>{theme === "system" ? "●" : "○"}</span>
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
            ? "var(--primary-soft)"
            : "var(--surface-secondary)",
        border:
          language === "ru"
            ? "1px solid var(--brand-primary)"
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
      <span>🇷🇺 Русский</span><span>{language === "ru" ? "●" : "○"}</span>
    </div>

    <div
      style={{
        ...sheetItem,
        background:
          language === "en"
            ? "var(--primary-soft)"
            : "var(--surface-secondary)",
        border:
          language === "en"
            ? "1px solid var(--brand-primary)"
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
      <span>🇺🇸 English</span><span>{language === "en" ? "●" : "○"}</span>
    </div>

  </div>

</BottomSheet>
    
  </PageWrapper>
  );
}




const cardStyle = {
  background:"var(--surface)",
  color:"var(--text-primary)",
  border:"1px solid var(--border-subtle)",
  borderRadius:"18px",
  padding:"18px",
  marginBottom:"14px",

  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",

  boxShadow:
    "var(--shadow-sm)"
};

const titleStyle = {
  fontSize:"15px",
  fontWeight:600
};

const subtitleStyle = {
  marginTop:"4px",
  fontSize:"12px",
  color:"var(--text-secondary)"
};
const sheetItem = {
  padding:"16px",
  borderRadius:"16px",
  background:"var(--surface-secondary)",
  marginBottom:"10px",
  cursor:"pointer",
  fontWeight:600,
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  color:"var(--text-primary)"
};
