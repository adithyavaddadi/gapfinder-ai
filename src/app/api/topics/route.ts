import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Fetch topics
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .eq("user_id", user.id)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (topicsError) {
      return NextResponse.json({ error: topicsError.message, code: "DB_ERROR" }, { status: 500 });
    }

    // 2. Fetch topic mastery records
    const { data: masteryRecords } = await supabase
      .from("topic_mastery")
      .select("*")
      .eq("user_id", user.id);

    const masteryMap = new Map((masteryRecords || []).map((m: any) => [m.topic_id, m]));

    // 3. Fetch topic prerequisites
    const { data: prerequisites } = await supabase
      .from("topic_prerequisites")
      .select("*, prerequisite:prerequisite_topic_id(id, title)")
      .eq("user_id", user.id);

    const prereqMap = new Map<string, any[]>();
    (prerequisites || []).forEach((p: any) => {
      const list = prereqMap.get(p.topic_id) || [];
      list.push({
        id: p.id,
        prerequisiteTopicId: p.prerequisite_topic_id,
        prerequisiteTitle: p.prerequisite?.title || "Prerequisite",
        status: p.status,
        reason: p.reason,
      });
      prereqMap.set(p.topic_id, list);
    });

    // Merge mastery and prerequisites into topics
    const enrichedTopics = (topics || []).map((t: any) => {
      const mastery = masteryMap.get(t.id) || {
        level: "not_assessed",
        score_percentage: 0,
        evidence_badge: "insufficient",
        questions_attempted: 0,
        questions_correct: 0,
        missed_concepts: [],
        why_rating: "No diagnostic attempts yet",
      };

      return {
        ...t,
        mastery,
        prerequisites: prereqMap.get(t.id) || [],
      };
    });

    return NextResponse.json({ topics: enrichedTopics });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, parent_id, source = "user" } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required", code: "INVALID_TITLE" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: topic, error } = await supabase
      .from("topics")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        parent_id: parent_id || null,
        source,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: "DB_ERROR" }, { status: 500 });
    }

    // Default mastery row
    await supabase.from("topic_mastery").insert({
      user_id: user.id,
      topic_id: topic.id,
      level: "not_assessed",
      score_percentage: 0,
      evidence_badge: "insufficient",
      questions_attempted: 0,
      questions_correct: 0,
      why_rating: "Newly created topic - awaiting diagnostic test",
    });

    return NextResponse.json({ success: true, topic });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
