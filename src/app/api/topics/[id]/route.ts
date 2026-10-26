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

    const { id: topicId } = await params;
    const body = await request.json();
    const { title, description, parent_id, order_index } = body;

    const supabase = await createClient();

    // Verify ownership
    const { data: existingTopic } = await supabase
      .from("topics")
      .select("id")
      .eq("id", topicId)
      .eq("user_id", user.id)
      .single();

    if (!existingTopic) {
      return NextResponse.json({ error: "Topic not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (typeof title === "string") updates.title = title.trim();
    if (typeof description !== "undefined") updates.description = description;
    if (typeof parent_id !== "undefined") updates.parent_id = parent_id;
    if (typeof order_index === "number") updates.order_index = order_index;

    const { data: updated, error } = await supabase
      .from("topics")
      .update(updates)
      .eq("id", topicId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ success: true, topic: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: topicId } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message, code: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
