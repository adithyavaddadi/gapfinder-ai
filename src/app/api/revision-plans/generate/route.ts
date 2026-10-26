import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";
import { generateRevisionSchedule, TopicForPlanning } from "@/lib/planner/algorithm";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const dailyHours = Number(body.dailyHours) || 2.0;
    const examDate = body.examDate || null;
    const learningMode = body.learningMode || "balanced";

    const supabase = await createClient();

    // 1. Fetch user topics & mastery
    const { data: topics, error: topicsErr } = await supabase
      .from("topics")
      .select("id, title")
      .eq("user_id", user.id);

    if (topicsErr || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: "No topics found. Upload materials first to generate a revision plan.", code: "NO_TOPICS" },
        { status: 400 }
      );
    }

    const { data: masteryRecords } = await supabase
      .from("topic_mastery")
      .select("topic_id, level, score_percentage")
      .eq("user_id", user.id);

    const masteryMap = new Map((masteryRecords || []).map((m: any) => [m.topic_id, m]));

    // 2. Identify which topics have other topics depending on them
    const { data: prereqRecords } = await supabase
      .from("topic_prerequisites")
      .select("prerequisite_topic_id")
      .eq("user_id", user.id);

    const dependentTopicIds = new Set((prereqRecords || []).map((p: any) => p.prerequisite_topic_id));

    // 3. Build TopicForPlanning array
    const topicsForPlanning: TopicForPlanning[] = topics.map((t) => {
      const m = masteryMap.get(t.id);
      return {
        id: t.id,
        title: t.title,
        level: m?.level || "not_assessed",
        scorePercentage: m?.score_percentage || 0,
        hasDependents: dependentTopicIds.has(t.id),
      };
    });

    // 4. Generate schedule with algorithm
    const scheduledTasks = generateRevisionSchedule(topicsForPlanning, {
      dailyHours,
      examDate,
      learningMode,
      targetDays: 7,
    });

    // 5. Determine version number
    const { data: latestPlan } = await supabase
      .from("revision_plans")
      .select("version")
      .eq("user_id", user.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const newVersion = (latestPlan?.version || 0) + 1;

    // Deactivate old plans
    await supabase
      .from("revision_plans")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // 6. Insert new plan
    const { data: newPlan, error: planInsertErr } = await supabase
      .from("revision_plans")
      .insert({
        user_id: user.id,
        version: newVersion,
        daily_hours: dailyHours,
        exam_date: examDate,
        learning_mode: learningMode,
        is_active: true,
      })
      .select()
      .single();

    if (planInsertErr || !newPlan) {
      throw new Error(`Failed to create revision plan: ${planInsertErr?.message}`);
    }

    // 7. Insert tasks
    const taskRows = scheduledTasks.map((t, idx) => ({
      plan_id: newPlan.id,
      user_id: user.id,
      topic_id: t.topicId,
      day_number: t.dayNumber,
      duration_minutes: t.durationMinutes,
      task_type: t.taskType,
      title: t.title,
      description: t.description,
      why_reason: t.whyReason,
      priority_score: t.priorityScore,
      status: "pending",
      order_index: idx,
    }));

    if (taskRows.length > 0) {
      const { error: taskInsertErr } = await supabase.from("revision_tasks").insert(taskRows);
      if (taskInsertErr) {
        console.error("Failed to insert revision tasks:", taskInsertErr);
      }
    }

    return NextResponse.json({
      success: true,
      plan: newPlan,
      tasksCount: taskRows.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan generation error";
    console.error("Generate revision plan error:", err);
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
