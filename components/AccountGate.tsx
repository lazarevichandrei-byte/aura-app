"use client";

import {useEffect,useRef} from "react";
import {usePathname,useRouter} from "next/navigation";
import HomeSkeleton from "./HomeSkeleton";
import {savePendingRoute} from "../lib/auth/pendingRoute";
import {DELETED_SESSION_KEY,useCurrentUser} from "../lib/useCurrentUser";

const PUBLIC_ROUTES=new Set(["/","/terms","/privacy-policy"]);

export default function AccountGate({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const router=useRouter();
  const {user,loading,error}=useCurrentUser();
  const isPublic=PUBLIC_ROUTES.has(pathname);
  const deleted=typeof window!=="undefined"&&sessionStorage.getItem(DELETED_SESSION_KEY)==="1";
  const farewellActive=deleted&&pathname==="/account"&&typeof window!=="undefined"&&sessionStorage.getItem("aura-delete-farewell-active")==="1";
  const incomplete=user&&user.onboarding_completed!==true;
  const startedAt=useRef(typeof performance!=="undefined"?performance.now():0);

  useEffect(()=>{
    if(loading||process.env.NODE_ENV==="production")return;
    const now=performance.now();
    const markTime=(name:string)=>performance.getEntriesByName(name).at(-1)?.startTime;
    const authStart=markTime("USER_BOOTSTRAP_START");
    const authEnd=markTime("USER_BOOTSTRAP_END");
    console.info("[AURA_BOOT]",{
      telegramReadyMs:authStart===undefined?null:Math.max(0,authStart-startedAt.current),
      localeResolvedMs:markTime("I18N_READY")===undefined?null:Math.max(0,(markTime("I18N_READY") as number)-startedAt.current),
      authResolvedMs:authStart===undefined||authEnd===undefined?null:Math.max(0,authEnd-authStart),
      profileResolvedMs:null,
      gateResolvedMs:Math.max(0,now-startedAt.current),
    });
  },[loading]);

  useEffect(()=>{
    if(isPublic||loading||farewellActive)return;
    const destination=window.location.pathname+window.location.search;
    if(deleted||error||!user){savePendingRoute(destination);router.replace("/");return;}
    if(incomplete&&pathname!=="/profile"){savePendingRoute(destination);router.replace("/profile");}
  },[deleted,error,farewellActive,incomplete,isPublic,loading,pathname,router,user]);

  if(isPublic)return children;
  if(farewellActive)return children;
  if(loading||deleted||error||!user||(incomplete&&pathname!=="/profile"))return <HomeSkeleton/>;
  return children;
}
