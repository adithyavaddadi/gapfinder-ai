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

  return await generateStructuredJSON(
    prompt,
    CurriculumExtractionSchema,
    "You are an expert curriculum designer and academic knowledge graph architect."
  );
}
