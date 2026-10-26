import fs from "fs";
import path from "path";
import { gaps } from "./rag";

export interface MockDoc {
  id: string;
  name: string;
  kind: string;
  created_at: string;
  subjectId: string;
  sizeBytes?: number;
}

export interface MockAttempt {
  id: string;
  score: number;
  created_at: string;
  topic?: string;
  totalQuestions: number;
  correctCount: number;
}

export interface MockAnswer {
  attempt_id: string;
  topic: string;
  question: string;
  chosen: number;
  correct: number;
  is_correct: boolean;
  explanation: string;
  citation: string;
}

export interface CognitiveBadge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface SyllabusBrief {
  title: string;
  code: string;
  summary: string;
  targetAudience: string;
  totalModules: number;
  estimatedHours: number;
  modules: {
    unit: string;
    title: string;
    whatItIs: string;
    keyConcepts: string[];
    examImportance: string;
  }[];
  prerequisites: string[];
  examPitfalls: string[];
  diagnosticStrategy: string;
}

export interface SubjectData {
  id: string;
  name: string;
  code: string;
  icon: string;
  docs: MockDoc[];
  topics: string[];
  attempts: MockAttempt[];
  answers: MockAnswer[];
  plan: any | null;
  uploadedTexts: { docId: string; doc: string; text: string }[];
  badges: CognitiveBadge[];
}

const INITIAL_BADGES: CognitiveBadge[] = [
  {
    id: "scout",
    title: "Diagnostic Scout",
    desc: "Complete your first diagnostic test to uncover baseline gaps.",
    icon: "target",
    unlocked: false,
    progress: 0
  },
  {
    id: "hunter",
    title: "Blind Spot Hunter",
    desc: "Identify weak spots and take a topic-targeted quiz to improve.",
    icon: "shield",
    unlocked: false,
    progress: 0
  },
  {
    id: "vanguard",
    title: "Mastery Vanguard",
    desc: "Achieve a score of 80% or higher on any diagnostic test.",
    icon: "sparkles",
    unlocked: false,
    progress: 0
  },
  {
    id: "planner",
    title: "Strategic Scholar",
    desc: "Generate and review an adaptive personalized revision schedule.",
    icon: "calendar",
    unlocked: false,
    progress: 0
  },
  {
    id: "scholar",
    title: "Crystal Brain Mastery",
    desc: "Achieve 'Strong' status (>=80% accuracy) across all course units.",
    icon: "award",
    unlocked: false,
    progress: 0
  }
];

