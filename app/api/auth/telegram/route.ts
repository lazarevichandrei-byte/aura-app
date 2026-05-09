import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
export async function POST(req: Request) {
  try {

    const body = await req.json();

    const initData = body?.initData;

    const params = new URLSearchParams(initData);

const userRaw = params.get("user");

if (!userRaw) {
  return NextResponse.json(
    { ok:false, error:"NO_USER" },
    { status:400 }
  );
}

const telegramUser = JSON.parse(userRaw);
const telegramId = telegramUser.id;

const hash = params.get("hash");

if (!hash) {
  return NextResponse.json(
    { ok:false, error:"NO_HASH" },
    { status:400 }
  );
}

params.delete("hash");

const dataCheckString = [...params.entries()]
  .sort(([a],[b]) => a.localeCompare(b))
  .map(([key,value]) => `${key}=${value}`)
  .join("\n");

    if (!initData) {
      return NextResponse.json(
        { ok:false, error:"NO_INIT_DATA" },
        { status:400 }
      );
    }

  const secretKey = crypto
  .createHash("sha256")
  .update(process.env.TELEGRAM_BOT_TOKEN!)
  .digest();

const hmac = crypto
  .createHmac("sha256", secretKey)
  .update(dataCheckString)
  .digest("hex");

const isValid = hmac === hash;

if (!isValid) {
  return NextResponse.json(
    { ok:false, error:"INVALID_HASH" },
    { status:403 }
  );
}

const { data: existingUser } =
  await supabaseAdmin
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

if (existingUser) {

  return NextResponse.json({
    ok:true,
    user: existingUser
  });

}

const { data:newUser, error:newUserError } =
  await supabaseAdmin
    .from("users")
    .insert({
      telegram_id: telegramId,
      name:
        telegramUser.first_name ||
        "Telegram User"
    })
    .select()
    .single();

if (newUserError || !newUser) {

  return NextResponse.json(
    { ok:false, error:"USER_CREATE_FAILED" },
    { status:500 }
  );

}

return NextResponse.json({
  ok:true,
  user:newUser
});


  } catch (e) {

    return NextResponse.json(
      { ok:false },
      { status:500 }
    );

  }
}