import {NextResponse} from "next/server";
import {normalizeLocale} from "../../../../lib/i18n/locales";
import {supabaseAdmin} from "../../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../../lib/telegram-auth";

export const runtime="nodejs";

const USER_FIELDS="id,telegram_id,name,avatar_url,onboarding_completed";

function validatedTelegramUser(initData:unknown){
  if(typeof initData!=="string"||!initData)return {response:NextResponse.json({ok:false,error:"NO_INIT_DATA"},{status:400})};
  const validation=validateTelegramInitData(initData);
  if(validation.ok===false)return {response:NextResponse.json({ok:false,error:validation.error},{status:validation.error==="BOT_TOKEN_MISSING"?500:403})};
  return {user:validation.user};
}

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>({}));
    const identity=validatedTelegramUser(body.initData);
    if(identity.response)return identity.response;
    const action=body.action==="create"?"create":"check";
    const {data:existingUser,error:lookupError}=await supabaseAdmin.from("users").select(USER_FIELDS).eq("telegram_id",identity.user.id).maybeSingle();
    if(lookupError)return NextResponse.json({ok:false,error:"USER_LOOKUP_FAILED"},{status:500});
    if(existingUser)return NextResponse.json({ok:true,exists:true,user:existingUser});
    if(action==="check")return NextResponse.json({ok:true,exists:false,user:null});

    const {data:newUser,error:createError}=await supabaseAdmin.from("users").insert({
      telegram_id:identity.user.id,
      name:identity.user.first_name||"Telegram User",
      avatar_url:identity.user.photo_url||null,
      language:normalizeLocale(typeof body.language==="string"?body.language:identity.user.language_code),
    }).select(USER_FIELDS).single();
    if(createError||!newUser)return NextResponse.json({ok:false,error:"USER_CREATE_FAILED"},{status:500});
    return NextResponse.json({ok:true,exists:true,user:newUser});
  }catch(error){
    console.error("AUTH ERROR",{message:error instanceof Error?error.message:"unknown"});
    return NextResponse.json({ok:false,error:"AUTH_FAILED"},{status:500});
  }
}

export async function DELETE(request:Request){
  try{
    const body=await request.json().catch(()=>({}));
    const identity=validatedTelegramUser(body.initData);
    if(identity.response)return identity.response;
    const {data:user,error:lookupError}=await supabaseAdmin.from("users").select("id").eq("telegram_id",identity.user.id).maybeSingle();
    if(lookupError)return NextResponse.json({ok:false,error:"USER_LOOKUP_FAILED"},{status:500});
    if(!user)return NextResponse.json({ok:false,error:"USER_NOT_FOUND"},{status:404});
    const {error:deleteError}=await supabaseAdmin.rpc("delete_my_account",{p_user_id:user.id});
    if(deleteError)return NextResponse.json({ok:false,error:"DELETE_FAILED"},{status:500});
    return NextResponse.json({ok:true});
  }catch(error){
    console.error("DELETE ACCOUNT ERROR",{message:error instanceof Error?error.message:"unknown"});
    return NextResponse.json({ok:false,error:"DELETE_FAILED"},{status:500});
  }
}
