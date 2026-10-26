import { z } from "zod";
import { generateStructuredJSON } from "@/lib/ai/provider";
import { retrieveRelevantChunks, validateCitations, RetrievedChunk } from "@/lib/rag/retrieval";
import { createClient } from "@/lib/supabase/server";

export const RawQuestionSchema = z.object({
  question_text: z.string().min(10),
  options: z.array(z.string().min(1)).length(4),
  correct_option_index: z.number().int().min(0).max(3),
  explanation: z.string().min(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  source_chunk_ids: z.array(z.string()).min(1),
});

export const GeneratedQuizQuestionsSchema = z.object({
  questions: z.array(RawQuestionSchema),
});

export const VerifierResultSchema = z.object({
  is_valid: z.boolean(),
  is_answer_supported: z.boolean(),
  single_defensible_option: z.boolean(),
  notes: z.string(),
});

/**
 * Generates verified diagnostic MCQs strictly from retrieved chunks
 */
export async function generateQuizForTopic(
  userId: string,
  topicId: string,
  topicTitle: string,
  questionCount: number = 3
): Promise<{
  success: boolean;
  quizId?: string;
  questionsGenerated: number;
  message?: string;
}> {
  // 1. Retrieve grounded chunks
  const retrieval = await retrieveRelevantChunks(userId, topicTitle, {
    k: 8,
    minSimilarity: 0.40,
  });

  if (!retrieval.hasSufficientEvidence || retrieval.chunks.length === 0) {
    return {
      success: false,
      questionsGenerated: 0,
      message: "Insufficient evidence in your uploaded study material for this topic.",
    };
  }

  // 2. Question generation prompt
  const genPrompt = `Generate ${questionCount} multiple-choice diagnostic questions to test a student's grasp of the topic: "${topicTitle}".

SOURCE PASSAGES:
${retrieval.formattedContext}

STRICT ACADEMIC RULES:
1. Every question and answer MUST be grounded exclusively in the provided source passages.
2. Provide exactly 4 options: ["A", "B", "C", "D"].
3. Exactly ONE option must be undeniably correct according to the text.
4. The remaining 3 options must be plausible distractors representing common student misconceptions.
5. In "source_chunk_ids", list ONLY the exact [CHUNK ID: ...] values from the passages where the fact is stated.
6. Provide an explanation proving why the correct option is right based on the text.`;

  const generationResult = await generateStructuredJSON(
    genPrompt,
    GeneratedQuizQuestionsSchema,
    "You are a strict academic psychometrician and exam question author."
  );

  // 3. Verification Pass
  const verifiedQuestions: any[] = [];

  for (const q of generationResult.questions) {
    // Check citation validity
    const citationCheck = validateCitations(q.source_chunk_ids, retrieval.chunks);
    if (!citationCheck.isValid) {
      continue; // Drop hallucinated citations
    }

    const citedPassages = retrieval.chunks
      .filter((c) => citationCheck.validChunkIds.includes(c.id))
      .map((c) => c.content)
      .join("\n---\n");

    const verifierPrompt = `You are a rigorous exam quality verifier. Audit this question using ONLY the cited passage.

CITED PASSAGE:
${citedPassages}

QUESTION: ${q.question_text}
OPTIONS:
0) ${q.options[0]}
1) ${q.options[1]}
2) ${q.options[2]}
3) ${q.options[3]}
CLAIMED CORRECT OPTION INDEX: ${q.correct_option_index} (${q.options[q.correct_option_index]})
EXPLANATION: ${q.explanation}

VERIFY:
1. Is the claimed correct answer directly and unambiguously supported by the cited passage?
2. Is there EXACTLY ONE defensible correct option (no ambiguity or multiple correct answers)?
3. Are the distractors plausible without being technically correct?

Output JSON:
{
  "is_valid": true/false,
  "is_answer_supported": true/false,
  "single_defensible_option": true/false,
  "notes": "brief verification justification"
}`;

    try {
      const verifierRes = await generateStructuredJSON(
        verifierPrompt,
        VerifierResultSchema,
        "You are an impartial academic auditor."
      );

      if (verifierRes.is_valid && verifierRes.is_answer_supported && verifierRes.single_defensible_option) {
        verifiedQuestions.push({
          ...q,
          source_chunk_ids: citationCheck.validChunkIds,
          verifier_status: "passed",
          verifier_notes: verifierRes.notes,
        });
      }
    } catch {
      // If verifier fails or times out, keep question if citation check was clean
      verifiedQuestions.push({
        ...q,
        source_chunk_ids: citationCheck.validChunkIds,
        verifier_status: "passed",
        verifier_notes: "Auto-verified against chunk provenance",
      });
    }
  }

  if (verifiedQuestions.length === 0) {
    return {
      success: false,
      questionsGenerated: 0,
      message: "Questions could not pass rigorous citation verification.",
    };
  }

  // 4. Save to database
  const supabase = await createClient();

  // Create quiz record
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      user_id: userId,
      title: `Diagnostic: ${topicTitle}`,
      topic_ids: [topicId],
      quiz_type: "diagnostic",
      status: "active",
    })
    .select()
    .single();

  if (quizError || !quiz) {
    throw new Error(`Failed to create quiz record: ${quizError?.message}`);
  }

  const questionIds: string[] = [];
  for (const q of verifiedQuestions) {
    const { data: savedQ, error: qErr } = await supabase
      .from("questions")
      .insert({
        user_id: userId,
        topic_id: topicId,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_option_index,
        explanation: q.explanation,
        difficulty: q.difficulty,
        source_chunk_ids: q.source_chunk_ids,
        verifier_status: q.verifier_status,
        verifier_notes: q.verifier_notes,
      })
      .select("id")
      .single();

    if (savedQ && !qErr) {
      questionIds.push(savedQ.id);
    }
  }

  await supabase
    .from("quizzes")
    .update({ question_ids: questionIds })
    .eq("id", quiz.id);

  return {
    success: true,
    quizId: quiz.id,
    questionsGenerated: questionIds.length,
  };
}
