export interface MasteryThresholds {
  weakMax: number; // strictly less than 60
  mediumMax: number; // strictly less than 80
  strongMin: number; // 80 and above
}

export const MASTERY_THRESHOLDS: MasteryThresholds = {
  weakMax: 60,
  mediumMax: 80,
  strongMin: 80,
};

export type MasteryLevel = "weak" | "medium" | "strong" | "not_assessed";
export type EvidenceBadge = "insufficient" | "preliminary" | "established";

/**
 * Calculates deterministic mastery level from accuracy percentage
 */
export function calculateMasteryLevel(
  accuracyPercentage: number,
  totalQuestions: number
): MasteryLevel {
  if (totalQuestions === 0) return "not_assessed";
  if (accuracyPercentage < MASTERY_THRESHOLDS.weakMax) return "weak";
  if (accuracyPercentage < MASTERY_THRESHOLDS.mediumMax) return "medium";
  return "strong";
}

/**
 * Calculates evidence sufficiency badge based on sample size
 */
export function calculateEvidenceBadge(totalQuestions: number): EvidenceBadge {
  if (totalQuestions < 3) return "insufficient";
  if (totalQuestions <= 4) return "preliminary";
  return "established";
}

/**
 * Generates an evidence-backed "Why this rating" diagnostic rationale
 */
export function generateWhyRating(
  level: MasteryLevel,
  scorePercentage: number,
  correct: number,
  total: number,
  confidenceSignal?: string
): string {
  if (total === 0) {
    return "Topic not yet assessed in diagnostic quizzes.";
  }

  const base = `${scorePercentage}% accuracy (${correct} of ${total} questions answered correctly).`;

  if (level === "weak") {
    const caveat = total < 3 ? " (Note: insufficient sample size)" : "";
    return `Diagnosed as Weak: ${base}${caveat}. High error rate indicates fundamental conceptual gaps or unmastered prerequisites.`;
  }

  if (level === "medium") {
    return `Diagnosed as Medium: ${base}. Demonstrates basic familiarity but inconsistent recall on edge cases or multi-step problem solving.`;
  }

  return `Diagnosed as Strong: ${base}. Consistent correct responses grounded in source materials indicate reliable mastery.`;
}

/**
 * Analyzes confidence vs correctness signal for pedagogical next steps
 */
export function analyzeConfidenceSignal(
  isCorrect: boolean,
  confidence: number // 1 to 5
): {
  type: "misconception" | "foundational_gap" | "fragile_knowledge" | "solid_mastery";
  message: string;
  recommendedAction: string;
} {
  if (!isCorrect && confidence >= 4) {
    return {
      type: "misconception",
      message: "High confidence error indicates a deeply rooted misconception.",
      recommendedAction: "Review counterexample in source textbook and verify prerequisite definitions.",
    };
  }

  if (!isCorrect && confidence <= 2) {
    return {
      type: "foundational_gap",
      message: "Low confidence error indicates unfamiliar material.",
      recommendedAction: "Read introductory sections in notes before retesting.",
    };
  }

  if (isCorrect && confidence <= 2) {
    return {
      type: "fragile_knowledge",
      message: "Correct answer but low confidence suggests guessing or fragile intuition.",
      recommendedAction: "Reinforce with practice questions to build certainty.",
    };
  }

  return {
    type: "solid_mastery",
    message: "High confidence correct response indicates solid grasp.",
    recommendedAction: "Move forward to advanced applications or next topic.",
  };
}
