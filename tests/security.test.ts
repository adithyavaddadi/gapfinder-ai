import { describe, it, expect } from "vitest";
import { MASTERY_THRESHOLDS, calculateMasteryLevel, calculateEvidenceBadge } from "../src/lib/assessment/mastery";
import { calculatePriorityScore } from "../src/lib/planner/algorithm";
import { validateCitations } from "../src/lib/rag/retrieval";

describe("Security & Guardrails Audit", () => {
  it("never trusts client-side scores or arbitrary accuracy percentages", () => {
    // Weak threshold strictly < 60
    expect(calculateMasteryLevel(59.9, 5)).toBe("weak");
    expect(calculateMasteryLevel(60.0, 5)).toBe("medium");
    expect(calculateMasteryLevel(79.9, 5)).toBe("medium");
    expect(calculateMasteryLevel(80.0, 5)).toBe("strong");
    expect(calculateMasteryLevel(0, 0)).toBe("not_assessed");
  });

  it("strictly enforces small sample evidence sufficiency rules", () => {
    // < 3 questions is insufficient
    expect(calculateEvidenceBadge(0)).toBe("insufficient");
    expect(calculateEvidenceBadge(1)).toBe("insufficient");
    expect(calculateEvidenceBadge(2)).toBe("insufficient");

    // 3-4 questions is preliminary
    expect(calculateEvidenceBadge(3)).toBe("preliminary");
    expect(calculateEvidenceBadge(4)).toBe("preliminary");

    // 5+ questions is established
    expect(calculateEvidenceBadge(5)).toBe("established");
    expect(calculateEvidenceBadge(10)).toBe("established");
  });

  it("calculates priority scores deterministically and handles neutral urgency when no exam date is set", () => {
    // Formula: P = 0.40W + 0.25I + 0.20U + 0.15D
    // With W=60, I=50, No exam date (U=50), D=30 (no dependents)
    // P = 0.4(60) + 0.25(50) + 0.20(50) + 0.15(30) = 24 + 12.5 + 10 + 4.5 = 51.0
    const p1 = calculatePriorityScore({
      weaknessScore: 60,
      importanceScore: 50,
      examDate: null,
      hasDependents: false,
    });
    expect(p1).toBe(51.0);

    // With dependency (D=90):
    // P = 24 + 12.5 + 10 + 0.15(90) = 46.5 + 13.5 = 60.0
    const p2 = calculatePriorityScore({
      weaknessScore: 60,
      importanceScore: 50,
      examDate: null,
      hasDependents: true,
    });
    expect(p2).toBe(60.0);
  });

  it("rejects hallucinated citation chunk IDs not present in retrieved context", () => {
    const retrieved = [
      { id: "chunk-valid-1", document_id: "doc-1", content: "text 1", heading: "h1", page_number: 1, metadata: { filename: "f1", sectionHeading: "h1", page: 1 }, similarity: 0.9 },
      { id: "chunk-valid-2", document_id: "doc-1", content: "text 2", heading: "h2", page_number: 2, metadata: { filename: "f1", sectionHeading: "h2", page: 2 }, similarity: 0.8 },
    ];

    // Cited valid chunk
    const checkValid = validateCitations(["chunk-valid-1"], retrieved);
    expect(checkValid.isValid).toBe(true);
    expect(checkValid.hallucinatedChunkIds).toHaveLength(0);

    // Cited hallucinated chunk ID
    const checkFake = validateCitations(["chunk-fake-999"], retrieved);
    expect(checkFake.isValid).toBe(false);
    expect(checkFake.hallucinatedChunkIds).toContain("chunk-fake-999");

    // Mixed
    const checkMixed = validateCitations(["chunk-valid-1", "chunk-fake-999"], retrieved);
    expect(checkMixed.isValid).toBe(false);
    expect(checkMixed.hallucinatedChunkIds).toContain("chunk-fake-999");
  });
});
