"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Drawer } from "@/components/ui/drawer";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  Check,
  ChevronRight,
  Flame,
  Info,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface QuestionItem {
  id: string;
  question_text: string;
  options: string[];
  difficulty: string;
}

interface UserAnswerState {
  selectedIndex: number;
  confidence: number; // 1 to 5
}

interface EvaluationResult {
  score: {
    correctCount: number;
    totalQuestions: number;
    percentage: number;
  };
  masteryUpdate: {
    level: "weak" | "medium" | "strong";
    scorePercentage: number;
    evidenceBadge: string;
    whyRating: string;
  };
  feedback: Array<{
    questionId: string;
    questionText: string;
    options: string[];
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    confidenceLevel: number;
    confidenceSignal: { signal: string; message: string };
    explanation: string;
    citations: Array<{
      chunkId: string;
      pageNumber: number;
      heading: string;
      filename: string;
      passage: string;
    }>;
  }>;
}

const CONFIDENCE_LEVELS = [
  { level: 1, label: "Total Guess", desc: "0% certainty • High risk of lucky guess bias" },
  { level: 2, label: "Hesitant", desc: "25% certainty • Leaning toward answer with doubt" },
  { level: 3, label: "Educated Guess", desc: "50% certainty • Narrowed down options" },
  { level: 4, label: "Confident", desc: "75% certainty • Strong conceptual recall" },
  { level: 5, label: "100% Certain", desc: "Absolute certainty • Ready to defend proof" },
];

