# GapFinder AI - API Documentation

All routes require server-side session authentication unless explicitly marked as public. Unauthenticated requests return HTTP 401 Unauthorized. Accessing non-owned resources returns HTTP 404 Not Found to prevent ID enumeration.

---

## 1. Authentication & Demo

### `POST /api/demo/login`
- **Description**: Authenticates or provisions the demo evaluator user (`demo@gapfinder.ai`).
- **Auth**: Public
- **Response**:
  ```json
  {
    "success": true,
    "user": { "id": "uuid", "email": "demo@gapfinder.ai" }
  }
  ```

---

## 2. Course Materials & Processing

### `GET /api/documents`
- **Description**: Lists all uploaded documents for the authenticated user.
- **Response**:
  ```json
  {
    "documents": [
      {
        "id": "uuid",
        "title": "DBMS Normalization Theory",
        "filename": "DBMS_Normalization_Theory.txt",
        "file_type": "textbook",
        "status": "ready",
        "page_count": 3,
        "chunk_count": 5
      }
    ]
  }
  ```

### `POST /api/documents/upload`
- **Description**: Uploads a PDF or TXT course document (<10MB).
- **Body**: `multipart/form-data` with `file`, `title`, `file_type`.
- **Response**: `{ "success": true, "document": { ... } }`

### `POST /api/documents/[id]/process`
- **Description**: Triggers text extraction, scanned PDF detection, chunking, and batch embedding.
- **Response**:
  ```json
  {
    "success": true,
    "documentId": "uuid",
    "pageCount": 3,
    "chunkCount": 5
  }
  ```

---

## 3. Curriculum & Knowledge X-Ray

### `GET /api/topics`
- **Description**: Returns curriculum topics enriched with diagnostic mastery and prerequisites.
- **Response**: `{ "topics": [...] }`

### `POST /api/topics/generate`
- **Description**: Uses Gemini to extract a hierarchical topic tree and suspected prerequisites from uploaded material chunks.
- **Response**: `{ "success": true, "curriculumTitle": "Database Systems", "topicCount": 6 }`

### `POST /api/topics`
- **Description**: Creates a custom topic manually.
- **Body**: `{ "title": "string", "description": "string", "parent_id": "uuid" }`

### `PATCH /api/topics/[id]`
- **Description**: Renames, updates description, or re-parents a topic.

### `DELETE /api/topics/[id]`
- **Description**: Deletes a topic and cascades child items.

---

## 4. Grounded Diagnostic Quizzes

### `POST /api/quizzes/generate`
- **Description**: Generates verified MCQs strictly from retrieved chunks with citations.
- **Body**: `{ "topicId": "uuid", "questionCount": 3 }`
- **Response**: `{ "success": true, "quizId": "uuid", "questionsCount": 3 }`

### `GET /api/quizzes/[id]`
- **Description**: Returns quiz questions for student distraction-free mode.
- **Security**: Answer keys (`correct_option_index`, `explanation`) are strictly removed.
- **Response**:
  ```json
  {
    "quiz": {
      "id": "uuid",
      "title": "Diagnostic: Relational Normalization",
      "questions": [
        {
          "id": "uuid",
          "question_text": "Which normal form guarantees...",
          "options": ["A", "B", "C", "D"],
          "difficulty": "medium"
        }
      ]
    }
  }
  ```

### `POST /api/quizzes/[id]/submit`
- **Description**: Server-side deterministic scoring against stored keys, mastery update, and citation return.
- **Body**:
  ```json
  {
    "responses": [
      {
        "question_id": "uuid",
        "selected_option_index": 1,
        "confidence_level": 5
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "score": { "total": 3, "correct": 2, "percentage": 67 },
    "results": [
      {
        "questionId": "uuid",
        "isCorrect": true,
        "correctOptionIndex": 1,
        "explanation": "...",
        "confidenceSignal": { "type": "solid_mastery", "message": "..." },
        "citations": [{ "filename": "...", "pageNumber": 1, "passage": "..." }]
      }
    ]
  }
  ```

---

## 5. Revision Planning & Diagnosis

### `GET /api/gap-report`
- **Description**: Returns aggregated curriculum mastery counts, topic ratings, why-rating rationales, and cited evidence excerpts.

### `GET /api/revision-plans`
- **Description**: Fetches the active revision plan and daily tasks grouped by day.

### `POST /api/revision-plans/generate`
- **Description**: Calculates priority scores ($P = 0.40W + 0.25I + 0.20U + 0.15D$) and creates time-budgeted daily tasks.
- **Body**: `{ "dailyHours": 2.0, "examDate": "2026-11-15", "learningMode": "balanced" }`

### `PATCH /api/revision-tasks/[id]`
- **Description**: Marks task as `completed`, `skipped`, or `pending`.

### `POST /api/explain`
- **Description**: RAG-powered assistant answering questions strictly grounded in user materials with citations or explicit abstention.
- **Body**: `{ "query": "string", "topicTitle": "string", "mode": "explain" }`
