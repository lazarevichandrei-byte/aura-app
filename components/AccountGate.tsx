"use client";

import {useEffect} from "react";
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
