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
  Zap,
  Target,
  Flame,
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
      const topicsRes = await fetch("/api/topics");
      const topicsData = topicsRes.ok ? await topicsRes.json() : { topics: [] };
      const topics: any[] = topicsData.topics || [];

      const planRes = await fetch("/api/revision-plans");
      const planData = planRes.ok ? await planRes.json() : { tasks: [] };
      const tasks: any[] = planData.tasks || [];

      const progressRes = await fetch("/api/progress");
      const progressData = progressRes.ok ? await progressRes.json() : { attempts: [] };
      const attempts: any[] = progressData.attempts || [];

      const assessedTopics = topics.filter(
        (t) => t.mastery?.level && t.mastery.level !== "not_assessed"
      );
      const sortedByWeakness = [...assessedTopics].sort(
        (a, b) => (a.mastery?.score_percentage || 0) - (b.mastery?.score_percentage || 0)
      );

      const weakest = sortedByWeakness.length > 0 ? sortedByWeakness[0] : null;

      const todayTasks = tasks.filter((t) => t.day_number === 1);
      const todayMinutes = todayTasks.reduce((acc, t) => acc + (t.duration_minutes || 0), 0);

      let nextStep = null;
      if (assessedTopics.length === 0 && topics.length > 0) {
        nextStep = {
          topicId: topics[0].id,
          topicTitle: topics[0].title,
          whyThis: "Initial diagnostic baseline required to pinpoint knowledge blindspots.",
          whyNow: "Without a diagnostic baseline, revision time is wasted on already known concepts.",
          whatNext: "Complete a 3-question grounded diagnostic quiz.",
          actionHref: `/quiz?topicId=${topics[0].id}`,
          actionLabel: "Start Diagnostic Quiz",
        };
      } else if (weakest) {
        nextStep = {
          topicId: weakest.id,
          topicTitle: weakest.title,
          whyThis: `Diagnosed at ${weakest.mastery?.score_percentage || 0}% mastery — your lowest validated score.`,
          whyNow: "Prerequisite for advanced normal forms; fixing this creates maximum composite score gain.",
          whatNext: "Review grounded textbook notes and retake verification quiz.",
          actionHref: `/explain?topic=${encodeURIComponent(weakest.title)}`,
          actionLabel: "Review Concept with AI",
        };
      }

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
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#121316]">
                Diagnostic Study Dashboard
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF]">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-[#5A554E] mt-1.5 max-w-2xl leading-relaxed">
              Real-time snapshot of your diagnosed syllabus gaps, evidence-backed next steps, and algorithmic daily revision blocks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/quiz">
              <Button size="sm" className="font-semibold shadow-sm">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                Run Diagnostic
              </Button>
            </Link>
          </div>
        </div>

        {/* GUIDED EMPTY STATE FOR NEW USERS */}
        {!isLoading && data?.stats.totalTopics === 0 && (
          <Card className="p-8">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F2EFEB] text-[#121316] flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#121316] tracking-tight">
                Welcome to GapFinder AI
              </h2>
              <p className="text-xs text-[#5A554E] leading-relaxed">
                Follow this simple 3-step checklist to diagnose your knowledge gaps:
              </p>

              <div className="text-left space-y-3 pt-4 border-t border-[#E8E5DF]">
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#E8E5DF] bg-[#FAF9F5]">
                  <span className="w-6 h-6 rounded-full bg-[#121316] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#121316]">
                      Upload Course Syllabus / Notes
                    </h4>
                    <p className="text-[11px] text-[#5A554E] mt-0.5">
                      Upload PDF or TXT course materials. The system indexes your topics and chunks passages for grounding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#E8E5DF] bg-white">
                  <span className="w-6 h-6 rounded-full bg-[#E8E5DF] text-[#121316] flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#121316]">
                      Review Knowledge X-Ray
                    </h4>
                    <p className="text-[11px] text-[#5A554E] mt-0.5">
                      Inspect your curriculum tree and suspected prerequisite relationships.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#E8E5DF] bg-white">
                  <span className="w-6 h-6 rounded-full bg-[#E8E5DF] text-[#121316] flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#121316]">
                      Take Grounded Diagnostic & Get Revision Plan
                    </h4>
                    <p className="text-[11px] text-[#5A554E] mt-0.5">
                      Answer verified MCQs. We diagnose Weak/Medium/Strong topics and schedule your daily study time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/materials">
                  <Button size="lg" className="shadow-sm">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload Your First Document
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* 1. LIQUID "YOUR NEXT BEST STEP" HERO CARD */}
        {data?.nextBestStep && (
          <div className="rounded-3xl p-8 bg-white border border-[#E8E5DF] shadow-[0_12px_35px_-8px_rgba(35,30,20,0.06)] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EFEB] text-[#121316] text-xs font-bold border border-[#E8E5DF]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your Next Best Step</span>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold text-[#121316] tracking-tight">
                  {data.nextBestStep.topicTitle}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF]">
                    <span className="text-[#121316] font-bold block mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#121316]" />
                      Why this?
                    </span>
                    <span className="text-[#5A554E] leading-relaxed">{data.nextBestStep.whyThis}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF]">
                    <span className="text-[#121316] font-bold block mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#121316]" />
                      Why now?
                    </span>
                    <span className="text-[#5A554E] leading-relaxed">{data.nextBestStep.whyNow}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF]">
                    <span className="text-[#121316] font-bold block mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#121316]" />
                      What next?
                    </span>
                    <span className="text-[#5A554E] leading-relaxed">{data.nextBestStep.whatNext}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link href={data.nextBestStep.actionHref}>
                  <Button size="lg" className="w-full sm:w-auto font-semibold px-6 shadow-sm">
                    <span>{data.nextBestStep.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-6 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block">
              Curriculum Assessed
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#121316]">
                {data?.stats.topicsAssessed || 0}
              </span>
              <span className="text-xs text-[#78716C]">
                of {data?.stats.totalTopics || 0} topics
              </span>
            </div>
            <p className="text-[11px] text-[#5A554E]">
              Evaluated via grounded diagnostic quizzes
            </p>
          </Card>

          <Card className="p-6 space-y-1.5 border-rose-200 bg-rose-50/40">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">
              Primary Knowledge Gap
            </span>
            <div className="min-w-0">
              {data?.stats.weakestTopic ? (
                <>
                  <span className="text-base font-bold text-rose-900 truncate block">
                    {data.stats.weakestTopic.title}
                  </span>
                  <span className="text-xs text-rose-700 font-semibold font-mono">
                    {data.stats.weakestTopic.score}% accuracy
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#78716C] italic block py-1">
                  No gaps diagnosed yet
                </span>
              )}
            </div>
            <p className="text-[11px] text-rose-700">
              Highest-priority topic for today's revision
            </p>
          </Card>

          <Card className="p-6 space-y-1.5 border-[#E8E5DF] bg-[#FAF9F5]">
            <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block">
              Today's Scheduled Revision
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#121316]">
                {data?.stats.todayMinutes || 0}
              </span>
              <span className="text-xs text-[#78716C]">minutes total</span>
            </div>
            <p className="text-[11px] text-[#5A554E]">
              {data?.stats.todayTasksCount || 0} tasks planned for today
            </p>
          </Card>
        </div>

        {/* 3. TWO-COLUMN SPLIT: Weakest Topics & Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weakest Topics List */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#121316] flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                Diagnosed Knowledge Gaps (Priority Order)
              </h3>
              <Link href="/gap-report" className="text-xs text-[#121316] hover:underline font-semibold flex items-center gap-1">
                <span>Full Gap Report</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.weakestTopics && data.weakestTopics.length > 0 ? (
              <div className="space-y-3">
                {data.weakestTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-2xl border border-[#E8E5DF] bg-white space-y-2 hover:border-[#121316]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#121316] truncate flex-1 pr-2">
                        {topic.title}
                      </span>
                      <Badge variant={topic.level} />
                    </div>
                    <ProgressBar value={topic.score} size="sm" variant={topic.level === "weak" ? "weak" : topic.level === "medium" ? "medium" : "strong"} />
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
              <h3 className="text-sm font-bold text-[#121316] flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#121316]" />
                Today's Revision Schedule
              </h3>
              <Link href="/revision-plan" className="text-xs text-[#121316] hover:underline font-semibold flex items-center gap-1">
                <span>Open Schedule</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.todayTasks && data.todayTasks.length > 0 ? (
              <div className="space-y-2.5">
                {data.todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl border border-[#E8E5DF] bg-[#FAF9F5] flex items-center justify-between hover:border-[#121316]/30 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#121316] bg-white px-2 py-0.5 rounded-full border border-[#E8E5DF]">
                          {t.type}
                        </span>
                        <span className="text-xs font-bold text-[#121316] truncate">
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#78716C]">
                        {t.duration} minutes
                      </span>
                    </div>

                    <Link href={`/quiz?topicId=${t.topicId}`}>
                      <Button size="sm" variant="secondary" className="text-xs py-1.5 px-3">
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
            <h3 className="text-sm font-bold text-[#121316]">
              Recent Activity Timeline
            </h3>
            <div className="divide-y divide-[#F2EFEB] text-xs">
              {data.recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-[#121316]">{act.title}</span>
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
