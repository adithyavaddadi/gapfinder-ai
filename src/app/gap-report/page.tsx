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
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#121316]">
                Knowledge Gap Report & Audit
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF]">
                Evidence Grounded
              </span>
            </div>
            <p className="text-xs text-[#5A554E] mt-1 max-w-2xl leading-relaxed">
              Curriculum-wide mastery diagnosis. Ratings are backed by deterministic quiz scoring and page citations from your course materials.
            </p>
          </div>

          <Link href="/revision-plan">
            <Button size="sm" className="font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Build Revision Plan
            </Button>
          </Link>
        </div>

        {/* SUMMARY HEADER: Segmented Progress Bar */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <h2 className="font-bold text-[#121316]">
              Curriculum Mastery Distribution ({summary.total} topics)
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                Weak: {summary.weakCount}
              </span>
              <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                Medium: {summary.mediumCount}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                Strong: {summary.strongCount}
              </span>
              <span className="flex items-center gap-1.5 text-[#736E66]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D5D1C8]" />
                Not Assessed: {summary.notAssessedCount}
              </span>
            </div>
          </div>

          {/* Segmented bar */}
          <div className="w-full h-3.5 bg-[#E8E5DF] rounded-full overflow-hidden flex border border-[#DDD9D2]">
            {summary.weakCount > 0 && (
              <div
                style={{ width: `${weakPct}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Weak: ${summary.weakCount}`}
              />
            )}
            {summary.mediumCount > 0 && (
              <div
                style={{ width: `${mediumPct}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Medium: ${summary.mediumCount}`}
              />
            )}
            {summary.strongCount > 0 && (
              <div
                style={{ width: `${strongPct}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Strong: ${summary.strongCount}`}
              />
            )}
            {summary.notAssessedCount > 0 && (
              <div
                style={{ width: `${unassessedPct}%` }}
                className="bg-[#D5D1C8] h-full transition-all"
                title={`Not Assessed: ${summary.notAssessedCount}`}
              />
            )}
          </div>
        </Card>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736E66]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagnosed topics..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[#E8E5DF] bg-white text-xs text-[#121316] placeholder:text-[#A09A90] focus:outline-none focus:ring-2 focus:ring-[#121316]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "weak", "medium", "strong", "not_assessed"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(lvl)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  filterLevel === lvl
                    ? "bg-[#121316] text-white shadow-xs"
                    : "bg-[#F2EFEB] text-[#5A554E] hover:text-[#121316] hover:bg-[#E8E5DF]"
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
              <div key={i} className="h-44 rounded-3xl bg-white border border-[#E8E5DF] animate-pulse" />
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
                      ? "border-rose-300 bg-rose-50/40 hover:border-rose-400"
                      : "border-[#E8E5DF] hover:border-[#121316]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Topic Main Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          {topic.level === "weak" && (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                          {topic.level === "medium" && (
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                          )}
                          {topic.level === "strong" && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {topic.level === "not_assessed" && (
                            <HelpCircle className="w-5 h-5 text-[#736E66] shrink-0" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-[#121316] tracking-tight">
                              {topic.title}
                            </h3>
                            <Badge variant={topic.level} />
                            <Badge variant={topic.evidenceBadge} />
                          </div>
                          {topic.description && (
                            <p className="text-xs text-[#5A554E] leading-relaxed">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Why this rating */}
                      <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF] text-xs text-[#5A554E] leading-relaxed">
                        <strong className="text-[#121316]">Why this rating: </strong>
                        {topic.whyRating}
                      </div>

                      {/* Suspected Prerequisite Warning */}
                      {hasWeakPrereq && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                          <GitFork className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block text-amber-950">
                              Suspected Root Prerequisite Alert:
                            </span>
                            <span className="text-amber-900">
                              This topic is diagnosed as Weak, and depends on{" "}
                              <strong className="text-[#121316]">{topic.prerequisites[0].prerequisiteTitle}</strong>.
                              Rather than re-reading advanced concepts, take a short prerequisite check quiz first.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Missed Concepts Chips */}
                      {topic.missedConcepts && topic.missedConcepts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mr-1">
                            Missed:
                          </span>
                          {topic.missedConcepts.map((concept, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-0.5 rounded-full bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-medium"
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
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121316] hover:text-[#5A554E] cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#121316]" />
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
                            <div className="mt-3 space-y-2 border-l-2 border-[#121316] pl-4">
                              {topic.citations.map((cite, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setActiveCitation(cite);
                                    setDrawerOpen(true);
                                  }}
                                  className="p-3.5 rounded-2xl border border-[#E8E5DF] bg-[#FBF9F5] hover:bg-white transition-colors cursor-pointer text-xs"
                                >
                                  <div className="flex items-center justify-between text-[11px] text-[#736E66] mb-1 font-mono">
                                    <span>{cite.filename} • Page {cite.pageNumber}</span>
                                    <span className="text-[#121316] font-semibold hover:underline">
                                      View full excerpt →
                                    </span>
                                  </div>
                                  <p className="text-[#121316] italic line-clamp-2">
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

                      <span className="text-xs text-[#736E66] font-mono">
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
                            <Button size="sm" variant="outline" className="w-full text-xs text-emerald-800 border-emerald-300">
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
            <div className="p-4 rounded-2xl bg-[#F2EFEB] border border-[#E8E5DF] text-xs text-[#5A554E]">
              <span className="font-semibold text-[#121316] block mb-1">
                Grounded Provenance Verification
              </span>
              This cited excerpt was retrieved from your uploaded study document and formed the factual basis for diagnostic scoring and topic mastery analysis.
            </div>

            <div className="p-5 rounded-2xl border border-[#E8E5DF] bg-[#FBF9F5] text-xs md:text-sm text-[#121316] leading-relaxed whitespace-pre-wrap font-serif">
              {activeCitation?.passage}
            </div>
          </div>
        </Drawer>
      </div>
    </AppShell>
  );
}
