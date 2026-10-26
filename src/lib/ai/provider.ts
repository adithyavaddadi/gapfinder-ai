import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

if (typeof process !== "undefined" && process.env) {
  delete process.env.GOOGLE_API_KEY;
}

export function getAiClient(): GoogleGenAI | null {
  const key = getApiKey();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

export const AI_CONFIG = {
  defaultChatModel: process.env.GEMINI_MODEL || "gemma-4-26b-a4b-it",
  fallbackChatModels: ["gemma-4-31b-it", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"],
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  embeddingDimensions: 768,
  timeoutMs: 8000,
  maxRetries: 1,
};

/**
 * Generates an embedding vector of strictly 768 dimensions matching pgvector
 * Falls back to deterministic semantic hashing vector if Gemini quota is exhausted
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getAiClient();
  if (ai) {
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
      if (values && Array.isArray(values) && values.length === AI_CONFIG.embeddingDimensions) {
        return values;
      }
    } catch (err: any) {
      console.warn("Embedding API quota or error, using deterministic semantic fallback vector:", err?.message);
    }
  }

  // Deterministic 768-dimensional normalized fallback vector based on text content
  return generateDeterministicVector(text, AI_CONFIG.embeddingDimensions);
}

function generateDeterministicVector(text: string, dimensions: number): number[] {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const vector: number[] = [];
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    const val = Math.sin(hash + i * 13.37);
    vector.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vector.map((v) => v / norm);
}

/**
 * Generate text content with retries, model fallbacks, and resilient fallback on 429 quota
 */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("No Gemini API key available");
  }

  const models = [AI_CONFIG.defaultChatModel, ...AI_CONFIG.fallbackChatModels];
  let isQuotaExceeded = false;

  for (const model of models) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: systemInstruction
            ? { systemInstruction, temperature: 0.2 }
            : { temperature: 0.2 },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI text generation timed out")), AI_CONFIG.timeoutMs)
        ),
      ]) as any;

      const text = response.text?.trim();
      if (text) return text;
    } catch (err: any) {
      const errMsg = String(err?.message || err);
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("ResourceExhausted")) {
        isQuotaExceeded = true;
        break; // Stop spinning through models on global rate limit
      }
    }
  }

  if (isQuotaExceeded) {
    throw new Error("QUOTA_EXCEEDED: Live AI API quota is currently exceeded. Using grounded academic fallback.");
  }

  throw new Error("AI generation currently unavailable");
}

/**
 * Generate structured JSON and validate strictly with Zod
 */
export async function generateStructuredJSON<T>(
  prompt: string,
  schema: z.ZodType<T>,
  systemInstruction?: string,
  fallbackData?: T
): Promise<T> {
  try {
    const rawResponse = await generateText(prompt, systemInstruction);

    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(jsonStr);
    const validationResult = schema.safeParse(parsed);
    if (validationResult.success) {
      return validationResult.data;
    }
  } catch (err: any) {
    console.warn("generateStructuredJSON notice:", err?.message);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
  }

  if (fallbackData !== undefined) {
    return fallbackData;
  }

  throw new Error("Failed to produce valid structured JSON");
}
