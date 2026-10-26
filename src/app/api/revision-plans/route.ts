import { NextResponse } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Fetch latest active plan
    const { data: plan, error: planError } = await supabase
      .from("revision_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError) {
      return NextResponse.json({ error: planError.message, code: "DB_ERROR" }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ plan: null, tasks: [] });
    }

    // 2. Fetch tasks for this plan
    const { data: tasks, error: tasksError } = await supabase
      .from("revision_tasks")
      .select("*, topic:topic_id(id, title)")
      .eq("plan_id", plan.id)
      .eq("user_id", user.id)
      .order("day_number", { ascending: true })
      .order("order_index", { ascending: true });

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message, code: "DB_ERROR" }, { status: 500 });
    }

    // Group tasks by day
    const tasksByDay: Record<number, any[]> = {};
    (tasks || []).forEach((t: any) => {
      const list = tasksByDay[t.day_number] || [];
      list.push(t);
      tasksByDay[t.day_number] = list;
    });

    return NextResponse.json({
      plan,
      tasks: tasks || [],
      tasksByDay,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