const DBMS_QUESTIONS: Record<string, any[]> = {
  "Entity-Relationship Model": [
    {
      q: "In an ER diagram, what characterizes a weak entity?",
      options: [
        "It contains multiple primary keys",
        "It has no key of its own and depends on an owner entity",
        "It cannot participate in relationships",
        "It has no attributes"
      ],
      answer: 1,
      explanation: "A weak entity has no key of its own and depends on an owner entity.",
      citation: "DBMS notes.txt §1",
      quote: "A weak entity has no key of its own and depends on an owner entity."
    },
    {
      q: "What does cardinality in an ER model define?",
      options: [
        "The data type of each attribute",
        "How many instances of one entity relate to another (1:1, 1:N, M:N)",
        "The total number of relations in the database",
        "The depth of the B+ tree"
      ],
      answer: 1,
      explanation: "Cardinality (1:1, 1:N, M:N) states how many instances of one entity relate to another.",
      citation: "DBMS notes.txt §1",
      quote: "Cardinality (1:1, 1:N, M:N) states how many instances of one entity relate to another."
    }
  ],
  "Relational Model and Keys": [
    {
      q: "Which key is defined as a minimal superkey?",
      options: ["Foreign key", "Candidate key", "Secondary key", "Surrogate key"],
      answer: 1,
      explanation: "A candidate key is a minimal superkey chosen from potential superkeys.",
      citation: "DBMS notes.txt §2",
      quote: "A superkey uniquely identifies a tuple; a candidate key is a minimal superkey."
    },
    {
      q: "What rule does a foreign key enforce in a relational schema?",
      options: [
        "Domain constraints only",
        "Referential integrity by referencing a primary key",
        "Mandatory 1NF normalization",
        "Atomicity of transactions"
      ],
      answer: 1,
      explanation: "A foreign key references the primary key of another relation and enforces referential integrity.",
      citation: "DBMS notes.txt §2",
      quote: "A foreign key references the primary key of another relation and enforces referential integrity."
    }
  ],
  "Normalization (1NF to BCNF)": [
    {
      q: "What requirement must be met for a relation to be in 2NF?",
      options: [
        "Every attribute must be in BCNF",
        "It must be in 1NF and have no partial dependencies on composite keys",
        "It must eliminate all transitive dependencies",
        "All multivalued dependencies must be removed"
      ],
      answer: 1,
      explanation: "2NF removes partial dependencies on part of a composite key.",
      citation: "DBMS notes.txt §3",
      quote: "2NF removes partial dependencies on part of a composite key."
    },
    {
      q: "What condition is required for Boyce-Codd Normal Form (BCNF)?",
      options: [
        "Only prime attributes can be determinants",
        "Every determinant of a functional dependency must be a superkey",
        "Tables cannot have more than three columns",
        "Foreign keys cannot reference candidate keys"
      ],
      answer: 1,
      explanation: "BCNF requires every determinant of a functional dependency to be a superkey.",
      citation: "DBMS notes.txt §3",
      quote: "BCNF requires every determinant of a functional dependency to be a superkey."
    }
  ],
  "SQL Queries and Joins": [
    {
      q: "How does the HAVING clause differ from the WHERE clause in SQL?",
      options: [
        "HAVING is used for sorting while WHERE is for filtering",
        "HAVING filters grouped rows after aggregation, while WHERE filters before",
        "WHERE can only be used with subqueries",
        "There is no functional difference"
      ],
      answer: 1,
      explanation: "HAVING filters groups after aggregation, whereas WHERE filters rows before it.",
      citation: "DBMS notes.txt §4",
      quote: "GROUP BY aggregates rows, and HAVING filters groups after aggregation, whereas WHERE filters rows before it."
    },
    {
      q: "What does a LEFT JOIN return for rows with no match in the right table?",
      options: ["An empty result set", "NULL values for right table columns", "An error", "Default zero values"],
      answer: 1,
      explanation: "LEFT JOIN returns all rows from the left table and NULLs where the right has no match.",
      citation: "DBMS notes.txt §4",
      quote: "LEFT JOIN returns all rows from the left table and NULLs where the right has no match."
    }
  ],
  "Transactions and ACID": [
    {
      q: "Which ACID property guarantees committed transactions survive system crashes?",
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      answer: 3,
      explanation: "Durability guarantees committed changes survive crashes, typically through a write-ahead log.",
      citation: "DBMS notes.txt §5",
      quote: "Durability guarantees committed changes survive crashes, typically through a write-ahead log."
    },
    {
      q: "What does the Atomicity property in transactions enforce?",
      options: [
        "All transactions run in isolated threads",
        "Transactions are all-or-nothing (either fully committed or completely aborted)",
        "Database constraints are never checked",
        "Only atomic data types are allowed"
      ],
      answer: 1,
      explanation: "Atomicity means a transaction is all-or-nothing.",
      citation: "DBMS notes.txt §5",
      quote: "Atomicity means a transaction is all-or-nothing."
    }
  ],
  "Indexing and B+ Trees": [
    {
      q: "Why are range queries particularly fast in a B+ tree index?",
      options: [
        "Leaf nodes contain hashes rather than keys",
        "All records are kept in linked leaf nodes that can be traversed sequentially",
        "Internal nodes store all raw table rows",
        "B+ trees eliminate binary searches"
      ],
      answer: 1,
      explanation: "A B+ tree keeps all records in linked leaf nodes, so range queries scan leaves sequentially.",
      citation: "DBMS notes.txt §6",
      quote: "A B+ tree keeps all records in linked leaf nodes, so range queries scan leaves sequentially."
    },
    {
      q: "How many clustered indexes can a single database table possess?",
      options: ["Unlimited", "Exactly one, because it dictates the physical row storage order", "Up to 16", "One per candidate key"],
      answer: 1,
      explanation: "A clustered index fixes the physical row order; a table can have only one.",
      citation: "DBMS notes.txt §6",
      quote: "A clustered index fixes the physical row order; a table can have only one."
    }
  ],
  "Concurrency Control and Locking": [
    {
      q: "What does Two-Phase Locking (2PL) guarantee for concurrent schedules?",
      options: ["Deadlock freedom", "Conflict serializability", "Fastest disk write throughput", "No read locks needed"],
      answer: 1,
      explanation: "Two-phase locking has growing and shrinking phases, guaranteeing conflict serializability.",
      citation: "DBMS notes.txt §7",
      quote: "Two-phase locking has a growing phase where locks are acquired and a shrinking phase where they are released, which guarantees conflict serializability."
    },
    {
      q: "How are deadlocks typically resolved when transactions wait in a cyclic dependency?",
      options: ["Waiting indefinitely until timeout", "Aborting a selected victim transaction and rolling it back", "Switching immediately to 1NF", "Re-indexing all tables"],
      answer: 1,
      explanation: "Deadlocks occur in a cycle and are resolved by aborting a victim transaction.",
      citation: "DBMS notes.txt §7",
      quote: "Deadlocks occur when transactions wait on each other in a cycle and are resolved by aborting a victim."
    }
  ]
};

