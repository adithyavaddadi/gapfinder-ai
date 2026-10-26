# GapFinder AI - Technical Architecture & Engineering Specification

## 1. Executive Architecture Overview

GapFinder AI transforms raw academic course documents (syllabi, lecture notes, textbook chapters, past papers) into a personalized diagnostic revision engine.

Unlike generic "chat-with-PDF" applications that wait for students to ask questions, GapFinder AI **proactively diagnoses knowledge gaps before exams do**, deterministically scores assessments against verified answer keys, and adapts a time-budgeted revision plan.

```mermaid
graph TD
  User([Student / Evaluator]) -->|Uploads PDF / TXT| UploadEndpoint[/api/documents/upload]
  UploadEndpoint --> Storage[(Supabase Storage)]
  Storage --> Parser[PDF & Text Parser]
  Parser --> Chunker[Semantic Paragraph Chunker]
  Chunker --> Embedder[Gemini Embedding 001 - 768 dim]
  Embedder --> VectorDB[(Postgres pgvector - HNSW)]

  User -->|Requests Diagnostic| QuizEngine[Quiz Generation Engine]
  VectorDB -->|User-Isolated match_chunks| QuizEngine
  QuizEngine -->|Passage Grounding| QualityVerifier[LLM Verifier Pass]
  QualityVerifier -->|Persist Quiz - Key Masked| QuizDB[(Supabase DB)]

  User -->|Submits A/B/C/D + Confidence| ScoringEngine[/api/quizzes/id/submit]
  ScoringEngine -->|Deterministic Key Match| MasteryEngine[Mastery Engine]
  MasteryEngine -->|Updates| TopicMastery[(topic_mastery & history)]
  TopicMastery --> Planner[Revision Planner P = 0.4W + 0.25I + 0.2U + 0.15D]
  Planner --> Schedule[Daily Time-Block Schedule]
```

---

## 2. Ingestion & RAG Pipeline Specification

### 2.1 Extraction & Validation
- **Accepted Formats**: Digital `.pdf`, `.txt`.
- **Validation**: Strict MIME type checking, size cap (<10MB), and user ownership.
- **Scanned PDF Rejection**: If text extraction returns empty or <50 characters, the document is immediately marked as `failed` with `"Scanned PDF: OCR not supported"` rather than falsely claiming readiness.

### 2.2 Semantic Chunking
- Chunks are segmented along section headings, Roman numerals, and paragraph boundaries (~800 characters target, 100 character sliding overlap).
- Every chunk is stamped with strict metadata:
  ```json
  {
    "document_id": "uuid",
    "user_id": "uuid",
    "filename": "DBMS_Normalization_Theory.txt",
    "page_number": 1,
    "heading": "8.4 Boyce-Codd Normal Form (BCNF)",
    "char_length": 780
  }
  ```

### 2.3 Vector Embedding & pgvector Indexing
- **Model**: `gemini-embedding-001` with explicit `outputDimensionality: 768`.
- **Postgres Column**: `VECTOR(768)` in table `document_chunks`.
- **Index**: HNSW (`vector_cosine_ops`) for sub-millisecond approximate nearest neighbor lookup.
- **Strict Row Isolation**: Vector queries execute via a `SECURITY DEFINER` function `match_chunks`:
  ```sql
  WHERE dc.user_id = match_user_id AND dc.embedding IS NOT NULL
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
  ```

### 2.4 Citation Provenance Validator
Every AI response or question generation must return the exact `source_chunk_ids` utilized.
Before rendering or persisting, the citation validator verifies that every cited chunk was present in the retrieved set. Any hallucinated chunk IDs are rejected and dropped.

---

## 3. Clear Separation of AI Responsibilities

| Responsibility | Component | Implementation |
| :--- | :--- | :--- |
| **Document Retrieval** | Vector Search | Deterministic Postgres cosine distance (`match_chunks`) |
| **Question Formulation** | Generative LLM | `gemma-4-26b-a4b-it` / `gemini-3.8-flash` with strict grounding prompt |
| **Quality Audit Gate** | Verifier LLM | Second independent pass checking single defensible option & distractor quality |
| **Assessment Scoring** | Server-Side Logic | **100% Deterministic Code** against stored `correct_option_index`. The LLM never decides score correctness. |
| **Mastery Diagnosis** | Mastery Engine | Mathematical accuracy threshold: Weak (<60%), Medium (60-79%), Strong (>=80%) |
| **Revision Prioritization** | Planner Algorithm | Formula: `P = 0.40W + 0.25I + 0.20U + 0.15D` |

---

## 4. Revision Priority Algorithm

The daily revision scheduler allocates tasks according to the priority score $P$:

$$P = 0.40W + 0.25I + 0.20U + 0.15D$$

Where all variables are normalized between $0$ and $100$:
- **$W$ (Weakness Score)**: $100 - \text{accuracy percentage}$.
- **$I$ (Syllabus Importance)**: Weighted syllabus importance or neutral $50$.
- **$U$ (Exam Urgency)**: Calculated from target exam date ($\le 3$ days: 100, $\le 7$ days: 90, $\le 14$ days: 75, $\le 30$ days: 60, $> 30$ days: 35). If no exam date is provided, $U$ strictly defaults to **neutral $50$** (never inventing artificial urgency).
- **$D$ (Prerequisite Dependency)**: $90$ if other topics depend on this as a prerequisite; $30$ if terminal leaf topic.

---

## 5. Security & Boundary Architecture
1. **Server-Side Authentication**: Every API route enforces `getUser()` through `@supabase/ssr`.
2. **Foreign ID Redaction**: Access to non-owned resources returns HTTP `404 Not Found` rather than `403 Forbidden` to prevent object enumeration.
3. **Row-Level Security (RLS)**: Enabled across all 14 database tables with `auth.uid() = user_id` policies.
4. **Answer Key Secrecy**: The GET endpoint for quizzes (`/api/quizzes/[id]`) strips `correct_option_index` and `explanation` before payload delivery to the client.
