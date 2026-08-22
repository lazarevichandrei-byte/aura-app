import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../lib/telegram-auth";

export const runtime="nodejs";

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const validation=validateTelegramInitData(typeof body?.initData==="string"?body.initData:"");
    if(validation.ok===false)return NextResponse.json({ok:false,error:validation.error},{status:validation.error==="BOT_TOKEN_MISSING"?500:403});
    const {data:user,error:userError}=await supabaseAdmin.from("users").select("id,age,gender,looking,latitude,longitude,search_radius,name,avatar_url,photos,main_photo_index").eq("telegram_id",validation.user.id).maybeSingle();
    if(userError)throw userError;
    if(!user)return NextResponse.json({ok:false,error:"USER_NOT_FOUND"},{status:404});
    const excludeIds=Array.isArray(body?.excludeIds)?body.excludeIds.filter((id:unknown)=>typeof id==="string").slice(0,300):[];
    const requestedLimit=Number(body?.limit);
    const limit=Number.isInteger(requestedLimit)?Math.max(1,Math.min(requestedLimit,60)):30;
    const {data,error}=await supabaseAdmin.rpc("get_dating_feed",{p_user_id:user.id,p_limit:limit,p_exclude_ids:excludeIds});
    if(error)throw error;
    const distance=(latitude:unknown,longitude:unknown)=>{
      if(typeof latitude!=="number"||typeof longitude!=="number"||typeof user.latitude!=="number"||typeof user.longitude!=="number")return null;
      const radians=(value:number)=>value*Math.PI/180;
      const latitudeDelta=radians(latitude-user.latitude);const longitudeDelta=radians(longitude-user.longitude);
      const value=Math.sin(latitudeDelta/2)**2+Math.cos(radians(user.latitude))*Math.cos(radians(latitude))*Math.sin(longitudeDelta/2)**2;
      return Math.round(6371*2*Math.asin(Math.sqrt(value)));
    };
    const candidates=((data??[]) as Array<Record<string,unknown>>).map((candidate)=>({id:candidate.id,name:candidate.name,age:candidate.age,city:candidate.city,bio:candidate.bio,interests:candidate.interests,avatar_url:candidate.avatar_url,photos:candidate.photos,main_photo_index:candidate.main_photo_index,is_verified:candidate.is_verified,is_online:candidate.show_online?candidate.is_online:false,last_seen:candidate.show_last_seen?candidate.last_seen:null,show_online:candidate.show_online,show_last_seen:candidate.show_last_seen,distance:distance(candidate.latitude,candidate.longitude)}));
    return NextResponse.json({ok:true,currentUserId:user.id,currentProfile:{name:user.name,avatar_url:user.avatar_url,photos:user.photos,main_photo_index:user.main_photo_index},filterSnapshot:{age:user.age,gender:user.gender,looking:user.looking,latitude:user.latitude,longitude:user.longitude,search_radius:user.search_radius},candidates});
  }catch(error){
    console.error("DISCOVERY API ERROR",{message:error instanceof Error?error.message:"unknown"});
    return NextResponse.json({ok:false,error:"DISCOVERY_FAILED"},{status:500});
  }
}
