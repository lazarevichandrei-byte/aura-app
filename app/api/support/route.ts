import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../lib/telegram-auth";

export const runtime = "nodejs";

const SUPPORT_CATEGORIES = new Set(["bug", "idea", "other"]);
const MAX_MESSAGE_LENGTH = 5000;

export async function POST(request: Request) {
  let step = "parse_body";

  try {
    const body = await request.json();
    const initData = typeof body.initData === "string" ? body.initData : "";
    const category = typeof body.category === "string" ? body.category : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (
      !initData ||
      !SUPPORT_CATEGORIES.has(category) ||
      !message ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
    }

    step = "validate_telegram";
    const validation = validateTelegramInitData(initData);
    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 403 });
    }

    step = "load_current_user";
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id,telegram_id")
      .eq("telegram_id", validation.user.id)
      .maybeSingle();
    if (userError) throw userError;
    if (!currentUser) {
      return NextResponse.json({ ok: false, error: "CURRENT_USER_NOT_FOUND" }, { status: 404 });
    }

    step = "insert_ticket";
    const { error } = await supabaseAdmin.from("support_tickets").insert({
      telegram_id: currentUser.telegram_id,
      category,
      message,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const databaseError = error as { code?: string; message?: string };
    console.error("SUPPORT API ERROR:", {
      step,
      code: databaseError.code ?? "UNEXPECTED_ERROR",
      message: databaseError.message ?? "Unknown error",
    });
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
