import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../lib/telegram-auth";
import {normalizeLocale} from "../../../lib/i18n/locales";

const READ_FIELDS="theme,language,show_online,show_last_seen,hide_profile,name,age,city,avatar_url,photos,main_photo_index";
const BOOLEAN_FIELDS=new Set(["show_online","show_last_seen","hide_profile"]);
const TEXT_FIELDS=new Set(["theme","language"]);

async function currentUser(initData:unknown){
  if(typeof initData!=="string")return null;
  const validation=validateTelegramInitData(initData);
  if(validation.ok===false)return null;
  const {data,error}=await supabaseAdmin.from("users").select(`id,${READ_FIELDS}`).eq("telegram_id",validation.user.id).maybeSingle();
  if(error)throw error;
  return data;
}

export async function POST(request:Request){
  try{
    const {initData}=await request.json().catch(()=>({}));
    const user=await currentUser(initData);
    if(!user)return NextResponse.json({ok:false,error:"UNAUTHORIZED"},{status:403});
    const settings={...user} as Record<string,unknown>;
    delete settings.id;
    return NextResponse.json({ok:true,settings});
  }catch{return NextResponse.json({ok:false,error:"LOAD_FAILED"},{status:500});}
}

export async function PATCH(request:Request){
  try{
    const {initData,field,value}=await request.json().catch(()=>({}));
    if(typeof field!=="string"||(!BOOLEAN_FIELDS.has(field)&&!TEXT_FIELDS.has(field)))return NextResponse.json({ok:false,error:"INVALID_SETTING"},{status:400});
    if(BOOLEAN_FIELDS.has(field)&&typeof value!=="boolean")return NextResponse.json({ok:false,error:"INVALID_VALUE"},{status:400});
    if(TEXT_FIELDS.has(field)&&typeof value!=="string")return NextResponse.json({ok:false,error:"INVALID_VALUE"},{status:400});
    if(field==="theme"&&!['light','dark','system'].includes(value))return NextResponse.json({ok:false,error:"INVALID_VALUE"},{status:400});
    const user=await currentUser(initData);
    if(!user)return NextResponse.json({ok:false,error:"UNAUTHORIZED"},{status:403});
    const normalizedValue=field==="language"?normalizeLocale(value as string):value;
    const patch:Record<string,unknown>={[field]:normalizedValue};
    if(field==="show_online")patch.show_last_seen=value;
    const {error}=await supabaseAdmin.from("users").update(patch).eq("id",user.id);
    if(error)throw error;
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({ok:false,error:"SAVE_FAILED"},{status:500});}
}
