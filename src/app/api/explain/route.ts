import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { retrieveRelevantChunks, validateCitations, GROUNDING_SYSTEM_PROMPT } from "@/lib/rag/retrieval";
import { generateText } from "@/lib/ai/provider";

export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const { query, topicTitle, mode = "explain" } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required", code: "INVALID_QUERY" }, { status: 400 });
    }

    // 1. Retrieve grounded chunks
    const searchQuery = topicTitle ? `${topicTitle}: ${query}` : query;
    const retrieval = await retrieveRelevantChunks(user.id, searchQuery, {
      k: 6,
      minSimilarity: 0.42,
    });

    // 2. Strict evidence check: abstain if insufficient
    if (!retrieval.hasSufficientEvidence || retrieval.chunks.length === 0) {
      return NextResponse.json({
        answer:
          "Not enough information in your uploaded materials to answer this question accurately. GapFinder AI strictly answers from your course documents to avoid halluncinating outside your syllabus.",
        citations: [],
        hasSufficientEvidence: false,
      });
    }

    // 3. Prompt tailoring based on mode
    let instructionMode = "Explain clearly and concisely";
    if (mode === "example") {
      instructionMode = "Provide a concrete step-by-step worked example grounded strictly in the concepts from the text";
    } else if (mode === "brief") {
      instructionMode = "Provide an executive Class Brief summarizing key definitions and core rules from the text";
    }

    const prompt = `STUDENT QUESTION: "${query}"
TOPIC CONTEXT: "${topicTitle || "Course Study"}"

SOURCE CONTEXT PASSAGES:
${retrieval.formattedContext}

INSTRUCTIONS:
1. ${instructionMode}.
2. Use ONLY the facts provided in the source context passages above.
3. If an answer cannot be determined from the passages, say: "Not enough information in your uploaded materials."
4. At the end of every substantive paragraph or claim, cite the source using the chunk marker [CHUNK ID: ...].`;

    const rawAnswer = await generateText(prompt, GROUNDING_SYSTEM_PROMPT);

    // 4. Extract cited chunk IDs and validate
    const citedMatches = rawAnswer.match(/\[CHUNK ID:\s*([a-f0-9-]+)\]/gi) || [];
    const citedIds = Array.from(
      new Set(
        citedMatches.map((m) =>
          m.replace(/\[CHUNK ID:\s*/i, "").replace("]", "").trim()
        )
      )
    );

    const citationValidation = validateCitations(citedIds, retrieval.chunks);

    // Filter valid citation chunks
    const validCitations = retrieval.chunks
      .filter((c) => citationValidation.validChunkIds.includes(c.id))
      .map((c) => ({
        chunkId: c.id,
        pageNumber: c.page_number,
        heading: c.heading || c.metadata?.sectionHeading || "Section",
        filename: c.metadata?.filename || "Course Material",
        passage: c.content,
      }));

    // Clean inline citation tokens from student-facing text for polished reading
    const cleanAnswer = rawAnswer.replace(/\[CHUNK ID:\s*[a-f0-9-]+\]/gi, "").trim();

    return NextResponse.json({
      success: true,
      answer: cleanAnswer,
      citations: validCitations.length > 0 ? validCitations : retrieval.chunks.slice(0, 2).map((c) => ({
        chunkId: c.id,
        pageNumber: c.page_number,
        heading: c.heading || c.metadata?.sectionHeading || "Section",
        filename: c.metadata?.filename || "Course Material",
        passage: c.content,
      })),
      hasSufficientEvidence: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Explanation error";
    console.error("Explain route error:", err);
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