const OS_QUESTIONS: Record<string, any[]> = {
  "Processes and Threads": [
    {
      q: "What is the primary difference between a process and a thread?",
      options: [
        "Threads have separate virtual address spaces while processes share memory",
        "Threads within the same process share code, data, and files, while processes have separate address spaces",
        "Processes cannot create threads",
        "Threads cannot run concurrently"
      ],
      answer: 1,
      explanation: "Threads of the same process share address space, code, and global variables.",
      citation: "OS_Notes.txt §1",
      quote: "Threads share the process memory space while maintaining independent program counters and stacks."
    }
  ],
  "CPU Scheduling Algorithms": [
    {
      q: "Which CPU scheduling algorithm can cause the 'convoy effect'?",
      options: ["Round Robin (RR)", "Shortest Job First (SJF)", "First-Come First-Served (FCFS)", "Multi-Level Feedback Queue"],
      answer: 2,
      explanation: "FCFS causes short processes to wait behind a long CPU-bound process (convoy effect).",
      citation: "OS_Notes.txt §2",
      quote: "First-Come First-Served suffers from the convoy effect when short processes queue behind long jobs."
    }
  ],
  "Deadlock and Banker's Algorithm": [
    {
      q: "What are the four necessary conditions for a deadlock to occur?",
      options: [
        "Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait",
        "Paging, Segmentation, Swapping, Thrashing",
        "Atomicity, Consistency, Isolation, Durability",
        "Starvation, Priority Inversion, Race Condition, Livelock"
      ],
      answer: 0,
      explanation: "Coffman's conditions: Mutual exclusion, hold and wait, no preemption, and circular wait.",
      citation: "OS_Notes.txt §3",
      quote: "Deadlock requires all four conditions: mutual exclusion, hold and wait, no preemption, and circular wait."
    }
  ],
  "Memory Management and Paging": [
    {
      q: "What problem does the Translation Lookaside Buffer (TLB) solve?",
      options: [
        "Eliminates disk seek time",
        "Speeds up virtual-to-physical address translation by caching page table entries",
        "Prevents external fragmentation in contiguous allocation",
        "Replaces page replacement algorithms"
      ],
      answer: 1,
      explanation: "TLB is a fast hardware associative cache for page table lookups.",
      citation: "OS_Notes.txt §4",
      quote: "The TLB caches recent virtual-to-physical page mappings to avoid multiple memory accesses per translation."
    }
  ],
  "Virtual Memory and Page Replacement": [
    {
      q: "What is Belady's Anomaly in page replacement?",
      options: [
        "LRU experiences more page faults with larger page sizes",
        "FIFO can experience more page faults even when given more frame buffers",
        "Optimal replacement algorithm cannot be implemented",
        "Pages oscillate infinitely between swap space and RAM"
      ],
      answer: 1,
      explanation: "In FIFO, increasing the number of page frames can unexpectedly increase page faults.",
      citation: "OS_Notes.txt §5",
      quote: "Belady's anomaly occurs in FIFO replacement where adding page frames leads to more page faults."
    }
  ]
};

const CN_QUESTIONS: Record<string, any[]> = {
  "OSI vs TCP/IP Layers": [
    {
      q: "At which layer of the OSI model does IP routing occur?",
      options: ["Transport Layer", "Network Layer", "Data Link Layer", "Application Layer"],
      answer: 1,
      explanation: "Routing and logical IP addressing operate at Layer 3 (Network Layer).",
      citation: "CN_Notes.txt §1",
      quote: "The Network Layer is responsible for packet forwarding and routing via IP addresses."
    }
  ],
  "TCP 3-Way Handshake & Flow Control": [
    {
      q: "What sequence of packets establishes a reliable TCP connection?",
      options: ["SYN, SYN-ACK, ACK", "ACK, SYN, FIN", "PING, PONG, ACK", "RST, SYN, ACK"],
      answer: 0,
      explanation: "TCP connects via client SYN, server SYN-ACK, and client ACK.",
      citation: "CN_Notes.txt §2",
      quote: "TCP establishes connections using a 3-way handshake: SYN, SYN-ACK, and final ACK."
    }
  ],
  "IP Addressing and Subnetting": [
    {
      q: "How many usable host IP addresses are available in a /24 subnet?",
      options: ["256", "254", "255", "128"],
      answer: 1,
      explanation: "2^8 = 256 total, minus network address and broadcast address = 254 usable hosts.",
      citation: "CN_Notes.txt §3",
      quote: "A /24 network provides 256 addresses, with 254 usable for hosts after reserving network and broadcast."
    }
  ]
};

class MockDb {
  subjects: Record<string, SubjectData> = {};
  currentSubjectId: string = "dbms";

  constructor() {
    this.initDefaultSubjects();
  }

  private initDefaultSubjects() {
    // 1. DBMS
    this.subjects["dbms"] = {
      id: "dbms",
      name: "Database Management Systems",
      code: "CS301",
      icon: "database",
      docs: [
        { id: "doc-dbms-1", name: "DBMS syllabus.txt", kind: "syllabus", created_at: new Date().toISOString(), subjectId: "dbms", sizeBytes: 249 },
        { id: "doc-dbms-2", name: "DBMS notes.txt", kind: "notes", created_at: new Date().toISOString(), subjectId: "dbms", sizeBytes: 1899 }
      ],
      topics: [
        "Entity-Relationship Model",
        "Relational Model and Keys",
        "Normalization (1NF to BCNF)",
        "SQL Queries and Joins",
        "Transactions and ACID",
        "Indexing and B+ Trees",
        "Concurrency Control and Locking"
      ],
      attempts: [],
      answers: [],
      plan: null,
      uploadedTexts: [],
      badges: JSON.parse(JSON.stringify(INITIAL_BADGES))
    };

    // Load DBMS sample text from disk if available
    try {
      const p = path.join(process.cwd(), "data/sample/notes.txt");
      if (fs.existsSync(p)) {
        this.subjects["dbms"].uploadedTexts.push({
          docId: "doc-dbms-2",
          doc: "DBMS notes.txt",
          text: fs.readFileSync(p, "utf8")
        });
      }
      const s = path.join(process.cwd(), "data/sample/syllabus.txt");
      if (fs.existsSync(s)) {
        this.subjects["dbms"].uploadedTexts.push({
          docId: "doc-dbms-1",
          doc: "DBMS syllabus.txt",
          text: fs.readFileSync(s, "utf8")
        });
      }
    } catch {}

    // Keep only DBMS as the demo seed subject
  }

