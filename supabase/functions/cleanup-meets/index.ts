import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();

    const { data: expiredEvents, error: selectError } =
      await supabase
        .from("meet_events")
        .select("id")
        .eq("is_active", true)
        .lte("expires_at", now);

    if (selectError) {
      throw selectError;
    }

    if (!expiredEvents || expiredEvents.length === 0) {
      return Response.json({
        success: true,
        disabled: 0,
        message: "Нет просроченных встреч",
      });
    }

    const ids = expiredEvents.map((event) => event.id);

    const { error: updateError } =
      await supabase
        .from("meet_events")
        .update({
          is_active: false,
        })
        .in("id", ids);

    if (updateError) {
      throw updateError;
    }

    console.log(`Disabled ${ids.length} expired meet events`);

    return Response.json({
      success: true,
      disabled: ids.length,
      ids,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
});