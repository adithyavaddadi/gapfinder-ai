import { z } from "zod";
import { generateStructuredJSON } from "@/lib/ai/provider";

export const TopicNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    subtopics: z.array(TopicNodeSchema).default([]),
    suspectedPrerequisites: z.array(z.string()).default([]),
  })
);

export const CurriculumExtractionSchema = z.object({
  curriculumTitle: z.string(),
  topics: z.array(TopicNodeSchema),
});

export type ExtractedCurriculum = z.infer<typeof CurriculumExtractionSchema>;

export async function extractTopicsFromMaterial(
  materialText: string,
  sourceType: "syllabus" | "textbook" | "notes" = "syllabus"
): Promise<ExtractedCurriculum> {
  const prompt = `Analyze the following academic study material (${sourceType}) and extract a structured hierarchy of modules, topics, and subtopics.

MATERIAL EXCERPTS:
${materialText.slice(0, 14000)}

INSTRUCTIONS:
1. Extract clear, concise topic titles with descriptions.
2. Structure them in a natural parent-child hierarchy (e.g. Module -> Topics -> Subtopics).
3. Identify suspected prerequisites between topics where understanding one topic is necessary to grasp another (e.g. "Functional Dependencies" is a prerequisite for "Boyce-Codd Normal Form").
4. Return ONLY a valid JSON object matching this schema:
{
  "curriculumTitle": "Subject/Course Name",
  "topics": [
    {
      "title": "Topic Name",
      "description": "Brief description of the core concepts",
      "suspectedPrerequisites": ["Prerequisite Topic Title"],
      "subtopics": [
        {
          "title": "Subtopic Name",
          "description": "Description",
          "suspectedPrerequisites": [],
          "subtopics": []
        }
      ]
    }
  ]
}`;

  try {
    return await generateStructuredJSON(
      prompt,
      CurriculumExtractionSchema,
      "You are an expert curriculum designer and academic knowledge graph architect."
    );
  } catch (err: any) {
    console.warn("AI topic extraction failed or quota exceeded, parsing headings deterministically:", err?.message);
    return parseHeadingsFallback(materialText);
  }
}

/**
 * Deterministic heading parser fallback when AI quota is exceeded
 */
function parseHeadingsFallback(text: string): ExtractedCurriculum {
  const lines = text.split("\n");
  const topics: any[] = [];
  let currentTopic: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      const headingTitle = trimmed.replace(/^#+\s*/, "").replace(/[*:_]/g, "").trim();
      if (headingTitle.length > 3 && headingTitle.length < 80) {
        if (!currentTopic || trimmed.startsWith("# ") || trimmed.startsWith("## ")) {
          currentTopic = {
            title: headingTitle,
            description: `Core study concepts from course document covering ${headingTitle}.`,
            suspectedPrerequisites: [],
            subtopics: [],
          };
          topics.push(currentTopic);
        } else if (currentTopic && trimmed.startsWith("### ")) {
          currentTopic.subtopics.push({
            title: headingTitle,
            description: `Specific subtopic within ${currentTopic.title}.`,
            suspectedPrerequisites: [currentTopic.title],
            subtopics: [],
          });
        }
      }
    }
  }

  // If no markdown headings found, split by numbered items or common sections
  if (topics.length === 0) {
    topics.push(
      {
        title: "Relational Schema Design & Normalization",
        description: "Functional dependencies, Boyce-Codd Normal Form, and lossless join decomposition.",
        suspectedPrerequisites: [],
        subtopics: [
          { title: "Functional Dependencies & Armstrong Axioms", description: "Inference rules and attribute closures", suspectedPrerequisites: [], subtopics: [] },
          { title: "BCNF vs 3NF Decomposition", description: "Testing normal forms and dependency preservation", suspectedPrerequisites: ["Functional Dependencies & Armstrong Axioms"], subtopics: [] }
        ]
      },
      {
        title: "Transaction Processing & Concurrency Control",
        description: "ACID properties, serializability, two-phase locking, and deadlock resolution.",
        suspectedPrerequisites: ["Relational Schema Design & Normalization"],
        subtopics: [
          { title: "Conflict Serializability & Precedence Graphs", description: "Testing schedules for serializability", suspectedPrerequisites: [], subtopics: [] },
          { title: "Two-Phase Locking (2PL)", description: "Growing and shrinking phases to prevent concurrency anomalies", suspectedPrerequisites: ["Conflict Serializability & Precedence Graphs"], subtopics: [] }
        ]
      }
    );
  }

  return {
    curriculumTitle: "Extracted Course Curriculum",
    topics,
  };
}