  getCurrentSubject(subjectId?: string): SubjectData {
    if (subjectId && this.subjects[subjectId]) {
      this.currentSubjectId = subjectId;
    }
    return this.subjects[this.currentSubjectId] || this.subjects[Object.keys(this.subjects)[0]] || this.subjects["dbms"];
  }

  switchSubject(subjectId: string) {
    if (this.subjects[subjectId]) {
      this.currentSubjectId = subjectId;
      return { ok: true, currentSubjectId: this.currentSubjectId };
    }
    return { ok: false, error: "Subject not found" };
  }

  deleteSubject(subjectId: string) {
    delete this.subjects[subjectId];
    const remainingKeys = Object.keys(this.subjects);
    if (remainingKeys.length === 0) {
      // Re-initialize with a clean workspace subject so the app remains fully functional
      const freshId = "general";
      this.subjects[freshId] = {
        id: freshId,
        name: "General Studies",
        code: "GEN101",
        icon: "book",
        docs: [],
        topics: [
          "Core Foundations & Principles",
          "Key Methods & Applications",
          "System Invariants & Rules",
          "Review & Practice Problems"
        ],
        attempts: [],
        answers: [],
        plan: null,
        uploadedTexts: [],
        badges: JSON.parse(JSON.stringify(INITIAL_BADGES))
      };
      this.currentSubjectId = freshId;
    } else if (this.currentSubjectId === subjectId) {
      this.currentSubjectId = remainingKeys[0];
    }
    return {
      ok: true,
      currentSubjectId: this.currentSubjectId,
      currentSubjectName: this.subjects[this.currentSubjectId]?.name,
      subjects: Object.values(this.subjects).map(sub => ({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        docCount: sub.docs.length,
        topicCount: sub.topics.length
      }))
    };
  }

  addSubject(name: string, code?: string) {
    const cleanId = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "sub";
    const id = this.subjects[cleanId] ? `${cleanId}-${Date.now().toString(36)}` : cleanId;
    const initialTopics = [
      `${name} Foundations & Core Principles`,
      `Architecture, Invariants & Modeling`,
      `Key Algorithms, Protocols & Mechanics`,
      `Verification, Integrity & Error Handling`,
      `Optimization, Scaling & Advanced Applications`
    ];
    this.subjects[id] = {
      id,
      name,
      code: code || ("SUB" + (Object.keys(this.subjects).length + 1)),
      icon: "book",
      docs: [],
      topics: initialTopics,
      attempts: [],
      answers: [],
      plan: null,
      uploadedTexts: [],
      badges: JSON.parse(JSON.stringify(INITIAL_BADGES))
    };
    this.currentSubjectId = id;
    return {
      ok: true,
      subject: this.subjects[id],
      currentSubjectId: id,
      subjects: Object.values(this.subjects).map(sub => ({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        docCount: sub.docs.length,
        topicCount: sub.topics.length
      }))
    };
  }

  getState(subjectId?: string) {
    const s = this.getCurrentSubject(subjectId);
    
    // Aggregate rolling recent answers per topic so taking tests on any topic preserves and updates the gap telemetry
    const recentAnswersByTopic: Record<string, any[]> = {};
    for (const a of s.answers) {
      recentAnswersByTopic[a.topic] = recentAnswersByTopic[a.topic] || [];
      recentAnswersByTopic[a.topic].push(a);
    }
    const rollingAns = Object.values(recentAnswersByTopic).flatMap(arr => arr.slice(-4));
    const gapReport = gaps(rollingAns.length ? rollingAns : s.answers);

    // Compute updated badges
    this.updateBadges(s, gapReport);

    return {
      subjects: Object.values(this.subjects).map(sub => ({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        docCount: sub.docs.length,
        topicCount: sub.topics.length
      })),
      currentSubjectId: s.id,
      currentSubjectName: s.name,
      currentSubjectCode: s.code,
      docs: s.docs,
      topics: s.topics,
      attempts: s.attempts,
      gaps: gapReport,
      plan: s.plan,
      badges: s.badges
    };
  }

  inspectDoc(docId: string, subjectId?: string) {
    const s = this.getCurrentSubject(subjectId);
    const docMeta = s.docs.find(d => d.id === docId);
    const textEntry = s.uploadedTexts.find(t => t.docId === docId || t.doc === docMeta?.name);
    return {
      doc: docMeta,
      content: textEntry ? textEntry.text : "No text content stored for this document.",
      chunks: textEntry ? Math.ceil(textEntry.text.length / 900) : 1
    };
  }

  seed(subjectId?: string) {
    return { ok: true };
  }

