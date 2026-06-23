"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../components/PageWrapper";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function NotificationsPage() {

  const router = useRouter();

  const [messages,setMessages] =
useState(true);

const [matches,setMatches] =
useState(true);

const [vibration,setVibration] =
useState(true);

const [silentMode,setSilentMode] =
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
      notify_messages,
      notify_matches,
      notify_vibration,
      notify_silent
    `)
    .eq("telegram_id", telegramId)
    .single();

  if (!data) return;

  setMessages(
    data.notify_messages ?? true
  );

  setMatches(
    data.notify_matches ?? true
  );

  setVibration(
    data.notify_vibration ?? true
  );

  setSilentMode(
    data.notify_silent ?? false
  );
}

async function saveSetting(
  field:string,
  value:boolean
){

  const tg =
    (window as any)?.Telegram?.WebApp;

  const telegramId =
    tg?.initDataUnsafe?.user?.id;

  if (!telegramId) return;

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
            display:"flex",
            alignItems:"center",
            marginBottom:24
          }}
        >

          <div
            onClick={()=>router.back()}
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              paddingRight:10,
              cursor:"pointer"
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
              marginLeft:14,
              fontSize:24,
              fontWeight:700
            }}
          >
            Уведомления
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
Настройте уведомления и сигналы приложения.
</p>

<div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      Сообщения
    </div>

    <div style={subtitleStyle}>
      Уведомлять о новых сообщениях
    </div>
  </div>

  <Switch
  active={messages}
  onClick={async () => {

    const value =
      !messages;

    setMessages(value);

    await saveSetting(
      "notify_messages",
      value
    );
  }}
/>
</div>

<div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      Новые мэтчи
    </div>

    <div style={subtitleStyle}>
      Уведомлять о взаимных лайках
    </div>
  </div>

  <Switch
  active={matches}
  onClick={async () => {

    const value = !matches;

    setMatches(value);

    await saveSetting(
      "notify_matches",
      value
    );
  }}
/>
</div>

<div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      Вибрация
    </div>

    <div style={subtitleStyle}>
      Вибрация при уведомлениях
    </div>
  </div>

 <Switch
  active={vibration}
  onClick={async () => {

    const value = !vibration;

    setVibration(value);

    await saveSetting(
      "notify_vibration",
      value
    );
  }}
/>
</div>

<div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      Тихий режим
    </div>

    <div style={subtitleStyle}>
      Без звука и вибрации
    </div>
  </div>

  <Switch
  active={silentMode}
  onClick={async () => {

    const value = !silentMode;

    setSilentMode(value);

    await saveSetting(
      "notify_silent",
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
  background:"#fff",
  padding:"16px",
  borderRadius:"16px",
  marginTop:"12px"
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
          ? "#2AABEE"
          : "#D7DCE4",

        position:"relative",

        transition:
          "all .2s ease",

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

          background:"#fff",

          transition:
            "all .2s ease"
        }}
      />
    </div>
  );
}