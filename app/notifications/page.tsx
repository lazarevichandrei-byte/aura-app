"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../components/PageWrapper";
import { useState } from "react";

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
    onClick={() =>
      setMessages(!messages)
    }
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
    onClick={() =>
      setMatches(!matches)
    }
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
    onClick={() =>
      setVibration(!vibration)
    }
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
    onClick={() =>
      setSilentMode(!silentMode)
    }
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