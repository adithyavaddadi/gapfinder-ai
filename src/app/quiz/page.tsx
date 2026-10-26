"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ScoreRing } from "@/components/ui/score-ring";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  FileText,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface QuestionItem {
  id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
}

interface ScoredFeedback {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
  confidenceLevel: number;
  confidenceSignal: {
    type: string;
    message: string;
    recommendedAction: string;
  };
  citations: Array<{
    chunkId: string;
    pageNumber: number;
    heading: string;
    filename: string;
    passage: string;
  }>;
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const preselectedTopicId = searchParams.get("topicId");

  const [topics, setTopics] = React.useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>(preselectedTopicId || "");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [quizId, setQuizId] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // User answers state: Map questionId -> { selectedIndex, confidence }
  const [userAnswers, setUserAnswers] = React.useState<
    Record<string, { selectedIndex: number; confidence: number }>
  >({});

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [results, setResults] = React.useState<{
    score: { total: number; correct: number; percentage: number };
    feedback: ScoredFeedback[];
  } | null>(null);

  // Citation drawer state
  const [citationDrawerOpen, setCitationDrawerOpen] = React.useState(false);
  const [activeCitation, setActiveCitation] = React.useState<any | null>(null);

  // Load available topics
  React.useEffect(() => {
    async function loadTopics() {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
          if (!selectedTopicId && data.topics?.length > 0) {
            setSelectedTopicId(data.topics[0].id);
          }
        }
      } catch (e) {
        console.warn("Error fetching topics:", e);
      }
    }
    loadTopics();
  }, [selectedTopicId]);

  // Generate or start diagnostic quiz
  const handleStartQuiz = async () => {
    if (!selectedTopicId) return;
    setIsGenerating(true);
    setResults(null);
    setUserAnswers({});
    setCurrentIndex(0);

    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          questionCount: 3,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not generate grounded questions. Upload material first.");
        return;
      }

      setQuizId(data.quizId);

      // Fetch questions
      const quizRes = await fetch(`/api/quizzes/${data.quizId}`);
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        setQuestions(quizData.quiz.questions || []);
      }
    } catch (e) {
      console.error("Start quiz failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard shortcut listener (A: 0, B: 1, C: 2, D: 3)
  React.useEffect(() => {
    if (questions.length === 0 || results) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      const key = e.key.toUpperCase();
      const optionMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      if (typeof optionMap[key] !== "undefined") {
        const selectedIndex = optionMap[key];
        setUserAnswers((prev) => ({
          ...prev,
          [currentQ.id]: {
            selectedIndex,
            confidence: prev[currentQ.id]?.confidence || 4,
          },
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions, currentIndex, results]);

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedIndex: optionIndex,
        confidence: prev[currentQ.id]?.confidence || 4,
      },
    }));
  };

  const handleSelectConfidence = (confidence: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedIndex: prev[currentQ.id]?.selectedIndex ?? 0,
        confidence,
      },
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizId) return;
    setIsSubmitting(true);

    const responsesPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option_index: userAnswers[q.id]?.selectedIndex ?? 0,
      confidence_level: userAnswers[q.id]?.confidence ?? 3,
    }));

    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: responsesPayload }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults({
          score: data.score,
          feedback: data.results,
        });
      }
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? userAnswers[currentQ.id] : undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = questions.every((q) => userAnswers[q.id] !== undefined);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* If no active quiz and no results, show quiz launcher */}
        {!quizId && !results && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Grounded Diagnostic Quiz
              </h1>
              <p className="text-xs text-[#57534E] mt-1">
                Evaluate your true knowledge standing with questions generated directly from your uploaded materials.
              </p>
            </div>

            <Card className="p-6 md:p-8">
              <h2 className="text-base font-semibold text-[#1C1917] mb-2">
                Select Curriculum Topic to Assess
              </h2>
              <p className="text-xs text-[#57534E] mb-6">
                Choose a topic from your mapped course syllabus. The diagnostic engine will verify questions and citations against your documents before testing.
              </p>

              {topics.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No topics available"
                  description="Upload course materials first so the diagnostic engine can index your curriculum topics."
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topics.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTopicId(t.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedTopicId === t.id
                            ? "bg-[#F3EEFF] border-[#DDD6FE] shadow-xs"
                            : "bg-white border-[#E7E5E4] hover:bg-[#FAF9F6]"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-semibold text-[#1C1917] truncate">
                            {t.title}
                          </h4>
                          <span className="text-[10px] text-[#78716C] block mt-0.5">
                            Status: {t.mastery?.level?.replace("_", " ") || "Not Assessed"}
                          </span>
                        </div>
                        <Badge
                          variant={t.mastery?.level || "not_assessed"}
                          className="text-[10px] py-0 px-2 shrink-0"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleStartQuiz}
                    isLoading={isGenerating}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Launch Grounded Diagnostic (3 Questions)
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ACTIVE QUIZ: Distraction-free mode */}
        {quizId && !results && currentQ && (
          <div className="space-y-6">
            {/* Top Bar with Progress */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div>
                <span className="text-xs font-semibold text-[#7C3AED]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[11px] text-[#78716C] ml-2">• Difficulty: {currentQ.difficulty}</span>
              </div>
              <Badge variant="ai" label="Citation Grounded" />
            </div>

            <ProgressBar
              value={currentIndex + 1}
              max={questions.length}
              size="sm"
            />

            {/* Main Question Card */}
            <Card className="p-6 md:p-8 space-y-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-[#1C1917] leading-relaxed">
                {currentQ.question_text}
              </h2>

              {/* Options Cards with Keyboard Shortcuts (A/B/C/D) */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = ["A", "B", "C", "D"][optIdx];
                  const isSelected = currentAnswer?.selectedIndex === optIdx;

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-[#F3EEFF] border-[#7C3AED] shadow-xs"
                          : "bg-white border-[#E7E5E4] hover:bg-[#FAF9F6] active:scale-[0.99]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                            : "bg-[#F5F5F4] text-[#57534E] border-[#E7E5E4]"
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="text-xs md:text-sm text-[#1C1917] leading-relaxed flex-1">
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 1-5 Confidence Selector */}
              <div className="pt-4 border-t border-[#F5F5F4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#1C1917] block">
                    Confidence Rating:
                  </span>
                  <span className="text-[11px] text-[#78716C]">
                    Used to detect root misconceptions vs careless errors
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleSelectConfidence(lvl)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        (currentAnswer?.confidence || 4) === lvl
                          ? "bg-[#7C3AED] text-white shadow-xs"
                          : "bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmitQuiz}
                  isLoading={isSubmitting}
                  disabled={!allAnswered}
                  size="md"
                  className="shadow-sm shadow-[#7C3AED]/25"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Submit Diagnostic for Evaluation
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  size="sm"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS SCREEN WITH DETERMINISTIC SCORING & CITATIONS */}
        {results && (
          <div className="space-y-6">
            <Card className="p-6 md:p-8 bg-white border border-[#E7E5E4] shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#F5F5F4]">
                <div>
                  <Badge variant="ai" label="Deterministic Evaluation Complete" className="mb-2" />
                  <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                    Diagnostic Results & Grounding Audit
                  </h2>
                  <p className="text-xs text-[#57534E] mt-1 max-w-md">
                    Scored server-side against verified course passage keys. Review explanations and click citations to inspect your textbook excerpts.
                  </p>
                </div>

                <ScoreRing
                  score={results.score.percentage}
                  size={100}
                  strokeWidth={9}
                  label="Mastery"
                />
              </div>

              {/* Per-Question Detailed Feedback */}
              <div className="divide-y divide-[#F5F5F4] mt-6 space-y-6">
                {results.feedback.map((item, idx) => (
                  <div key={idx} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {item.isCorrect ? (
                          <div className="w-6 h-6 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        <h4 className="text-sm font-semibold text-[#1C1917]">
                          Question {idx + 1}: {item.questionText}
                        </h4>
                      </div>
                      <Badge
                        variant={item.isCorrect ? "strong" : "weak"}
                        label={item.isCorrect ? "Correct" : "Incorrect"}
                      />
                    </div>

                    {/* Answer review */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pl-8">
                      <div className="p-3 rounded-lg border border-[#E7E5E4] bg-[#FAF9F6]">
                        <span className="font-semibold text-[#78716C] block mb-0.5">
                          Your Answer (Confidence: {item.confidenceLevel}/5):
                        </span>
                        <span className={item.isCorrect ? "text-[#16A34A] font-medium" : "text-[#DC2626] font-medium"}>
                          {item.options[item.selectedOptionIndex]}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4]">
                        <span className="font-semibold text-[#16A34A] block mb-0.5">
                          Verified Correct Answer:
                        </span>
                        <span className="text-[#16A34A] font-medium">
                          {item.options[item.correctOptionIndex]}
                        </span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="pl-8 text-xs text-[#57534E] leading-relaxed">
                      <strong className="text-[#1C1917]">Explanation: </strong>
                      {item.explanation}
                    </div>

                    {/* Confidence signal diagnostic */}
                    <div className="pl-8 flex items-center gap-2 text-xs">
                      <span className="text-[#78716C] font-medium">Confidence Signal:</span>
                      <span className="text-[#7C3AED] font-semibold">{item.confidenceSignal.message}</span>
                    </div>

                    {/* Grounded Citation Chips */}
                    {item.citations && item.citations.length > 0 && (
                      <div className="pl-8 flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-semibold text-[#78716C]">
                          Source Provenance:
                        </span>
                        {item.citations.map((cite, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => {
                              setActiveCitation(cite);
                              setCitationDrawerOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3EEFF] border border-[#DDD6FE] text-[#7C3AED] hover:bg-[#E9DEFF] text-xs font-medium cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {cite.filename} (p.{cite.pageNumber})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="pt-8 border-t border-[#F5F5F4] flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizId(null);
                    setResults(null);
                  }}
                  className="text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Take Another Topic Quiz
                </Button>

                <div className="flex items-center gap-3">
                  <Link href="/gap-report">
                    <Button size="md" className="text-xs">
                      View Updated Gap Report
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Source Citation Drawer */}
        <Drawer
          isOpen={citationDrawerOpen}
          onClose={() => setCitationDrawerOpen(false)}
          title={activeCitation?.filename || "Grounded Source Passage"}
          subtitle={`Page ${activeCitation?.pageNumber} • Section: "${activeCitation?.heading}"`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4] text-xs text-[#78716C]">
              <span className="font-semibold text-[#1C1917] block mb-1">
                Verified Provenance Proven
              </span>
              This excerpt was extracted from your uploaded study document and used to formulate the question and verify the correct answer.
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
