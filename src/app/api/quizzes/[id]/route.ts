import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const supabase = await createClient();

    // 1. Fetch quiz verifying user ownership
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .eq("user_id", user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // 2. Fetch questions
    const questionIds: string[] = quiz.question_ids || [];
    if (questionIds.length === 0) {
      return NextResponse.json({
        quiz: {
          id: quiz.id,
          title: quiz.title,
          status: quiz.status,
          questions: [],
        },
      });
    }

    const { data: rawQuestions, error: qErr } = await supabase
      .from("questions")
      .select("id, topic_id, question_text, options, difficulty")
      .in("id", questionIds);

    if (qErr) {
      return NextResponse.json({ error: qErr.message, code: "DB_ERROR" }, { status: 500 });
    }

    // STRICT SECURITY: Notice that correct_option_index and explanation are completely excluded!
    const sanitizedQuestions = (rawQuestions || []).map((q: any) => ({
      id: q.id,
      topic_id: q.topic_id,
      question_text: q.question_text,
      options: q.options,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        status: quiz.status,
        quiz_type: quiz.quiz_type,
        questions: sanitizedQuestions,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
