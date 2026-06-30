"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";

export default function PrivacyPage() {

  const router = useRouter();

  const [showOnline,setShowOnline] =
useState<boolean | null>(null);

const [showLastSeen,setShowLastSeen] =
useState<boolean | null>(null);

const [hideProfile,setHideProfile] =
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
      show_online,
      show_last_seen,
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

setShowLastSeen(
  data.show_last_seen ?? false
);

setHideProfile(
  data.hide_profile ?? false
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
  showOnline === null ||
  showLastSeen === null ||
  hideProfile === null
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
            Конфиденциальность
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
      Показывать "был недавно"
    </div>

    <div style={subtitleStyle}>
      Отображать последнюю активность
    </div>
  </div>

  <Switch
  active={showLastSeen}
  onClick={async () => {

    const value =
      !showLastSeen;

    setShowLastSeen(value);

    await saveSetting(
      "show_last_seen",
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
