import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";
import {
  calculateMasteryLevel,
  calculateEvidenceBadge,
  generateWhyRating,
  analyzeConfidenceSignal,
} from "@/lib/assessment/mastery";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const body = await request.json();
    const clientResponses: Array<{
      question_id: string;
      selected_option_index: number;
      confidence_level?: number;
    }> = body.responses || [];

    if (!Array.isArray(clientResponses) || clientResponses.length === 0) {
      return NextResponse.json(
        { error: "No responses submitted", code: "EMPTY_SUBMISSION" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Fetch quiz and verify user ownership
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .eq("user_id", user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // 2. Fetch ground-truth questions from DB with correct keys and source chunks
    const questionIds = clientResponses.map((r) => r.question_id);
    const { data: dbQuestions, error: qErr } = await supabase
      .from("questions")
      .select("id, topic_id, question_text, options, correct_option_index, explanation, source_chunk_ids")
      .in("id", questionIds);

    if (qErr || !dbQuestions) {
      return NextResponse.json({ error: "Questions not found", code: "DB_ERROR" }, { status: 500 });
    }

    const questionMap = new Map(dbQuestions.map((q) => [q.id, q]));

    // 3. Fetch source citation chunk passages
    const allChunkIds = Array.from(
      new Set(dbQuestions.flatMap((q) => q.source_chunk_ids || []))
    );

    let chunksMap = new Map<string, any>();
    if (allChunkIds.length > 0) {
      const { data: chunksData } = await supabase
        .from("document_chunks")
        .select("id, content, heading, page_number, metadata")
        .in("id", allChunkIds);

      chunksMap = new Map((chunksData || []).map((c) => [c.id, c]));
    }

    // 4. Score DETERMINISTICALLY on the server
    let correctCount = 0;
    const scoredQuestionsFeedback: any[] = [];
    const topicStats = new Map<string, { total: number; correct: number; missedConcepts: string[] }>();

    for (const res of clientResponses) {
      const q = questionMap.get(res.question_id);
      if (!q) continue;

      const isCorrect = res.selected_option_index === q.correct_option_index;
      if (isCorrect) correctCount++;

      const confidence = res.confidence_level || 3;
      const confidenceSignal = analyzeConfidenceSignal(isCorrect, confidence);

      // Track per-topic performance
      const currentStats = topicStats.get(q.topic_id) || {
        total: 0,
        correct: 0,
        missedConcepts: [],
      };
      currentStats.total += 1;
      if (isCorrect) {
        currentStats.correct += 1;
      } else {
        // Collect missed concept from question
        currentStats.missedConcepts.push(q.question_text.slice(0, 80));
      }
      topicStats.set(q.topic_id, currentStats);

      // Build citations
      const citations = (q.source_chunk_ids || [])
        .map((chunkId: string) => chunksMap.get(chunkId))
        .filter(Boolean)
        .map((c: any) => ({
          chunkId: c.id,
          pageNumber: c.page_number,
          heading: c.heading || c.metadata?.sectionHeading || "Section",
          filename: c.metadata?.filename || "Course Material",
          passage: c.content,
        }));

      scoredQuestionsFeedback.push({
        questionId: q.id,
        questionText: q.question_text,
        options: q.options,
        selectedOptionIndex: res.selected_option_index,
        correctOptionIndex: q.correct_option_index,
        isCorrect,
        explanation: q.explanation,
        confidenceLevel: confidence,
        confidenceSignal,
        citations,
      });
    }

    const totalQuestions = clientResponses.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // 5. Save Quiz Attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        quiz_id: quiz.id,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        score_percentage: scorePercentage,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError || !attempt) {
      console.error("Attempt insert error:", attemptError);
    }

    // 6. Save Individual Quiz Responses
    if (attempt) {
      const responseRows = scoredQuestionsFeedback.map((f) => ({
        attempt_id: attempt.id,
        question_id: f.questionId,
        user_id: user.id,
        selected_option_index: f.selectedOptionIndex,
        is_correct: f.isCorrect,
        confidence_level: f.confidenceLevel,
      }));

      await supabase.from("quiz_responses").insert(responseRows);
    }

    // 7. Update Topic Mastery for each assessed topic
    for (const [topicId, stats] of topicStats.entries()) {
      // Get historical mastery
      const { data: existingMastery } = await supabase
        .from("topic_mastery")
        .select("*")
        .eq("user_id", user.id)
        .eq("topic_id", topicId)
        .single();

      const cumulativeTotal = (existingMastery?.questions_attempted || 0) + stats.total;
      const cumulativeCorrect = (existingMastery?.questions_correct || 0) + stats.correct;
      const accuracy = Math.round((cumulativeCorrect / cumulativeTotal) * 100);

      const level = calculateMasteryLevel(accuracy, cumulativeTotal);
      const evidenceBadge = calculateEvidenceBadge(cumulativeTotal);
      const whyRating = generateWhyRating(level, accuracy, cumulativeCorrect, cumulativeTotal);

      const missed = Array.from(
        new Set([...(existingMastery?.missed_concepts || []), ...stats.missedConcepts])
      ).slice(0, 5);

      await supabase.from("topic_mastery").upsert(
        {
          user_id: user.id,
          topic_id: topicId,
          score_percentage: accuracy,
          level,
          evidence_badge: evidenceBadge,
          questions_attempted: cumulativeTotal,
          questions_correct: cumulativeCorrect,
          missed_concepts: missed,
          why_rating: whyRating,
          last_assessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, topic_id" }
      );

      // Record in mastery_history
      await supabase.from("mastery_history").insert({
        user_id: user.id,
        topic_id: topicId,
        score_percentage: accuracy,
        level,
        questions_attempted: cumulativeTotal,
      });
    }

    // Update quiz status to completed
    await supabase.from("quizzes").update({ status: "completed" }).eq("id", quiz.id);

    return NextResponse.json({
      success: true,
      score: {
        total: totalQuestions,
        correct: correctCount,
        percentage: scorePercentage,
      },
      results: scoredQuestionsFeedback,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Scoring error";
    console.error("Quiz submission error:", err);
    return NextResponse.json({ error: msg, code: "SUBMISSION_ERROR" }, { status: 500 });
  }
}
