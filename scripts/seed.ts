import { createClient } from "@supabase/supabase-js";
import { generateEmbedding } from "../src/lib/ai/provider";
import { chunkDocument } from "../src/lib/rag/chunker";
import fs from "fs";
import path from "path";

// Ensure .env.local is loaded
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

loadEnv();
delete process.env.GOOGLE_API_KEY;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const demoEmail = process.env.DEMO_EMAIL || "demo@gapfinder.ai";
const demoPassword = process.env.DEMO_PASSWORD || "DemoPassword123!";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Realistic Academic Documents
const SAMPLE_DOCUMENTS = [
  {
    title: "Relational Database Normalization (1NF to BCNF)",
    filename: "DBMS_Normalization_Theory.txt",
    fileType: "textbook",
    content: `Chapter 8: Relational Database Normalization

8.1 First Normal Form (1NF)
A relation schema R is in First Normal Form (1NF) if and only if the domain of each attribute contains only atomic (indivisible) values, and the value of each attribute in any tuple is a single value from the domain of that attribute. Repeating groups and multi-valued attributes are strictly forbidden.

8.2 Second Normal Form (2NF)
A relation schema R is in Second Normal Form (2NF) if it is in 1NF and every non-prime attribute A in R is fully functionally dependent on any candidate key of R. A functional dependency X -> A is a partial dependency if some attribute can be removed from X and the dependency still holds. Partial dependencies cause severe update anomalies and data redundancy.

8.3 Third Normal Form (3NF)
A relation schema R is in Third Normal Form (3NF) if whenever a non-trivial functional dependency X -> A holds in R, either:
1. X is a superkey of R, or
2. A is a prime attribute (that is, A is part of some candidate key for R).
3NF eliminates transitive dependencies. A crucial theoretical advantage of 3NF is that it is ALWAYS possible to find a decomposition that is simultaneously lossless-join AND dependency-preserving.

8.4 Boyce-Codd Normal Form (BCNF)
A relation schema R is in Boyce-Codd Normal Form (BCNF) if whenever a non-trivial functional dependency X -> A holds in R, X is a superkey of R.
BCNF strictly removes all redundancy caused by functional dependencies. However, decomposing a relation into BCNF does NOT guarantee dependency preservation. Testing dependency preservation requires computing attribute closures F+ over each decomposed relation.`,
  },
  {
    title: "Functional Dependencies and Attribute Closures",
    filename: "DBMS_Functional_Dependencies.txt",
    fileType: "notes",
    content: `Lecture Notes: Functional Dependencies and Axioms

Section 1: Definition of Functional Dependency
Given a relation schema R, a functional dependency denoted by X -> Y asserts that for any legal relation instance r(R), whenever two tuples t1 and t2 agree on attributes in X (t1[X] = t2[X]), they must also agree on attributes in Y (t1[Y] = t2[Y]). X is called the determinant.

Section 2: Armstrong's Inference Rules (Axioms)
Armstrong's Axioms form a sound and complete set of inference rules:
1. Reflexivity: If Y is a subset of X, then X -> Y.
2. Augmentation: If X -> Y holds, then XZ -> YZ holds for any attribute set Z.
3. Transitivity: If X -> Y and Y -> Z hold, then X -> Z.
Derived rules include:
- Union: If X -> Y and X -> Z, then X -> YZ.
- Decomposition: If X -> YZ, then X -> Y and X -> Z.
- Pseudotransitivity: If X -> Y and WY -> Z, then WX -> Z.

Section 3: Attribute Closures and Superkeys
The closure of an attribute set X under a set of functional dependencies F, denoted X+, is the set of all attributes functionally determined by X under F.
Algorithm to compute X+:
1. Initialize X+ := X.
2. Repeat until no more attributes can be added:
   For each dependency Y -> Z in F:
   If Y is a subset of X+, then X+ := X+ union Z.
A set of attributes K is a superkey of R if K+ contains all attributes of R. K is a candidate key if K is a superkey and no proper subset of K is a superkey.`,
  },
  {
    title: "Transaction Management and ACID Properties",
    filename: "DBMS_Transactions_and_SQL.txt",
    fileType: "syllabus",
    content: `Module 3: Transactions and ACID Guarantees

Section 1: The ACID Properties
A transaction is a logical unit of database processing that includes one or more database access operations. To preserve data integrity, transactions must satisfy the four ACID properties:
1. Atomicity: Either all operations of the transaction are reflected properly in the database, or none are. Handled by the transaction recovery manager (write-ahead logging).
2. Consistency: Execution of a transaction in isolation preserves the consistency of the database (satisfies all integrity constraints).
3. Isolation: Even though multiple transactions execute concurrently, the system guarantees that for every pair of transactions Ti and Tj, it appears to Ti that either Tj finished before Ti began, or Tj began after Ti finished. Controlled by the concurrency-control manager.
4. Durability: After a transaction completes successfully (commits), the changes it has made to the database persist, even if there are system failures.

Section 2: Relational SQL Joins
SQL Inner Join returns only rows where there is a match in both tables.
SQL Left Outer Join returns all rows from the left table and matched rows from the right table (NULL when unmatched).
Full Outer Join combines results of both Left and Right joins.`,
  },
];

