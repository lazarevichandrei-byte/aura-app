import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../lib/telegram-auth";

export const runtime = "nodejs";

const REPORT_REASONS = new Set([
  "Спам",
  "Фейк аккаунт",
  "Оскорбления",
  "Неприемлемый контент",
  "Другое",
]);

export async function POST(request: Request) {
  let step = "parse_body";

  try {
    const body = await request.json();
    const initData = typeof body.initData === "string" ? body.initData : "";
    const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!initData || !targetUserId || !REPORT_REASONS.has(reason)) {
      return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
    }

    step = "validate_telegram";
    const validation = validateTelegramInitData(initData);
    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 403 });
    }

    step = "load_users";
    const [reporterResult, targetResult] = await Promise.all([
      supabaseAdmin.from("users").select("id").eq("telegram_id", validation.user.id).maybeSingle(),
      supabaseAdmin.from("users").select("id").eq("id", targetUserId).maybeSingle(),
    ]);

    if (reporterResult.error) throw reporterResult.error;
    if (targetResult.error) throw targetResult.error;
    if (!reporterResult.data) {
      return NextResponse.json({ ok: false, error: "CURRENT_USER_NOT_FOUND" }, { status: 404 });
    }
    if (!targetResult.data) {
      return NextResponse.json({ ok: false, error: "TARGET_USER_NOT_FOUND" }, { status: 404 });
    }
    if (reporterResult.data.id === targetResult.data.id) {
      return NextResponse.json({ ok: false, error: "SELF_REPORT_NOT_ALLOWED" }, { status: 400 });
    }

    step = "insert_report";
    const { error } = await supabaseAdmin.from("reports").insert({
      reporter_id: reporterResult.data.id,
      reported_user_id: targetResult.data.id,
      reason,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const databaseError = error as { code?: string; message?: string };
    console.error("REPORT API ERROR:", {
      step,
      code: databaseError.code ?? "UNEXPECTED_ERROR",
      message: databaseError.message ?? "Unknown error",
    });
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
