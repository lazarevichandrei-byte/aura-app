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
import {hasManualLocalePreference,useI18n} from "../../components/I18nProvider";
import LanguagePickerSheet from "../../components/LanguagePickerSheet";
import {LOCALE_BY_CODE} from "../../lib/i18n/locales";




export default function SettingsPage() {
  const router = useRouter();
  const {theme,setTheme} = useTheme();
  const {locale,setLocale,t}=useI18n();

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

    if(data.language && !hasManualLocalePreference()) setLocale(data.language,false);

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
    {t("settings.title")}
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
  {t("settings.subtitle")}
</p>

<div
  style={cardStyle}
  onClick={() =>
    setShowThemeModal(true)
  }
>

  <div>

    <div style={titleStyle}>
      🎨 {t("settings.appearance")}
    </div>

    <div style={subtitleStyle}>
      {
        theme === "light"
        ? t("theme.light")
        : theme === "dark"
        ? t("theme.dark")
        : t("theme.system")
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
      🌍 {t("settings.language")}
    </div>

    <div style={subtitleStyle}>
      {LOCALE_BY_CODE.get(locale)?.nativeName || locale}
    </div>

  </div>

</div>


<div
  style={cardStyle}
  onClick={() => router.push("/notifications")}
>

  <div>

    <div style={titleStyle}>
      🔔 {t("settings.notifications")}
    </div>

    <div style={subtitleStyle}>
      {t("settings.notificationsHint")}
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
      🚫 {t("settings.blacklist")}
    </div>

    <div style={subtitleStyle}>
      {t("settings.blacklistHint")}
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
    {t("settings.appearance")}
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
      <span><strong>☀️ {t("theme.light")}</strong><small style={themeDescriptionStyle}>{t("theme.lightHint")}</small></span><span>{theme === "light" ? "●" : "○"}</span>
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
      <span><strong>☾ {t("theme.dark")}</strong><small style={themeDescriptionStyle}>{t("theme.darkHint")}</small></span><span>{theme === "dark" ? "●" : "○"}</span>
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
      <span><strong>◐ {t("theme.system")}</strong><small style={themeDescriptionStyle}>{t("theme.systemHint")}</small></span><span>{theme === "system" ? "●" : "○"}</span>
    </div>

  </div>

</BottomSheet>

<LanguagePickerSheet open={showLanguageModal} onClose={()=>setShowLanguageModal(false)} onPersist={(nextLocale)=>saveSetting("language",nextLocale)} />
    
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
const themeDescriptionStyle = {display:"block",marginTop:4,color:"var(--text-secondary)",fontSize:12,fontWeight:500};
