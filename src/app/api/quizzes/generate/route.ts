import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";
import { generateQuizForTopic } from "@/lib/quiz/generator";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const { topicId, questionCount = 3 } = body;

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required", code: "MISSING_TOPIC" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify topic belongs to user
    const { data: topic, error: topicErr } = await supabase
      .from("topics")
      .select("id, title")
      .eq("id", topicId)
      .eq("user_id", user.id)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: "Topic not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Generate verified quiz
    const result = await generateQuizForTopic(user.id, topic.id, topic.title, questionCount);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message || "Failed to generate grounded quiz questions",
          code: "GENERATION_FAILED",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      quizId: result.quizId,
      questionsCount: result.questionsGenerated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Quiz generation error";
    console.error("Quiz generate route error:", err);
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
