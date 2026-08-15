import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../lib/telegram-auth";
import {NOTIFICATION_PREFERENCE_KEYS,type NotificationPreferences} from "../../../lib/notifications/preferences";
import {getUserNotificationPreferences,saveUserNotificationPreferences} from "../../../lib/server/notifications/preferences";

async function currentUser(initData:string){
  const validation=validateTelegramInitData(initData);
  if(validation.ok===false) return null;
  const {data}=await supabaseAdmin.from("users").select("id").eq("telegram_id",validation.user.id).maybeSingle();
  return data;
}
export async function POST(request:Request){
  const {initData}=await request.json().catch(()=>({}));
  if(typeof initData!=="string") return NextResponse.json({ok:false,error:"AUTH_REQUIRED"},{status:400});
  const user=await currentUser(initData);if(!user)return NextResponse.json({ok:false,error:"AUTH_FAILED"},{status:403});
  try{return NextResponse.json({ok:true,preferences:await getUserNotificationPreferences(user.id)});}catch{return NextResponse.json({ok:false,error:"LOAD_FAILED"},{status:500});}
}
export async function PATCH(request:Request){
  const {initData,preferences}=await request.json().catch(()=>({}));
  if(typeof initData!=="string"||!preferences||typeof preferences!=="object") return NextResponse.json({ok:false,error:"INVALID_REQUEST"},{status:400});
  const user=await currentUser(initData);if(!user)return NextResponse.json({ok:false,error:"AUTH_FAILED"},{status:403});
  let current:NotificationPreferences;
  try{current=await getUserNotificationPreferences(user.id);}catch{return NextResponse.json({ok:false,error:"LOAD_FAILED"},{status:500});}
  const patch:Partial<NotificationPreferences>={};
  for(const key of NOTIFICATION_PREFERENCE_KEYS) if(typeof preferences[key]==="boolean") patch[key]=preferences[key];
  const next={...current,...patch};
  const {error}=await saveUserNotificationPreferences(user.id,next);
  if(error)return NextResponse.json({ok:false,error:"SAVE_FAILED"},{status:500});
  return NextResponse.json({ok:true,preferences:next});
}
