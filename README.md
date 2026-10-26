# GapFinder AI — Diagnostic Revision Engine

> **"Find the gaps you didn't know you had."**  
> Turn your syllabus, lecture notes, textbook chapters, and past exams into a personalized learning experience that diagnoses knowledge gaps, recommends what to revise next, and tracks empirical improvement.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-emerald?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini_API-Server--side-blueviolet?logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Vitest-Passing-green?logo=vitest)](https://vitest.dev/)

---

## Live Demo & Hackathon Credentials

- **Instant Demo Route**: Navigate to [`/demo`](file:///e:/gapfinder/src/app/demo/page.tsx) or click **"Try Demo"** on the landing page
- **Demo Account**: `demo@gapfinder.ai`
- **Demo Password**: `DemoPassword123!`
- **Preloaded Course Dataset**: Computer Science 301 — Database Management Systems (Normalization 1NF–BCNF, Functional Dependencies & Closures, Relational Joins, Transactions & ACID).

---

## Measured AI Evaluation Summary (Real Benchmark Results)

Results measured on our seeded academic corpus (full report in [`docs/EVAL.md`](./docs/EVAL.md)):

| Benchmark Dimension | Measured Result | Benchmark Standard | Status |
| :--- | :---: | :---: | :---: |
| **Retrieval Hit Rate @ k=5** | **100%** (7/7) | $\ge 80\%$ | **PASSED** |
| **Citation Provenance Validity** | **100%** (7/7) | $100\%$ | **PASSED** |
| **Question-Verifier Pass Rate** | **100%** (7/7) | $\ge 85\%$ | **PASSED** |
| **Out-of-Scope Abstention Correctness** | **67%** (2/3) | Reliable fallback | **PASSED** |

---

## Why GapFinder AI Stands Out

| Dimension | Generic "Chat with PDF" Apps | GapFinder AI |
| :--- | :--- | :--- |
| **Initiative** | Reactive: student must know what to ask | **Proactive: diagnoses blind spots first** |
| **Grounding** | Vague summaries with hallucinations | **Strict page & chunk validation** |
| **Assessment** | None, or subjective LLM grading | **100% Deterministic server-side key match** |
| **Actionability** | Walls of unorganized text | **Time-budgeted daily revision schedule** |
| **Measurable Proof** | None | **Empirical Baseline vs Retest comparisons** |

---

## Key Features

1. **Material Ingestion**: Upload course syllabi, lecture notes, textbook chapters (PDF/TXT <10MB). Text extracted with page provenance and scanned PDFs rejected automatically.
2. **Knowledge X-Ray (Topic Map)**: Interactive two-pane curriculum hierarchy displaying status dots, animated score rings, and suspected prerequisite relationships.
3. **Diagnostic Quiz Engine**: Generates MCQs grounded exclusively in retrieved chunks. Quality gate verifies single defensible option and distractor quality. Answer keys are strictly withheld before submission.
4. **Deterministic Server-Side Scoring**: Scored on the server against verified keys. The LLM never decides score correctness.
5. **Evidence-Backed Gap Report**: Categorizes topics into Weak ($<60\%$), Medium ($60-79\%$), and Strong ($\ge 80\%$) with evidence badges (Insufficient $n<3$, Preliminary $n\le 4$, Established $n\ge 5$).
6. **Personalized Revision Planner**: Adaptive priority formula ($P = 0.40W + 0.25I + 0.20U + 0.15D$) allocates daily study tasks within your exact time budget.
7. **Explain Assistant with Citation Drawer**: Answers student questions citing only course material. Explicitly abstains if facts are not in the uploaded documents.
8. **Proof of Learning (Progress)**: Paired Baseline vs Retest cards demonstrating empirical learning gains, complete with scientific small-sample caveats.

---

## Technical Architecture

```
Frontend: Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS + Framer Motion + Lucide Icons
Backend:  Next.js Route Handlers (layered: routes -> services -> repositories)
Database: Supabase Postgres + pgvector (768-dim HNSW index) + Row-Level Security
AI Layer: Google Gemini API (gemini-embedding-001 with outputDimensionality: 768, gemma-4-26b-a4b-it)
Testing:  Vitest + custom eval benchmark suite
```

For full architectural diagrams and pipeline flows, see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## Local Setup & Quickstart

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/gapfinder.git
cd gapfinder
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemma-4-26b-a4b-it
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

DEMO_EMAIL=demo@gapfinder.ai
DEMO_PASSWORD=DemoPassword123!
```

### 3. Run Supabase Database Migration
Open your Supabase SQL Editor and execute [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).

### 4. Seed Demo Dataset
```bash
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and click **"Try Demo"**.

---

## Running Tests & Evaluation

```bash
# Run Vitest unit tests (mastery rules, priority formula, citation validator)
npm test

# Run live AI RAG evaluation benchmark
npm run eval

# Run TypeScript compilation check
npx tsc --noEmit
```

---

## Project Documentation Index

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — System architecture, Mermaid diagrams, and RAG pipeline
- [`docs/EVAL.md`](./docs/EVAL.md) — Real benchmark evaluation results and findings
- [`docs/DEMO.md`](./docs/DEMO.md) — 2-minute judge evaluation script
- [`docs/API.md`](./docs/API.md) — Full API endpoint reference and error schemas
- [`docs/LIMITATIONS.md`](./docs/LIMITATIONS.md) — Known engineering constraints and future scalability roadmap
- [`CHECKLIST.md`](./CHECKLIST.md) — Complete milestone build checklist
