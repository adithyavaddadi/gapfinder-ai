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
  Flame,
  Zap,
  Target,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#121316] selection:bg-[#121316] selection:text-white">
      {/* 1. STICKY TOP-MIDDLE TRANSLUCENT NAVBAR */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl bg-[#F9F8F5]/85 border-b border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#121316] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              G
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#121316] block leading-none">
                GapFinder AI
              </span>
              <span className="text-[9px] text-[#736E66] font-mono uppercase tracking-wider block mt-0.5">
                Diagnostic Revision Engine
              </span>
            </div>
          </Link>

          {/* TOP MIDDLE FLOATING PILL MENU */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 border border-[#E8E5DF] shadow-xs backdrop-blur-xl">
            <a href="#how-it-works" className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#5A554E] hover:text-[#121316] hover:bg-[#F2EFEB] transition-all">
              How It Works
            </a>
            <a href="#features" className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#5A554E] hover:text-[#121316] hover:bg-[#F2EFEB] transition-all">
              Knowledge X-Ray
            </a>
            <a href="#comparison" className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#5A554E] hover:text-[#121316] hover:bg-[#F2EFEB] transition-all">
              Why GapFinder
            </a>
            <Link href="/demo" className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#F2EFEB] text-[#121316] hover:bg-[#E8E5DF] transition-all flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#121316]" />
              <span>Sample DBMS Data</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs text-[#5A554E] hover:text-[#121316]">
                Sign In
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="sm" className="text-xs font-semibold shadow-xs">
                <span>Try Live Demo</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2EFEB] border border-[#E8E5DF] text-[#121316] text-xs font-bold mb-8 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#121316]" />
            <span>The Diagnostic Engine for Precision Academic Revision</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#121316] leading-[1.08] mb-6">
            Find the gaps you{" "}
            <span className="italic underline decoration-[#D5D1C8] decoration-wavy decoration-2">
              didn't know
            </span>{" "}
            you had.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#5A554E] max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            Turn your own syllabus, lecture notes, and textbook chapters into an objective diagnostic engine.
            We pinpoint exact topic blindspots, schedule what to revise first, and prove your empirical gains.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-16">
            <Link href="/demo" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-md font-bold py-3 px-8 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Launch Demo (Preloaded DBMS)
              </Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-sm font-semibold py-3 px-8">
                Start With Custom Material
              </Button>
            </Link>
          </div>

          {/* 3. APPLE LIQUID GLASS MOCKUP */}
          <div className="relative rounded-3xl p-[1px] bg-[#E8E5DF] shadow-xl max-w-4xl mx-auto text-left overflow-hidden">
            <div className="rounded-[23px] bg-white/90 backdrop-blur-2xl p-6 sm:p-8">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DF] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-[#736E66] ml-2">
                    GapFinder AI • Knowledge X-Ray & Grounded Diagnostic
                  </span>
                </div>
                <Badge variant="ai" label="Verified Provenance Grounded" />
              </div>

              {/* Mock Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 Cols: Diagnosed Topic Cards */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#736E66]">
                      Syllabus Topic Map (CS 301: Database Management Systems)
                    </h4>
                    <span className="text-xs text-[#121316] font-mono font-semibold">4 topics assessed</span>
                  </div>

                  {/* Card 1: Normalization (Weak) */}
                  <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-[#121316]">
                          1.2 Normalization (2NF, 3NF, BCNF)
                        </span>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                          Weak • 33% accuracy • Prerequisite loss of Dependency Preservation
                        </p>
                      </div>
                    </div>
                    <Badge variant="weak" label="Weak" />
                  </div>

                  {/* Card 2: Functional Dependencies (Medium) */}
                  <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-[#121316]">
                          1.1 Functional Dependencies & Closures
                        </span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Medium • 66% accuracy • Suspected root prerequisite for 1.2
                        </p>
                      </div>
                    </div>
                    <Badge variant="medium" label="Medium" />
                  </div>

                  {/* Card 3: Relational Algebra (Strong) */}
                  <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-[#121316]">
                          2.1 Relational Algebra & Joins
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Strong • 100% accuracy • Established Verified Mastery
                        </p>
                      </div>
                    </div>
                    <Badge variant="strong" label="Strong" />
                  </div>
                </div>

                {/* Right Col: Algorithmic Next Step */}
                <div className="p-5 rounded-2xl border border-[#E8E5DF] bg-[#FBF9F5] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#121316] font-bold text-xs mb-2">
                      <Zap className="w-4 h-4 text-[#121316]" />
                      <span>Next Best Step</span>
                    </div>
                    <h5 className="text-sm font-bold text-[#121316] mb-1">
                      Revise Functional Dependencies
                    </h5>
                    <p className="text-xs text-[#5A554E] leading-relaxed mb-4">
                      BCNF decomposition failed because attribute closure rules were missed. Master this prerequisite first.
                    </p>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-[11px] text-[#736E66]">
                        <span>Algorithmic Priority</span>
                        <span className="font-bold text-[#121316] font-mono">86 / 100</span>
                      </div>
                      <ProgressBar value={86} size="sm" variant="primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-white border border-[#E8E5DF] text-xs">
                      <span className="font-bold text-[#121316] block mb-0.5">Cited Textbook p.48:</span>
                      <span className="text-[#5A554E] italic line-clamp-2 text-[11px]">
                        "A relation is in BCNF if for every non-trivial dependency X → Y, X is a superkey..."
                      </span>
                    </div>
                    <Link href="/demo">
                      <Button size="sm" className="w-full text-xs font-semibold py-2">
                        Start 25m Practice Task
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-[#E8E5DF]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold text-[#736E66] tracking-wider">
            Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121316] tracking-tight mt-2 mb-3">
            How GapFinder AI Works
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] leading-relaxed">
            From raw course documents to proven mastery. An end-to-end diagnostic pipeline grounded in rigorous academic retrieval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#121316] text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-[#121316]">Syllabus Ingestion</h3>
            <p className="text-xs text-[#5A554E] leading-relaxed">
              Upload PDF or TXT syllabus, textbook chapters, or lecture notes. Documents are parsed and indexed with 768-dim semantic chunk vectors.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#121316] text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-[#121316]">Knowledge X-Ray</h3>
            <p className="text-xs text-[#5A554E] leading-relaxed">
              Extracts topic hierarchies and maps suspected prerequisite dependencies between foundational and advanced concepts.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#121316] text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-[#121316]">Diagnostic Scoring</h3>
            <p className="text-xs text-[#5A554E] leading-relaxed">
              Delivers citation-grounded MCQs. Evaluates responses deterministically server-side with confidence signals to isolate root errors.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#121316] text-white flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="text-base font-bold text-[#121316]">Adaptive Revision</h3>
            <p className="text-xs text-[#5A554E] leading-relaxed">
              Schedules time-budgeted daily revision tasks prioritizing weaknesses. Measures empirical deltas when retests are completed.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 px-6 border-t border-[#E8E5DF] text-center text-xs text-[#736E66]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#121316] flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <span className="font-bold text-[#121316]">GapFinder AI</span>
            <span className="text-[10px] text-[#736E66]">• Provenance-Grounded Diagnostic Revision</span>
          </div>
          <div>
            Built with Next.js App Router, Supabase pgvector, and Google Gemini AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
