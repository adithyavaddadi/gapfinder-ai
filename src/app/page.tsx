"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  UploadCloud,
  Network,
  CheckCircle2,
  CalendarCheck,
  Search,
  Check,
  X,
  BookOpen,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] selection:bg-[#F3EEFF] selection:text-[#7C3AED]">
      {/* 1. STICKY TRANSLUCENT NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9F6]/85 border-b border-[#E7E5E4]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#7C3AED]/25">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#1C1917] leading-none">
                GapFinder<span className="text-[#7C3AED]"> AI</span>
              </span>
              <span className="text-[10px] text-[#78716C] font-medium uppercase tracking-wide">
                Diagnostic Revision Engine
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#57534E]">
            <a href="#how-it-works" className="hover:text-[#1C1917] transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#1C1917] transition-colors">
              Features
            </a>
            <a href="#comparison" className="hover:text-[#1C1917] transition-colors">
              Why GapFinder
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="sm" variant="secondary" className="hidden sm:inline-flex">
                <Sparkles className="w-3.5 h-3.5" />
                Try Demo
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EEFF] border border-[#DDD6FE] text-[#7C3AED] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Diagnostic Alternative to Generic Chatbots</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1C1917] leading-[1.1] mb-6">
          Find the gaps you{" "}
          <span className="text-[#7C3AED] relative inline-block">
            didn't know
            <svg
              className="absolute -bottom-2 left-0 w-full text-[#7C3AED]/30"
              height="8"
              viewBox="0 0 200 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6C50 2 150 2 198 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          you had.
        </h1>

        <p className="text-lg md:text-xl text-[#57534E] max-w-3xl mx-auto leading-relaxed mb-10">
          Turn your own syllabus, notes, and past exams into a personalized diagnostic engine.
          We identify exact topic weaknesses, recommend what to revise next, and prove your measurable improvement.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-16">
          <Link href="/demo" className="w-full sm:w-auto">
            <Button size="lg" className="w-full shadow-md shadow-[#7C3AED]/20">
              <Sparkles className="w-4 h-4" />
              Try Demo (Preloaded DBMS)
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* 3. REALISTIC PRODUCT MOCKUP IN HTML/CSS */}
        <div className="rounded-2xl border border-[#E7E5E4] bg-white shadow-2xl p-4 sm:p-6 text-left max-w-4xl mx-auto overflow-hidden">
          {/* Mock Window Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F5F5F4] mb-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E7E5E4]" />
              <div className="w-3 h-3 rounded-full bg-[#E7E5E4]" />
              <div className="w-3 h-3 rounded-full bg-[#E7E5E4]" />
              <span className="text-xs font-mono text-[#78716C] ml-2">
                GapFinder AI • Knowledge X-Ray & Diagnostic Plan
              </span>
            </div>
            <Badge variant="ai" label="Verified RAG Grounded" />
          </div>

          {/* Mock Dashboard Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left Mock: Topic Tree with Status Badges */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Syllabus Topic Map (CS 301: Database Systems)
                </h4>
                <span className="text-xs text-[#57534E]">4 topics assessed</span>
              </div>

              {/* Topic Item 1: Normalization (Weak) */}
              <div className="p-3.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                  <div>
                    <span className="text-sm font-semibold text-[#1C1917]">
                      1.2 Normalization (2NF, 3NF, BCNF)
                    </span>
                    <p className="text-xs text-[#DC2626] font-medium mt-0.5">
                      Weak • 33% (1/3 correct) • Recurring loss of Dependency Preservation
                    </p>
                  </div>
                </div>
                <Badge variant="weak" label="Weak" />
              </div>

              {/* Topic Item 2: Functional Dependencies (Medium) */}
              <div className="p-3.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <div>
                    <span className="text-sm font-semibold text-[#1C1917]">
                      1.1 Functional Dependencies & Closures
                    </span>
                    <p className="text-xs text-[#D97706] font-medium mt-0.5">
                      Medium • 66% (2/3 correct) • Suspected prerequisite for 1.2
                    </p>
                  </div>
                </div>
                <Badge variant="medium" label="Medium" />
              </div>

              {/* Topic Item 3: SQL Joins (Strong) */}
              <div className="p-3.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                  <div>
                    <span className="text-sm font-semibold text-[#1C1917]">
                      2.1 Relational Algebra & Joins
                    </span>
                    <p className="text-xs text-[#16A34A] font-medium mt-0.5">
                      Strong • 100% (4/4 correct) • Established Mastery
                    </p>
                  </div>
                </div>
                <Badge variant="strong" label="Strong" />
              </div>

              {/* Topic Item 4: ACID Transactions (Strong) */}
              <div className="p-3.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                  <div>
                    <span className="text-sm font-semibold text-[#1C1917]">
                      3.1 Transaction Management & ACID
                    </span>
                    <p className="text-xs text-[#16A34A] font-medium mt-0.5">
                      Strong • 85% (3/4 correct) • Verified Grounded
                    </p>
                  </div>
                </div>
                <Badge variant="strong" label="Strong" />
              </div>
            </div>

            {/* Right Mock: Next Best Action Card */}
            <div className="p-4 rounded-xl border border-[#DDD6FE] bg-[#F3EEFF]/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#7C3AED] font-semibold text-xs mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Next Best Step</span>
                </div>
                <h5 className="text-sm font-bold text-[#1C1917] mb-1">
                  Revise Functional Dependencies
                </h5>
                <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                  BCNF decomposition failed because attribute closure rules weren't mastered. Fix this root prerequisite first.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                    <span>Prerequisite Priority Score</span>
                    <span className="font-bold text-[#7C3AED]">86 / 100</span>
                  </div>
                  <ProgressBar value={86} size="sm" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-[#E7E5E4] text-xs">
                  <span className="font-semibold text-[#1C1917] block">Citing Textbook p.48:</span>
                  <span className="text-[#57534E] italic line-clamp-2">
                    "A relation is in BCNF if for every non-trivial functional dependency X → Y, X is a superkey..."
                  </span>
                </div>
                <Button size="sm" className="w-full text-xs">
                  Start 25m Practice Task
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS 4-STEP STRIP */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E7E5E4]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] mb-2">
              Systematic Learning Workflow
            </h2>
            <h3 className="text-3xl font-bold text-[#1C1917] tracking-tight">
              From Raw Documents to Measurable Mastery
            </h3>
            <p className="text-sm text-[#57534E] mt-3">
              Standard tools wait for you to ask questions. GapFinder tests you first to find what you don't even realize you missed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card className="p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h4 className="text-base font-semibold text-[#1C1917] mb-2">
                1. Upload Material
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Upload your syllabus, textbook PDFs, lecture notes, or past papers. Extracted and chunked with verified page provenance.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h4 className="text-base font-semibold text-[#1C1917] mb-2">
                2. Topic Map X-Ray
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                The engine structures your curriculum into a hierarchy of topics, identifying suspected prerequisites and syllabus weight.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h4 className="text-base font-semibold text-[#1C1917] mb-2">
                3. Diagnostic Quiz
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Take quizzes generated strictly from your materials. Scored deterministically on the server with cited answer verifications.
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h4 className="text-base font-semibold text-[#1C1917] mb-2">
                4. Targeted Revision
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Receive an evidence-backed Gap Report and daily time-budgeted study tasks. Retest with new questions to prove real progress.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. ALTERNATING FEATURE SECTIONS */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-6 space-y-24">
        {/* Feature 1: Evidence-backed diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Badge variant="ai" label="Evidence Grounding" />
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
              Diagnoses Grounded in Citations, Not Guesswork
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Every diagnostic question, explanation, and topic rating links directly back to the exact passage and page number in your textbook or lecture notes. If an answer cannot be grounded, the engine abstains rather than halluncinating.
            </p>
            <ul className="space-y-2 text-xs text-[#57534E] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Strict chunk validation before question release
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Evidence sufficiency badges (Insufficient, Preliminary, Established)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Interactive source citation drawer for immediate review
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F4] mb-4">
              <span className="text-xs font-semibold text-[#1C1917]">Diagnostic Question Audit</span>
              <Badge variant="established" />
            </div>
            <p className="text-sm font-medium text-[#1C1917] mb-3">
              "Which normal form guarantees both lossless join decomposition and dependency preservation?"
            </p>
            <div className="space-y-2 mb-4">
              <div className="p-2.5 rounded-lg border border-[#E7E5E4] text-xs text-[#57534E] flex items-center justify-between">
                <span>A) Boyce-Codd Normal Form (BCNF)</span>
                <span className="text-[#DC2626] font-mono text-[11px]">Loss of FD</span>
              </div>
              <div className="p-2.5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] text-xs text-[#16A34A] font-semibold flex items-center justify-between">
                <span>B) Third Normal Form (3NF)</span>
                <span className="font-mono text-[11px]">Correct Answer</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4] text-xs text-[#57534E]">
              <span className="font-semibold text-[#1C1917] block mb-1">Source Passage (DBMS_Concepts.pdf, p.142):</span>
              "3NF always allows a lossless-join decomposition that is also dependency-preserving; BCNF guarantees lossless-join but may not preserve dependencies."
            </div>
          </div>
        </div>

        {/* Feature 2: Personalized Revision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] shadow-sm order-2 md:order-1">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F4] mb-4">
              <span className="text-xs font-semibold text-[#1C1917]">Daily Schedule • 1.5 Hours Budget</span>
              <span className="text-xs text-[#7C3AED] font-semibold">Priority P = 0.4W + 0.25I + 0.2U + 0.15D</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-[#E7E5E4] bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#F3EEFF] text-[#7C3AED] text-[10px] font-bold">
                      PRACTICE • 35 MIN
                    </span>
                    <span className="text-xs font-semibold text-[#1C1917]">
                      Closure computation exercises
                    </span>
                  </div>
                  <p className="text-[11px] text-[#57534E] mt-1">
                    Why: Needed before tackling BCNF decomposition tests
                  </p>
                </div>
                <Check className="w-4 h-4 text-[#A8A29E]" />
              </div>

              <div className="p-3 rounded-xl border border-[#E7E5E4] bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] text-[10px] font-bold">
                      VERIFY • 25 MIN
                    </span>
                    <span className="text-xs font-semibold text-[#1C1917]">
                      Diagnostic Retest: Normalization 3NF
                    </span>
                  </div>
                  <p className="text-[11px] text-[#57534E] mt-1">
                    Why: Validate whether the FD misconception was fixed
                  </p>
                </div>
                <Check className="w-4 h-4 text-[#A8A29E]" />
              </div>
            </div>
          </div>

          <div className="space-y-4 order-1 md:order-2">
            <Badge variant="syllabus" label="Algorithmic Prioritization" />
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
              Adaptive Revision That Fits Your Real Schedule
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Never waste time rereading chapters you've already mastered. The revision algorithm balances your diagnosed topic weakness, syllabus exam weight, date urgency, and prerequisite dependencies to structure bite-sized daily tasks.
            </p>
            <ul className="space-y-2 text-xs text-[#57534E] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Daily time-budget meters (1h, 2h, or customized)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Tasks can be completed, skipped, or reordered
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Completing a task doesn't claim mastery—only quiz evidence does
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. "NOT ANOTHER CHAT-WITH-PDF" COMPARISON TABLE */}
      <section id="comparison" className="py-20 bg-white border-t border-[#E7E5E4]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] mb-2">
              Direct Comparison
            </h2>
            <h3 className="text-3xl font-bold text-[#1C1917] tracking-tight">
              Why GapFinder AI Stands Out
            </h3>
            <p className="text-sm text-[#57534E] mt-3">
              Most study tools wait for the student to ask a question. But a student cannot ask about a gap they don't know they have.
            </p>
          </div>

          <div className="border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-3 bg-[#FAF9F6] p-4 text-xs font-bold text-[#1C1917] border-b border-[#E7E5E4]">
              <div>Dimension</div>
              <div className="text-[#78716C]">Generic "Chat with PDF"</div>
              <div className="text-[#7C3AED]">GapFinder AI</div>
            </div>

            <div className="divide-y divide-[#F5F5F4] text-xs">
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-[#1C1917]">Initiative</span>
                <span className="text-[#57534E] flex items-center gap-1.5">
                  <X className="w-4 h-4 text-[#DC2626] shrink-0" />
                  Reactive: student must ask
                </span>
                <span className="text-[#1C1917] font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  Proactive: diagnoses gaps first
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-[#FAF9F6]/40">
                <span className="font-semibold text-[#1C1917]">Grounding & Citations</span>
                <span className="text-[#57534E] flex items-center gap-1.5">
                  <X className="w-4 h-4 text-[#DC2626] shrink-0" />
                  Vague or unverified
                </span>
                <span className="text-[#1C1917] font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  Strict page & chunk validation
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-[#1C1917]">Assessment Scoring</span>
                <span className="text-[#57534E] flex items-center gap-1.5">
                  <X className="w-4 h-4 text-[#DC2626] shrink-0" />
                  None or subjective prompt
                </span>
                <span className="text-[#1C1917] font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  Deterministic server-side keys
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-[#FAF9F6]/40">
                <span className="font-semibold text-[#1C1917]">Actionability</span>
                <span className="text-[#57534E] flex items-center gap-1.5">
                  <X className="w-4 h-4 text-[#DC2626] shrink-0" />
                  Walls of text answers
                </span>
                <span className="text-[#1C1917] font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  Daily time-budgeted revision plan
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-[#1C1917]">Measurable Proof</span>
                <span className="text-[#57534E] flex items-center gap-1.5">
                  <X className="w-4 h-4 text-[#DC2626] shrink-0" />
                  No retest or tracking
                </span>
                <span className="text-[#1C1917] font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  Baseline vs Retest progress delta
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA BAND */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-10 md:p-14 rounded-3xl bg-white border border-[#E7E5E4] shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-3xl md:text-4xl font-extrabold text-[#1C1917] tracking-tight mb-4">
              Stop guessing what to revise.
            </h3>
            <p className="text-base text-[#57534E] max-w-xl mx-auto mb-8">
              Experience the preloaded DBMS study space with zero setup, or upload your own course materials right now.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto shadow-md shadow-[#7C3AED]/20">
                  <Sparkles className="w-4 h-4" />
                  Explore Demo (Instant)
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 border-t border-[#E7E5E4] bg-white text-xs text-[#78716C]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <span className="font-semibold text-[#1C1917]">GapFinder AI</span>
            <span>— Diagnostic Learning & Evidence-Backed Revision Engine</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#1C1917]">
              Sign In
            </Link>
            <Link href="/demo" className="hover:text-[#1C1917]">
              Live Demo
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1C1917]"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
