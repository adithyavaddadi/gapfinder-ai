# GapFinder AI - Known Limitations & Future Roadmap

## Current Engineering Limitations

1. **Scanned PDF Text Extraction (No OCR)**
   - GapFinder AI extracts digital, selectable text from PDF and TXT files.
   - If an uploaded PDF contains purely scanned bitmap images with no searchable text layer, the system rejects it with an explicit error: `"Scanned PDF: OCR not supported"` rather than pretending the document was indexed.
   - *Rationale*: Running heavy OCR models in serverless functions introduces latency bottlenecks and high error rates. Students are advised to upload original digital lecture slides or textbooks.

2. **Heuristic Mastery Thresholds**
   - Topic mastery scores currently map to fixed empirical thresholds:
     - **Weak**: $< 60\%$
     - **Medium**: $60\% - 79\%$
     - **Strong**: $\ge 80\%$
   - *Caveat*: These thresholds represent starting pedagogical heuristics. While effective for diagnostic sorting, individual syllabus difficulty may vary.

3. **Sample-Size Sufficiency (Small $n$ Caveat)**
   - When a topic has fewer than 3 questions attempted, the evidence badge is strictly labeled **Insufficient Evidence**.
   - With 3–4 questions, it is labeled **Preliminary Evidence**.
   - With 5+ questions, it is labeled **Established Evidence**.
   - *Principle*: GapFinder explicitly warns students against over-interpreting high scores on 1 or 2 narrow questions.

4. **Deterministic Correctness vs. Generative Ambiguity**
   - While questions and distractors are generated with RAG grounding, scoring is 100% deterministic against the server-stored answer key. The LLM is never allowed to subjectively "grade" multiple choice answers.

---

## Future Scalability & Roadmap

1. **Class-Level Analytics for Educators**
   - Aggregate topic weakness heatmaps across an entire cohort of students, enabling professors to adjust lecture time toward topics where the class struggles most.

2. **Parent & Advisor Progress Portals**
   - Read-only progress dashboards tracking revision adherence and measurable diagnostic improvement over time.

3. **Spaced Repetition & Adaptive Retention Reminders**
   - Automated email/push triggers reminding students to take a 2-minute verification check on topics diagnosed as "Strong" 14 days prior, preventing Ebbinghaus forgetting curve decay.

4. **Learning Management System (LMS) Integration**
   - LTI 1.3 standards integration for Canvas, Blackboard, and Moodle to sync course syllabi and gradebook diagnostic milestones directly.

5. **Multi-Language Curriculum Support**
   - Native support for multilingual syllabi and regional exam standards.
