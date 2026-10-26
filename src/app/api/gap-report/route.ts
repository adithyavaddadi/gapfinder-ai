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
    const { data: topics, error: topicsErr } = await supabase
      .from("topics")
      .select("*")
      .eq("user_id", user.id)
      .order("order_index", { ascending: true });

    if (topicsErr) {
      return NextResponse.json({ error: topicsErr.message, code: "DB_ERROR" }, { status: 500 });
    }

    // 2. Fetch topic mastery records
    const { data: masteryRecords } = await supabase
      .from("topic_mastery")
      .select("*")
      .eq("user_id", user.id);

    const masteryMap = new Map((masteryRecords || []).map((m: any) => [m.topic_id, m]));

    // 3. Fetch prerequisites
    const { data: prerequisites } = await supabase
      .from("topic_prerequisites")
      .select("*, prerequisite:prerequisite_topic_id(id, title)")
      .eq("user_id", user.id);

    const prereqMap = new Map<string, any[]>();
    (prerequisites || []).forEach((p: any) => {
      const list = prereqMap.get(p.topic_id) || [];
      list.push({
        id: p.id,
        prerequisiteId: p.prerequisite_topic_id,
        prerequisiteTitle: p.prerequisite?.title || "Prerequisite",
        status: p.status,
        reason: p.reason,
      });
      prereqMap.set(p.topic_id, list);
    });

    // 4. Fetch recent questions & cited chunk passages for each topic
    const { data: questions } = await supabase
      .from("questions")
      .select("id, topic_id, question_text, explanation, source_chunk_ids")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const chunkIds = Array.from(
      new Set((questions || []).flatMap((q: any) => q.source_chunk_ids || []))
    );

    let chunksMap = new Map<string, any>();
    if (chunkIds.length > 0) {
      const { data: chunks } = await supabase
        .from("document_chunks")
        .select("id, content, heading, page_number, metadata")
        .in("id", chunkIds);

      chunksMap = new Map((chunks || []).map((c: any) => [c.id, c]));
    }

    const topicCitationsMap = new Map<string, any[]>();
    (questions || []).forEach((q: any) => {
      const citations = (q.source_chunk_ids || [])
        .map((cid: string) => chunksMap.get(cid))
        .filter(Boolean)
        .map((c: any) => ({
          chunkId: c.id,
          pageNumber: c.page_number,
          heading: c.heading || c.metadata?.sectionHeading || "Section",
          filename: c.metadata?.filename || "Course Material",
          passage: c.content,
        }));

      if (citations.length > 0) {
        const existing = topicCitationsMap.get(q.topic_id) || [];
        topicCitationsMap.set(q.topic_id, [...existing, ...citations]);
      }
    });

    // 5. Build enriched topic gap report items
    let weakCount = 0;
    let mediumCount = 0;
    let strongCount = 0;
    let notAssessedCount = 0;

    const topicReports = (topics || []).map((t: any) => {
      const m = masteryMap.get(t.id) || {
        level: "not_assessed",
        score_percentage: 0,
        evidence_badge: "insufficient",
        questions_attempted: 0,
        questions_correct: 0,
        missed_concepts: [],
        why_rating: "No diagnostic attempts yet. Take a diagnostic test to evaluate this topic.",
      };

      if (m.level === "weak") weakCount++;
      else if (m.level === "medium") mediumCount++;
      else if (m.level === "strong") strongCount++;
      else notAssessedCount++;

      const prereqs = prereqMap.get(t.id) || [];
      const citations = topicCitationsMap.get(t.id) || [];

      // Deduplicate citations
      const uniqueCitations = citations.filter(
        (c: any, index: number, self: any[]) =>
          index === self.findIndex((o: any) => o.chunkId === c.chunkId)
      );

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        source: t.source,
        level: m.level,
        scorePercentage: m.score_percentage,
        evidenceBadge: m.evidence_badge,
        questionsAttempted: m.questions_attempted,
        questionsCorrect: m.questions_correct,
        whyRating: m.why_rating,
        missedConcepts: m.missed_concepts || [],
        prerequisites: prereqs,
        citations: uniqueCitations.slice(0, 3),
      };
    });

    return NextResponse.json({
      summary: {
        total: topicReports.length,
        weakCount,
        mediumCount,
        strongCount,
        notAssessedCount,
      },
      topics: topicReports,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
