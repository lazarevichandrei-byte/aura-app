import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "NOTIFICATION_PROXY_DEPRECATED" },
    { status: 410 }
  );
}
