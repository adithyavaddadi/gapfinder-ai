import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";
import { extractTopicsFromMaterial } from "@/lib/topics/generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId } = body;

    const supabase = await createClient();

    // 1. Fetch chunks for the target document, or all syllabus/material chunks for the user
    let chunksQuery = supabase
      .from("document_chunks")
      .select("content, heading, page_number")
      .eq("user_id", user.id)
      .order("chunk_index", { ascending: true })
      .limit(25);

    if (documentId) {
      chunksQuery = chunksQuery.eq("document_id", documentId);
    }

    const { data: chunks, error: chunksError } = await chunksQuery;

    if (chunksError || !chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "No document text found to extract topics. Please upload and process a document first.", code: "NO_CHUNKS" },
        { status: 400 }
      );
    }

    const aggregatedText = chunks.map((c) => `${c.heading ? `### ${c.heading}\n` : ""}${c.content}`).join("\n\n");

    // 2. Extract topics using Gemini
    const extracted = await extractTopicsFromMaterial(aggregatedText, "syllabus");

    const createdTopics: any[] = [];
    const titleToIdMap = new Map<string, string>();

    // 3. Insert parent topics and subtopics
    for (const [idx, topTopic] of extracted.topics.entries()) {
      const { data: parentRecord, error: parentErr } = await supabase
        .from("topics")
        .insert({
          user_id: user.id,
          document_id: documentId || null,
          title: topTopic.title,
          description: topTopic.description || null,
          source: "ai",
          order_index: idx,
        })
        .select()
        .single();

      if (parentErr || !parentRecord) continue;
      createdTopics.push(parentRecord);
      titleToIdMap.set(topTopic.title.toLowerCase(), parentRecord.id);

      // Default mastery for parent
      await supabase.from("topic_mastery").insert({
        user_id: user.id,
        topic_id: parentRecord.id,
        level: "not_assessed",
        score_percentage: 0,
        evidence_badge: "insufficient",
        why_rating: "Extracted from material - awaiting diagnostic quiz",
      });

      // Insert subtopics
      if (topTopic.subtopics && Array.isArray(topTopic.subtopics)) {
        for (const [subIdx, sub] of topTopic.subtopics.entries()) {
          const { data: subRecord, error: subErr } = await supabase
            .from("topics")
            .insert({
              user_id: user.id,
              document_id: documentId || null,
              parent_id: parentRecord.id,
              title: sub.title,
              description: sub.description || null,
              source: "ai",
              order_index: subIdx,
            })
            .select()
            .single();

          if (subErr || !subRecord) continue;
          createdTopics.push(subRecord);
          titleToIdMap.set(sub.title.toLowerCase(), subRecord.id);

          await supabase.from("topic_mastery").insert({
            user_id: user.id,
            topic_id: subRecord.id,
            level: "not_assessed",
            score_percentage: 0,
            evidence_badge: "insufficient",
            why_rating: "Extracted from material - awaiting diagnostic quiz",
          });
        }
      }
    }

    // 4. Insert suspected prerequisites
    for (const topTopic of extracted.topics) {
      const topicId = titleToIdMap.get(topTopic.title.toLowerCase());
      if (!topicId) continue;

      if (topTopic.suspectedPrerequisites && Array.isArray(topTopic.suspectedPrerequisites)) {
        for (const prereqName of topTopic.suspectedPrerequisites) {
          const prereqId = titleToIdMap.get(prereqName.toLowerCase());
          if (prereqId && prereqId !== topicId) {
            await supabase.from("topic_prerequisites").insert({
              user_id: user.id,
              topic_id: topicId,
              prerequisite_topic_id: prereqId,
              status: "suspected",
              reason: `Suspected fundamental dependency identified in curriculum structure`,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      curriculumTitle: extracted.curriculumTitle,
      topicCount: createdTopics.length,
      topics: createdTopics,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Topic extraction failed";
    console.error("Generate topics error:", err);
    return NextResponse.json({ error: msg, code: "GENERATION_ERROR" }, { status: 500 });
  }
}
