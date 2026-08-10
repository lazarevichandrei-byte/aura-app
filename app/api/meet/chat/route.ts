import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const initData = body?.initData;
    const eventId = body?.eventId;

    if (!initData || !eventId) {
      return NextResponse.json(
        {
          ok: false,
          error: "MISSING_DATA",
        },
        {
          status: 400,
        }
      );
    }

    const validation =
      validateTelegramInitData(initData);

    if (!validation.ok) {
      const validationError =
        "error" in validation
          ? validation.error
          : "INVALID_INIT_DATA";

      return NextResponse.json(
        {
          ok: false,
          error: validationError,
        },
        {
          status:
            validationError === "BOT_TOKEN_MISSING"
              ? 500
              : 403,
        }
      );
    }

    const telegramId =
      validation.user.id;

    const {
      data: user,
      error: userError,
    } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("telegram_id", telegramId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "USER_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: event,
      error: eventError,
    } = await supabaseAdmin
      .from("meet_events")
      .select("id, creator_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          ok: false,
          error: "MEET_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    if (event.creator_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "NOT_EVENT_CREATOR",
        },
        {
          status: 403,
        }
      );
    }

    let {
      data: chat,
      error: chatError,
    } = await supabaseAdmin
      .from("chats")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (chatError) {
      console.error(
        "MEET CHAT CHECK ERROR:",
        chatError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "CHAT_CHECK_FAILED",
        },
        {
          status: 500,
        }
      );
    }

    if (!chat) {
      const {
        data: createdChat,
        error,
      } = await supabaseAdmin
        .from("chats")
        .insert({
          event_id: eventId,
          user1_id: null,
          user2_id: null,
          last_message: "",
          liked_by: true,
          is_new_match: false,
          has_messages: false,
          unread_count: 0,
        })
        .select("id")
        .single();

      if (error || !createdChat) {
        console.error(
          "MEET CHAT CREATE ERROR:",
          error
        );

        return NextResponse.json(
          {
            ok: false,
            error: "CHAT_CREATE_FAILED",
          },
          {
            status: 500,
          }
        );
      }

      chat = createdChat;
    }

    const {
      data: existingParticipant,
      error: participantCheckError,
    } = await supabaseAdmin
      .from("chat_participants")
      .select("chat_id")
      .eq("chat_id", chat.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (participantCheckError) {
      console.error(
        "MEET CHAT PARTICIPANT CHECK ERROR:",
        participantCheckError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "PARTICIPANT_CHECK_FAILED",
        },
        {
          status: 500,
        }
      );
    }

    if (!existingParticipant) {
      const {
        error: participantError,
      } = await supabaseAdmin
        .from("chat_participants")
        .insert({
          chat_id: chat.id,
          user_id: user.id,
        });

      if (participantError) {
        console.error(
          "MEET CHAT PARTICIPANT ADD ERROR:",
          participantError
        );

        return NextResponse.json(
          {
            ok: false,
            error: "PARTICIPANT_ADD_FAILED",
          },
          {
            status: 500,
          }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      chatId: chat.id,
    });

  } catch (error) {
    console.error(
      "MEET CHAT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "SERVER_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}
