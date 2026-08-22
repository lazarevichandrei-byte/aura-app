"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft2 } from "iconsax-react";
import { useNotification } from "../../../components/NotificationContext";
import BottomSheet from "../../../components/BottomSheet";
import UserProfileSkeleton from "../../../components/UserProfileSkeleton";
import { getTelegramInitData } from "../../../lib/telegram-init-data";
import {useI18n} from "../../../components/I18nProvider";
import {interestLabel} from "../../../lib/i18n/interests";
import {performLikeAction} from "../../../lib/likes/api";
import {consumeDiscoveryCandidate} from "../../../lib/discovery/session";
import {loadCurrentUser} from "../../../lib/useCurrentUser";
export default function UserProfilePage() {

  const params = useParams();
  const router = useRouter();
  const searchParams=useSearchParams();
  const {t}=useI18n();
  const {
  success,
  error,
  warning
} = useNotification();

  const [user,setUser] = useState<any>(null);

  const [showReportModal,setShowReportModal] =
useState(false);

const [reportReason,setReportReason] =
useState("");

const [showBlockModal,setShowBlockModal] =
useState(false);

const [showActions,setShowActions] =
useState(false);

const [showGallery,setShowGallery] =
useState(false);

const [photoIndex,setPhotoIndex] =
useState(0);
const [photoLoaded,setPhotoLoaded] = useState(false);
const [datingActionLoading,setDatingActionLoading]=useState(false);
const pointerStart = useRef({x:0,y:0});
const suppressTapUntil = useRef(0);

useEffect(()=>setPhotoLoaded(false),[photoIndex]);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser(){

    

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if(data){
      setUser(data);
    }

  }

async function submitReport(){
  if(!reportReason){

  warning(
    t("common.error"),
    t("report.chooseReason")
  );

  return;

}

  const initData = await getTelegramInitData();
  if(!initData){
    error(t("common.error"), t("report.authFailed"));
    return;
  }

  const response = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, targetUserId: user.id, reason: reportReason })
  });
  const result = await response.json().catch(() => null);
  if(!response.ok || !result?.ok){
    error(t("common.error"), t("report.sendFailed"));
    return;
  }

  setShowReportModal(false);
  setReportReason("");

  success(
  t("common.done"),
  t("report.sent")
);
}

  if (!user) {
  return <UserProfileSkeleton />;
}
  async function blockUser(){
  const initData = await getTelegramInitData();
  if(!initData){
    error(t("common.error"), t("report.authFailed"));
    return;
  }

  const response = await fetch("/api/blocked-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, action: "block", blockedUserId: user.id })
  });
  const result = await response.json().catch(() => null);
  if(!response.ok || !result?.ok){
    error(t("common.error"), t("report.blockFailed"));
    return;
  }

  router.push("/home");
}

  const photos =
    user.photos?.length
      ? user.photos
      : user.avatar_url
      ? [user.avatar_url]
      : [];

  const previousPhoto = () => setPhotoIndex((index)=>Math.max(0,index-1));
  const nextPhoto = () => setPhotoIndex((index)=>Math.min(photos.length-1,index+1));
  const fromHome=searchParams.get("from")==="home";
  const handleDatingAction=async(action:"like"|"skip")=>{
    if(datingActionLoading||!user?.id)return;
    setDatingActionLoading(true);
    try{
      const current=await loadCurrentUser();
      if(!current)throw new Error("AUTH_REQUIRED");
      const result=await performLikeAction(action,user.id);
      consumeDiscoveryCandidate(current.id,user.id);
      if(result.chatId)router.replace(`/chat/${result.chatId}`);else router.back();
    }catch{
      error(t("common.error"),t("home.likeFailed"));
      setDatingActionLoading(false);
    }
  };
  const handlePointerDown = (event:React.PointerEvent)=>{
    pointerStart.current = {x:event.clientX,y:event.clientY};
  };
  const handlePointerUp = (event:React.PointerEvent)=>{
    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;
    if(Math.abs(deltaX) < 46 || Math.abs(deltaX) <= Math.abs(deltaY)*1.2) return;
    suppressTapUntil.current = Date.now()+300;
    if(deltaX < 0) nextPhoto(); else previousPhoto();
  };
  const handlePhotoTap = (event:React.MouseEvent<HTMLElement>)=>{
    if(Date.now() < suppressTapUntil.current) return;
    if(photos.length <= 1){ setShowGallery(true); return; }
    const bounds = event.currentTarget.getBoundingClientRect();
    if(event.clientX < bounds.left + bounds.width/2) previousPhoto(); else nextPhoto();
  };

  return (

<>
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
          maxWidth:"420px",
          margin:"0 auto"
        }}
      >

        <div
          style={{
            display:"flex",
            alignItems:"center",
            marginBottom:"20px"
          }}
        >

          <div
            onClick={() => router.back()}
            style={{
              cursor:"pointer"
            }}
          >
            <ArrowLeft2
              size="28"
              color="var(--primary)"
            />
          </div>

        </div>

      <div
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}
  onClick={handlePhotoTap}
  style={{
    position:"relative",
    aspectRatio:"4 / 5",
    maxHeight:560,
    overflow:"hidden",
    borderRadius:32,
    background:"var(--surface-secondary)",
    touchAction:"pan-y",
    userSelect:"none"
  }}