function QuizContent() {
  const searchParams = useSearchParams();
  const initialTopicId = searchParams.get("topicId");
  const isRetestMode = searchParams.get("mode") === "retest";

  const [topics, setTopics] = React.useState<Array<{ id: string; title: string; mastery?: any }>>([]);
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>(initialTopicId || "");
  const [quizId, setQuizId] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<Record<string, UserAnswerState>>({});
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [results, setResults] = React.useState<EvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Citation drawer state
  const [activeCitation, setActiveCitation] = React.useState<any | null>(null);
  const [citationDrawerOpen, setCitationDrawerOpen] = React.useState(false);

  // Fetch topics list
  React.useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          const list = data.topics || [];
          setTopics(list);
          if (!selectedTopicId && list.length > 0) {
            setSelectedTopicId(list[0].id);
          }
        }
      } catch (e) {
        console.warn("Load topics error:", e);
      }
    };
    loadTopics();
  }, [selectedTopicId]);

  // Generate or start diagnostic quiz
  const handleStartQuiz = async () => {
    if (!selectedTopicId) return;
    setIsGenerating(true);
    setResults(null);
    setUserAnswers({});
    setCurrentIndex(0);
    setErrorMessage(null);

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
        setErrorMessage(data.error || "Could not generate grounded questions. Ensure course material is uploaded.");
        return;
      }

      setQuizId(data.quizId);

      // Fetch questions
      const quizRes = await fetch(`/api/quizzes/${data.quizId}`);
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        const loadedQuestions: QuestionItem[] = quizData.quiz.questions || [];
        setQuestions(loadedQuestions);

        // Pre-initialize answers with default selection & confidence 4 so submitting is always valid
        const initialAnswers: Record<string, UserAnswerState> = {};
        loadedQuestions.forEach((q, idx) => {
          initialAnswers[q.id] = { selectedIndex: idx === 0 ? 0 : 0, confidence: 4 };
        });
        setUserAnswers(initialAnswers);
      }
    } catch (e) {
      console.error("Start quiz failed:", e);
      setErrorMessage("Quiz launch timed out. Please try again.");
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
    setErrorMessage(null);

    try {
      // Build response payload sending BOTH casing conventions
      const answersArray = questions.map((q) => {
        const ans = userAnswers[q.id];
        return {
          question_id: q.id,
          questionId: q.id,
          selected_option_index: ans?.selectedIndex ?? 0,
          selectedOptionIndex: ans?.selectedIndex ?? 0,
          confidence_level: ans?.confidence ?? 4,
          confidenceLevel: ans?.confidence ?? 4,
        };
      });

      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: answersArray,
          answers: answersArray,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to evaluate diagnostic submission.");
      }
    } catch (e) {
      console.error("Submit error:", e);
      setErrorMessage("Error submitting quiz results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? userAnswers[currentQ.id] : undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const activeConfidence = currentAnswer?.confidence || 4;
  const confidenceMeta = CONFIDENCE_LEVELS.find((c) => c.level === activeConfidence) || CONFIDENCE_LEVELS[3];

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SETUP SCREEN: Choose Topic & Grounding Info */}
        {!quizId && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#121316]">
                    {isRetestMode ? "Targeted Mastery Retest" : "Diagnostic Quiz Engine"}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF]">
                    Provenance Verified
                  </span>
                </div>
                <p className="text-xs text-[#5A554E] mt-1.5 max-w-xl leading-relaxed">
                  Questions are generated exclusively from your uploaded study materials. Deterministic server-side evaluation guarantees objective, repeatable mastery ratings.
                </p>
              </div>
            </div>

            <Card className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#121316] uppercase tracking-wider">
                  Select Curriculum Topic for Diagnostic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E8E5DF] bg-white text-xs font-semibold text-[#121316] focus:outline-none focus:ring-2 focus:ring-[#121316]"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.mastery?.level ? `(${t.mastery.level.toUpperCase()} - ${t.mastery.score_percentage}%)` : "(Not Assessed)"}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTopic && (
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A554E] font-medium">Current Mastery Level:</span>
                    <Badge variant={selectedTopic.mastery?.level || "not_assessed"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A554E] font-medium">Last Validated Score:</span>
                    <span className="font-mono font-bold text-[#121316]">
                      {selectedTopic.mastery?.score_percentage || 0}%
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleStartQuiz}
                  isLoading={isGenerating}
                  disabled={!selectedTopicId}
                  size="lg"
                  className="w-full sm:w-auto font-semibold px-6"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Launch Grounded Diagnostic (3 Questions)
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ACTIVE QUIZ: Distraction-free mode */}
        {quizId && !results && currentQ && (
          <div className="space-y-6">
            {/* Top Bar with Question Navigator Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E5DF]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#121316] uppercase tracking-wider">
                  Jump to Question:
                </span>
                <div className="flex items-center gap-1.5">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const hasSelected = typeof userAnswers[q.id]?.selectedIndex === "number";
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-[#121316] text-white shadow-xs"
                            : hasSelected
                            ? "bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF]"
                            : "bg-white text-[#78716C] border border-[#E8E5DF]"
                        }`}
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#78716C]">Difficulty: {currentQ.difficulty}</span>
                <Badge variant="ai" label="Citation Grounded" />
              </div>
            </div>

            <ProgressBar
              value={currentIndex + 1}
              max={questions.length}
              size="sm"
            />

            {/* Main Question Card */}
            <Card className="p-8 space-y-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="px-3 py-1 rounded-full bg-[#F2EFEB] text-[#121316] text-xs font-bold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-[#78716C] font-mono">
                  Press A, B, C, or D on keyboard to select
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-[#121316] leading-relaxed">
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                        isSelected
                          ? "bg-[#F4F1EA] border-[#121316] shadow-xs text-[#121316]"
                          : "bg-white border-[#E8E5DF] hover:border-[#D5D0C6] hover:bg-[#FAF9F5] text-[#2D2A26] active:scale-[0.99]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-[#121316] text-white border-[#121316]"
                            : "bg-[#F2EFEB] text-[#5A554E] border-[#E8E5DF]"
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="text-xs md:text-sm leading-relaxed flex-1 font-medium">
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Confidence Selector with Live Feedback */}
              <div className="pt-6 border-t border-[#F2EFEB] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#121316] uppercase tracking-wider block">
                      Metacognitive Confidence Rating:
                    </span>
                    <span className="text-[11px] text-[#5A554E]">
                      Select how certain you feel. This separates true knowledge gaps from careless mistakes.
                    </span>
                  </div>

                  {/* 1-5 Button Pills */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {CONFIDENCE_LEVELS.map((item) => {
                      const isActive = activeConfidence === item.level;
                      return (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => handleSelectConfidence(item.level)}
                          className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#121316] text-white shadow-sm scale-105"
                              : "bg-white text-[#5A554E] border border-[#E8E5DF] hover:bg-[#F2EFEB]"
                          }`}
                        >
                          {item.level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Feedback Description of Current Confidence */}
                <div className="p-3 rounded-2xl bg-[#F9F8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#121316]">
                      Level {confidenceMeta.level}: {confidenceMeta.label}
                    </span>
                    <span className="text-[#6B665E] hidden sm:inline">
                      — {confidenceMeta.desc}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Saved
                  </span>
                </div>
              </div>
            </Card>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                Previous Question
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmitQuiz}
                  isLoading={isSubmitting}
                  size="md"
                  className="font-semibold px-6 shadow-sm"
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
            <Card className="p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#F2EFEB]">
                <div>
                  <Badge variant="ai" label="Deterministic Evaluation Complete" className="mb-2" />
                  <h2 className="text-2xl font-bold text-[#121316] tracking-tight">
                    Diagnostic Results & Grounding Audit
                  </h2>
                  <p className="text-xs text-[#5A554E] mt-1.5 max-w-md leading-relaxed">
                    Scored server-side against verified course passage keys. Review explanations and click citations to inspect your textbook excerpts.
                  </p>
                </div>

                <ScoreRing
                  score={results.score?.percentage ?? 0}
                  size={100}
                  strokeWidth={9}
                  label="Mastery"
                />
              </div>

              {/* Per-Question Detailed Feedback */}
              {(() => {
                const feedbackItems = results.feedback || (results as any).results || [];
                return (
                  <div className="divide-y divide-[#F2EFEB] mt-6 space-y-6">
                    {feedbackItems.map((item: any, idx: number) => (
                  <div key={idx} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {item.isCorrect ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4 text-rose-700" />
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-[#121316]">
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
                      <div className="p-3.5 rounded-2xl border border-[#E8E5DF] bg-[#FAF9F5]">
                        <span className="font-semibold text-[#6B665E] block mb-1">
                          Your Answer (Confidence: Level {item.confidenceLevel}/5):
                        </span>
                        <span className={item.isCorrect ? "text-emerald-800 font-semibold" : "text-rose-800 font-semibold"}>
                          {item.options[item.selectedOptionIndex]}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70">
                        <span className="font-semibold text-emerald-900 block mb-1">
                          Verified Correct Answer:
                        </span>
                        <span className="text-emerald-900 font-semibold">
                          {item.options[item.correctOptionIndex]}
                        </span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="pl-8 text-xs text-[#4A463F] leading-relaxed">
                      <strong className="text-[#121316]">Explanation: </strong>
                      {item.explanation}
                    </div>

                    {/* Confidence signal diagnostic */}
                    <div className="pl-8 flex items-center gap-2 text-xs">
                      <span className="text-[#6B665E] font-medium">Confidence Signal:</span>
                      <span className="text-[#121316] font-semibold">{item.confidenceSignal.message}</span>
                    </div>

                    {/* Grounded Citation Chips */}
                    {item.citations && item.citations.length > 0 && (
                      <div className="pl-8 flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-semibold text-[#6B665E]">
                          Source Provenance:
                        </span>
                        {item.citations.map((cite: any, cIdx: number) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => {
                              setActiveCitation(cite);
                              setCitationDrawerOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E5DF] hover:border-[#121316] text-[#121316] text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#121316]" />
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
                );
              })()}

              {/* Footer Actions */}
              <div className="pt-8 border-t border-[#F2EFEB] flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
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
            <div className="p-4 rounded-2xl bg-[#F2EFEB] border border-[#E8E5DF] text-xs text-[#5A554E]">
              <span className="font-bold text-[#121316] block mb-1">
                Verified Provenance Proven
              </span>
              This excerpt was extracted from your uploaded study document and used to formulate the question and verify the correct answer.
            </div>

            <div className="p-5 rounded-2xl border border-[#E8E5DF] bg-white text-xs md:text-sm text-[#121316] leading-relaxed whitespace-pre-wrap font-serif">
              {activeCitation?.passage}
            </div>
          </div>
        </Drawer>
      </div>
    </AppShell>
  );
}

export default function QuizPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-[#6B665E]">Loading Quiz Engine...</div>}>
      <QuizContent />
    </React.Suspense>
  );
}
