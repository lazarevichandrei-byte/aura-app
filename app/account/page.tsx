"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import BottomSheet from "../../components/BottomSheet";
import { AccountSkeleton } from "../../components/AppSkeletons";
import { useNotification } from "../../components/NotificationContext";
import { warning } from "../../lib/haptic";
import {useI18n} from "../../components/I18nProvider";
import {getTelegramInitData} from "../../lib/telegram-init-data";
import {clearAuraUserSession,DELETED_SESSION_KEY} from "../../lib/useCurrentUser";


export default function AccountPage() {
  const {t}=useI18n();
  const router = useRouter();
  const {
  error
} = useNotification();

  const [profile, setProfile] = useState<any>(null);
  const [loading,setLoading] =
useState(true);
  const [showDeleteModal,setShowDeleteModal] =
useState(false);
  const [deleted,setDeleted]=useState(false);

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
    try{
      const initData=await getTelegramInitData();
      if(!initData)throw new Error("AUTH_REQUIRED");
      const response=await fetch("/api/auth/telegram",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData})});
      const result=await response.json().catch(()=>null);
      if(!response.ok||!result?.ok)throw new Error(result?.error||"DELETE_FAILED");
      clearAuraUserSession();
      const telegram=(window as any)?.Telegram?.WebApp;
      if(typeof telegram?.close==="function"){
        sessionStorage.removeItem(DELETED_SESSION_KEY);
        telegram.close();
        return;
      }
      setDeleted(true);
    }catch{
      error(t("common.error"),t("account.deleteFailed"));
    }
}

if(deleted)return <main className="app-page" style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:"24px"}}><section className="app-card" style={{width:"min(100%,380px)",padding:28,borderRadius:24,textAlign:"center"}}><h1 style={{margin:0,fontSize:28}}>{t("account.deleted")}</h1><p style={{color:"var(--text-secondary)",lineHeight:1.5}}>{t("account.deletedText")}</p><button style={editButtonStyle} onClick={()=>{sessionStorage.removeItem(DELETED_SESSION_KEY);router.replace("/");}}>{t("account.close")}</button></section></main>;

if (loading) {
  return <AccountSkeleton />;

}

  return (
    <div className="app-page" style={{padding:"20px 20px 120px"}}>
      <main className="app-card" style={{maxWidth:420,margin:"0 auto",borderRadius:24,padding:20}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <img
            src={profile?.photos?.length ? profile.photos[profile.main_photo_index || 0] : profile?.avatar_url || "/noavatar.jpg"}
            alt={t("account.userPhoto",{name:profile?.name || t("navigation.profile")})}
            style={{width:110,height:110,borderRadius:"50%",objectFit:"cover"}}
          />
          <h2 style={{marginTop:14,marginBottom:4}}>{profile?.name || t("account.unnamed")}</h2>
          <div style={{color:"var(--text-secondary)"}}>
            {profile?.age ? t("account.years",{age:profile.age}) : "—"}{profile?.city ? ` • ${profile.city}` : ""}
          </div>
        </div>

        <button onClick={()=>router.push("/profile")} style={editButtonStyle}>{t("account.edit")}</button>

        <div style={{marginTop:30}}>
          <button style={itemStyle} onClick={()=>router.push("/settings")}>⚙️ {t("account.settings")}</button>
          <button style={itemStyle} onClick={()=>router.push("/privacy")}>🔒 {t("account.privacy")}</button>
          <button style={itemStyle} onClick={()=>router.push("/support")}>💬 {t("account.support")}</button>
          <button style={itemStyle} onClick={()=>router.push("/terms")}>📄 {t("account.terms")}</button>
          <button style={itemStyle} onClick={()=>router.push("/privacy-policy")}>🛡️ {t("account.privacyPolicy")}</button>
        </div>

        <div style={{marginTop:30}}>
          <button onClick={()=>setShowDeleteModal(true)} style={{...itemStyle,color:"var(--danger)",fontWeight:600}}>{t("account.delete")}</button>
        </div>
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
    {t("account.deleteTitle")}
  </h2>

  <p
    style={{
      textAlign:"center",
      color:"var(--text-secondary)",
      marginTop:14,
      lineHeight:1.6
    }}
  >
    {t("account.deleteText")}
    <br />
    {t("account.deleteHint")}
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
      {t("common.cancel")}
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
      {t("common.delete")}
    </button>

  </div>

</BottomSheet>

      <BottomNav />

    </div>
  );
}

const editButtonStyle = {width:"100%",marginTop:24,height:54,borderRadius:16,color:"var(--text-inverse)",background:"var(--brand-gradient)",fontWeight:700,cursor:"pointer"};
const itemStyle = {width:"100%",minHeight:48,background:"var(--surface-secondary)",color:"var(--text-primary)",padding:"14px 16px",borderRadius:14,marginTop:10,cursor:"pointer",textAlign:"left" as const};
