# GapFinder AI — User Guide & Testing Walkthrough

> **Live Application URL:** [https://gapfinder-ai-kappa.vercel.app](https://gapfinder-ai-kappa.vercel.app)  
> **Source Repository:** [https://github.com/adithyavaddadi/gapfinder-ai](https://github.com/adithyavaddadi/gapfinder-ai)  
> **Tagline:** *"Find what you don't know you don't know."*

---

## 1. Quick Access & Credentials

You can test the application immediately with zero setup:

| Method | Instructions |
|---|---|
| **⚡ 1-Click Demo (Fastest)** | Open [gapfinder-ai-kappa.vercel.app](https://gapfinder-ai-kappa.vercel.app) and click **"⚡ Instant Demo Access (1-Click Login)"**. |
| **Demo Credentials** | **Email:** `demo@gapfinder.app`<br>**Password:** `Demo@1234`<br>Click **"Sign In to Dashboard"**. |
| **New Account** | Enter any email and password and click **"Create New Student Account"** — accounts are confirmed automatically with no email delays. |

---

## 2. Step-by-Step Feature Walkthrough

### Step 1: Study Vault & Syllabus Intelligence (Tab 1: Materials)
1. In the left sidebar, click **Materials**.
2. Notice the pre-loaded **Database Management Systems (CS301)** curriculum:
   - `DBMS syllabus.txt` (Structured course syllabus)
   - `DBMS notes.txt` (Comprehensive lecture study notes)
3. Click the green button **"Read Course Brief"** on the banner:
   - A modal opens displaying the **Executive Syllabus Brief**: Course overview, prerequisites, unit breakdown, key invariant principles, and common exam pitfalls.
4. Click on any document card (e.g. `DBMS notes.txt`):
   - Opens the **Document Inspection Modal** showing exact text content, paragraph sections (§1, §2), and extracted topic tags.
5. *(Optional)* Use the upload form at the bottom to upload any `.txt`, `.md`, or `.pdf` file.

---

### Step 2: Interactive Prerequisite Knowledge Graph (Tab 2: Topic Map)
1. In the sidebar, click **Topic Map**.
2. Toggle between **"Visual Topology Graph"** and **"Structured Cards"**:
   - In **Graph mode**: You will see an interconnected dependency flow connecting prerequisites (e.g., *Relational Model* $\to$ *Normalization* $\to$ *Transaction ACID* $\to$ *Concurrency & Recovery*).
   - In **Cards mode**: You will see unit-level breakdowns with status badges (`🟢 Mastered`, `🔴 Weak Gap`, `🟣 Developing`, or `⚪ Untested`).
3. Click on any topic card to view its study focus and targeted concept highlights.

---

### Step 3: Diagnostic Testing (Tab 3: Diagnostic Quiz)
1. Click **Diagnostic Quiz** in the sidebar.
2. Filter by topic or select **"All Topics"**. Select question count (e.g., 5 or 10 questions).
3. Click **"Generate Diagnostic Test"**:
   - Questions are generated with source citations and quotes from your course material.
4. Answer the multiple-choice questions:
   - Intentionally pick some correct answers and some incorrect answers to observe the gap diagnosis engine.
5. Click **"Submit & Audit Gaps"**:
   - Instant score calculation with immediate color-coded feedback.
   - Explanations display the exact supporting excerpt and document reference.

---

### Step 4: Auditable Gap Report (Tab 4: Gap Report)
1. Click **Gap Report** in the sidebar.
2. View the deterministic breakdown:
   - **Weak Areas (< 50% accuracy):** Flagged with priority action alerts and a list of missed questions.
   - **Developing / Medium Areas (50% – 79%):** Recommended for targeted practice.
   - **Strong Mastery ($\ge$ 80%):** Verified areas requiring only periodic mock checks.
3. Click **"Review Notes"** next to any weak topic to jump directly to its syllabus notes.

---

### Step 5: Adaptive Revision Planner (Tab 5: Revision Plan)
1. Click **Revision Plan** in the sidebar.
2. Choose your protocol:
   - **Exam Countdown Protocol:** Enter your target exam date (e.g., 7 days from now) and daily study hours (e.g., 2 hrs/day).
   - **Paced Mastery Protocol:** Set total study days and hours.
3. Click **"Generate Study Schedule"**:
   - The engine generates an adaptive day-by-day revision timetable.
   - Weak topics are automatically assigned **60% of total study minutes**, medium topics **30%**, and strong topics **10%**.
4. Check off daily cards as you complete them to watch your **Plan Progress** percentage advance.

---

### Step 6: Grounded AI Tutor (Tab 6: Ask AI Tutor)
1. Click **Ask AI Tutor** in the sidebar.
2. Try asking specific computer science and database questions:
   - *"What is a primary key?"*
   - *"What is a null key?"*
   - *"Explain normalization (1NF to BCNF)"*
   - *"What are ACID properties?"*
   - *"How do B+ Trees optimize indexing?"*
3. Notice that each answer:
   - Provides clear, pedagogical explanations with bullet points.
   - Specifically addresses edge cases (e.g., explaining why a primary key can *never* be null under Entity Integrity).
   - Includes verified citations to course notes (e.g., `Verified in materials: [1] DBMS syllabus.txt §Relational Model & Keys`).

---

### Step 7: Multi-Subject Workspace Management
1. Look at the top navigation bar or the active subject dropdown in the top-left sidebar:
   - Click the **Subject Dropdown** (currently showing `Database Management Systems (CS301)`).
2. Switch to **Operating Systems (CS302)** or **Machine Learning (CS401)**:
   - All materials, topic maps, quizzes, and revision plans adapt immediately to the selected subject.
3. Click the **`+` icon** next to the subject dropdown to add a new custom course (e.g. *"Computer Networks"*, Code: `CS304`).

---

### Step 8: Progress & Cognitive Awards (Tab 7: Progress & Awards)
1. Click **Progress & Awards** in the sidebar.
2. Inspect the **Diagnostic Score History Chart**:
   - Plots your score trajectory across diagnostic attempts.
3. Inspect **Cognitive Achievement Badges**:
   - **Diagnostic Pioneer (Scout):** Unlocked on first test attempt.
   - **Gap Hunter:** Unlocked when identifying your first weak topic.
   - **Relational Architect:** Unlocked upon scoring high in database design.
   - **Streak Master & Study Velocity:** Tracks consistency and active study streaks.

---

## 3. Key Architecture & Grading Highlights

| Evaluation Criteria | How GapFinder AI Delivers |
|---|---|
| **Zero Hallucinations** | All quiz questions and tutor responses are strictly grounded in course materials with explicit citations (`[doc §section]`). |
| **Deterministic Diagnosis** | Weak/Medium/Strong ratings are **never guessed by an LLM** — they are computed deterministically in code based on objective question answers. |
| **Adaptive Load Balancing** | Revision time is algorithmically distributed (60% weak, 30% medium, 10% strong) to stop students from wasting time on concepts they already know. |
| **Production Ready** | Built with Next.js 14, Tailwind CSS, high-contrast dark/glassmorphic UI, Supabase authentication, and deployed on Vercel Edge. |
