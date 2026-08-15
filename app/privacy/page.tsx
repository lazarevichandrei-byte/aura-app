"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import PageWrapper from "../../components/PageWrapper";
import PageHeader from "../../components/PageHeader";
import { selection } from "../../lib/haptic";

export default function PrivacyPage() {

  const router = useRouter();

  const [showOnline,setShowOnline] =
useState<boolean | null>(null);



const [hideProfile,setHideProfile] =
useState<boolean | null>(null);

const [saving,setSaving] =
useState(false);

useEffect(() => {
  loadSettings();
}, []);

async function loadSettings() {

  const tg =
    (window as any)?.Telegram?.WebApp;

  const telegramId =
    tg?.initDataUnsafe?.user?.id;

  if (!telegramId) return;

  const { data } = await supabase
    .from("users")
    .select(`
      show_online,
hide_profile
    `)
    .eq("telegram_id", telegramId)
    .single();

  if (!data){

  return;
}

setShowOnline(
  data.show_online ?? false
);



setHideProfile(
  data.hide_profile ?? false
);
}


async function saveSetting(
  field:string,
  value:boolean
){

  if(saving) return;

  setSaving(true);

  try{

    const tg =
      (window as any)?.Telegram?.WebApp;

    const telegramId =
      tg?.initDataUnsafe?.user?.id;

    if(!telegramId) return;

    const { error } =
  await supabase
    .from("users")
    .update({

  [field]: value,

  ...(field === "show_online"
    ? {
        show_last_seen: value
      }
    : {})

})
    .eq(
      "telegram_id",
      telegramId
    );

if (error) {

  console.error(error);

}

  } finally {

    setSaving(false);

  }

}

  




if (
  showOnline === null ||
  hideProfile === null
){
  return (
    <div
      style={{
        minHeight:"100vh",
        background:"var(--app-bg)"
      }}
    />
  );
}

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

        <PageHeader title="Конфиденциальность" onBack={() => router.back()} />

        <p
style={{
color:"var(--text-secondary)",
fontSize:14,
lineHeight:1.5,
marginBottom:20
}}
>
Управляйте тем, какую информацию
видят другие пользователи.
</p>

<div
style={cardStyle}
>
  <div>
    <div style={titleStyle}>
      Показывать онлайн
    </div>

    <div style={subtitleStyle}>
      Видно другим пользователям
    </div>
  </div>

<Switch
  active={showOnline}
  onClick={async () => {

    selection();

    const value =
      !showOnline;

    setShowOnline(value);

    await saveSetting(
      "show_online",
      value
    );
  }}
/>
</div>



<div
style={cardStyle}
>
  <div>
    <div style={titleStyle}>
      Скрыть профиль
    </div>

    <div style={subtitleStyle}>
      Временно скрыть анкету из поиска
    </div>
  </div>

  <Switch
  active={hideProfile}
  onClick={async () => {

    selection();

    const value =
      !hideProfile;

    setHideProfile(value);

    await saveSetting(
      "hide_profile",
      value
    );
  }}
/>
</div>

      </div>
    </PageWrapper>
  );
}

const itemStyle = {
  background:"var(--surface)",
  padding:"16px",
  borderRadius:"16px",
  marginTop:"12px"
};

const cardStyle = {
  background:"var(--surface)",
  border:"1px solid var(--border-subtle)",
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
  color:"var(--text-secondary)"
};

function Switch({
  active,
  onClick
}:{
  active:boolean;
  onClick:()=>void;
}){

  return(
    <div
      onClick={onClick}
      style={{
        width:54,
        height:30,
        borderRadius:999,

        background:
          active
          ? "var(--brand-primary)"
          : "#D7DCE4",

        position:"relative",

        transition:
  "all .22s cubic-bezier(.22,1,.36,1)",

        cursor:"pointer"
      }}
    >
      <div
        style={{
          position:"absolute",
          top:3,
          left:active
            ? 27
            : 3,

          width:24,
          height:24,

          borderRadius:"50%",

          background:"var(--surface)",

          transition:
  "all .22s cubic-bezier(.22,1,.36,1)"
        }}
      />
    </div>
  );
}
