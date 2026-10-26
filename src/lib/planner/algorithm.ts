export interface PriorityFactors {
  weaknessScore: number; // 0-100 (100 - accuracy)
  importanceScore?: number; // 0-100 (default 50 if neutral)
  examDate?: string | Date | null;
  hasDependents?: boolean; // whether other topics depend on this
}

/**
 * Calculates deterministic priority score:
 * P = 0.40W + 0.25I + 0.20U + 0.15D
 * Each normalized 0 to 100
 */
export function calculatePriorityScore(factors: PriorityFactors): number {
  const W = Math.min(100, Math.max(0, factors.weaknessScore));
  const I = Math.min(100, Math.max(0, factors.importanceScore ?? 50));

  // Urgency calculation: if no exam date, strictly neutral 50 (never invent urgency)
  let U = 50;
  if (factors.examDate) {
    const exam = new Date(factors.examDate).getTime();
    const now = new Date().getTime();
    const daysRemaining = Math.max(0, Math.ceil((exam - now) / (1000 * 60 * 60 * 24)));

    if (daysRemaining <= 3) U = 100;
    else if (daysRemaining <= 7) U = 90;
    else if (daysRemaining <= 14) U = 75;
    else if (daysRemaining <= 30) U = 60;
    else U = 35;
  }

  // Dependency factor: if other topics depend on this, D=90, else D=30
  const D = factors.hasDependents ? 90 : 30;

  const P = 0.4 * W + 0.25 * I + 0.2 * U + 0.15 * D;
  return Math.round(P * 10) / 10;
}

export interface TopicForPlanning {
  id: string;
  title: string;
  level: "weak" | "medium" | "strong" | "not_assessed";
  scorePercentage: number;
  hasDependents: boolean;
  importance?: number;
}

export interface GeneratedTask {
  topicId: string;
  dayNumber: number;
  durationMinutes: number;
  taskType: "learn" | "practice" | "verify";
  title: string;
  description: string;
  whyReason: string;
  priorityScore: number;
}

/**
 * Generates an adaptive daily schedule fitting the student's daily time budget
 */
export function generateRevisionSchedule(
  topics: TopicForPlanning[],
  options: {
    dailyHours: number; // e.g. 1.5, 2.0, 3.0
    examDate?: string | Date | null;
    learningMode?: "intensive" | "balanced" | "light";
    targetDays?: number;
  }
): GeneratedTask[] {
  const dailyBudgetMinutes = Math.round(options.dailyHours * 60);
  const targetDays = options.targetDays || 7;

  // Rank topics by priority
  const ranked = topics
    .map((t) => {
      const weakness = t.level === "not_assessed" ? 70 : 100 - t.scorePercentage;
      const priority = calculatePriorityScore({
        weaknessScore: weakness,
        importanceScore: t.importance ?? 50,
        examDate: options.examDate,
        hasDependents: t.hasDependents,
      });
      return { ...t, priority };
    })
    .sort((a, b) => b.priority - a.priority);

  const tasks: GeneratedTask[] = [];
  let currentDay = 1;
  let currentDayMinutes = 0;

  for (const topic of ranked) {
    if (currentDay > targetDays) break;

    // Determine task types based on diagnosed mastery
    const topicTasks: Array<{
      type: "learn" | "practice" | "verify";
      duration: number;
      title: string;
      description: string;
      why: string;
    }> = [];

    if (topic.level === "weak" || topic.level === "not_assessed") {
      topicTasks.push({
        type: "learn",
        duration: 35,
        title: `Core Conceptual Revision: ${topic.title}`,
        description: `Review fundamental definitions, formulas, and cited examples from textbook excerpts.`,
        why: `Diagnosed as Weak (${topic.scorePercentage}%). Grounding fundamentals is required before solving problems.`,
      });
      topicTasks.push({
        type: "practice",
        duration: 25,
        title: `Guided Practice: ${topic.title}`,
        description: `Work through step-by-step problem sets and counterexample validation.`,
        why: `Build active recall and eliminate identified misconceptions.`,
      });
      topicTasks.push({
        type: "verify",
        duration: 15,
        title: `Diagnostic Retest: ${topic.title}`,
        description: `Take a 3-question grounded verification quiz to prove improvement.`,
        why: `Mastery updates only through verified diagnostic retests.`,
      });
    } else if (topic.level === "medium") {
      topicTasks.push({
        type: "practice",
        duration: 30,
        title: `Targeted Problem Solving: ${topic.title}`,
        description: `Focus on edge cases and multi-step decomposition questions.`,
        why: `Diagnosed as Medium (${topic.scorePercentage}%). Reinforcing edge cases pushes score to Strong.`,
      });
      topicTasks.push({
        type: "verify",
        duration: 15,
        title: `Verification Quiz: ${topic.title}`,
        description: `Validate consistency on higher-difficulty questions.`,
        why: `Verify mastery transition from Medium to Strong.`,
      });
    } else {
      // Strong: short maintenance verify
      topicTasks.push({
        type: "verify",
        duration: 15,
        title: `Retention Check: ${topic.title}`,
        description: `Quick 3-question retention check to maintain active memory.`,
        why: `Diagnosed Strong (${topic.scorePercentage}%). Spaced verification prevents decay.`,
      });
    }

    for (const t of topicTasks) {
      if (currentDayMinutes + t.duration > dailyBudgetMinutes && currentDayMinutes > 0) {
        currentDay++;
        currentDayMinutes = 0;
        if (currentDay > targetDays) break;
      }

      tasks.push({
        topicId: topic.id,
        dayNumber: currentDay,
        durationMinutes: t.duration,
        taskType: t.type,
        title: t.title,
        description: t.description,
        whyReason: t.why,
        priorityScore: topic.priority,
      });

      currentDayMinutes += t.duration;
    }
  }

  return tasks;
}