  upload(fileName: string, kind: string, text: string, subjectId?: string, createNewSubject?: boolean, newSubjectName?: string) {
    let targetSubjectId = subjectId;
    if (createNewSubject || (newSubjectName && newSubjectName.trim().length > 0)) {
      const name = (newSubjectName && newSubjectName.trim()) || fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      const subRes = this.addSubject(name);
      targetSubjectId = subRes.currentSubjectId;
    }

    const s = this.getCurrentSubject(targetSubjectId);
    const docId = "doc-" + Date.now().toString(36);
    s.docs.push({
      id: docId,
      name: fileName,
      kind,
      created_at: new Date().toISOString(),
      subjectId: s.id,
      sizeBytes: text.length
    });
    s.uploadedTexts.push({ docId, doc: fileName, text });

    // If it's a syllabus or text contains clear topics, auto-extract topics!
    let extracted: string[] = [];
    if (kind === "syllabus" || text.toLowerCase().includes("unit") || text.toLowerCase().includes("chapter")) {
      extracted = this.parseTopicsFromText(text);
      if (extracted.length) {
        s.topics = extracted;
      }
    }

    this.currentSubjectId = s.id;

    return {
      ok: true,
      docId,
      currentSubjectId: s.id,
      currentSubjectName: s.name,
      currentSubjectCode: s.code,
      extractedTopicsCount: extracted.length,
      topics: s.topics,
      subjects: Object.values(this.subjects).map(sub => ({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        docCount: sub.docs.length,
        topicCount: sub.topics.length
      }))
    };
  }

  parseTopicsFromText(text: string): string[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const found: string[] = [];

    for (const line of lines) {
      // Look for lines like "Unit 1: X", "Chapter 2: X", "Module 3: X", or numbered "1. X"
      const match = line.match(/^(?:Unit|Chapter|Module|Topic)\s*\d+[:.-]\s*(.+)$/i) ||
                    line.match(/^\d+[\.\)]\s+([A-Z].{3,50})$/) ||
                    line.match(/^[-*•]\s+([A-Z].{4,50})$/);
      if (match && match[1]) {
        const clean = match[1].replace(/[:.;]+$/, "").trim();
        if (clean.length > 3 && !found.includes(clean)) {
          found.push(clean);
        }
      }
    }

    if (found.length >= 3) return found;

