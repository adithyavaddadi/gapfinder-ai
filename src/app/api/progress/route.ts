import { NextResponse } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Fetch topics
    const { data: topics } = await supabase
      .from("topics")
      .select("id, title")
      .eq("user_id", user.id);

    const topicMap = new Map((topics || []).map((t) => [t.id, t.title]));

    // 2. Fetch mastery history grouped by topic
    const { data: history } = await supabase
      .from("mastery_history")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true });

    const historyByTopic = new Map<string, any[]>();
    (history || []).forEach((h) => {
      const list = historyByTopic.get(h.topic_id) || [];
      list.push(h);
      historyByTopic.set(h.topic_id, list);
    });

    // 3. Calculate baseline vs latest retest comparison per topic
    const topicComparisons: any[] = [];
    let totalAttemptsCount = 0;

    for (const [topicId, entries] of historyByTopic.entries()) {
      totalAttemptsCount += entries.length;
      const baseline = entries[0];
      const latest = entries[entries.length - 1];
      const title = topicMap.get(topicId) || "Topic";

      const delta = Math.round(Number(latest.score_percentage) - Number(baseline.score_percentage));

      topicComparisons.push({
        topicId,
        topicTitle: title,
        attemptsCount: entries.length,
        baselineScore: Number(baseline.score_percentage),
        baselineDate: baseline.recorded_at,
        latestScore: Number(latest.score_percentage),
        latestDate: latest.recorded_at,
        delta,
        sampleSizeTotal: latest.questions_attempted,
        isSmallSample: latest.questions_attempted < 5,
      });
    }

    // 4. Fetch quiz attempts
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    // 5. Fetch current topic mastery
    const { data: masteryRecords } = await supabase
      .from("topic_mastery")
      .select("*")
      .eq("user_id", user.id);

    return NextResponse.json({
      totalAttempts: attempts?.length || 0,
      topicComparisons,
      attempts: attempts || [],
      currentMastery: masteryRecords || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
