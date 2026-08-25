import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../lib/telegram-auth";
import {recordServerEventSafe} from "../../../lib/server/events/record";

export const runtime = "nodejs";

async function getCurrentUser(initData: string) {
  const validation = validateTelegramInitData(initData);
  if (!validation.ok) return null;

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("telegram_id", validation.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function readBodyValue(body: unknown, key: string) {
  if (!body || typeof body !== "object") return "";
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let step = "parse_body";

  try {
    const body = await request.json();
    const initData = readBodyValue(body, "initData");
    const action = readBodyValue(body, "action");
    const blockedUserId = readBodyValue(body, "blockedUserId");

    if (!initData || !["list", "block"].includes(action) || (action === "block" && !blockedUserId)) {
      return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
    }

    step = "authenticate";
    const currentUser = await getCurrentUser(initData);
    if (!currentUser) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 403 });
    }

    if (action === "list") {
      step = "list_blocks";
      const { data: blocks, error } = await supabaseAdmin
        .from("blocked_users")
        .select("id,blocked_user_id")
        .eq("user_id", currentUser.id);
      if (error) throw error;

      if (!blocks?.length) {
        return NextResponse.json({ ok: true, blockedUsers: [] });
      }

      step = "load_blocked_users";
      const { data: users, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id,name,avatar_url,city")
        .in("id", blocks.map((block) => block.blocked_user_id));
      if (usersError) throw usersError;

      const blockedUsers = blocks.map((block) => ({
        ...block,
        blocked_user: users?.find((user) => user.id === block.blocked_user_id) ?? null,
      }));
      return NextResponse.json({ ok: true, blockedUsers });
    }

    if (blockedUserId === currentUser.id) {
      return NextResponse.json({ ok: false, error: "SELF_BLOCK_NOT_ALLOWED" }, { status: 400 });
    }

    step = "validate_target";
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", blockedUserId)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!targetUser) {
      return NextResponse.json({ ok: false, error: "TARGET_USER_NOT_FOUND" }, { status: 404 });
    }

    step = "insert_block";
    const {data:block, error } = await supabaseAdmin.from("blocked_users").insert({
      user_id: currentUser.id,
      blocked_user_id: targetUser.id,
    }).select("id").maybeSingle();
    if (error && error.code !== "23505") throw error;
    if(block)await recordServerEventSafe({eventName:"block",actorUserId:currentUser.id,targetUserId:targetUser.id,entityType:"block",entityId:block.id,dedupeKey:`block:${block.id}`});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError("POST", step, error);
  }
}

export async function DELETE(request: Request) {
  let step = "parse_body";

  try {
    const body = await request.json();
    const initData = readBodyValue(body, "initData");
    const blockedUserId = readBodyValue(body, "blockedUserId");
    if (!initData || !blockedUserId) {
      return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
    }

    step = "authenticate";
    const currentUser = await getCurrentUser(initData);
    if (!currentUser) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 403 });
    }

    step = "delete_block";
    const { error } = await supabaseAdmin
      .from("blocked_users")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("blocked_user_id", blockedUserId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError("DELETE", step, error);
  }
}

function handleError(method: string, step: string, error: unknown) {
  const databaseError = error as { code?: string; message?: string };
  console.error("BLOCKED USERS API ERROR:", {
    method,
    step,
    code: databaseError.code ?? "UNEXPECTED_ERROR",
    message: databaseError.message ?? "Unknown error",
  });
  return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
}
