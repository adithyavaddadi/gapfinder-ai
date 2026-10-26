# GapFinder AI - Master Build Checklist

## Project Status: In Progress
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
- [ ] **AWAITING USER INPUT**: Supabase URL, Anon Key, and Service-Role Key (plus Gemini API Key & Demo credentials)

### Step 2: Ingestion & Real RAG Pipeline
- [ ] AI provider wrapper `src/lib/ai/provider.ts` (Gemini text-embedding-004 768-dim, Gemini 1.5/2.5 Flash chat models, retry backoff, timeouts)
- [ ] PDF & TXT parser utility (text extraction, page numbering, scanned PDF detection)
- [ ] Document chunker (headings/paragraphs, ~800 chars, ~100 overlap, rich metadata)
- [ ] Upload API & processing pipeline (`/api/documents/upload`, `/api/documents/[id]/process`, private storage, status tracking)
- [ ] Vector similarity search (`match_chunks` function caller with user_id enforcement)
- [ ] Citation validator & anti-hallucination / injection guardrails

### Step 3: Topic Map (Knowledge X-Ray)
- [ ] Topic extraction prompt & hierarchy generation from syllabus/material
- [ ] Topic map store/service with CRUD (add, rename, delete, re-parent)
- [ ] Topic Map UI: 2-pane Knowledge X-Ray (left: collapsible tree with status dots; right: detail panel with score ring, missed concepts, cited passages, action buttons)

### Step 4: Diagnostic Quiz Generation & Deterministic Scoring
- [ ] MCQ question generation strictly from retrieved chunks with citations
- [ ] LLM verifier pass (checks support in cited chunks, single defensible answer, quality distractors)
- [ ] Quiz storage & retrieval API (answer key NEVER sent to client before submission)
- [ ] Diagnostic Quiz UI: Distraction-free, progress bar, options A/B/C/D keyboard shortcuts, 1-5 confidence rating, save & resume
- [ ] Deterministic server-side submit endpoint (`/api/quizzes/[id]/submit` - scored against stored key, never trusting client)
- [ ] Quiz Results UI (score, per-topic breakdown, sliding explanation drawer with citations)

### Step 5: Mastery Calculation & Evidence-Backed Gap Report
- [ ] Mastery engine (`src/lib/assessment/mastery.ts`): Weak <60%, Medium 60-79%, Strong >=80%
- [ ] Evidence sufficiency rules (<3 questions: Insufficient, 3-4: Preliminary, 5+: Established)
- [ ] Topic mastery persistence & `mastery_history` tracking
- [ ] Gap Report UI: Segmented bar, sortable/filterable cards, evidence badges, "Why this rating", missed concepts, citation explorer, prerequisite warnings

### Step 6: Personalized Revision Planner
- [ ] Priority algorithm: `P = 0.40W + 0.25I + 0.20U + 0.15D`
- [ ] Schedule generator respecting daily time budget (hours/day, exam date, learning mode)
- [ ] Revision plan API & versioning
- [ ] Revision Plan UI: Day/week time-block cards, completable/skippable/reorderable tasks, daily budget meter, priority list view

### Step 7: Grounded Explain-This-Topic & Class Brief
- [ ] RAG-powered Explain Assistant strictly citing user material (explicit abstention if insufficient)
- [ ] Explain-This-Topic UI: Chat layout, topic picker, citation drawer, "Give an example" & "Quiz me" quick chips
- [ ] Class Brief generator (key definitions & concepts with citations + "Test me" action)

### Step 8: Progress Dashboard & Retest Workflow
- [ ] Retest diagnostic quiz generator (new questions for assessed topics)
- [ ] Baseline vs Retest comparison engine & UI
- [ ] Dashboard UI: "Your next best step" card, real stat cards, weakest topics list, today's revision tasks, recent activity
- [ ] Empty states for new users ("Take your first diagnostic")

### Step 9: Realistic DBMS Demo Dataset & Seed Script
- [ ] Create real DBMS study materials: Functional Dependencies, Normalization (1NF-BCNF), SQL Joins, Transactions/ACID
- [ ] Seed script (`scripts/seed.ts`): processes real documents through real pipeline, embeds real chunks, seeds baseline quiz with realistic errors in Normalization/FD, generates Gap Report, Plan, and Retest
- [ ] One-click "Try Demo" login flow

### Step 10: Security, RLS & Verification
- [ ] Strict RLS policies verification on all tables
- [ ] API ownership validation (return 404 on foreign IDs)
- [ ] Private Supabase Storage bucket access
- [ ] Sanitization & zero secret leakage audit

### Step 11: Automated Tests & AI Evaluation
- [ ] Setup Vitest with unit tests (mastery calculation, priority formula, citation validator, Zod schemas)
- [ ] Integration tests (scoring, auth boundaries)
- [ ] Evaluation script `scripts/eval.ts` measuring hit rate@k, citation validity, verifier pass rate, abstention correctness
- [ ] Generate `docs/EVAL.md` with real run numbers

### Step 12: Documentation, Final Polish & Deployment
- [ ] Build `docs/ARCHITECTURE.md` with Mermaid diagrams & pipeline details
- [ ] Build `docs/API.md`, `docs/LIMITATIONS.md`, `docs/DEMO.md`
- [ ] Comprehensive README with setup guide, demo credentials, screenshot placeholders
- [ ] Visual QA pass at 375px, 768px, 1280px (fix top 10 UI issues)
- [ ] Final verification & honest summary report
