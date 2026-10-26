# GapFinder AI - Master Build Checklist

## Project Status: Completed & Verified
**Target Deadline**: Today 3 PM Hackathon Submission
**Stack**: Next.js App Router (TypeScript strict), Tailwind CSS (Light Theme only, Violet #7C3AED accent, No Blue, No Dark Mode), Supabase (Postgres + pgvector 768 + Auth + Storage), Gemini API (server-side only), Zod, Vitest.

---

### Step 1: Foundation & Auth & Design System
- [x] Initialize Next.js project with TypeScript, Tailwind CSS, ESLint
- [x] Configure light design system in `globals.css` (Background `#FAF9F6`, Cards `#FFFFFF`, Border `#E7E5E4`, Text `#1C1917`, Accent Violet `#7C3AED`, Status Green `#16A34A` / Amber `#D97706` / Red `#DC2626` / Stone `#A8A29E`)
- [x] Install dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `lucide-react`, `framer-motion`, `recharts`, `clsx`, `tailwind-merge`, `@google/genai`, `pdf-parse`, `vitest`
- [x] Create Supabase migration script `supabase/migrations/001_initial_schema.sql` (profiles, documents, document_chunks with pgvector 768, topics, topic_prerequisites, questions, quizzes, quiz_attempts, quiz_responses, topic_mastery, mastery_history, revision_plans, revision_tasks, audit_events, RLS policies, match_chunks SQL function)
- [x] Build shared component library: Button, Card, Badge, Modal, Drawer, Tabs, Skeleton, Toast, EmptyState, ProgressBar, ScoreRing
- [x] Build App Shell (Sidebar navigation, topbar with breadcrumbs & Next Best Action, Demo banner)
- [x] Build Landing Page (Hero, How It Works, Features, Gap Diagnosis vs Chat comparison, CTA)
- [x] Build Auth pages (Sign In, Sign Up, Instant Demo entry route)
- [x] Build Supabase auth middleware & server-side auth verification helpers
- [x] Supabase project URL, Anon Key, and Service-Role Key configured and verified

### Step 2: Ingestion & Real RAG Pipeline
- [x] AI provider wrapper `src/lib/ai/provider.ts` (Gemini gemini-embedding-001 768-dim, gemma-4-26b-a4b-it chat model, retry backoff, timeouts)
- [x] PDF & TXT parser utility (text extraction, page numbering, scanned PDF detection)
- [x] Document chunker (headings/paragraphs, ~800 chars, ~100 overlap, rich metadata)
- [x] Upload API & processing pipeline (`/api/documents/upload`, `/api/documents/[id]/process`, private storage, status tracking)
- [x] Vector similarity search (`match_chunks` function caller with user_id enforcement)
- [x] Citation validator & anti-hallucination / injection guardrails

### Step 3: Topic Map (Knowledge X-Ray)
- [x] Topic extraction prompt & hierarchy generation from syllabus/material
- [x] Topic map store/service with CRUD (add, rename, delete, re-parent)
- [x] Topic Map UI: 2-pane Knowledge X-Ray (left: collapsible tree with status dots; right: detail panel with score ring, missed concepts, cited passages, action buttons)

### Step 4: Diagnostic Quiz Generation & Deterministic Scoring
- [x] MCQ question generation strictly from retrieved chunks with citations
- [x] LLM verifier pass (checks support in cited chunks, single defensible answer, quality distractors)
- [x] Quiz storage & retrieval API (answer key NEVER sent to client before submission)
- [x] Diagnostic Quiz UI: Distraction-free, progress bar, options A/B/C/D keyboard shortcuts, 1-5 confidence rating, save & resume
- [x] Deterministic server-side submit endpoint (`/api/quizzes/[id]/submit` - scored against stored key, never trusting client)
- [x] Quiz Results UI (score, per-topic breakdown, sliding explanation drawer with citations)

### Step 5: Mastery Calculation & Evidence-Backed Gap Report
- [x] Mastery engine (`src/lib/assessment/mastery.ts`): Weak <60%, Medium 60-79%, Strong >=80%
- [x] Evidence sufficiency rules (<3 questions: Insufficient, 3-4: Preliminary, 5+: Established)
- [x] Topic mastery persistence & `mastery_history` tracking
- [x] Gap Report UI: Segmented bar, sortable/filterable cards, evidence badges, "Why this rating", missed concepts, citation explorer, prerequisite warnings

### Step 6: Personalized Revision Planner
- [x] Priority algorithm: `P = 0.40W + 0.25I + 0.20U + 0.15D`
- [x] Schedule generator respecting daily time budget (hours/day, exam date, learning mode)
- [x] Revision plan API & versioning
- [x] Revision Plan UI: Day/week time-block cards, completable/skippable/reorderable tasks, daily budget meter, priority list view

### Step 7: Grounded Explain-This-Topic & Class Brief
- [x] RAG-powered Explain Assistant strictly citing user material (explicit abstention if insufficient)
- [x] Explain-This-Topic UI: Chat layout, topic picker, citation drawer, "Give an example" & "Quiz me" quick chips
- [x] Class Brief generator (key definitions & concepts with citations + "Test me" action)

### Step 8: Progress Dashboard & Retest Workflow
- [x] Retest diagnostic quiz generator (new questions for assessed topics)
- [x] Baseline vs Retest comparison engine & UI
- [x] Dashboard UI: "Your next best step" card, real stat cards, weakest topics list, today's revision tasks, recent activity
- [x] Empty states for new users ("Take your first diagnostic")

### Step 9: Realistic DBMS Demo Dataset & Seed Script
- [x] Created real DBMS study materials: Functional Dependencies, Normalization (1NF-BCNF), SQL Joins, Transactions/ACID
- [x] Seed script (`scripts/seed.ts`): processes real documents through real pipeline, embeds real chunks, seeds baseline quiz with realistic errors in Normalization/FD, generates Gap Report, Plan, and Retest
- [x] One-click "Try Demo" login flow verified

### Step 10: Security, RLS & Verification
- [x] Strict RLS policies verified on all 14 tables
- [x] API ownership validation (return 404 on foreign IDs)
- [x] Private Supabase Storage bucket access
- [x] Sanitization & zero secret leakage audit (secrets only in `.env.local`, `.env.example` safe)
- [x] Unit tests in `tests/security.test.ts` passing (4/4)

### Step 11: Automated Tests & AI Evaluation
- [x] Vitest test suite running and passing (`npm test`)
- [x] Evaluation script `scripts/eval.ts` executed with real benchmarks:
  - Retrieval Hit Rate @ k=5: 100% (7/7)
  - Citation Provenance Validity: 100% (7/7)
  - Question-Verifier Pass Rate: 100% (7/7)
  - Out-of-Scope Abstention: 67% (2/3)
- [x] Generated `docs/EVAL.md` with real run numbers

### Step 12: Documentation, Final Polish & Deployment
- [x] Build `docs/ARCHITECTURE.md` with Mermaid diagrams & pipeline details
- [x] Build `docs/API.md`, `docs/LIMITATIONS.md`, `docs/DEMO.md`
- [x] Comprehensive README with setup guide, demo credentials, and walkthrough
- [x] Visual QA verified across viewports
- [x] Production build validation (`next build` / `tsc --noEmit`)
