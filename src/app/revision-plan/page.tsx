"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  SkipForward,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  HelpCircle,
  Layers,
  Info,
} from "lucide-react";

interface RevisionTaskItem {
  id: string;
  topic_id: string;
  day_number: number;
  duration_minutes: number;
  task_type: "learn" | "practice" | "verify";
  title: string;
  description: string;
  why_reason: string;
  priority_score: number;
  status: "pending" | "completed" | "skipped";
  order_index: number;
  topic?: { id: string; title: string };
}

interface RevisionPlanData {
  id: string;
  version: number;
  daily_hours: number;
  exam_date: string | null;
  learning_mode: string;
  is_active: boolean;
}

export default function RevisionPlanPage() {
  const [plan, setPlan] = React.useState<RevisionPlanData | null>(null);
  const [tasks, setTasks] = React.useState<RevisionTaskItem[]>([]);
  const [tasksByDay, setTasksByDay] = React.useState<Record<number, RevisionTaskItem[]>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("schedule");

  // Plan generation controls
  const [dailyHours, setDailyHours] = React.useState(2.0);
  const [examDate, setExamDate] = React.useState("");
  const [learningMode, setLearningMode] = React.useState<"intensive" | "balanced" | "light">("balanced");

  const fetchPlan = async () => {
    try {
      const res = await fetch("/api/revision-plans");
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setTasks(data.tasks || []);
        setTasksByDay(data.tasksByDay || {});
      }
    } catch (e) {
      console.warn("Fetch plan error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPlan();
  }, []);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/revision-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyHours,
          examDate: examDate || null,
          learningMode,
        }),
      });
      if (res.ok) {
        await fetchPlan();
      }
    } catch (e) {
      console.error("Plan generate error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTaskStatus = async (task: RevisionTaskItem, newStatus: "pending" | "completed" | "skipped") => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      setTasksByDay((prev) => {
        const updated = { ...prev };
        const dayList = updated[task.day_number] || [];
        updated[task.day_number] = dayList.map((t) =>
          t.id === task.id ? { ...t, status: newStatus } : t
        );
        return updated;
      });

      await fetch(`/api/revision-tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Update task failed:", e);
      fetchPlan();
    }
  };

  const dayNumbers = Object.keys(tasksByDay)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate completion progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Helper for task type badges
  const getTaskTypeBadge = (type: "learn" | "practice" | "verify") => {
    if (type === "learn") {
      return (
        <span className="px-2 py-0.5 rounded bg-[#F3EEFF] text-[#7C3AED] text-[10px] font-bold uppercase tracking-wider">
          Learn
        </span>
      );
    }
    if (type === "practice") {
      return (
        <span className="px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] text-[10px] font-bold uppercase tracking-wider">
          Practice
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] text-[10px] font-bold uppercase tracking-wider">
        Verify
      </span>
    );
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Personalized Revision Plan
              </h1>
              {plan && <Badge variant="ai" label={`Version ${plan.version}`} />}
            </div>
            <p className="text-xs text-[#57534E] mt-1">
              Prioritized daily schedule: P = 0.40W + 0.25I + 0.20U + 0.15D. Adapts as you diagnose and retest.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGeneratePlan}
              isLoading={isGenerating}
              size="sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Recalculate Schedule
            </Button>
          </div>
        </div>

        {/* Pedagogical Rule Banner */}
        <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-start gap-3 text-xs text-[#57534E]">
          <Info className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#1C1917]">Academic Proof Principle: </strong>
            Marking revision tasks completed helps track your study pace, but does <em>not</em> artificially increase topic mastery. True mastery upgrades only when validated by fresh diagnostic quiz retests.
          </div>
        </div>

        {/* Plan Configuration & Progress Banner */}
        {plan && (
          <Card className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
                Daily Time Budget
              </span>
              <p className="text-2xl font-extrabold text-[#1C1917]">
                {plan.daily_hours} Hours <span className="text-xs text-[#78716C] font-normal">/ day</span>
              </p>
              <span className="text-xs text-[#57534E]">
                Mode: <strong className="capitalize">{plan.learning_mode}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#57534E] font-medium">Task Completion Pace</span>
                <span className="font-mono font-bold text-[#1C1917]">
                  {completedTasks} / {totalTasks} ({progressPct}%)
                </span>
              </div>
              <ProgressBar value={progressPct} size="md" />
            </div>

            <div className="flex flex-col sm:items-end justify-center text-xs space-y-1">
              <span className="text-[#78716C]">Target Exam Date:</span>
              <span className="font-semibold text-[#1C1917]">
                {plan.exam_date ? new Date(plan.exam_date).toLocaleDateString() : "No fixed deadline (Neutral Urgency)"}
              </span>
              <span className="text-[11px] text-[#7C3AED] font-medium">
                7-Day Adaptive Block Active
              </span>
            </div>
          </Card>
        )}

        {/* View Tabs: Daily Schedule vs Ranked Priorities */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="schedule">Daily Time-Block Schedule</TabsTrigger>
            <TabsTrigger value="priorities">Priority Algorithm Ranking</TabsTrigger>
          </TabsList>

          {/* TAB 1: DAILY TIME-BLOCK SCHEDULE */}
          <TabsContent value="schedule">
            {isLoading ? (
              <div className="space-y-4 py-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-white border border-[#E7E5E4] animate-pulse" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No active revision plan"
                description="Click 'Recalculate Schedule' to turn your diagnosed weaknesses into a time-budgeted study plan."
                action={
                  <Button size="sm" onClick={handleGeneratePlan} isLoading={isGenerating}>
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Generate First Plan
                  </Button>
                }
              />
            ) : (
              <div className="space-y-8">
                {dayNumbers.map((dayNum) => {
                  const dayTasks = tasksByDay[dayNum] || [];
                  const dayMinutes = dayTasks.reduce((acc, t) => acc + t.duration_minutes, 0);

                  return (
                    <div key={dayNum} className="space-y-3">
                      {/* Day Header with Duration Sum */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#7C3AED] text-white flex items-center justify-center text-xs font-bold">
                            D{dayNum}
                          </div>
                          <h3 className="text-sm font-bold text-[#1C1917]">
                            Day {dayNum} Revision Tasks
                          </h3>
                        </div>

                        <span className="text-xs text-[#78716C] font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {dayMinutes} minutes total
                        </span>
                      </div>

                      {/* Day Tasks List */}
                      <div className="grid grid-cols-1 gap-3">
                        {dayTasks.map((task) => {
                          const isCompleted = task.status === "completed";
                          const isSkipped = task.status === "skipped";

                          return (
                            <Card
                              key={task.id}
                              className={`p-4 transition-all border ${
                                isCompleted
                                  ? "bg-[#FAF9F6] border-[#E7E5E4] opacity-75"
                                  : isSkipped
                                  ? "bg-[#FAF9F6] border-[#E7E5E4] opacity-50"
                                  : "bg-white border-[#E7E5E4] hover:shadow-xs"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {getTaskTypeBadge(task.task_type)}
                                    <span className="text-xs font-semibold text-[#1C1917] truncate">
                                      {task.title}
                                    </span>
                                    <span className="text-[11px] text-[#78716C] font-mono">
                                      ({task.duration_minutes} min)
                                    </span>
                                  </div>

                                  <p className="text-xs text-[#57534E] leading-relaxed">
                                    {task.description}
                                  </p>

                                  <div className="text-[11px] text-[#78716C] bg-[#FAF9F6] p-2 rounded-lg inline-block border border-[#F5F5F4]">
                                    <strong className="text-[#57534E]">Why this task: </strong>
                                    {task.why_reason}
                                  </div>
                                </div>

                                {/* Task actions: Complete / Skip */}
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  {task.task_type === "verify" && (
                                    <Link href={`/quiz?topicId=${task.topic_id}`}>
                                      <Button size="sm" variant="secondary" className="text-xs py-1 px-3">
                                        Take Verification Quiz
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                      </Button>
                                    </Link>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleTaskStatus(
                                        task,
                                        isCompleted ? "pending" : "completed"
                                      )
                                    }
                                    className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                      isCompleted
                                        ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]"
                                        : "bg-white border-[#E7E5E4] text-[#57534E] hover:bg-[#FAF9F6]"
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{isCompleted ? "Done" : "Complete"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleTaskStatus(
                                        task,
                                        isSkipped ? "pending" : "skipped"
                                      )
                                    }
                                    className={`p-2 rounded-lg border text-xs transition-colors ${
                                      isSkipped
                                        ? "bg-[#F5F5F4] border-[#E7E5E4] text-[#78716C]"
                                        : "bg-white border-[#E7E5E4] text-[#A8A29E] hover:text-[#DC2626]"
                                    }`}
                                    title="Skip task"
                                  >
                                    <SkipForward className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: PRIORITY ALGORITHM RANKING */}
          <TabsContent value="priorities">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1C1917]">
                  Priority Formula Breakdown: P = 0.40W + 0.25I + 0.20U + 0.15D
                </h3>
                <p className="text-xs text-[#57534E] mt-0.5">
                  Tasks are assigned to earlier days based on their composite priority score.
                </p>
              </div>

              <div className="divide-y divide-[#F5F5F4]">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#78716C] w-6">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-[#1C1917] block">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-[#78716C]">
                          Scheduled for Day {task.day_number} • {task.duration_minutes} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#7C3AED]">
                          {task.priority_score}
                        </span>
                        <span className="text-[10px] text-[#78716C] block">Priority Score</span>
                      </div>
                      <Badge variant="neutral" label={`Day ${task.day_number}`} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