>

    {photos.length > 1 && <div
  style={{
    position:"absolute",
    top:"12px",
    left:"12px",
    right:"12px",

    display:"flex",
    gap:"4px",

    zIndex:20
  }}
>
  {photos.map((_:any,i:number)=>(

    
    <div
      key={i}
      style={{
        flex:1,
        height:"4px",
        borderRadius:"999px",

        background:
          i === photoIndex
            ? "#fff"
            : "rgba(255,255,255,.35)"
      }}
    />
  ))}
</div>}

<div
  onClick={(event) => { event.stopPropagation(); setShowActions(true); }}
  style={{
    position:"absolute",
    top:"16px",
    right:"16px",

    width:"42px",
    height:"42px",

    borderRadius:"50%",

    background:"rgba(0,0,0,.35)",

    display:"flex",
    justifyContent:"center",
    alignItems:"center",

    color:"#fff",
    fontSize:"24px",

    zIndex:30,
    cursor:"pointer"
  }}
>
  ⋮
</div>

 {!photoLoaded && <div style={{position:"absolute",inset:0,background:"linear-gradient(100deg,var(--surface-secondary) 20%,var(--surface-elevated) 40%,var(--surface-secondary) 60%)",backgroundSize:"200% 100%",animation:"profilePhotoLoading 1.2s ease infinite"}} />}
 <img
  src={photos[photoIndex] || "/noavatar.jpg"}
    alt={t("report.photoAlt",{name:user.name || t("chat.user"),index:photoIndex+1})}
    draggable={false}
    onLoad={()=>setPhotoLoaded(true)}
    onError={(event)=>{ event.currentTarget.src="/noavatar.jpg"; setPhotoLoaded(true); }}
    style={{
      width:"100%",
      height:"100%",
      objectFit:"cover",
      opacity:photoLoaded ? 1 : 0,
      transition:"opacity .22s ease",
      pointerEvents:"none"
    }}
  />

  <div
    style={{
      position:"absolute",
      left:0,
      right:0,
      bottom:0,
      height:"62%",

      background:`
      linear-gradient(
        to top,
        rgba(0,0,0,.78) 0%,
        rgba(0,0,0,.54) 38%,
        rgba(0,0,0,.18) 72%,
        rgba(0,0,0,0) 100%
      )`
    }}
  />

  <div
    style={{
      position:"absolute",
      left:"24px",
      bottom:"24px",
      color:"rgba(255,255,255,.98)",
      textShadow:"0 1px 8px rgba(0,0,0,.42)",
      pointerEvents:"none"
    }}
  >

    <div
  style={{
    display:"flex",
    alignItems:"center",
    gap:"8px"
  }}
>
  <div
    style={{
      fontSize:"24px",
      fontWeight:700
    }}
  >
    {user.name}, {user.age}
  </div>

  {user.is_verified && (
  <div
    style={{
      width:"20px",
      height:"20px",
      borderRadius:"50%",
      background:"var(--primary)",

      display:"flex",
      alignItems:"center",
      justifyContent:"center",

      color:"#fff",
      fontSize:"12px",
      fontWeight:700
    }}
  >
    ✓
  </div>
)}
</div>

    <div
  style={{
    marginTop:"8px",
    opacity:.95,
    fontSize:"15px"
  }}
