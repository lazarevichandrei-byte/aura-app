import { NextResponse } from "next/server";

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

    if (!initData) {
      return NextResponse.json(
        { ok:false, error:"NO_INIT_DATA" },
        { status:400 }
      );
    }

  return NextResponse.json({
  ok:true,
  telegramUser
});

  } catch (e) {

    return NextResponse.json(
      { ok:false },
      { status:500 }
    );

  }
}