"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  BookOpen,
  FileText,
  GitFork,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
} from "lucide-react";

interface GapTopic {
  id: string;
  title: string;
  description: string | null;
  source: string;
  level: "weak" | "medium" | "strong" | "not_assessed";
  scorePercentage: number;
  evidenceBadge: "insufficient" | "preliminary" | "established";
  questionsAttempted: number;
  questionsCorrect: number;
  whyRating: string;
  missedConcepts: string[];
  prerequisites: Array<{
    id: string;
    prerequisiteId: string;
    prerequisiteTitle: string;
    status: string;
    reason: string;
  }>;
  citations: Array<{
    chunkId: string;
    pageNumber: number;
    heading: string;
    filename: string;
    passage: string;
  }>;
}

export default function GapReportPage() {
  const [summary, setSummary] = React.useState({
    total: 0,
    weakCount: 0,
    mediumCount: 0,
    strongCount: 0,
    notAssessedCount: 0,
  });
  const [topics, setTopics] = React.useState<GapTopic[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterLevel, setFilterLevel] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedCitations, setExpandedCitations] = React.useState<Record<string, boolean>>({});

  // Citation drawer
  const [activeCitation, setActiveCitation] = React.useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const fetchGapReport = async () => {
    try {
      const res = await fetch("/api/gap-report");
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || {});
        setTopics(data.topics || []);
      }
    } catch (e) {
      console.warn("Failed to fetch gap report:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGapReport();
  }, []);

  const toggleExpand = (topicId: string) => {
    setExpandedCitations((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // Filter & sort (Weak topics first by default)
  const filteredTopics = topics
    .filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterLevel === "all" || t.level === filterLevel;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const order: Record<string, number> = { weak: 0, medium: 1, not_assessed: 2, strong: 3 };
      return (order[a.level] ?? 4) - (order[b.level] ?? 4);
    });

  // Calculate percentages for segmented summary bar
  const total = summary.total || 1;
  const weakPct = Math.round((summary.weakCount / total) * 100);
  const mediumPct = Math.round((summary.mediumCount / total) * 100);
  const strongPct = Math.round((summary.strongCount / total) * 100);
  const unassessedPct = Math.max(0, 100 - (weakPct + mediumPct + strongPct));

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Knowledge Gap Report & Diagnostic Audit
              </h1>
              <Badge variant="ai" label="Evidence Grounded" />
            </div>
            <p className="text-xs text-[#57534E] mt-1">
              Curriculum-wide mastery diagnosis. Ratings are backed by deterministic quiz scoring and page citations from your course materials.
            </p>
          </div>

          <Link href="/revision-plan">
            <Button size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Build Revision Plan
            </Button>
          </Link>
        </div>

        {/* SUMMARY HEADER: Segmented Progress Bar */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <h2 className="font-semibold text-[#1C1917]">
              Curriculum Mastery Distribution ({summary.total} topics)
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#DC2626] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                Weak: {summary.weakCount}
              </span>
              <span className="flex items-center gap-1.5 text-[#D97706] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                Medium: {summary.mediumCount}
              </span>
              <span className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                Strong: {summary.strongCount}
              </span>
              <span className="flex items-center gap-1.5 text-[#78716C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A8A29E]" />
                Not Assessed: {summary.notAssessedCount}
              </span>
            </div>
          </div>

          {/* Segmented bar */}
          <div className="w-full h-3.5 bg-[#E7E5E4] rounded-full overflow-hidden flex">
            {summary.weakCount > 0 && (
              <div
                style={{ width: `${weakPct}%` }}
                className="bg-[#DC2626] h-full transition-all"
                title={`Weak: ${summary.weakCount}`}
              />
            )}
            {summary.mediumCount > 0 && (
              <div
                style={{ width: `${mediumPct}%` }}
                className="bg-[#D97706] h-full transition-all"
                title={`Medium: ${summary.mediumCount}`}
              />
            )}
            {summary.strongCount > 0 && (
              <div
                style={{ width: `${strongPct}%` }}
                className="bg-[#16A34A] h-full transition-all"
                title={`Strong: ${summary.strongCount}`}
              />
            )}
            {summary.notAssessedCount > 0 && (
              <div
                style={{ width: `${unassessedPct}%` }}
                className="bg-[#D6D3D1] h-full transition-all"
                title={`Not Assessed: ${summary.notAssessedCount}`}
              />
            )}
          </div>
        </Card>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagnosed topics..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E7E5E4] bg-white text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "weak", "medium", "strong", "not_assessed"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  filterLevel === lvl
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : "bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]"
                }`}
              >
                {lvl.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnosed Topics List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-white border border-[#E7E5E4] animate-pulse" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No topics match your filter"
            description="Take diagnostic quizzes or upload study materials to assess additional course topics."
          />
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic) => {
              const isExpanded = expandedCitations[topic.id];
              const hasWeakPrereq =
                topic.level === "weak" && topic.prerequisites.length > 0;

              return (
                <Card
                  key={topic.id}
                  className={`p-6 border transition-all ${
                    topic.level === "weak"
                      ? "border-[#FECACA] bg-white shadow-xs"
                      : "border-[#E7E5E4] bg-white"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Topic Main Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          {topic.level === "weak" && (
                            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                          )}
                          {topic.level === "medium" && (
                            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />
                          )}
                          {topic.level === "strong" && (
                            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                          )}
                          {topic.level === "not_assessed" && (
                            <HelpCircle className="w-5 h-5 text-[#78716C] shrink-0" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-[#1C1917] tracking-tight">
                              {topic.title}
                            </h3>
                            <Badge variant={topic.level} />
                            <Badge variant={topic.evidenceBadge} />
                          </div>
                          {topic.description && (
                            <p className="text-xs text-[#57534E] leading-relaxed">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Why this rating */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] text-xs text-[#1C1917] leading-relaxed">
                        <strong className="text-[#57534E]">Why this rating: </strong>
                        {topic.whyRating}
                      </div>

                      {/* Suspected Prerequisite Warning */}
                      {hasWeakPrereq && (
                        <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#D97706] flex items-start gap-2.5">
                          <GitFork className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block text-[#B45309]">
                              Suspected Root Prerequisite Alert:
                            </span>
                            <span>
                              This topic is diagnosed as Weak, and depends on{" "}
                              <strong>{topic.prerequisites[0].prerequisiteTitle}</strong>.
                              Rather than re-reading advanced concepts, take a short prerequisite check quiz first.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Missed Concepts Chips */}
                      {topic.missedConcepts && topic.missedConcepts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider mr-1">
                            Missed:
                          </span>
                          {topic.missedConcepts.map((concept, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-0.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-medium"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Cited Evidence Collapsible */}
                      {topic.citations && topic.citations.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(topic.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {isExpanded ? "Hide" : "Inspect"} Cited Source Passages ({topic.citations.length})
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-2 border-l-2 border-[#DDD6FE] pl-4">
                              {topic.citations.map((cite, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setActiveCitation(cite);
                                    setDrawerOpen(true);
                                  }}
                                  className="p-3 rounded-lg border border-[#E7E5E4] bg-[#FAF9F6] hover:bg-white transition-colors cursor-pointer text-xs"
                                >
                                  <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1 font-mono">
                                    <span>{cite.filename} • Page {cite.pageNumber}</span>
                                    <span className="text-[#7C3AED] font-semibold hover:underline">
                                      View full excerpt →
                                    </span>
                                  </div>
                                  <p className="text-[#1C1917] italic line-clamp-2">
                                    "{cite.passage}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Score & Action CTA */}
                    <div className="flex flex-col items-center md:items-end justify-between shrink-0 gap-4">
                      <ScoreRing
                        score={topic.scorePercentage}
                        size={80}
                        strokeWidth={7}
                        label="Score"
                      />

                      <span className="text-xs text-[#78716C] font-mono">
                        {topic.questionsCorrect} / {topic.questionsAttempted} correct
                      </span>

                      <div className="flex flex-col w-full sm:w-auto gap-2">
                        {topic.level === "weak" ? (
                          <Link href={`/quiz?topicId=${topic.id}`}>
                            <Button size="sm" className="w-full text-xs">
                              {hasWeakPrereq ? "Take Prerequisite Check" : "Retest Topic"}
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        ) : topic.level === "medium" ? (
                          <Link href={`/revision-plan`}>
                            <Button size="sm" variant="secondary" className="w-full text-xs">
                              Add to Revision Plan
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        ) : topic.level === "strong" ? (
                          <Link href={`/quiz?topicId=${topic.id}`}>
                            <Button size="sm" variant="outline" className="w-full text-xs text-[#16A34A] border-[#BBF7D0]">
                              Verified Strong
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/quiz?topicId=${topic.id}`}>
                            <Button size="sm" className="w-full text-xs">
                              Take First Diagnostic
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Source Citation Drawer */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={activeCitation?.filename || "Source Evidence Passage"}
          subtitle={`Page ${activeCitation?.pageNumber} • Section: "${activeCitation?.heading}"`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4] text-xs text-[#78716C]">
              <span className="font-semibold text-[#1C1917] block mb-1">
                Grounded Provenance Verification
              </span>
              This cited excerpt was retrieved from your uploaded study document and formed the factual basis for diagnostic scoring and topic mastery analysis.
            </div>

            <div className="p-4 rounded-xl border border-[#E7E5E4] bg-white text-xs md:text-sm text-[#1C1917] leading-relaxed whitespace-pre-wrap font-serif">
              {activeCitation?.passage}
            </div>
          </div>
        </Drawer>
      </div>
    </AppShell>
  );
}
