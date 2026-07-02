"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import BottomSheet from "../../components/BottomSheet";
import { useNotification } from "../../components/NotificationContext";

export default function AccountPage() {
  const router = useRouter();
  const {
  success,
  error
} = useNotification();

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

  async function deleteAccount(){

  const tg =
    (window as any)?.Telegram?.WebApp;

  const telegramId =
    tg?.initDataUnsafe?.user?.id;

  if (!telegramId) return;

  const { data:user } =
    await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", telegramId)
      .single();

  if (!user){

  error(
    "Ошибка",
    "Пользователь не найден"
  );

  return;
}
const { error: rpcError } =
  await supabase.rpc(
      "delete_my_account",
      {
        p_user_id:user.id
      }
    );

  if (rpcError){

  error(
    "Ошибка",
    rpcError.message
  );

  return;
}

  localStorage.clear();

success(
  "Аккаунт удалён",
  "Спасибо, что были с нами ❤️"
);

setTimeout(() => {

  router.replace("/");

},1200);
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

      
    

<BottomSheet

  open={showDeleteModal}

  onClose={() =>
    setShowDeleteModal(false)
  }

>

  <h2
    style={{
      margin:0,
      textAlign:"center"
    }}
  >
    Удалить аккаунт?
  </h2>

  <p
    style={{
      textAlign:"center",
      color:"#7B8595",
      marginTop:14,
      lineHeight:1.6
    }}
  >
    Без вас приложение станет чуточку грустнее.
    <br />
    Если что-то работало не так —
    напишите нам в поддержку ❤️
  </p>

  <div
    style={{
      display:"flex",
      gap:12,
      marginTop:24
    }}
  >

    <button

      onClick={() =>
        setShowDeleteModal(false)
      }

      style={{
        flex:1,
        height:52,
        border:"none",
        borderRadius:16,
        background:"#F3F5F8",
        fontWeight:600
      }}

    >
      Отмена
    </button>

    <button

      onClick={async()=>{

        setShowDeleteModal(false);

        await deleteAccount();

      }}

      style={{
        flex:1,
        height:52,
        border:"none",
        borderRadius:16,
        background:"#FF4D4F",
        color:"#fff",
        fontWeight:600
      }}

    >
      Удалить
    </button>

  </div>

</BottomSheet>

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