>
  📍 {user.city || t("profile.noCity")}{user.distance ? ` • ${Math.round(user.distance)} km` : ""}
</div>

<div
  style={{
    marginTop:"10px",

    display:"flex",
    gap:"8px"
  }}
>

  <div
    onClick={(event)=>{ event.stopPropagation(); setShowGallery(true); }}
    style={{
      background:"rgba(255,255,255,.18)",
      padding:"6px 10px",
      borderRadius:"999px",
      fontSize:"12px",
      pointerEvents:"auto",
      cursor:"pointer"
    }}
  >
    {photos.length > 1 ? `${photoIndex+1} / ${photos.length}` : `📷 ${photos.length || 1} ${t("profile.photos")}`}
  </div>

  

</div>

<div
  style={{
    marginTop:"6px",

    display:"flex",
    gap:"8px",

    fontSize:"13px"
  }}
>

  <div
  style={{
    marginTop:"6px",
    fontSize:"13px"
  }}
>
  {user.last_seen ? (
    Date.now() - new Date(user.last_seen).getTime() < 5 * 60 * 1000
      ? `● ${t("home.online")}`
      : `● ${t("home.recently")}`
  ) : null}
</div>

</div>

  </div>

</div>

        {user.bio && <section style={profileSectionStyle}>
          <h2 style={sectionTitleStyle}>{t("profile.about")}</h2>
          <p style={{lineHeight:1.6,fontSize:15}}>{user.bio}</p>
        </section>}

        {user.interests?.length > 0 && <section style={profileSectionStyle}>
          <h2 style={sectionTitleStyle}>{t("profile.interests")}</h2>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {user.interests.map((item:string)=><span key={item} style={interestChipStyle}>{interestLabel(item,t)}</span>)}
          </div>
        </section>}

        {user.city && <section style={{marginTop:22}}>
          <h2 style={sectionTitleStyle}>{t("profile.location")}</h2>
          <div style={{background:"var(--surface)",border:"1px solid var(--border-subtle)",borderRadius:18,padding:"14px 16px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontWeight:700}}>📍 {user.city}</div>
            {user.distance ? <div style={{marginTop:4,color:"var(--text-secondary)",fontSize:13}}>{t("report.distance",{distance:Math.round(user.distance)})}</div> : null}
          </div>
        </section>}

</div>
</div>
        

      

    

    


{showReportModal && (

<div
  onClick={() =>
    setShowReportModal(false)
  }
  style={{
    position:"fixed",
    inset:0,

    background:"rgba(0,0,0,.45)",

    zIndex:999999,

    display:"flex",
    alignItems:"flex-end"
  }}
>

  <div
    onClick={(e)=>
      e.stopPropagation()
    }
    style={{
      width:"100%",
      background:"var(--sheet-bg)",
      color:"var(--text-primary)",

      borderTopLeftRadius:"28px",
      borderTopRightRadius:"28px",

      padding:"24px"
    }}
  >

    <div
      style={{
        textAlign:"center",
        fontSize:"20px",
        fontWeight:700,
        marginBottom:"18px"
      }}
    >
      {t("profile.report")}
    </div>

    {[
      {value:"Спам",label:t("report.spam")},
      {value:"Фейк аккаунт",label:t("report.fake")},
      {value:"Оскорбления",label:t("report.harassment")},
      {value:"Неприемлемый контент",label:t("report.content")},
      {value:"Другое",label:t("report.other")}
    ].map(item => (

      <div
        key={item.value}
        onClick={() =>
          setReportReason(item.value)
        }
        style={{
          padding:"16px",
          borderRadius:"16px",

          marginBottom:"10px",

          background:
            reportReason === item.value
            ? "var(--primary-soft)"
            : "var(--surface-secondary)",

          border:
            reportReason === item.value
            ? "2px solid var(--primary)"
            : "2px solid transparent",

          cursor:"pointer"
        }}
      >
        {item.label}
      </div>

    ))}

    <button
      onClick={submitReport}
      style={{
        width:"100%",
        height:"52px",

        border:"none",
        borderRadius:"16px",

        background:"var(--primary)",
        color:"var(--text-inverse)",

        fontWeight:600,
        marginTop:"10px"
      }}
    >
      {t("profile.reportSubmit")}
    </button>

  </div>

</div>

)}


{fromHome&&<div style={{position:"fixed",left:0,right:0,bottom:"calc(env(safe-area-inset-bottom, 0px) + 16px)",zIndex:80,display:"flex",justifyContent:"center",gap:20,pointerEvents:"none"}}>
  <button type="button" disabled={datingActionLoading} onClick={()=>void handleDatingAction("skip")} aria-label="Dismiss" style={{width:58,height:58,borderRadius:"50%",background:"var(--surface)",color:"var(--danger)",boxShadow:"var(--shadow-md)",fontSize:25,pointerEvents:"auto"}}>✕</button>
  <button type="button" disabled={datingActionLoading} onClick={()=>void handleDatingAction("like")} aria-label="Like" style={{width:64,height:64,borderRadius:"50%",background:"var(--brand-gradient)",color:"var(--text-inverse)",boxShadow:"var(--shadow-md)",fontSize:28,pointerEvents:"auto"}}>♡</button>
</div>}

<BottomSheet

  open={showActions}

  onClose={() =>
    setShowActions(false)
  }

>

  <h2
    style={{
      margin:0,
      textAlign:"center"
    }}
  >
    {t("profile.actions")}
  </h2>

  <div
    style={{
      marginTop:24
    }}
  >

    <div

      onClick={() => {

        setShowActions(false);

        setShowReportModal(true);

      }}

      style={actionItem}

    >
      ⚠️ {t("profile.report")}
    </div>

    <div

      onClick={async()=>{

        setShowActions(false);

        await blockUser();

      }}

      style={{...actionItem,color:"var(--danger)"}}

    >
      🚫 {t("profile.block")}
    </div>

  </div>

</BottomSheet>

{showGallery && (



<div
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}
  style={{
    position:"fixed",
    inset:0,
    background:"#000",
    zIndex:999999,

    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    touchAction:"pan-y"
  }}
>

  <button type="button" aria-label={t("report.closeGallery")} onClick={()=>setShowGallery(false)} style={{position:"absolute",top:"calc(env(safe-area-inset-top, 0px) + 16px)",right:16,zIndex:4,width:44,height:44,borderRadius:"50%",background:"rgba(0,0,0,.46)",color:"#fff",fontSize:24,cursor:"pointer"}}>×</button>

  {photos.length > 1 && <div style={{position:"absolute",top:"calc(env(safe-area-inset-top, 0px) + 18px)",left:18,right:72,display:"flex",gap:5,zIndex:3}}>
    {photos.map((_:string,index:number)=><span key={index} style={{flex:1,height:3,borderRadius:99,background:index===photoIndex ? "#fff" : "rgba(255,255,255,.32)",transition:"background .2s ease"}} />)}
  </div>}

  <img
    onClick={handlePhotoTap}
    src={photos[photoIndex] || "/noavatar.jpg"}
    alt={t("report.photoAlt",{name:user.name || t("chat.user"),index:photoIndex+1})}
    draggable={false}
    onError={(event)=>{ event.currentTarget.src="/noavatar.jpg"; }}
    style={{
      width:"100%",
      height:"100%",
      objectFit:"contain",
      userSelect:"none"
    }}
  />

</div>

)}

</>

  );
}
const actionItem = {
  padding:"16px",
  borderRadius:"16px",
  background:"var(--surface-secondary)",
  color:"var(--text-primary)",
  marginBottom:"10px",
  cursor:"pointer",
  fontWeight:600
};
const profileSectionStyle = {marginTop:16,background:"var(--surface)",border:"1px solid var(--border-subtle)",borderRadius:22,padding:18,boxShadow:"var(--shadow-sm)"};
const sectionTitleStyle = {fontSize:18,fontWeight:700,marginBottom:12};
const interestChipStyle = {padding:"8px 11px",borderRadius:999,background:"var(--primary-soft)",border:"1px solid var(--brand-border)",color:"var(--brand-primary)",fontSize:13,fontWeight:600};
