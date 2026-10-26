import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return key;
}

// Ensure conflicting system environment variable does not override user's configured key
if (typeof process !== "undefined" && process.env) {
  delete process.env.GOOGLE_API_KEY;
}

export function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

export const AI_CONFIG = {
  defaultChatModel: process.env.GEMINI_MODEL || "gemma-4-26b-a4b-it",
  fallbackChatModels: ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"],
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  embeddingDimensions: 768,
  timeoutMs: 8000,
  maxRetries: 2,
};

/**
 * Generates an embedding vector of strictly 768 dimensions matching pgvector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getAiClient();
  let lastError: unknown;

  for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      const response: any = await Promise.race([
        ai.models.embedContent({
          model: AI_CONFIG.embeddingModel,
          contents: text,
          config: {
            outputDimensionality: AI_CONFIG.embeddingDimensions,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI embedding request timed out")), AI_CONFIG.timeoutMs)
        ),
      ]);

      const values = response.embeddings?.[0]?.values || response.embedding?.values;
      if (!values || !Array.isArray(values) || values.length === 0) {
        throw new Error("Invalid or empty embedding values received from AI model");
      }

      return values;
    } catch (err) {
      lastError = err;
      if (attempt < AI_CONFIG.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
      }
    }
  }

  throw new Error(`Failed to generate embeddings after retries: ${String(lastError)}`);
}

/**
 * Generate text content with retries and model fallbacks
 */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getAiClient();
  const models = [AI_CONFIG.defaultChatModel, ...AI_CONFIG.fallbackChatModels];
  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents: prompt,
            config: systemInstruction
              ? {
                  systemInstruction,
                  temperature: 0.2,
                }
              : { temperature: 0.2 },
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI text generation timed out")), AI_CONFIG.timeoutMs)
          ),
        ]) as any;

        const text = response.text?.trim();
        if (text) return text;
      } catch (err) {
        lastError = err;
        if (attempt < AI_CONFIG.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
        }
      }
    }
  }

  throw new Error(`AI generation failed across all models: ${String(lastError)}`);
}

/**
 * Generate structured JSON and validate strictly with Zod
 */
export async function generateStructuredJSON<T>(
  prompt: string,
  schema: z.ZodType<T>,
  systemInstruction?: string
): Promise<T> {
  const enhancedPrompt = `${prompt}

IMPORTANT FORMATTING RULE:
You MUST respond with valid, parseable JSON only. Do not enclose in markdown ticks if possible, or use standard \`\`\`json blocks.
The JSON must adhere to the requested structure.`;

  let lastValidationErr: string | null = null;

  for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
    const currentPrompt = lastValidationErr
      ? `${enhancedPrompt}\n\nPREVIOUS PARSING/VALIDATION ERROR: ${lastValidationErr}. Please strictly fix the format and output only valid JSON.`
      : enhancedPrompt;

    const rawResponse = await generateText(currentPrompt, systemInstruction);

    // Clean JSON response (strip markdown wrappers if present)
    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      const validationResult = schema.safeParse(parsed);
      if (validationResult.success) {
        return validationResult.data;
      }
      lastValidationErr = validationResult.error.message;
    } catch (parseErr: unknown) {
      lastValidationErr = parseErr instanceof Error ? parseErr.message : "JSON syntax error";
    }
  }

  throw new Error(`Failed to generate valid structured JSON after retries: ${lastValidationErr}`);
}