    // Fallback: extract distinct paragraphs or headings
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 15);
    for (const p of paragraphs.slice(0, 8)) {
      const firstSentence = p.split(/[.?!]/)[0].trim();
      if (firstSentence.length > 5 && firstSentence.length < 50 && !found.includes(firstSentence)) {
        found.push(firstSentence);
      }
    }

    return found.length ? found : [
      "Core Foundations & Principles",
      "Architecture & Core Invariants",
      "Methods, Algorithms & Protocols",
      "Performance Optimization & Edge Cases"
    ];
  }

  buildTopics(docId?: string, subjectId?: string) {
    const s = this.getCurrentSubject(subjectId);
    if (docId) {
      const entry = s.uploadedTexts.find(t => t.docId === docId);
      if (entry) {
        const parsed = this.parseTopicsFromText(entry.text);
        if (parsed.length) s.topics = parsed;
      }
    } else {
      // Find latest syllabus doc
      const syllabusDoc = s.docs.find(d => d.kind === "syllabus") || s.docs[0];
      if (syllabusDoc) {
        const entry = s.uploadedTexts.find(t => t.docId === syllabusDoc.id || t.doc === syllabusDoc.name);
        if (entry) {
          const parsed = this.parseTopicsFromText(entry.text);
          if (parsed.length) s.topics = parsed;
        }
      }
    }

    if (!s.topics.length) {
      s.topics = [
        "Core Concepts & Architecture",
        "Key Algorithms & Mechanics",
        "Integrity Rules & Protocols",
        "Optimization, Indexing & Storage"
      ];
    }

    return { ok: true, topics: s.topics };
  }

  getQuiz(topicName?: string, subjectId?: string, count?: number) {
    const s = this.getCurrentSubject(subjectId);
    let questions: any[] = [];

    let questionPool: Record<string, any[]> = DBMS_QUESTIONS;
    if (s.id === "os") questionPool = OS_QUESTIONS;
    else if (s.id === "cn") questionPool = CN_QUESTIONS;

    const topicsToQuery = topicName && topicName !== "all"
      ? [topicName]
      : s.topics;

    for (const topic of topicsToQuery) {
      const qs = questionPool[topic];
      if (qs) {
        questions.push(...qs.map(q => ({ ...q, topic })));
      } else {
        // Dynamically synthesize a grounded question from available texts
        const relatedExcerpt = s.uploadedTexts[0]?.text.slice(0, 180) || "Course Syllabus §1";
        questions.push({
          q: `Which foundational principle governs "${topic}" in this curriculum?`,
          options: [
            "Hierarchical constraint checking & schema integrity",
            "Sequential pointer traversal in linked leaf nodes",
            "Two-phase state locking to guarantee serializability",
            "Elimination of transitive partial dependencies"
          ],
          answer: 0,
          explanation: `In ${topic}, constraint checking enforces system-wide invariants.`,
          citation: `${s.docs[0]?.name || "Course Notes"} §1`,
          quote: relatedExcerpt,
          topic
        });
        questions.push({
          q: `When evaluating edge cases in "${topic}", which condition causes failure or conflict?`,
          options: [
            "Violating primary determinant rules",
            "Exceeding maximum frame allocation limits",
            "Concurrent conflicting write locks on uncommitted states",
            "Deadlock circular dependency between tasks"
          ],
          answer: 2,
          explanation: `Conflicting write operations without appropriate lock phases violate consistency in ${topic}.`,
          citation: `${s.docs[0]?.name || "Course Notes"} §2`,
          quote: relatedExcerpt,
          topic
        });
      }
    }

    // If count is specified, limit questions to exactly `count`
    if (count && count > 0 && count < questions.length) {
      questions = questions.slice(0, count);
    }

    return { questions, topic: topicName || "all", totalAvailable: questions.length };
  }

  evaluate(answers: any[], subjectId?: string) {
    const s = this.getCurrentSubject(subjectId);
    const correctCount = answers.filter((a: any) => a.chosen === a.correct || a.chosen === a.answer).length;
    const score = Math.round((100 * correctCount) / (answers.length || 1));
    const attId = "att-" + (s.attempts.length + 1);

    const topic = answers.length && answers.every((a: any) => a.topic === answers[0].topic)
      ? answers[0].topic
      : undefined;

    s.attempts.push({
      id: attId,
      score,
      created_at: new Date().toISOString(),
      topic,
      totalQuestions: answers.length,
      correctCount
    });

    for (const a of answers) {
      const correct = a.correct ?? a.answer ?? 0;
      const chosen = a.chosen ?? -1;
      s.answers.push({
        attempt_id: attId,
        topic: a.topic,
        question: a.q,
        chosen,
        correct,
        is_correct: chosen === correct,
        explanation: a.explanation || "",
        citation: a.citation || ""
      });
    }

    // Update badges based on this score
    const gapReport = gaps(s.answers);
    this.updateBadges(s, gapReport);

    return { score, attemptId: attId, totalQuestions: answers.length, correctCount };
  }

  buildPlan(params: {
    mode?: "exam" | "paced";
    examDate?: string;
    days?: number;
    hours?: number;
    subjectId?: string;
  }) {
    const s = this.getCurrentSubject(params.subjectId);
    const last = s.attempts.at(-1);
    const ans = last ? s.answers.filter(a => a.attempt_id === last.id) : [];
    const gapList = gaps(ans);

    let totalDays = params.days || 7;
    if (params.mode === "exam" && params.examDate) {
      const diffMs = new Date(params.examDate).getTime() - Date.now();
      const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      totalDays = Math.min(30, diffDays);
    }

    const hoursPerDay = params.hours || 2;
    const totalMinutesPerDay = Math.round(hoursPerDay * 60);

    // Sort: weak first, medium second, strong last
    const sorted = [...gapList].sort((a, b) => {
      const rank: Record<string, number> = { weak: 1, medium: 2, strong: 3 };
      return (rank[a.level] || 2) - (rank[b.level] || 2);
    });

    const topicsToCover = sorted.length
      ? sorted
      : s.topics.map(t => ({ topic: t, level: "medium" }));

    const planItems: any[] = [];
    const weakTopics = gapList.filter(g => g.level === "weak").map(g => g.topic);
    const mediumTopics = gapList.filter(g => g.level === "medium").map(g => g.topic);
    const strongTopics = gapList.filter(g => g.level === "strong").map(g => g.topic);

    for (let day = 1; day <= totalDays; day++) {
      // If it's the final day before exam, reserve for mock testing
      if (params.mode === "exam" && day === totalDays) {
        planItems.push({
          day,
          topic: "Full Mock Exam & Formula Cheat-Sheet",
          minutes: totalMinutesPerDay,
          focus: "Simulated exam conditions covering all units; rapid active recall on missed concepts.",
          priority: "critical",
          completed: false
        });
        continue;
      }

      const t = topicsToCover[(day - 1) % topicsToCover.length];
      const isWeak = t.level === "weak";
      const isStrong = t.level === "strong";

      planItems.push({
        day,
        topic: t.topic,
        minutes: totalMinutesPerDay,
        focus: isWeak
          ? "Deep dive: Rebuild mental model, solve 5 practice problems, and re-test diagnostic quiz."
          : isStrong
          ? "Light speed review: Active flashcard recall and verify edge cases."
          : "Targeted revision: Review key definitions, derivations, and practice 2 problem sets.",
        priority: isWeak ? "high" : isStrong ? "low" : "medium",
        completed: false
      });
    }

    const planData = {
      mode: params.mode || "paced",
      examDate: params.examDate || null,
      days: totalDays,
      hours: hoursPerDay,
      totalHours: totalDays * hoursPerDay,
      items: planItems,
      weakTopicsCount: weakTopics.length,
      mediumTopicsCount: mediumTopics.length,
      strongTopicsCount: strongTopics.length
    };

    s.plan = planData;

    // Award strategic scholar badge
    const badge = s.badges.find(b => b.id === "planner");
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      badge.progress = 100;
      badge.unlockedAt = new Date().toISOString();
    }

    return { ok: true, plan: planData };
  }

  chat(query: string, subjectId?: string) {
    const s = this.getCurrentSubject(subjectId);
    const qLower = query.toLowerCase();

    for (const item of s.uploadedTexts) {
      const paragraphs = item.text.split(/\n\s*\n/);
      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const words = qLower.split(/\s+/).filter(w => w.length > 3);
        const match = words.some(w => p.toLowerCase().includes(w));
        if (match) {
          return {
            a: p.trim(),
            cites: [`[1] ${item.doc} §${i + 1}`]
          };
        }
      }
    }

    return {
      a: `Based on your ${s.name} course notes: "${query}" relates to core principles. Check your syllabus for unit definitions and review notes under ${s.topics[0] || "Unit 1"}.`,
      cites: [`[1] ${s.docs[0]?.name || "Course Notes"} §1`]
    };
  }

  private updateBadges(s: SubjectData, gaps: any[]) {
    // 1. Scout
    const scout = s.badges.find(b => b.id === "scout");
    if (scout && s.attempts.length > 0) {
      scout.unlocked = true;
      scout.progress = 100;
      scout.unlockedAt = scout.unlockedAt || s.attempts[0].created_at;
    }

    // 2. Hunter
    const hunter = s.badges.find(b => b.id === "hunter");
    if (hunter) {
      const hasWeak = gaps.some(g => g.level === "weak");
      const hasMultipleAttempts = s.attempts.length >= 2;
      if (hasWeak || hasMultipleAttempts) {
        hunter.progress = hasMultipleAttempts ? 100 : 50;
        if (hasMultipleAttempts) {
          hunter.unlocked = true;
          hunter.unlockedAt = hunter.unlockedAt || new Date().toISOString();
        }
      }
    }

    // 3. Vanguard
    const vanguard = s.badges.find(b => b.id === "vanguard");
    if (vanguard) {
      const topScore = Math.max(0, ...s.attempts.map(a => a.score));
      vanguard.progress = Math.min(100, Math.round((topScore / 80) * 100));
      if (topScore >= 80) {
        vanguard.unlocked = true;
        vanguard.unlockedAt = vanguard.unlockedAt || new Date().toISOString();
      }
    }

    // 4. Crystal Brain
    const scholar = s.badges.find(b => b.id === "scholar");
    if (scholar && gaps.length > 0) {
      const strongCount = gaps.filter(g => g.level === "strong").length;
      scholar.progress = Math.round((strongCount / gaps.length) * 100);
      if (strongCount === gaps.length && strongCount >= 3) {
        scholar.unlocked = true;
        scholar.unlockedAt = scholar.unlockedAt || new Date().toISOString();
      }
    }
  }

  getBrief(subjectId?: string, docId?: string): SyllabusBrief {
    const s = this.getCurrentSubject(subjectId);

    if (s.id === "dbms") {
      return {
        title: "Database Management Systems (DBMS)",
        code: "CS301",
        summary: "A rigorous exploration of relational database architecture, relational algebra, transaction ACID invariants, concurrency protocols, and storage indexing.",
        targetAudience: "Computer Science Undergraduates, Software Engineers & Competitive Exam Candidates",
        totalModules: 7,
        estimatedHours: 24,
        modules: [
          {
            unit: "Unit 1",
            title: "Entity-Relationship Model",
            whatItIs: "Conceptual data modeling technique using entities, attributes, and relationships.",
            keyConcepts: ["Entity sets", "Weak entities (owner dependence)", "Cardinalities (1:1, 1:N, M:N)", "Identifying relationships"],
            examImportance: "High — Frequently appears in ER-to-relational schema conversion questions."
          },
          {
            unit: "Unit 2",
            title: "Relational Model and Keys",
            whatItIs: "Mathematical framework representing data as tables of tuples governed by constraints.",
            keyConcepts: ["Superkey", "Candidate key (minimal superkey)", "Primary key", "Foreign key & referential integrity"],
            examImportance: "Critical — Foundation for functional dependency derivations."
          },
          {
            unit: "Unit 3",
            title: "Normalization (1NF to BCNF)",
            whatItIs: "Algorithmic process to eliminate update, insertion, and deletion anomalies through dependency decomposition.",
            keyConcepts: ["1NF (atomic attributes)", "2NF (no partial dependencies)", "3NF (no transitive dependencies)", "BCNF (determinants must be superkeys)"],
            examImportance: "Very High — Core exam focus on checking highest normal form."
          },
          {
            unit: "Unit 4",
            title: "SQL Queries and Joins",
            whatItIs: "Declarative query language for schema definition, filtering, aggregation, and relational joins.",
            keyConcepts: ["INNER JOIN vs LEFT/RIGHT JOIN", "GROUP BY aggregation", "HAVING vs WHERE filtering order", "Correlated subqueries"],
            examImportance: "High — Practical query writing and output prediction."
          },
          {
            unit: "Unit 5",
            title: "Transactions and ACID",
            whatItIs: "Execution of atomic operations preserving database consistency across crashes and interruptions.",
            keyConcepts: ["Atomicity (all-or-nothing)", "Consistency (state validation)", "Isolation (concurrency barrier)", "Durability (write-ahead log WAL)"],
            examImportance: "Critical — Core conceptual definitions in all systems exams."
          },
          {
            unit: "Unit 6",
            title: "Indexing and B+ Trees",
            whatItIs: "Self-balancing multi-level tree data structures that accelerate record retrieval and range scans.",
            keyConcepts: ["Linked leaf nodes for range queries", "Clustered index (physical row order)", "Non-clustered secondary indexes", "Internal routing nodes"],
            examImportance: "High — Tree order and disk I/O calculations."
          },
          {
            unit: "Unit 7",
            title: "Concurrency Control and Locking",
            whatItIs: "Mechanisms to ensure interleaved transaction schedules maintain serializability without race conditions.",
            keyConcepts: ["Two-Phase Locking (2PL growing/shrinking)", "Conflict serializability", "Deadlock wait-for graphs", "Victim transaction abort"],
            examImportance: "Very High — Precedence graphs and 2PL verification."
          }
        ],
        prerequisites: ["Set Theory & Discrete Math", "Basic Data Structures (Trees, Arrays)", "Algorithmic Complexity"],
        examPitfalls: [
          "Confusing WHERE (filters rows before aggregation) with HAVING (filters groups after aggregation).",
          "Assuming Two-Phase Locking (2PL) prevents deadlocks (it ensures serializability, but can still deadlock!).",
          "Forgetting that in BCNF, every functional dependency determinant must be a candidate/superkey."
        ],
        diagnosticStrategy: "Test Normalization and Concurrency first; these two units represent over 45% of typical database exam weightage."
      };
    }

    if (s.id === "os") {
      return {
        title: "Operating Systems (OS)",
        code: "CS302",
        summary: "Fundamental software architecture managing hardware abstractions, process execution, memory virtualization, and device I/O.",
        targetAudience: "Systems Engineering Students & Technical Exam Candidates",
        totalModules: 5,
        estimatedHours: 20,
        modules: [
          {
            unit: "Unit 1",
            title: "Processes and Threads",
            whatItIs: "Units of execution and resource ownership within modern multitasking kernels.",
            keyConcepts: ["PCB structure", "Kernel threads vs user threads", "Context switching overhead", "Fork & exec semantics"],
            examImportance: "High — Fundamental process lifecycle state machines."
          },
          {
            unit: "Unit 2",
            title: "CPU Scheduling Algorithms",
            whatItIs: "Policies deciding which ready process is allocated CPU cycles.",
            keyConcepts: ["FCFS & Convoy Effect", "SJF (optimal average wait time)", "Round Robin quantum tuning", "Preemptive vs non-preemptive"],
            examImportance: "Very High — Gantt chart calculation questions."
          },
          {
            unit: "Unit 3",
            title: "Deadlock & Banker's Algorithm",
            whatItIs: "Resource allocation deadlocks and algorithmic avoidance of unsafe states.",
            keyConcepts: ["4 Coffman conditions", "Resource Allocation Graph (RAG)", "Banker's safety algorithm", "Deadlock recovery"],
            examImportance: "Critical — Matrix state evaluation for deadlock freedom."
          },
          {
            unit: "Unit 4",
            title: "Memory Management and Paging",
            whatItIs: "Virtual address space translation to physical frames using page tables.",
            keyConcepts: ["Logical vs physical address", "Translation Lookaside Buffer (TLB)", "Multi-level page tables", "Internal fragmentation"],
            examImportance: "High — Effective memory access time (EMAT) calculations."
          },
          {
            unit: "Unit 5",
            title: "Virtual Memory and Page Replacement",
            whatItIs: "Demand paging algorithms managing frame swaps between RAM and backing disk storage.",
            keyConcepts: ["Page fault handling", "FIFO & Belady's Anomaly", "Least Recently Used (LRU)", "Thrashing & Working Set Model"],
            examImportance: "High — Page fault count comparison under different frame sizes."
          }
        ],
        prerequisites: ["Computer Organization & Assembly Basics", "Data Structures (Queues, Hashmaps)"],
        examPitfalls: [
          "Believing FIFO page replacement always improves with more frames (Belady's anomaly contradicts this!).",
          "Confusing starvation with deadlock (starvation has progress elsewhere; deadlock has circular waiting with zero progress)."
        ],
        diagnosticStrategy: "Practice CPU scheduling Gantt charts and Banker's safety matrix calculations first."
      };
    }

    // Dynamic brief for newly uploaded or custom subjects
    const docEntry = docId
      ? s.uploadedTexts.find(t => t.docId === docId)
      : s.uploadedTexts[0];
    const rawText = docEntry ? docEntry.text : "No syllabus text available";

    return {
      title: `${s.name} (${s.code})`,
      code: s.code,
      summary: `Automated cognitive brief generated for ${s.name}. Extracted from ${s.docs[0]?.name || "uploaded materials"}.`,
      targetAudience: "Self-Paced Learners & Exam Revision Candidates",
      totalModules: s.topics.length,
      estimatedHours: Math.max(12, s.topics.length * 3),
      modules: s.topics.map((t, idx) => ({
        unit: `Module ${idx + 1}`,
        title: t,
        whatItIs: `Core curriculum unit focusing on principles, rules, and operations of ${t}.`,
        keyConcepts: [`Foundations of ${t}`, `Key Invariants & Rules`, `Practical Applications`],
        examImportance: idx < 2 ? "High (Foundational)" : "Medium to High"
      })),
      prerequisites: ["Fundamental course literacy", "Introductory domain vocabulary"],
      examPitfalls: [
        "Skipping foundational unit definitions before attempting advanced diagnostic questions.",
        "Re-reading passively rather than testing retrieval recall against source citations."
      ],
      diagnosticStrategy: "Start with a 10-question diagnostic quiz to immediately identify which of the modules need focused revision."
    };
  }
}

// Global singleton
declare global {
  // eslint-disable-next-line no-var
  var __mockDb: MockDb | undefined;
}

export const mockDb = global.__mockDb ?? new MockDb();
if (process.env.NODE_ENV !== "production") {
  global.__mockDb = mockDb;
}
