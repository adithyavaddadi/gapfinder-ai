import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { status, day_number, order_index } = body;

    const supabase = await createClient();

    const updates: Record<string, any> = {};
    if (["pending", "completed", "skipped"].includes(status)) {
      updates.status = status;
    }
    if (typeof day_number === "number") {
      updates.day_number = day_number;
    }
    if (typeof order_index === "number") {
      updates.order_index = order_index;
    }

    const { data: updated, error } = await supabase
      .from("revision_tasks")
      .update(updates)
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
