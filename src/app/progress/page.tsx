"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatDate, formatTimeAgo } from "@/lib/utils";

interface TopicComparison {
  topicId: string;
  topicTitle: string;
  attemptsCount: number;
  baselineScore: number;
  baselineDate: string;
  latestScore: number;
  latestDate: string;
  delta: number;
  sampleSizeTotal: number;
  isSmallSample: boolean;
}

export default function ProgressPage() {
  const [comparisons, setComparisons] = React.useState<TopicComparison[]>([]);
  const [totalAttempts, setTotalAttempts] = React.useState(0);
  const [recentAttempts, setRecentAttempts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/progress");
      if (res.ok) {
        const data = await res.json();
        setComparisons(data.topicComparisons || []);
        setTotalAttempts(data.totalAttempts || 0);
        setRecentAttempts(data.attempts || []);
      }
    } catch (e) {
      console.warn("Failed to fetch progress:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#121316]">
                Learning Trajectory & Proof of Progress
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF]">
                Empirical Delta
              </span>
            </div>
            <p className="text-xs text-[#5A554E] mt-1 max-w-xl leading-relaxed">
              Compare your initial baseline diagnostic against subsequent retests. No fabricated trajectories—only real attempt evidence.
            </p>
          </div>

          <Link href="/quiz">
            <Button size="sm" className="font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Take New Diagnostic Quiz
            </Button>
          </Link>
        </div>

        {/* HONEST SMALL-SAMPLE CAVEAT BANNER */}
        <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF] flex items-start gap-3 text-xs text-[#5A554E]">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#121316]">Scientific Measurement Caveat: </strong>
            Topics evaluated on fewer than 5 total questions reflect preliminary evidence. Score variations between baseline and retests reflect question-level performance delta, not guaranteed long-term retention. Retest periodically to confirm lasting mastery.
          </div>
        </div>

        {/* Topic Baseline vs Retest Comparison Cards */}
        <div>
          <h2 className="text-base font-bold text-[#121316] mb-4">
            Baseline vs. Retest Comparison
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-white border border-[#E8E5DF] animate-pulse" />
              ))}
            </div>
          ) : comparisons.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No quiz attempts recorded yet"
              description="Complete your first diagnostic test to establish your baseline score, then retest to track empirical learning gains."
              action={
                <Link href="/quiz">
                  <Button size="sm">Start First Diagnostic</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {comparisons.map((item) => {
                const hasRetest = item.attemptsCount > 1;

                return (
                  <Card key={item.topicId} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-[#121316]">
                            {item.topicTitle}
                          </h3>
                          {item.isSmallSample && (
                            <Badge variant="preliminary" label="Sample n < 5" />
                          )}
                          <span className="text-xs text-[#736E66] font-mono">
                            {item.attemptsCount} attempt{item.attemptsCount > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Paired baseline vs retest score display */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {/* Baseline */}
                          <div className="p-4 rounded-2xl border border-[#E8E5DF] bg-[#FBF9F5] space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[#736E66] tracking-wider block">
                              Baseline Diagnostic ({formatDate(item.baselineDate)})
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold font-mono text-[#121316]">
                                {item.baselineScore}%
                              </span>
                              <Badge
                                variant={
                                  item.baselineScore >= 80
                                    ? "strong"
                                    : item.baselineScore >= 60
                                    ? "medium"
                                    : "weak"
                                }
                              />
                            </div>
                            <ProgressBar value={item.baselineScore} size="sm" />
                          </div>

                          {/* Latest Retest */}
                          <div className="p-4 rounded-2xl border border-[#E8E5DF] bg-white space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[#736E66] tracking-wider block">
                              Latest Retest ({formatDate(item.latestDate)})
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold font-mono text-[#121316]">
                                {item.latestScore}%
                              </span>
                              <Badge
                                variant={
                                  item.latestScore >= 80
                                    ? "strong"
                                    : item.latestScore >= 60
                                    ? "medium"
                                    : "weak"
                                }
                              />
                            </div>
                            <ProgressBar value={item.latestScore} size="sm" />
                          </div>
                        </div>
                      </div>

                      {/* Delta Indicator */}
                      <div className="flex flex-col items-center md:items-end justify-center shrink-0 min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 border-[#E8E5DF]">
                        {hasRetest ? (
                          <div className="text-center md:text-right space-y-1">
                            <div className="flex items-center gap-1 font-mono text-2xl font-black">
                              {item.delta > 0 && (
                                <>
                                  <ArrowUpRight className="w-6 h-6 text-emerald-700" />
                                  <span className="text-emerald-700">+{item.delta}%</span>
                                </>
                              )}
                              {item.delta < 0 && (
                                <>
                                  <ArrowDownRight className="w-6 h-6 text-rose-700" />
                                  <span className="text-rose-700">{item.delta}%</span>
                                </>
                              )}
                              {item.delta === 0 && (
                                <>
                                  <Minus className="w-6 h-6 text-[#736E66]" />
                                  <span className="text-[#736E66]">0%</span>
                                </>
                              )}
                            </div>
                            <span className="text-[11px] text-[#736E66] block font-medium">
                              Measured Improvement
                            </span>
                          </div>
                        ) : (
                          <div className="text-center md:text-right space-y-1">
                            <span className="text-xs text-[#736E66] italic block">
                              Single baseline attempt
                            </span>
                            <Link href={`/quiz?topicId=${item.topicId}`}>
                              <Button size="sm" variant="secondary" className="text-xs">
                                Retest to Compare
                                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Attempts History Timeline */}
        {recentAttempts.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-[#121316] mb-4">
              Diagnostic Attempt History ({totalAttempts} completed)
            </h3>
            <div className="divide-y divide-[#E8E5DF] text-xs">
              {recentAttempts.slice(0, 8).map((att) => (
                <div key={att.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-[#121316] block">
                        Diagnostic Assessment • {att.total_questions} Questions
                      </span>
                      <span className="text-[11px] text-[#736E66] font-mono">
                        {formatTimeAgo(att.started_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-[#121316]">
                      {att.score_percentage}% ({att.correct_answers}/{att.total_questions})
                    </span>
                    <Badge
                      variant={
                        att.score_percentage >= 80
                          ? "strong"
                          : att.score_percentage >= 60
                          ? "medium"
                          : "weak"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
