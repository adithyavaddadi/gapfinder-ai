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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Progress & Proof of Learning
              </h1>
              <Badge variant="ai" label="Empirical Delta" />
            </div>
            <p className="text-xs text-[#57534E] mt-1">
              Compare your initial baseline diagnostic against subsequent retests. No fabricated trajectories—only real attempt evidence.
            </p>
          </div>

          <Link href="/quiz">
            <Button size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Take New Diagnostic Quiz
            </Button>
          </Link>
        </div>

        {/* HONEST SMALL-SAMPLE CAVEAT BANNER */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-start gap-3 text-xs text-[#57534E]">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#1C1917]">Scientific Measurement Caveat: </strong>
            Topics evaluated on fewer than 5 total questions reflect preliminary evidence. Score variations between baseline and retests reflect question-level performance delta, not guaranteed long-term retention. Retest periodically to confirm lasting mastery.
          </div>
        </div>

        {/* Topic Baseline vs Retest Comparison Cards */}
        <div>
          <h2 className="text-base font-semibold text-[#1C1917] mb-4">
            Baseline vs. Retest Comparison
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-xl bg-white border border-[#E7E5E4] animate-pulse" />
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
                          <h3 className="text-base font-bold text-[#1C1917]">
                            {item.topicTitle}
                          </h3>
                          {item.isSmallSample && (
                            <Badge variant="preliminary" label="Sample n < 5" />
                          )}
                          <span className="text-xs text-[#78716C] font-mono">
                            {item.attemptsCount} attempt{item.attemptsCount > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Paired baseline vs retest score display */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {/* Baseline */}
                          <div className="p-3 rounded-xl border border-[#E7E5E4] bg-[#FAF9F6] space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block">
                              Baseline Diagnostic ({formatDate(item.baselineDate)})
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold font-mono text-[#1C1917]">
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
                          <div className="p-3 rounded-xl border border-[#E7E5E4] bg-white space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block">
                              Latest Retest ({formatDate(item.latestDate)})
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold font-mono text-[#1C1917]">
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
                      <div className="flex flex-col items-center md:items-end justify-center shrink-0 min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 border-[#F5F5F4]">
                        {hasRetest ? (
                          <div className="text-center md:text-right space-y-1">
                            <div className="flex items-center gap-1 font-mono text-2xl font-black">
                              {item.delta > 0 && (
                                <>
                                  <ArrowUpRight className="w-6 h-6 text-[#16A34A]" />
                                  <span className="text-[#16A34A]">+{item.delta}%</span>
                                </>
                              )}
                              {item.delta < 0 && (
                                <>
                                  <ArrowDownRight className="w-6 h-6 text-[#DC2626]" />
                                  <span className="text-[#DC2626]">{item.delta}%</span>
                                </>
                              )}
                              {item.delta === 0 && (
                                <>
                                  <Minus className="w-6 h-6 text-[#78716C]" />
                                  <span className="text-[#78716C]">0%</span>
                                </>
                              )}
                            </div>
                            <span className="text-[11px] text-[#78716C] block">
                              Measured Improvement
                            </span>
                          </div>
                        ) : (
                          <div className="text-center md:text-right space-y-1">
                            <span className="text-xs text-[#78716C] italic block">
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
            <h3 className="text-sm font-bold text-[#1C1917] mb-4">
              Diagnostic Attempt History ({totalAttempts} completed)
            </h3>
            <div className="divide-y divide-[#F5F5F4] text-xs">
              {recentAttempts.slice(0, 8).map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <div>
                      <span className="font-semibold text-[#1C1917] block">
                        Diagnostic Assessment • {att.total_questions} Questions
                      </span>
                      <span className="text-[11px] text-[#78716C]">
                        {formatTimeAgo(att.started_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-[#1C1917]">
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