async function seed() {
  console.log("=== SEEDING REALISTIC DEMO DATASET ===");
  console.log(`Demo Account: ${demoEmail}`);

  // 1. Ensure Demo User Exists
  let userId: string;
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const existingUser = usersData?.users.find((u) => u.email === demoEmail);

  if (existingUser) {
    userId = existingUser.id;
    console.log(`✓ Using existing demo user: ${userId}`);
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: "Demo Evaluator (DBMS)" },
    });
    if (createErr || !newUser.user) {
      console.error("Failed to create demo user:", createErr);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`✓ Created demo user: ${userId}`);
  }

  // 2. Clear previous data for clean idempotent demo
  console.log("Clearing previous demo workspace records...");
  await supabase.from("documents").delete().eq("user_id", userId);
  await supabase.from("topics").delete().eq("user_id", userId);
  await supabase.from("quizzes").delete().eq("user_id", userId);
  await supabase.from("revision_plans").delete().eq("user_id", userId);

  // 3. Ingest and embed real documents
  console.log("Ingesting and embedding 3 real DBMS course documents...");
  const documentMap = new Map<string, string>();

  for (const sample of SAMPLE_DOCUMENTS) {
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        filename: sample.filename,
        title: sample.title,
        file_type: sample.fileType,
        status: "ready",
        page_count: 3,
        chunk_count: 0,
        file_size: sample.content.length,
      })
      .select()
      .single();

    if (docErr || !doc) {
      console.error("Doc insert error:", docErr);
      continue;
    }

    documentMap.set(sample.filename, doc.id);

    // Chunk and embed
    const chunks = chunkDocument(
      [{ pageNumber: 1, text: sample.content }],
      sample.filename
    );

    console.log(`Generating embeddings for ${chunks.length} chunks of "${sample.filename}"...`);
    const chunkRows = [];
    for (const c of chunks) {
      let emb: number[] | null = null;
      try {
        emb = await generateEmbedding(c.content);
      } catch (e) {
        console.warn("Embedding error (using fallback vector):", e);
        emb = Array(768).fill(0.01);
      }

      chunkRows.push({
        user_id: userId,
        document_id: doc.id,
        chunk_index: c.chunkIndex,
        content: c.content,
        heading: c.heading,
        page_number: c.pageNumber,
        embedding: emb,
        metadata: c.metadata,
      });
    }

    await supabase.from("document_chunks").insert(chunkRows);
    await supabase
      .from("documents")
      .update({ chunk_count: chunkRows.length })
      .eq("id", doc.id);
  }

  // 4. Create Topic Map
  console.log("Building Knowledge X-Ray curriculum tree...");
  // Module 1
  const { data: mod1 } = await supabase
    .from("topics")
    .insert({
      user_id: userId,
      title: "Relational Design Theory & Dependencies",
      description: "Functional dependencies, closure computation, and normalization from 1NF to BCNF.",
      source: "syllabus",
      order_index: 0,
    })
    .select()
    .single();

  // Topic 1.1: Functional Dependencies
  const { data: topFD } = await supabase
    .from("topics")
    .insert({
      user_id: userId,
      parent_id: mod1.id,
      title: "Functional Dependencies & Attribute Closures",
      description: "Armstrong's axioms, determinant properties, computing X+, and finding candidate keys.",
      source: "syllabus",
      order_index: 1,
    })
    .select()
    .single();

  // Topic 1.2: Normalization (The weak gap!)
  const { data: topNorm } = await supabase
    .from("topics")
    .insert({
      user_id: userId,
      parent_id: mod1.id,
      title: "Normalization (1NF, 2NF, 3NF, BCNF)",
      description: "Lossless join decomposition, dependency preservation, transitive dependencies, and normal form conditions.",
      source: "syllabus",
      order_index: 2,
    })
    .select()
    .single();

  // Module 2: Transactions & ACID
  const { data: mod2 } = await supabase
    .from("topics")
    .insert({
      user_id: userId,
      title: "Transaction Processing & Concurrency",
      description: "ACID properties, write-ahead logging, and serializability guarantees.",
      source: "syllabus",
      order_index: 3,
    })
    .select()
    .single();

  // Topic 2.1: ACID
  const { data: topACID } = await supabase
    .from("topics")
    .insert({
      user_id: userId,
      parent_id: mod2.id,
      title: "ACID Properties & Logging",
      description: "Atomicity, consistency, isolation levels, and durability mechanisms.",
      source: "syllabus",
      order_index: 4,
    })
    .select()
    .single();

  // Module 3: SQL Joins
  const { data: topSQL } = await supabase
    .from("topics")
    .insert({
      user_id: userId,
      title: "Relational SQL Joins & Query Execution",
      description: "Inner joins, outer joins, cross products, and matching semantics.",
      source: "syllabus",
      order_index: 5,
    })
    .select()
    .single();

  // 5. Create Suspected Prerequisite
  // FD is a prerequisite for Normalization
  await supabase.from("topic_prerequisites").insert({
    user_id: userId,
    topic_id: topNorm.id,
    prerequisite_topic_id: topFD.id,
    status: "suspected",
    reason: "Decomposing into BCNF requires checking whether X is a superkey via attribute closure X+",
  });

  // 6. Fetch chunk IDs for citations
  const { data: chunks } = await supabase
    .from("document_chunks")
    .select("id, heading, document_id")
    .eq("user_id", userId);

  const normChunks = chunks?.filter((c) => c.heading?.includes("Normal") || c.heading?.includes("BCNF")).map((c) => c.id) || [];
  const fdChunks = chunks?.filter((c) => c.heading?.includes("Functional") || c.heading?.includes("Axioms")).map((c) => c.id) || [];
  const acidChunks = chunks?.filter((c) => c.heading?.includes("ACID") || c.heading?.includes("Transactions")).map((c) => c.id) || [];
  const sqlChunks = chunks?.filter((c) => c.heading?.includes("SQL") || c.heading?.includes("Joins")).map((c) => c.id) || [];

  // 7. Seed Diagnostic Questions & Completed Baseline Diagnostic
  console.log("Seeding baseline diagnostic assessment with realistic student errors...");
  const { data: quiz1 } = await supabase
    .from("quizzes")
    .insert({
      user_id: userId,
      title: "Baseline Diagnostic: Relational Normalization",
      topic_ids: [topNorm.id],
      quiz_type: "diagnostic",
      status: "completed",
    })
    .select()
    .single();

  // Q1: BCNF vs 3NF Dependency Preservation (STUDENT MISSED THIS)
  const { data: q1 } = await supabase
    .from("questions")
    .insert({
      user_id: userId,
      topic_id: topNorm.id,
      question_text: "Which normal form guarantees both a lossless-join decomposition AND dependency preservation for any relational schema?",
      options: [
        "Boyce-Codd Normal Form (BCNF)",
        "Third Normal Form (3NF)",
        "Second Normal Form (2NF)",
        "Fourth Normal Form (4NF)",
      ],
      correct_option_index: 1, // 3NF
      explanation: "3NF always allows a lossless-join decomposition that preserves functional dependencies. BCNF guarantees lossless-join but does not always preserve dependencies.",
      difficulty: "hard",
      source_chunk_ids: normChunks.slice(0, 2),
      verifier_status: "passed",
    })
    .select()
    .single();

  // Q2: BCNF Condition (STUDENT MISSED THIS - chose non-prime attribute)
  const { data: q2 } = await supabase
    .from("questions")
    .insert({
      user_id: userId,
      topic_id: topNorm.id,
      question_text: "In Boyce-Codd Normal Form (BCNF), for every non-trivial functional dependency X -> A, what condition MUST hold for X?",
      options: [
        "X must be a candidate key or A must be a prime attribute",
        "X must be a superkey",
        "A must be a single atomic attribute",
        "X must not contain any partial dependencies",
      ],
      correct_option_index: 1, // X is superkey
      explanation: "BCNF strictly requires that the determinant X must be a superkey for every non-trivial functional dependency X -> A. The alternative condition (A is prime) is only valid in 3NF.",
      difficulty: "medium",
      source_chunk_ids: normChunks.slice(0, 2),
      verifier_status: "passed",
    })
    .select()
    .single();

  // Q3: 1NF Definition (STUDENT GOT THIS RIGHT)
  const { data: q3 } = await supabase
    .from("questions")
    .insert({
      user_id: userId,
      topic_id: topNorm.id,
      question_text: "What fundamental property defines a relation in First Normal Form (1NF)?",
      options: [
        "Every attribute contains only atomic, indivisible values",
        "All transitive dependencies have been decomposed",
        "Every non-prime attribute is fully dependent on candidate keys",
        "Each tuple has a surrogate foreign key",
      ],
      correct_option_index: 0,
      explanation: "1NF requires that each attribute value is atomic and single-valued, strictly prohibiting repeating groups or nested relations.",
      difficulty: "easy",
      source_chunk_ids: normChunks.slice(0, 1),
      verifier_status: "passed",
    })
    .select()
    .single();

  await supabase
    .from("quizzes")
    .update({ question_ids: [q1.id, q2.id, q3.id] })
    .eq("id", quiz1.id);

  // Baseline Attempt: 1 out of 3 = 33%
  const baselineDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: attempt1 } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id: quiz1.id,
      total_questions: 3,
      correct_answers: 1,
      score_percentage: 33.33,
      status: "completed",
      started_at: baselineDate,
      completed_at: baselineDate,
    })
    .select()
    .single();

  await supabase.from("quiz_responses").insert([
    {
      attempt_id: attempt1.id,
      question_id: q1.id,
      user_id: userId,
      selected_option_index: 0, // Student selected BCNF (Wrong)
      is_correct: false,
      confidence_level: 5, // High confidence error!
      answered_at: baselineDate,
    },
    {
      attempt_id: attempt1.id,
      question_id: q2.id,
      user_id: userId,
      selected_option_index: 0, // Student selected 3NF condition (Wrong)
      is_correct: false,
      confidence_level: 4,
      answered_at: baselineDate,
    },
    {
      attempt_id: attempt1.id,
      question_id: q3.id,
      user_id: userId,
      selected_option_index: 0, // Correct
      is_correct: true,
      confidence_level: 5,
      answered_at: baselineDate,
    },
  ]);

  // Record baseline in mastery_history
  await supabase.from("mastery_history").insert({
    user_id: userId,
    topic_id: topNorm.id,
    score_percentage: 33.33,
    level: "weak",
    questions_attempted: 3,
    recorded_at: baselineDate,
  });

  // 8. Seed Retest Diagnostic (Proof of Learning Gain!)
  console.log("Seeding verified retest showing measurable learning improvement...");
  const retestDate = new Date().toISOString();
  const { data: attempt2 } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id: quiz1.id,
      total_questions: 3,
      correct_answers: 3,
      score_percentage: 80.00,
      status: "completed",
      started_at: retestDate,
      completed_at: retestDate,
    })
    .select()
    .single();

  // Cumulative mastery update for Normalization: 4/5 = 80% (Strong!)
  await supabase.from("topic_mastery").upsert({
    user_id: userId,
    topic_id: topNorm.id,
    score_percentage: 80.00,
    level: "strong",
    evidence_badge: "established",
    questions_attempted: 5,
    questions_correct: 4,
    missed_concepts: ["Dependency Preservation in BCNF", "Superkey vs Candidate Key Conditions"],
    why_rating: "Diagnosed as Strong: 80% accuracy (4 of 5 questions answered correctly across baseline and retest). Dependency preservation misconception successfully resolved.",
    last_assessed_at: retestDate,
  });

  await supabase.from("mastery_history").insert({
    user_id: userId,
    topic_id: topNorm.id,
    score_percentage: 80.00,
    level: "strong",
    questions_attempted: 5,
    recorded_at: retestDate,
  });

  // Seed Functional Dependencies: 2/3 = 66% (Medium)
  await supabase.from("topic_mastery").upsert({
    user_id: userId,
    topic_id: topFD.id,
    score_percentage: 66.67,
    level: "medium",
    evidence_badge: "preliminary",
    questions_attempted: 3,
    questions_correct: 2,
    missed_concepts: ["Pseudotransitivity inference rule"],
    why_rating: "Diagnosed as Medium: 67% accuracy (2 of 3 correct). Solid candidate key computation, minor error on complex inference rules.",
    last_assessed_at: baselineDate,
  });

  await supabase.from("mastery_history").insert({
    user_id: userId,
    topic_id: topFD.id,
    score_percentage: 66.67,
    level: "medium",
    questions_attempted: 3,
    recorded_at: baselineDate,
  });

  // Seed SQL Joins: 4/4 = 100% (Strong)
  await supabase.from("topic_mastery").upsert({
    user_id: userId,
    topic_id: topSQL.id,
    score_percentage: 100.00,
    level: "strong",
    evidence_badge: "established",
    questions_attempted: 4,
    questions_correct: 4,
    missed_concepts: [],
    why_rating: "Diagnosed as Strong: 100% accuracy (4 of 4 correct). Flawless execution on join mechanics and NULL handling.",
    last_assessed_at: baselineDate,
  });

  // Seed ACID: 3/4 = 75% (Medium)
  await supabase.from("topic_mastery").upsert({
    user_id: userId,
    topic_id: topACID.id,
    score_percentage: 75.00,
    level: "medium",
    evidence_badge: "preliminary",
    questions_attempted: 4,
    questions_correct: 3,
    missed_concepts: ["Isolation level dirty read anomalies"],
    why_rating: "Diagnosed as Medium: 75% accuracy (3 of 4 correct). Good grasp of Atomicity and Durability, slight confusion on isolation anomalies.",
    last_assessed_at: baselineDate,
  });

  // 9. Seed Active Revision Plan
  console.log("Generating 7-day adaptive revision plan based on priority formula...");
  const { data: plan } = await supabase
    .from("revision_plans")
    .insert({
      user_id: userId,
      version: 1,
      daily_hours: 2.0,
      exam_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      learning_mode: "balanced",
      is_active: true,
    })
    .select()
    .single();

  await supabase.from("revision_tasks").insert([
    {
      plan_id: plan.id,
      user_id: userId,
      topic_id: topFD.id,
      day_number: 1,
      duration_minutes: 35,
      task_type: "learn",
      title: "Core Review: Armstrong's Axioms & Attribute Closures",
      description: "Review X+ closure algorithm and determinant definitions from Lecture Notes p.2.",
      why_reason: "Prerequisite priority: Needed to master BCNF decomposition without guesswork.",
      priority_score: 86.5,
      status: "completed",
      order_index: 0,
    },
    {
      plan_id: plan.id,
      user_id: userId,
      topic_id: topNorm.id,
      day_number: 1,
      duration_minutes: 25,
      task_type: "practice",
      title: "Guided Practice: 3NF vs BCNF Decomposition",
      description: "Solve dependency preservation test problems on decomposed schemas.",
      why_reason: "Eliminates high-confidence error identified during baseline diagnostic.",
      priority_score: 82.0,
      status: "pending",
      order_index: 1,
    },
    {
      plan_id: plan.id,
      user_id: userId,
      topic_id: topNorm.id,
      day_number: 1,
      duration_minutes: 15,
      task_type: "verify",
      title: "Diagnostic Retest: Normalization Mastery",
      description: "Take 3-question grounded verification test to validate learning gain.",
      why_reason: "Mastery updates only through verified diagnostic quiz evidence.",
      priority_score: 80.0,
      status: "completed",
      order_index: 2,
    },
    {
      plan_id: plan.id,
      user_id: userId,
      topic_id: topACID.id,
      day_number: 2,
      duration_minutes: 40,
      task_type: "practice",
      title: "Concurrency Control & Isolation Levels",
      description: "Review dirty reads, non-repeatable reads, and phantom read anomalies.",
      why_reason: "Medium topic (75%) with high exam weight.",
      priority_score: 68.5,
      status: "pending",
      order_index: 3,
    },
  ]);

  console.log("=== SEED COMPLETE ===");
  console.log(`Demo workspace ready for user ${demoEmail}`);
  console.log("Judges can click 'Try Demo' and immediately explore live grounded DBMS diagnostic flow!");
}

seed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
