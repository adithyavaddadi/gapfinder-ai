"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Check,
  UploadCloud,
  Network,
  HelpCircle,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface DashboardData {
  stats: {
    topicsAssessed: number;
    totalTopics: number;
    weakestTopic: { id: string; title: string; score: number } | null;
    todayTasksCount: number;
    todayMinutes: number;
  };
  nextBestStep: {
    topicId: string;
    topicTitle: string;
    whyThis: string;
    whyNow: string;
    whatNext: string;
    actionHref: string;
    actionLabel: string;
  } | null;
  weakestTopics: Array<{
    id: string;
    title: string;
    level: "weak" | "medium" | "strong" | "not_assessed";
    score: number;
  }>;
  todayTasks: Array<{
    id: string;
    title: string;
    duration: number;
    type: "learn" | "practice" | "verify";
    status: string;
    topicId: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    time: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch topics
      const topicsRes = await fetch("/api/topics");
      const topicsData = topicsRes.ok ? await topicsRes.json() : { topics: [] };
      const topics: any[] = topicsData.topics || [];

      // 2. Fetch revision plan
      const planRes = await fetch("/api/revision-plans");
      const planData = planRes.ok ? await planRes.json() : { tasks: [] };
      const tasks: any[] = planData.tasks || [];

      // 3. Fetch progress
      const progressRes = await fetch("/api/progress");
      const progressData = progressRes.ok ? await progressRes.json() : { attempts: [] };
      const attempts: any[] = progressData.attempts || [];

      // Calculate real stats
      const assessedTopics = topics.filter(
        (t) => t.mastery?.level && t.mastery.level !== "not_assessed"
      );
      const sortedByWeakness = [...assessedTopics].sort(
        (a, b) => (a.mastery?.score_percentage || 0) - (b.mastery?.score_percentage || 0)
      );

      const weakest = sortedByWeakness.length > 0 ? sortedByWeakness[0] : null;

      // Filter Day 1 tasks as today's tasks
      const todayTasks = tasks.filter((t) => t.day_number === 1);
      const todayMinutes = todayTasks.reduce((acc, t) => acc + (t.duration_minutes || 0), 0);

      // Determine "Next Best Step"
      let nextStep: DashboardData["nextBestStep"] = null;

      if (topics.length === 0) {
        nextStep = {
          topicId: "",
          topicTitle: "Upload Your Syllabus",
          whyThis: "GapFinder needs your actual course material to build your topic map.",
          whyNow: "Before revising, we must map what you are expected to know.",
          whatNext: "Upload your syllabus or lecture notes in PDF or TXT format.",
          actionHref: "/materials",
          actionLabel: "Upload First Material",
        };
      } else if (assessedTopics.length === 0) {
        nextStep = {
          topicId: topics[0].id,
          topicTitle: `Run Diagnostic: ${topics[0].title}`,
          whyThis: "You have unassessed topics in your mapped curriculum.",
          whyNow: "A student cannot ask about a gap they don't know they have.",
          whatNext: "Take a 3-question grounded diagnostic quiz.",
          actionHref: `/quiz?topicId=${topics[0].id}`,
          actionLabel: "Start Diagnostic Quiz",
        };
      } else if (weakest && weakest.mastery?.level === "weak") {
        nextStep = {
          topicId: weakest.id,
          topicTitle: `Target Weakest Topic: ${weakest.title}`,
          whyThis: `Diagnosed at ${weakest.mastery.score_percentage}% accuracy. Unresolved foundational gap.`,
          whyNow: "Revision ROI is highest when eliminating bottom-quartile weaknesses.",
          whatNext: "Review grounded explanations and take a targeted prerequisite check.",
          actionHref: `/gap-report`,
          actionLabel: "View Gap Report & Next Action",
        };
      } else {
        nextStep = {
          topicId: "",
          topicTitle: "Review Revision Schedule",
          whyThis: "Your assessed curriculum topics are organized into an adaptive schedule.",
          whyNow: "Consistent daily time-budget revision prevents memory decay.",
          whatNext: "Complete today's practice and verification tasks.",
          actionHref: "/revision-plan",
          actionLabel: "Open Revision Plan",
        };
      }

      // Build activity timeline
      const recentActivity: any[] = [];
      attempts.slice(0, 5).forEach((att: any) => {
        recentActivity.push({
          id: att.id,
          type: "quiz",
          title: `Diagnostic Quiz completed (${att.score_percentage}%)`,
          time: formatTimeAgo(att.started_at),
          status: att.score_percentage >= 80 ? "strong" : att.score_percentage >= 60 ? "medium" : "weak",
        });
      });

      setData({
        stats: {
          topicsAssessed: assessedTopics.length,
          totalTopics: topics.length,
          weakestTopic: weakest
            ? {
                id: weakest.id,
                title: weakest.title,
                score: weakest.mastery?.score_percentage || 0,
              }
            : null,
          todayTasksCount: todayTasks.length,
          todayMinutes,
        },
        nextBestStep: nextStep,
        weakestTopics: sortedByWeakness.slice(0, 4).map((t) => ({
          id: t.id,
          title: t.title,
          level: t.mastery?.level,
          score: t.mastery?.score_percentage || 0,
        })),
        todayTasks: todayTasks.map((t) => ({
          id: t.id,
          title: t.title,
          duration: t.duration_minutes,
          type: t.task_type,
          status: t.status,
          topicId: t.topic_id,
        })),
        recentActivity,
      });
    } catch (e) {
      console.warn("Dashboard fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
              Diagnostic Study Dashboard
            </h1>
            <p className="text-xs text-[#57534E] mt-1">
              Live snapshot of your diagnosed syllabus gaps, next recommended steps, and today's revision tasks.
            </p>
          </div>
        </div>

        {/* GUIDED EMPTY STATE FOR NEW USERS */}
        {!isLoading && data?.stats.totalTopics === 0 && (
          <Card className="p-8 border-[#DDD6FE] bg-white">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1C1917]">
                Welcome to GapFinder AI
              </h2>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Follow this simple 3-step checklist to diagnose your knowledge gaps:
              </p>

              <div className="text-left space-y-3 pt-4 border-t border-[#F5F5F4]">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-[#E7E5E4] bg-[#FAF9F6]">
                  <span className="w-6 h-6 rounded-md bg-[#7C3AED] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1C1917]">
                      Upload Course Syllabus / Notes
                    </h4>
                    <p className="text-[11px] text-[#57534E]">
                      Upload PDF or TXT course materials. The system indexes your topics and chunks passages for grounding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-[#E7E5E4] bg-white">
                  <span className="w-6 h-6 rounded-md bg-[#F5F5F4] text-[#57534E] flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1C1917]">
                      Review Knowledge X-Ray
                    </h4>
                    <p className="text-[11px] text-[#57534E]">
                      Inspect your curriculum tree and suspected prerequisite relationships.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-[#E7E5E4] bg-white">
                  <span className="w-6 h-6 rounded-md bg-[#F5F5F4] text-[#57534E] flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1C1917]">
                      Take Grounded Diagnostic & Get Revision Plan
                    </h4>
                    <p className="text-[11px] text-[#57534E]">
                      Answer verified MCQs. We diagnose Weak/Medium/Strong topics and schedule your daily study time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/materials">
                  <Button size="lg" className="shadow-sm shadow-[#7C3AED]/25">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload Your First Document
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* 1. LARGE VIOLET-TINTED "YOUR NEXT BEST STEP" CARD */}
        {data?.nextBestStep && (
          <Card className="p-6 md:p-8 border-[#DDD6FE] bg-[#F3EEFF]/40 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#DDD6FE] text-[#7C3AED] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your Next Best Step</span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] tracking-tight">
                  {data.nextBestStep.topicTitle}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-white/80 border border-[#E7E5E4]">
                    <span className="text-[#7C3AED] font-bold block mb-0.5">Why this?</span>
                    <span className="text-[#57534E]">{data.nextBestStep.whyThis}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-[#E7E5E4]">
                    <span className="text-[#7C3AED] font-bold block mb-0.5">Why now?</span>
                    <span className="text-[#57534E]">{data.nextBestStep.whyNow}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-[#E7E5E4]">
                    <span className="text-[#7C3AED] font-bold block mb-0.5">What next?</span>
                    <span className="text-[#57534E]">{data.nextBestStep.whatNext}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link href={data.nextBestStep.actionHref}>
                  <Button size="lg" className="w-full sm:w-auto shadow-sm shadow-[#7C3AED]/25">
                    {data.nextBestStep.actionLabel}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* 2. STAT CARDS (REAL DATA ONLY) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block">
              Curriculum Assessed
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#1C1917]">
                {data?.stats.topicsAssessed || 0}
              </span>
              <span className="text-xs text-[#78716C]">
                of {data?.stats.totalTopics || 0} topics
              </span>
            </div>
            <p className="text-[11px] text-[#57534E]">
              Evaluated via grounded diagnostic quizzes
            </p>
          </Card>

          <Card className="p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block">
              Primary Knowledge Gap
            </span>
            <div className="min-w-0">
              {data?.stats.weakestTopic ? (
                <>
                  <span className="text-lg font-bold text-[#DC2626] truncate block">
                    {data.stats.weakestTopic.title}
                  </span>
                  <span className="text-xs text-[#DC2626] font-semibold">
                    {data.stats.weakestTopic.score}% accuracy
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#78716C] italic block py-1">
                  No gaps diagnosed yet
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#57534E]">
              Priority recommendation for revision
            </p>
          </Card>

          <Card className="p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block">
              Today's Scheduled Revision
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#1C1917]">
                {data?.stats.todayMinutes || 0}
              </span>
              <span className="text-xs text-[#78716C]">minutes total</span>
            </div>
            <p className="text-[11px] text-[#57534E]">
              {data?.stats.todayTasksCount || 0} tasks planned for today
            </p>
          </Card>
        </div>

        {/* 3. TWO-COLUMN SPLIT: Weakest Topics & Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weakest Topics List */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1917]">
                Diagnosed Knowledge Gaps (Priority Order)
              </h3>
              <Link href="/gap-report" className="text-xs text-[#7C3AED] hover:underline font-semibold">
                Full Gap Report →
              </Link>
            </div>

            {data?.weakestTopics && data.weakestTopics.length > 0 ? (
              <div className="space-y-3">
                {data.weakestTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3 rounded-xl border border-[#E7E5E4] bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1C1917] truncate flex-1 pr-2">
                        {topic.title}
                      </span>
                      <Badge variant={topic.level} />
                    </div>
                    <ProgressBar value={topic.score} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#78716C] py-6 text-center">
                Take your first diagnostic quiz to uncover topic weaknesses.
              </p>
            )}
          </Card>

          {/* Today's Tasks Checklist */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1917]">
                Today's Revision Schedule
              </h3>
              <Link href="/revision-plan" className="text-xs text-[#7C3AED] hover:underline font-semibold">
                Open Schedule →
              </Link>
            </div>

            {data?.todayTasks && data.todayTasks.length > 0 ? (
              <div className="space-y-2.5">
                {data.todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-[#E7E5E4] bg-white flex items-center justify-between"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                          {t.type}
                        </span>
                        <span className="text-xs font-semibold text-[#1C1917] truncate">
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#78716C]">
                        {t.duration} minutes
                      </span>
                    </div>

                    <Link href={`/quiz?topicId=${t.topicId}`}>
                      <Button size="sm" variant="secondary" className="text-xs py-1 px-2.5">
                        Start
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#78716C] py-6 text-center">
                No tasks scheduled for today. Generate your revision plan from the Gap Report.
              </p>
            )}
          </Card>
        </div>

        {/* 4. RECENT ACTIVITY TIMELINE */}
        {data?.recentActivity && data.recentActivity.length > 0 && (
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#1C1917]">
              Recent Activity Timeline
            </h3>
            <div className="divide-y divide-[#F5F5F4] text-xs">
              {data.recentActivity.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span className="font-semibold text-[#1C1917]">{act.title}</span>
                  </div>
                  <span className="text-[#78716C] font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
