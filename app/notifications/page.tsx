"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { selection } from "../../lib/haptic";

export default function NotificationsPage() {

  const router = useRouter();

  const [likes,setLikes] =
useState<boolean | null>(null);

const [messages,setMessages] =
useState<boolean | null>(null);

const [matches,setMatches] =
useState<boolean | null>(null);

const [news,setNews] =
useState<boolean | null>(null);



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
likes_notifications,
messages_notifications,
matches_notifications,
news_notifications
`)
    .eq("telegram_id", telegramId)
    .single();

  if (!data) return;

  setLikes(
data.likes_notifications ?? true
);

setMessages(
data.messages_notifications ?? true
);

setMatches(
data.matches_notifications ?? true
);

setNews(
data.news_notifications ?? true
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

if (
  likes === null ||
  messages === null ||
  matches === null ||
  news === null
){
  return (
    <div
      style={{
        minHeight:"100vh",
        background:"#F5F7FB"
      }}
    />
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
      ❤️ Новые лайки
    </div>

    <div style={subtitleStyle}>
      Уведомлять о новых лайках
    </div>
  </div>

  <Switch
    active={likes}
    onClick={async()=>{

      selection();

      const value=!likes;

      setLikes(value);

      await saveSetting(
        "likes_notifications",
        value
      );

    }}
  />
</div>

  <div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      💬 Сообщения
    </div>

    <div style={subtitleStyle}>
      Уведомлять о новых сообщениях
    </div>
  </div>

  <Switch
    active={messages}
    onClick={async()=>{

      selection();

      const value = !messages;

      setMessages(value);

      await saveSetting(
        "messages_notifications",
        value
      );

    }}
  />
</div>

  <div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      💙 Новые совпадения
    </div>

    <div style={subtitleStyle}>
      Уведомлять о новых совпадениях
    </div>
  </div>

  <Switch
    active={matches}
    onClick={async()=>{

      selection();

      const value = !matches;

      setMatches(value);

      await saveSetting(
        "matches_notifications",
        value
      );

    }}
  />
</div>

<div style={cardStyle}>
  <div>
    <div style={titleStyle}>
      📢 Новости AURA
    </div>

    <div style={subtitleStyle}>
      Новости и обновления приложения
    </div>
  </div>

  <Switch
    active={news}
    onClick={async()=>{

      selection();

      const value = !news;

      setNews(value);

      await saveSetting(
        "news_notifications",
        value
      );

    }}
  />
</div>

</div>

    </PageWrapper>
  );
  
}


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
  onClick,
  disabled = false
}:{
  active:boolean | null;
  onClick:()=>void;
  disabled?: boolean;
}){

  return(
    <div
      onClick={() => {

        if(disabled) return;

        onClick();

      }}
      style={{
        width:54,
        height:30,
        borderRadius:999,

        background:
          active
          ? "#2AABEE"
          : "#D7DCE4",

        position:"relative",

        transition:"all .2s ease",

        cursor: disabled ? "default" : "pointer",

        opacity: disabled ? 0.45 : 1
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

          transition:"all .2s ease"
        }}
      />
    </div>
  );
}

  