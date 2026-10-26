# GapFinder AI - 2-Minute Judge Walkthrough Script

**Hackathon Evaluation Demo Credentials**:
- **URL**: [Live Deployment / Local `http://localhost:3000`]
- **Instant Demo Route**: Navigate to `/demo` or click **"Try Demo"** on the landing page
- **Demo Account**: `demo@gapfinder.ai`
- **Demo Password**: `DemoPassword123!`
- **Preloaded Course**: Computer Science 301 — Database Management Systems (Normalization, Dependencies, SQL Joins, ACID)

---

## 2-Minute Judge Walkthrough Path

### Minute 0:00 - 0:20: Instant Entry & Core Differentiator
1. Open the landing page and click **"Try Demo"** (or **"Explore Demo"**).
2. Notice the yellow banner indicating: *"Sample Demo Dataset Active: Grounded on Database Management Systems"*.
3. **Key Differentiator**: Point out that unlike generic "Chat with PDF" apps that wait for students to ask questions, GapFinder AI has already diagnosed where the student stands before they even asked.

### Minute 0:20 - 0:45: The Dashboard & "Next Best Step"
1. Look at the large violet-tinted **"Your Next Best Step"** card:
   - **Why this?**: Diagnosed with low accuracy in *Normalization*.
   - **Why now?**: High-yield exam priority; unblocks prerequisite dependencies.
   - **What next?**: Recommend targeted prerequisite verification.
2. Note the stat cards: real data reflecting topics assessed, weakest topic, and today's planned revision time.

### Minute 0:45 - 1:15: Knowledge X-Ray (Topic Map) & Prerequisite Graph
1. Click **"Topic Map"** in the sidebar.
2. Inspect the collapsible curriculum tree:
   - *Relational Design Theory* contains *Functional Dependencies* and *Normalization*.
   - Click on **"Normalization (1NF, 2NF, 3NF, BCNF)"**.
3. In the right panel, observe the animated score ring, evidence sufficiency badge, and the dashed tag:
   - **Suspected Prerequisite**: *Functional Dependencies & Attribute Closures*.
   - The system recognizes that decomposing into BCNF failed because attribute closure rules weren't mastered.

### Minute 1:15 - 1:40: Evidence-Backed Gap Report & Provenance Drawer
1. Click **"Gap Report"** in the sidebar.
2. Notice the top segmented bar showing curriculum mastery distribution.
3. Find the card for *Normalization*:
   - Read the explicit **"Why this rating"** explanation.
   - Click **"Inspect Cited Source Passages"** and click any excerpt chip.
   - The slide-in drawer opens showing the exact passage from `DBMS_Normalization_Theory.txt` that formed the factual basis for the diagnosis.

### Minute 1:40 - 2:00: Revision Plan & Proof of Learning (Progress)
1. Click **"Revision Plan"**:
   - Observe how the priority algorithm ($P = 0.40W + 0.25I + 0.20U + 0.15D$) scheduled tasks into bite-sized daily time blocks fitting the 2-hour daily budget.
   - Click the checkmark to complete a task; notice the reminder that *only quiz evidence updates mastery*.
2. Click **"Progress"**:
   - See the empirical **Baseline vs. Retest** paired comparison cards.
   - Observe the measured $+47\%$ learning gain on Normalization after targeted revision, with an honest scientific caveat about small sample sizes ($n < 5$).
