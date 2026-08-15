"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import BottomSheet from "../../components/BottomSheet";
import AuraLoader from "../../components/AuraLoader";
import { useNotification } from "../../components/NotificationContext";
import { warning } from "../../lib/haptic";


export default function AccountPage() {
  const router = useRouter();
  const {
  success,
  error
} = useNotification();

  const [profile, setProfile] = useState<any>(null);
  const [loading,setLoading] =
useState(true);
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
    setLoading(true);
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

    setLoading(false);
  }

  async function deleteAccount(){
    warning();

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

if (loading) {

  return (

    <AuraLoader
      compact
      text="Загрузка профиля..."
    />

  );

}

  const photos:string[] = profile?.photos?.length
    ? profile.photos
    : profile?.avatar_url ? [profile.avatar_url] : [];
  const avatar = photos[profile?.main_photo_index || 0] || "/noavatar.jpg";

  return (
    <div className="app-page" style={{padding:"18px 18px 120px"}}>
      <main style={{maxWidth:440,margin:"0 auto"}}>
        <header style={{height:48,display:"grid",gridTemplateColumns:"48px 1fr 48px",alignItems:"center"}}>
          <span />
          <h1 style={{fontSize:20,fontWeight:700,textAlign:"center"}}>Профиль</h1>
          <button aria-label="Настройки" onClick={()=>router.push("/settings")} style={iconButtonStyle}>⚙️</button>
        </header>

        <section style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 8px 20px"}}>
          <button aria-label="Редактировать фотографию" onClick={()=>router.push("/profile")} style={{position:"relative",background:"transparent",cursor:"pointer"}}>
            <img src={avatar} alt={`Фото ${profile?.name || "пользователя"}`} style={{width:124,height:124,borderRadius:"50%",objectFit:"cover",border:"4px solid var(--surface)",boxShadow:"var(--shadow-md)"}} />
            <span style={{position:"absolute",right:2,bottom:5,width:36,height:36,borderRadius:"50%",display:"grid",placeItems:"center",background:"var(--primary)",color:"var(--text-inverse)",border:"3px solid var(--app-bg)",fontSize:16}}>📷</span>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:7,marginTop:16}}>
            <h2 style={{fontSize:25,fontWeight:700,letterSpacing:"-.4px"}}>{profile?.name || "Без имени"}{profile?.age ? `, ${profile.age}` : ""}</h2>
            {profile?.is_verified && <span aria-label="Профиль подтверждён" style={verifiedStyle}>✓</span>}
          </div>
          <p className="app-muted" style={{marginTop:6,fontSize:14}}>📍 {profile?.city || "Город не указан"}</p>
          {profile?.bio && <p style={{maxWidth:340,textAlign:"center",lineHeight:1.55,marginTop:16,fontSize:15}}>{profile.bio}</p>}
        </section>

        <button onClick={()=>router.push("/profile")} style={primaryButtonStyle}>Редактировать профиль</button>

        <section className="app-card" style={sectionStyle}>
          <h3 className="app-section-title">Интересы</h3>
          {profile?.interests?.length ? (
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
              {profile.interests.map((interest:string)=><span className="app-chip" key={interest} style={chipStyle}>{interest}</span>)}
            </div>
          ) : <p className="app-muted" style={{marginTop:10,fontSize:14}}>Добавьте интересы, чтобы находить больше общего.</p>}
        </section>

        <section className="app-card" style={sectionStyle}>
          <button onClick={()=>router.push("/profile")} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",cursor:"pointer"}}>
            <h3 className="app-section-title">Мои фото</h3>
            <span className="app-muted" style={{fontSize:13}}>{photos.length} фото ›</span>
          </button>
          {photos.length ? <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
            {photos.slice(0,3).map((photo,index)=><img key={photo} src={photo} alt={`Фото ${index+1}`} style={{width:"100%",aspectRatio:"1 / 1.18",objectFit:"cover",borderRadius:16,background:"var(--surface-secondary)"}} />)}
          </div> : <div className="app-muted" style={{marginTop:14,padding:"24px 12px",textAlign:"center",borderRadius:16,background:"var(--surface-secondary)",fontSize:14}}>Пока нет добавленных фотографий</div>}
        </section>

        <section className="app-card" style={sectionStyle}>
          <h3 className="app-section-title">Аккаунт</h3>
          <div style={{marginTop:10}}>
            <button style={menuButtonStyle} onClick={()=>router.push("/privacy")}>🔒 Конфиденциальность <span>›</span></button>
            <button style={menuButtonStyle} onClick={()=>router.push("/support")}>💬 Поддержка <span>›</span></button>
            <button style={menuButtonStyle} onClick={()=>router.push("/terms")}>📄 Условия использования <span>›</span></button>
            <button style={menuButtonStyle} onClick={()=>router.push("/privacy-policy")}>🛡️ Политика конфиденциальности <span>›</span></button>
            <button style={{...menuButtonStyle,color:"var(--danger)"}} onClick={()=>setShowDeleteModal(true)}>Удалить аккаунт <span>›</span></button>
          </div>
        </section>
      </main>

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
      color:"var(--text-secondary)",
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
        background:"var(--surface-secondary)",
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
        background:"var(--danger)",
        color:"var(--text-inverse)",
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

const iconButtonStyle = {width:44,height:44,borderRadius:14,background:"var(--surface)",border:"1px solid var(--border-subtle)",display:"grid",placeItems:"center",cursor:"pointer",fontSize:18};
const verifiedStyle = {width:20,height:20,borderRadius:"50%",display:"grid",placeItems:"center",background:"var(--primary)",color:"var(--text-inverse)",fontSize:12,fontWeight:800};
const primaryButtonStyle = {width:"100%",height:50,borderRadius:16,background:"var(--primary)",color:"var(--text-inverse)",fontWeight:700,cursor:"pointer",boxShadow:"var(--shadow-sm)"};
const sectionStyle = {marginTop:16,borderRadius:22,padding:18};
const chipStyle = {padding:"8px 12px",borderRadius:999,fontSize:13,fontWeight:600};
const menuButtonStyle = {width:"100%",minHeight:48,display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",borderBottom:"1px solid var(--border-subtle)",cursor:"pointer",fontSize:14,textAlign:"left" as const};
