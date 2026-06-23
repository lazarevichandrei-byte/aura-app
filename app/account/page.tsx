"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [showDeleteModal,setShowDeleteModal] =
useState(false);

  useEffect(() => {
  document.body.style.overflowY = "auto";
  document.documentElement.style.overflowY = "auto";

  return () => {
    document.body.style.overflowY = "";
    document.documentElement.style.overflowY = "";
  };
}, []);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const tg = (window as any)?.Telegram?.WebApp;
    const tgId = tg?.initDataUnsafe?.user?.id;

    if (!tgId) return;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", tgId)
      .single();

    if (data) {
      setProfile(data);
    }
  }

  return (
    <div
 style={{
  minHeight:"100vh",

  background:"#F5F7FB",

  padding:"20px",
  paddingBottom:"120px"
}}
>
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: 20
        }}
      >
        {/* Аватар */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <img
            src={
              profile?.photos?.length
                ? profile.photos[
                    profile.main_photo_index || 0
                  ]
                : profile?.avatar_url || "/noavatar.jpg"
            }
            alt=""
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />

          <h2
            style={{
              marginTop: 14,
              marginBottom: 4
            }}
          >
            {profile?.name || "Без имени"}
          </h2>

          <div
            style={{
              color: "#6B7280"
            }}
          >
            {profile?.age || "—"} лет
            {profile?.city
              ? ` • ${profile.city}`
              : ""}
          </div>
        </div>

        {/* Редактировать */}
        <button
          onClick={() => router.push("/profile")}
          style={{
            width: "100%",
            marginTop: 24,
            height: 54,
            border: "none",
            borderRadius: 16,
            color: "#fff",
            background:
              "linear-gradient(135deg,#2AABEE,#1C8CEB)"
          }}
        >
          Редактировать профиль
        </button>

        {/* Настройки знакомств */}
        

        {/* Меню */}
<div style={{ marginTop: 30 }}>

  <div
  style={itemStyle}
  onClick={() => router.push("/settings")}
>
  ⚙️ Настройки
</div>

<div
  style={itemStyle}
  onClick={() => router.push("/privacy")}
>
  🔒 Конфиденциальность
</div>

<div
  style={itemStyle}
  onClick={() => router.push("/notifications")}
>
  🔔 Уведомления
</div>


<div
  style={itemStyle}
  onClick={() => router.push("/support")}
>
  💬 Поддержка
</div>

<div
  style={itemStyle}
  onClick={() => router.push("/terms")}
>
  📄 Условия использования
</div>

<div
  style={itemStyle}
  onClick={() => router.push("/privacy-policy")}
>
  🛡️ Политика конфиденциальности
</div>


</div>

        {/* Аккаунт */}
<div style={{ marginTop: 30 }}>

  <div
  onClick={() =>
    setShowDeleteModal(true)
  }
  style={{
    ...itemStyle,
    color:"#FF4D4F",
    fontWeight:600,
    cursor:"pointer"
  }}
>
  Удалить аккаунт
</div>

</div>
      </div>

      {showDeleteModal && (

<div
  onClick={() =>
    setShowDeleteModal(false)
  }
  style={{
    position:"fixed",
    inset:0,

    background:"rgba(0,0,0,.45)",
    backdropFilter:"blur(4px)",

    zIndex:99999,

    display:"flex",
    justifyContent:"center",
    alignItems:"center",

    padding:"20px"
  }}
>

  <div
    onClick={(e)=>
      e.stopPropagation()
    }
    style={{
      width:"100%",
      maxWidth:"380px",

      background:"#fff",

      borderRadius:"28px",

      padding:"24px",

      boxShadow:
        "0 20px 60px rgba(0,0,0,.18)"
    }}
  >

    <div
      style={{
        fontSize:"22px",
        fontWeight:700,
        textAlign:"center",
        marginBottom:"10px"
      }}
    >
      Удалить аккаунт?
    </div>

    <div
      style={{
        textAlign:"center",
        color:"#7B8595",
        fontSize:"14px",
        lineHeight:1.6,
        marginBottom:"24px"
      }}
    >
      Вы точно хотите удалить аккаунт?
      <br />
      Это действие нельзя отменить.
    </div>

    <div
      style={{
        display:"flex",
        gap:"12px"
      }}
    >

      <button
        onClick={() =>
          setShowDeleteModal(false)
        }
        style={{
          flex:1,
          height:"52px",

          borderRadius:"16px",

          background:"#F3F5F8",

          fontWeight:600
        }}
      >
        Отмена
      </button>

      <button
        style={{
          flex:1,
          height:"52px",

          borderRadius:"16px",

          background:"#FF4D4F",
          color:"#fff",

          fontWeight:600
        }}
      >
        Удалить
      </button>

    </div>

  </div>

</div>

)}

      <BottomNav />

    </div>
  );
}

const itemStyle = {
  background: "#F7F8FA",
  padding: "14px 16px",
  borderRadius: 14,
  marginTop: 10,
  cursor: "pointer"
};