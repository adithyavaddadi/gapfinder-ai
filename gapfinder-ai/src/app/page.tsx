"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// Check whether demo mode should be used
const isMock =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
);

// Navigation tabs
const NAV_ITEMS = [
  { id: "materials", label: "Materials", icon: "book", desc: "Upload and inspect notes & syllabus" },
  { id: "topics", label: "Topic Map", icon: "map", desc: "Curriculum taxonomy of key concepts" },
  { id: "quiz", label: "Diagnostic Quiz", icon: "target", desc: "Targeted test to reveal knowledge gaps" },
  { id: "gaps", label: "Gap Report", icon: "shield", desc: "Auditable diagnosis of weak vs strong areas" },
  { id: "plan", label: "Revision Plan", icon: "calendar", desc: "Adaptive exam countdown & paced study" },
  { id: "ask", label: "Ask AI Tutor", icon: "message", desc: "Grounded Q&A citing only your materials" },
  { id: "progress", label: "Progress & Awards", icon: "chart", desc: "Cognitive analytics & mastery awards" }
];

const MOTIVATIONAL_QUOTES = [
  {
    quote: "The first principle is that you must not fool yourself — and you are the easiest person to fool.",
    author: "Richard Feynman",
    role: "Nobel Laureate in Physics"
  },
  {
    quote: "Diagnosing what you don't know yet is the highest leverage form of learning.",
    author: "Barbara Oakley",
    role: "Author of Learning How to Learn"
  },
  {
    quote: "Knowledge has to be improved, challenged, and increased constantly, or it vanishes.",
    author: "Peter F. Drucker",
    role: "Pioneer in Management"
  },
  {
    quote: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    role: "Stoic Philosopher"
  },
  {
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    role: "Philosopher & Leader"
  }
];

// Clean handcrafted SVG Icons
function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  switch (name) {
    case "book":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "map":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case "target":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "message":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case "refresh":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case "upload":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      );
    case "quote":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-8.983z" />
        </svg>
      );
    case "eye":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "award":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 13l-4-4m4 4l4-4" />
        </svg>
      );
    case "check":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case "x":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
}

// Universal API invoker
async function api(op: string, body?: any, form?: FormData) {
  let token = "demo-token";
  if (!isMock) {
    const { data } = await sb.auth.getSession();
    token = data.session?.access_token || "";
  } else {
    try {
      const saved = localStorage.getItem("gapfinder_demo_session");
      if (saved) token = JSON.parse(saved).access_token || "demo-token";
    } catch {}
  }

  const r = await fetch("/api/" + op, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      ...(form ? {} : { "Content-Type": "application/json" })
    },
    body: form || JSON.stringify(body || {})
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error);
  return j;
}

// Styled Glass Card
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-panel rounded-2xl p-6 shadow-sm border border-lav-200/70 transition-all ${className}`}>
      {children}
    </div>
  );
}

// Styled Action Button
function ActionBtn({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button"
}: any) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer whitespace-nowrap select-none";
  const styles: Record<string, string> = {
    primary: "bg-lav-700 text-white hover:bg-ink shadow-lav-700/20",
    accent: "bg-chart text-ink hover:brightness-95 font-bold shadow-chart/25",
    secondary: "bg-lav-100 text-lav-700 hover:bg-lav-200/80",
    outline: "border border-lav-300 text-lav-700 hover:bg-white bg-white/60"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export default function Home() {
  const [ses, setSes] = useState<any>(undefined);

  useEffect(() => {
    if (isMock) {
      try {
        const saved = localStorage.getItem("gapfinder_demo_session");
        if (saved) {
          setSes(JSON.parse(saved));
          return;
        }
      } catch {}
      setSes(null);
      return;
    }

    sb.auth.getSession().then(({ data }) => setSes(data.session)).catch(() => setSes(null));
    const { data } = sb.auth.onAuthStateChange((_, s) => setSes(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (ses === undefined) return null;
  return ses ? <App onSignOut={() => setSes(null)} /> : <Login onSignIn={(s: any) => setSes(s)} />;
}

// Advanced Login Screen
function Login({ onSignIn }: { onSignIn: (s: any) => void }) {
  const [email, setEmail] = useState("demo@gapfinder.app");
  const [password, setPassword] = useState("Demo@1234");
  const [msg, setMsg] = useState("");
  const [quoteIdx, setQuoteIdx] = useState(0);

  const activeQuote = MOTIVATIONAL_QUOTES[quoteIdx];

  const handleAuth = async (isSignUp: boolean) => {
    if (isMock) {
      const demoSes = {
        user: { email: email || "demo@gapfinder.app" },
        access_token: "demo-token"
      };
      localStorage.setItem("gapfinder_demo_session", JSON.stringify(demoSes));
      onSignIn(demoSes);
      return;
    }

    try {
      const res = isSignUp
        ? await sb.auth.signUp({ email, password })
        : await sb.auth.signInWithPassword({ email, password });
      if (res.error) setMsg(res.error.message);
      else if (isSignUp) setMsg("Account created. Please sign in.");
    } catch (err: any) {
      setMsg(err.message || "Failed to authenticate.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#F8F5FF]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-lav-200/80 bg-white">
        
        {/* Left Side: Visual Hero Showcase */}
        <div className="lg:col-span-7 relative bg-ink text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105"
            style={{ backgroundImage: `url('/images/hero.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-chart mb-6">
              <Icon name="sparkles" className="w-4 h-4 text-chart" />
              AI Cognitive Diagnostic Studio
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display leading-tight">
              Gap<span className="text-chart bg-chart/10 px-2 py-0.5 rounded-lg border border-chart/30 ml-1">Finder</span>
            </h1>
            <p className="mt-4 text-white/80 text-base md:text-lg max-w-md leading-relaxed">
              Find what you don't know you don't know. Transform course materials into deterministic diagnostic tests and personalized study paths.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="relative z-10 grid grid-cols-2 gap-4 my-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-chart/20 text-chart flex items-center justify-center mb-2 font-bold text-sm">
                01
              </div>
              <h4 className="font-semibold text-white text-sm">Ground Truth RAG</h4>
              <p className="text-xs text-white/60 mt-1">Every question cites exact excerpts from your uploaded notes.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-lav-300/20 text-lav-300 flex items-center justify-center mb-2 font-bold text-sm">
                02
              </div>
              <h4 className="font-semibold text-white text-sm">Auditable Diagnosis</h4>
              <p className="text-xs text-white/60 mt-1">Deterministic weak/medium/strong ratings computed strictly in code.</p>
            </div>
          </div>

          {/* Quote Ticker */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <div className="flex items-start gap-3">
              <Icon name="quote" className="w-5 h-5 text-chart shrink-0 mt-1" />
              <div>
                <p className="text-sm italic text-white/90">"{activeQuote.quote}"</p>
                <p className="text-xs text-chart font-semibold mt-1">
                  — {activeQuote.author}, <span className="text-white/60 font-normal">{activeQuote.role}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 mt-4">
              {MOTIVATIONAL_QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-chart" : "w-2 bg-white/20"}`}
                  aria-label={`Show quote ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Sign-in Form */}
        <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider font-bold text-lav-700 bg-lav-50 px-2.5 py-1 rounded-md border border-lav-200">
              {isMock ? "⚡ Local Demo Ready" : "Production Cloud"}
            </span>
            <h2 className="text-2xl font-bold mt-3 text-ink font-display">Welcome to your Study Hub</h2>
            <p className="text-xs text-ink/60 mt-1">Sign in with demo credentials to test all features instantly.</p>
          </div>

          {isMock && (
            <div className="mb-6 p-4 rounded-xl bg-chart/15 border border-chart/40 text-xs text-ink/80 leading-relaxed flex items-start gap-3">
              <Icon name="sparkles" className="w-5 h-5 text-lav-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink">Zero Setup Required</p>
                <p className="mt-0.5">Click <b>Sign In</b> below to launch the pre-seeded DBMS curriculum, interactive quiz, and revision planner.</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAuth(false); }}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-lav-300 focus:border-lav-700 focus:ring-2 focus:ring-lav-300/40 text-sm transition-all"
                placeholder="student@gapfinder.app"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-lav-300 focus:border-lav-700 focus:ring-2 focus:ring-lav-300/40 text-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {msg && <p className="text-tomato text-xs font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">{msg}</p>}

            <div className="pt-2 flex flex-col gap-2">
              <ActionBtn type="submit" variant="primary" className="w-full py-3 text-sm">
                Sign In to Dashboard
              </ActionBtn>
              <ActionBtn onClick={() => handleAuth(true)} variant="secondary" className="w-full py-2.5">
                Create New Student Account
              </ActionBtn>
            </div>
          </form>

          <p className="text-xs text-center text-ink/50 mt-6">
            Default credentials are automatically prefilled for testing.
          </p>
        </div>

      </div>
    </div>
  );
}

// Main Interactive Dashboard with Multi-Subject & Adaptive Engine
function App({ onSignOut }: { onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState("materials");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [state, setState] = useState<any>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Multi-Subject state
  const [currentSubjectId, setCurrentSubjectId] = useState("dbms");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  // Document Inspection Modal State
  const [inspectedDoc, setInspectedDoc] = useState<any | null>(null);

  // Topic Focus Drawer / Modal State
  const [focusedTopic, setFocusedTopic] = useState<string | null>(null);

  // Topic Map View Mode: graph or cards
  const [topicViewMode, setTopicViewMode] = useState<"graph" | "cards">("graph");

  // Syllabus & Course Brief State
  const [syllabusBrief, setSyllabusBrief] = useState<any | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);

  // File upload UI state
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quiz state, question count & topic filtering
  const [selectedQuizTopic, setSelectedQuizTopic] = useState("all");
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(10);
  const [questions, setQuestions] = useState<any[]>([]);
  const [picks, setPicks] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Adaptive Plan state
  const [planMode, setPlanMode] = useState<"exam" | "paced">("exam");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [planDays, setPlanDays] = useState(7);
  const [planHours, setPlanHours] = useState(2);
  const [uploadKind, setUploadKind] = useState("notes");
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});

  const activeQuote = MOTIVATIONAL_QUOTES[quoteIdx];
  const nextQuote = () => setQuoteIdx((quoteIdx + 1) % MOTIVATIONAL_QUOTES.length);

  const loadData = async (subjectId = currentSubjectId) => {
    try {
      const data = await api("state", { subjectId });
      setState(data);
      if (data.currentSubjectId) setCurrentSubjectId(data.currentSubjectId);
      return data;
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    (async () => {
      setBusy("Loading study materials and curriculum...");
      try {
        let res = await api("state", { subjectId: currentSubjectId });
        if (!res.docs || !res.docs.length) {
          await api("seed", { subjectId: currentSubjectId });
          res = await api("state", { subjectId: currentSubjectId });
        }
        setState(res);
        if (res.currentSubjectId) setCurrentSubjectId(res.currentSubjectId);
      } catch (e: any) {
        setError(e.message);
      }
      setBusy("");
    })();
  }, []);

  const runAction = async (label: string, actionFn: () => Promise<any>) => {
    setBusy(label);
    setError("");
    try {
      await actionFn();
      await loadData(currentSubjectId);
    } catch (e: any) {
      setError(e.message);
    }
    setBusy("");
  };

  const handleSignOut = async () => {
    if (isMock) {
      localStorage.removeItem("gapfinder_demo_session");
      onSignOut();
      return;
    }
    await sb.auth.signOut();
    onSignOut();
  };

  // Switch Active Subject
  const handleSwitchSubject = async (subId: string) => {
    setCurrentSubjectId(subId);
    setSelectedQuizTopic("all");
    setQuestions([]);
    setPicks([]);
    setScore(null);
    setChatMessages([]);
    setSuccessMsg("");
    setBusy(`Switching subject...`);
    try {
      await api("switch_subject", { subjectId: subId });
      const data = await api("state", { subjectId: subId });
      setState(data);
      if (data.currentSubjectId) setCurrentSubjectId(data.currentSubjectId);
      setSuccessMsg(`Active subject switched to ${data.currentSubjectName || subId}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  // Add New Subject
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const name = newSubjectName.trim();
    setNewSubjectName("");
    setShowAddSubjectModal(false);
    setBusy(`Creating subject: ${name}...`);
    try {
      const res = await api("add_subject", { name });
      const newId = res.currentSubjectId || res.subject?.id;
      setCurrentSubjectId(newId);
      const data = await api("state", { subjectId: newId });
      setState(data);
      setActiveTab("materials");
      setSuccessMsg(`Subject "${name}" created and activated!`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  // Delete Active Subject
  const handleDeleteSubject = async (subId: string) => {
    const sub = state?.subjects?.find((s: any) => s.id === subId);
    const subName = sub ? sub.name : subId;
    if (!window.confirm(`Are you sure you want to delete "${subName}" from your workspace?`)) {
      return;
    }
    setBusy(`Deleting subject: ${subName}...`);
    try {
      const res = await api("delete_subject", { subjectId: subId });
      if (res.error) throw new Error(res.error);
      const nextId = res.currentSubjectId || "dbms";
      setCurrentSubjectId(nextId);
      const data = await api("state", { subjectId: nextId });
      setState(data);
      setSuccessMsg(`Subject "${subName}" deleted.`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  // Inspect Document Modal
  const handleInspectDoc = async (docId: string) => {
    try {
      setBusy("Reading document excerpts...");
      const res = await api("inspect_doc", { docId, subjectId: currentSubjectId });
      setInspectedDoc(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  // Fetch and display Syllabus & Course Brief
  const handleOpenBrief = async (docId?: string) => {
    try {
      setBusy("Analyzing syllabus structure & generating course brief...");
      const brief = await api("brief", { subjectId: currentSubjectId, docId });
      setSyllabusBrief(brief);
      setShowBriefModal(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  // Fetch or filter quiz questions with custom question count
  const loadQuiz = async (topic = selectedQuizTopic, count = quizQuestionCount) => {
    setSelectedQuizTopic(topic);
    setQuizQuestionCount(count);
    await runAction(
      topic === "all"
        ? `Generating ${count} diagnostic questions across curriculum`
        : `Generating diagnostic test for ${topic}`,
      async () => {
        const res = await api("quiz", { topic, subjectId: currentSubjectId, count });
        setQuestions(res.questions);
        setPicks(res.questions.map(() => -1));
        setScore(null);
      }
    );
  };

  // Computed summary stats
  const stats = useMemo(() => {
    if (!state) return { docs: 0, topics: 0, weak: 0, medium: 0, strong: 0, avgScore: 0, completedPct: 0 };
    const docs = state.docs?.length || 0;
    const topics = state.topics?.length || 0;
    const gaps = state.gaps || [];
    const weak = gaps.filter((g: any) => g.level === "weak").length;
    const medium = gaps.filter((g: any) => g.level === "medium").length;
    const strong = gaps.filter((g: any) => g.level === "strong").length;
    const attempts = state.attempts || [];
    const avgScore = attempts.length
      ? Math.round(attempts.reduce((acc: number, a: any) => acc + a.score, 0) / attempts.length)
      : 0;

    const totalPlanItems = state.plan?.items?.length || 0;
    const completedCount = Object.values(completedDays).filter(Boolean).length;
    const completedPct = totalPlanItems ? Math.round((completedCount / totalPlanItems) * 100) : 0;

    return { docs, topics, weak, medium, strong, avgScore, completedPct };
  }, [state, completedDays]);

  const allAnswered = questions.length > 0 && picks.length === questions.length && picks.every(p => p >= 0);

  // Dynamic context action in top bar
  const renderTopBarAction = () => {
    switch (activeTab) {
      case "quiz":
        if (questions.length > 0 && score === null) {
          const completedCount = picks.filter(p => p >= 0).length;
          return (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-lav-100 text-lav-700">
              {completedCount} / {questions.length} Answered
            </span>
          );
        }
        return (
          <ActionBtn onClick={() => loadQuiz("all")} variant="accent" className="text-xs py-2 px-3.5">
            <Icon name="target" className="w-4 h-4" />
            {questions.length ? "New Comprehensive Test" : "Start Full Quiz"}
          </ActionBtn>
        );
      case "topics":
        return (
          <ActionBtn
            onClick={() => runAction("Re-extracting syllabus taxonomy", () => api("topics", { subjectId: currentSubjectId }))}
            variant="primary"
            className="text-xs py-2 px-3.5"
          >
            <Icon name="refresh" className="w-4 h-4" />
            Re-Extract Topics
          </ActionBtn>
        );
      case "plan":
        return (
          <ActionBtn
            onClick={() =>
              runAction("Building adaptive study schedule", () =>
                api("plan", {
                  mode: planMode,
                  examDate,
                  days: planDays,
                  hours: planHours,
                  subjectId: currentSubjectId
                })
              )
            }
            variant="primary"
            className="text-xs py-2 px-3.5"
          >
            <Icon name="calendar" className="w-4 h-4" />
            Update Adaptive Plan
          </ActionBtn>
        );
      default:
        return (
          <ActionBtn onClick={() => { setActiveTab("quiz"); loadQuiz("all"); }} variant="accent" className="text-xs py-2 px-3.5">
            <Icon name="target" className="w-4 h-4" />
            Take Diagnostic Test
          </ActionBtn>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F5FF] text-ink antialiased">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-lav-200 px-4 py-3 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lav-700 text-chart flex items-center justify-center font-bold text-sm">
            G
          </div>
          <span className="font-bold text-base font-display">GapFinder</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-lav-700 hover:bg-lav-50 border border-lav-200"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Docked Sidebar Controls */}
      <aside
        className={`bg-white border-r border-lav-200/80 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${
          sidebarOpen ? "md:w-64 lg:w-72" : "md:w-20"
        } ${
          mobileMenuOpen ? "fixed inset-0 top-[57px] bg-white w-full" : "hidden md:flex md:sticky md:top-0 md:h-screen"
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Header & Brand */}
          <div className="p-4 lg:p-5 flex items-center justify-between border-b border-lav-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-lav-700 text-chart flex items-center justify-center font-bold text-base shadow-sm">
                G
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-extrabold text-base text-ink font-display tracking-tight leading-none">
                    Gap<span className="text-lav-700">Finder</span>
                  </h2>
                  <span className="text-[10px] font-bold text-lav-500 uppercase tracking-widest">
                    Cognitive Studio
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-1.5 rounded-lg text-lav-700 hover:bg-lav-50 border border-lav-200 transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </button>
          </div>

          {/* Subject Switcher Pill in Sidebar */}
          {sidebarOpen && (
            <div className="px-4 pt-3 pb-1 shrink-0">
              <label className="text-[10px] font-bold text-lav-500 uppercase tracking-wider block mb-1.5">
                Active Subject
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={currentSubjectId}
                  onChange={e => handleSwitchSubject(e.target.value)}
                  className="flex-1 bg-lav-50 border border-lav-200 text-xs font-bold text-ink rounded-xl px-2.5 py-1.5 truncate cursor-pointer hover:bg-lav-100/70"
                >
                  {state?.subjects?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="p-1.5 rounded-xl border border-lav-200 bg-white hover:bg-lav-100 text-lav-700 text-xs font-bold"
                  title="Add new subject"
                >
                  +
                </button>
                {state?.subjects?.length > 1 && (
                  <button
                    onClick={() => handleDeleteSubject(currentSubjectId)}
                    className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold"
                    title="Delete current subject"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Metrics Bar in Sidebar */}
          {sidebarOpen && (
            <div className="p-3 mx-3 mt-2 rounded-2xl bg-gradient-to-br from-lav-50 to-white border border-lav-200 shadow-sm shrink-0">
              <div className="flex justify-between items-center text-xs font-semibold text-lav-700">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-chart animate-ping" />
                  Subject Mastery
                </span>
                <span className="bg-lav-100 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  {stats.avgScore > 0 ? `${stats.avgScore}% Avg` : "Diagnosing"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-lav-100 text-center">
                <div>
                  <div className="text-xs text-tomato font-bold">{stats.weak}</div>
                  <div className="text-[9px] text-ink/60 uppercase font-semibold">Weak</div>
                </div>
                <div>
                  <div className="text-xs text-lav-500 font-bold">{stats.medium}</div>
                  <div className="text-[9px] text-ink/60 uppercase font-semibold">Medium</div>
                </div>
                <div>
                  <div className="text-xs text-chart font-bold bg-ink px-1 rounded inline-block">{stats.strong}</div>
                  <div className="text-[9px] text-ink/60 uppercase font-semibold">Strong</div>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Nav Item List */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0">
            {NAV_ITEMS.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                    isActive
                      ? "bg-lav-700 text-white shadow-md shadow-lav-700/20 font-semibold"
                      : "text-ink/70 hover:bg-lav-100/70 hover:text-ink"
                  }`}
                  title={item.desc}
                >
                  <Icon name={item.icon} className={`w-4 h-4 shrink-0 ${isActive ? "text-chart" : "text-lav-500"}`} />
                  {sidebarOpen && (
                    <div className="flex-1 truncate flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.id === "materials" && stats.docs > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-lav-100 text-lav-700"}`}>
                          {stats.docs}
                        </span>
                      )}
                      {item.id === "topics" && stats.topics > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-lav-100 text-lav-700"}`}>
                          {stats.topics}
                        </span>
                      )}
                      {item.id === "gaps" && stats.weak > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tomato text-white font-bold">
                          {stats.weak}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Fixed Bottom Section */}
        <div className="p-3 border-t border-lav-100 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-2">
            {sidebarOpen && (
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-full bg-lav-200 text-lav-700 flex items-center justify-center text-xs font-bold shrink-0">
                  S
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-ink truncate leading-tight">Student Demo</p>
                  <p className="text-[10px] text-ink/50 truncate">demo@gapfinder.app</p>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className={`p-2 text-ink/60 hover:text-tomato hover:bg-red-50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 ${
                !sidebarOpen ? "w-full justify-center" : ""
              }`}
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-lav-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-lav-500 uppercase tracking-wider">
              <span>{state?.currentSubjectName || "Curriculum"}</span>
              <span>/</span>
              <span className="text-lav-700 font-bold">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-ink font-display mt-0.5">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Quick Subject Switcher */}
            <div className="flex items-center gap-1.5 bg-lav-50/80 p-1 rounded-xl border border-lav-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-lav-500 pl-1.5 hidden sm:inline">Subject:</span>
              <select
                value={currentSubjectId}
                onChange={e => handleSwitchSubject(e.target.value)}
                className="bg-transparent text-xs font-bold text-ink cursor-pointer outline-none max-w-[130px] sm:max-w-[160px] truncate"
              >
                {state?.subjects?.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(true)}
                className="w-6 h-6 rounded-lg bg-white border border-lav-200 hover:bg-lav-100 text-xs font-bold text-lav-700 flex items-center justify-center shadow-xs cursor-pointer"
                title="Add new subject"
              >
                +
              </button>
              {state?.subjects?.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSubject(currentSubjectId)}
                  className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-[11px] font-bold text-rose-600 flex items-center justify-center shadow-xs cursor-pointer"
                  title="Delete current subject"
                >
                  ✕
                </button>
              )}
            </div>

            {isMock && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chart/20 text-ink border border-chart/40 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-chart" />
                Local Demo
              </span>
            )}
            {renderTopBarAction()}
          </div>
        </header>

        {/* Global Notifications */}
        {busy && (
          <div className="bg-lav-700 text-white px-6 py-2 text-xs font-semibold flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">
              <Icon name="refresh" className="w-3.5 h-3.5 animate-spin text-chart" />
              {busy.length > 30 ? busy : `${busy}...`}
            </span>
            <span className="text-white/60 text-[10px]">Cognitive Diagnostic Engine</span>
          </div>
        )}
        {error && (
          <div className="bg-red-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="underline text-white/80 hover:text-white">
              Dismiss
            </button>
          </div>
        )}
        {successMsg && (
          <div className="bg-chart text-ink px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-sm">
            <span>🎉 {successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="underline hover:text-lav-700">
              Close
            </button>
          </div>
        )}

        {/* Workspace Container */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* TAB 1: MATERIALS */}
          {activeTab === "materials" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Upload & Materials List */}
              <div className="lg:col-span-8 space-y-6">
                <GlassCard>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-lav-100">
                    <div>
                      <h2 className="text-lg font-bold text-ink font-display">Study Vault & Course Materials</h2>
                      <p className="text-xs text-ink/60">
                        Click on any document to inspect its text, extract topics, or test questions.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-lav-700 bg-lav-100 px-3 py-1 rounded-full self-start sm:self-auto">
                      {state?.docs?.length || 0} Documents in {state?.currentSubjectCode}
                    </span>
                  </div>

                  {/* Executive Syllabus & Course Brief Banner */}
                  <div className="mb-5 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-lav-900 via-ink to-lav-950 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-chart/20 text-chart border border-chart/30 text-[10px] font-bold uppercase tracking-wider">
                          Syllabus Intelligence
                        </span>
                        <span className="text-xs text-white/70">• Complete Course Orientation</span>
                      </div>
                      <h3 className="text-base font-bold text-white font-display">
                        {state?.currentSubjectName} &bull; Executive Syllabus Brief
                      </h3>
                      <p className="text-xs text-white/70 max-w-xl mt-1 leading-relaxed">
                        Read a structured breakdown of what this subject is, what units exist, key concepts, prerequisites, and common exam pitfalls before taking tests.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenBrief()}
                      className="relative z-10 px-4 py-2.5 rounded-xl bg-chart text-ink font-bold text-xs hover:bg-chart/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                    >
                      <Icon name="sparkles" className="w-4 h-4 text-ink" />
                      Read Course Brief
                    </button>
                  </div>

                  {/* Document Grid with Interactive Click to Inspect */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {state?.docs?.map((d: any) => (
                      <div
                        key={d.id}
                        onClick={() => handleInspectDoc(d.id)}
                        className="p-4 rounded-xl border border-lav-200/80 bg-white hover:border-lav-500 hover:shadow-md transition-all flex items-start gap-3.5 shadow-sm group cursor-pointer"
                        title="Click to view and inspect document"
                      >
                        <div className="p-2.5 rounded-lg bg-lav-50 text-lav-700 group-hover:bg-lav-700 group-hover:text-chart transition-colors shrink-0">
                          <Icon name="book" className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-lav-100 text-lav-700">
                              {d.kind}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenBrief(d.id);
                                }}
                                className="text-[11px] text-lav-700 font-semibold hover:underline flex items-center gap-1"
                                title="Read structured brief for this document"
                              >
                                <Icon name="sparkles" className="w-3.5 h-3.5 text-chart fill-lav-700" />
                                Brief
                              </button>
                              <span className="text-[11px] text-ink/30">•</span>
                              <span className="text-[11px] text-lav-700 font-semibold group-hover:underline flex items-center gap-1">
                                <Icon name="eye" className="w-3.5 h-3.5" />
                                Raw
                              </span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-sm text-ink truncate mt-1.5">{d.name}</h4>
                          <p className="text-[11px] text-ink/50 mt-0.5">Click to inspect excerpts & topics</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean File Upload Box with Custom File Button */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      fd.append("subjectId", currentSubjectId);
                      runAction("Indexing and vectorizing uploaded file", async () => {
                        const res = await api("upload", null, fd);
                        setSelectedFileName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        setSuccessMsg(`File uploaded! Extracted ${res.extractedTopicsCount || "new"} syllabus topics.`);
                        // Auto-open course brief so students immediately know what is inside!
                        await handleOpenBrief(res.docId);
                      });
                    }}
                    className="p-5 rounded-2xl border-2 border-dashed border-lav-300 bg-lav-50/50 hover:bg-lav-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-lav-700 text-chart flex items-center justify-center shrink-0 shadow-sm">
                          <Icon name="upload" className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-ink">Upload Notes or Syllabus</h4>
                          <p className="text-xs text-ink/60">Upload files for {state?.currentSubjectName}. Topics and questions adapt automatically.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                        <select
                          name="kind"
                          value={uploadKind}
                          onChange={e => setUploadKind(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-lav-300 text-xs font-semibold bg-white cursor-pointer h-10"
                        >
                          <option value="syllabus">Syllabus</option>
                          <option value="notes">Notes</option>
                          <option value="past paper">Past Paper</option>
                        </select>

                        {/* Hidden Native Input */}
                        <input
                          ref={fileInputRef}
                          name="file"
                          type="file"
                          accept=".pdf,.txt,.md"
                          required
                          onChange={e => {
                            const f = e.target.files?.[0];
                            setSelectedFileName(f ? f.name : "");
                          }}
                          className="hidden"
                          id="file-upload-input"
                        />

                        {/* Styled Choose File Button */}
                        <label
                          htmlFor="file-upload-input"
                          className="px-3.5 py-2 rounded-xl border border-lav-300 bg-white hover:bg-lav-100/70 text-xs font-semibold text-lav-700 cursor-pointer transition-colors h-10 flex items-center max-w-[180px] truncate"
                          title={selectedFileName || "Choose file"}
                        >
                          {selectedFileName ? (
                            <span className="truncate">📄 {selectedFileName}</span>
                          ) : (
                            <span>Choose Document...</span>
                          )}
                        </label>

                        <ActionBtn type="submit" variant="primary" className="text-xs h-10">
                          Upload & Vectorize
                        </ActionBtn>
                      </div>
                    </div>
                  </form>
                </GlassCard>
              </div>

              {/* Right Column: Motivation & Subject Info */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Hero Artwork Card */}
                <div className="rounded-2xl overflow-hidden border border-lav-200 shadow-sm relative group bg-ink text-white">
                  <div
                    className="h-44 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url('/images/hero.jpg')` }}
                  />
                  <div className="p-5 relative z-10 bg-gradient-to-t from-ink via-ink to-transparent -mt-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-chart bg-chart/10 px-2.5 py-1 rounded-full border border-chart/30">
                      Cognitive Science
                    </span>
                    <h3 className="font-bold text-base mt-2 text-white font-display">
                      Why Knowledge Gaps Matter
                    </h3>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">
                      Students spend 80% of revision time reviewing comfortable topics. GapFinder tests blind spots first.
                    </p>
                  </div>
                </div>

                {/* Study Tip Card */}
                <GlassCard className="border-lav-300 bg-gradient-to-br from-lav-50/80 to-white">
                  <div className="flex items-center gap-2 mb-2 text-lav-700">
                    <Icon name="sparkles" className="w-5 h-5 text-chart fill-lav-700" />
                    <h4 className="font-bold text-sm text-ink font-display">Study Tip of the Day</h4>
                  </div>
                  <p className="text-xs text-ink/80 leading-relaxed italic">
                    "{activeQuote.quote}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-lav-200/60 flex items-center justify-between text-[11px] text-lav-700 font-semibold">
                    <span>— {activeQuote.author}</span>
                    <button onClick={nextQuote} className="underline hover:text-ink">
                      Next quote &rarr;
                    </button>
                  </div>
                </GlassCard>

              </div>
            </div>
          )}

          {/* TAB 2: TOPIC MAP WITH INTERACTIVE DEPENDENCY GRAPH */}
          {activeTab === "topics" && (
            <div className="space-y-6">
              
              {/* Header Controls: Subject Switcher + Graph/Cards View Mode Toggle */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-lav-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-lav-100 text-lav-700 font-extrabold text-[10px] uppercase tracking-wider">
                      Knowledge Topology
                    </span>
                    <span className="text-xs text-ink/50">• Prerequisite Flow & Interlinking</span>
                  </div>
                  <h2 className="text-lg font-bold text-ink font-display">
                    {state?.currentSubjectName} &bull; Curriculum Graph
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Subject Switcher inside Topic Map */}
                  <div className="flex items-center gap-1 bg-lav-50 px-2.5 py-1.5 rounded-xl border border-lav-200">
                    <span className="text-[10px] font-bold text-ink/60 uppercase">Subject:</span>
                    <select
                      value={currentSubjectId}
                      onChange={e => handleSwitchSubject(e.target.value)}
                      className="bg-transparent text-xs font-bold text-ink cursor-pointer outline-none"
                    >
                      {state?.subjects?.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Graph vs Cards Toggle */}
                  <div className="flex rounded-xl bg-lav-100 p-1">
                    <button
                      type="button"
                      onClick={() => setTopicViewMode("graph")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        topicViewMode === "graph" ? "bg-white text-lav-700 shadow-sm" : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      <Icon name="map" className="w-3.5 h-3.5" />
                      Dependency Flow
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicViewMode("cards")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        topicViewMode === "cards" ? "bg-white text-lav-700 shadow-sm" : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      <Icon name="book" className="w-3.5 h-3.5" />
                      Cards Grid
                    </button>
                  </div>

                  <ActionBtn
                    onClick={() => handleOpenBrief()}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Icon name="book" className="w-4 h-4" />
                    Course Brief
                  </ActionBtn>
                  <ActionBtn
                    onClick={() => runAction("Re-extracting syllabus taxonomy", () => api("topics", { subjectId: currentSubjectId }))}
                    variant="primary"
                    className="text-xs"
                  >
                    <Icon name="refresh" className="w-4 h-4" />
                    Re-Extract
                  </ActionBtn>
                </div>
              </div>

              {state?.topics?.length > 0 ? (
                topicViewMode === "graph" ? (
                  /* INTERACTIVE KNOWLEDGE TOPOLOGY & DEPENDENCY FLOW GRAPH */
                  <div className="space-y-4">
                    {/* Graph Legend & Study Order Guide */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-ink via-lav-950 to-ink text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-chart animate-ping" />
                          <h4 className="font-bold text-sm text-white font-display">Interlinked Prerequisite Learning Path</h4>
                        </div>
                        <p className="text-xs text-white/70 max-w-xl">
                          Topics are sequenced by conceptual dependencies. Study foundational prerequisites first before advancing to dependent invariants.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                        <span className="px-2 py-1 rounded-md bg-chart/20 text-chart border border-chart/30">🟢 Mastered</span>
                        <span className="px-2 py-1 rounded-md bg-tomato/20 text-tomato border border-tomato/30">🔴 Weak Gap</span>
                        <span className="px-2 py-1 rounded-md bg-lav-300/20 text-lav-300 border border-lav-300/30">🟣 Developing</span>
                        <span className="px-2 py-1 rounded-md bg-white/10 text-white/70 border border-white/20">⚪ Untested</span>
                      </div>
                    </div>

                    {/* Visual Connected Dependency Flowchart */}
                    <div className="relative p-6 rounded-3xl bg-white border border-lav-200 overflow-hidden shadow-sm">
                      <div className="space-y-4 relative z-10">
                        {state.topics.map((topic: string, index: number) => {
                          const matchedGap = state.gaps?.find((g: any) => g.topic === topic);
                          const level = matchedGap?.level || "untested";
                          const isFirst = index === 0;
                          const isLast = index === state.topics.length - 1;
                          const prereqTopic = index > 0 ? state.topics[index - 1] : "None (Foundational Unit)";

                          return (
                            <div key={topic} className="relative">
                              {/* Directional Connector Line between nodes */}
                              {!isFirst && (
                                <div className="flex items-center gap-2 pl-8 py-1.5 text-[11px] font-bold text-lav-500">
                                  <svg className="w-4 h-6 text-lav-400 shrink-0" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path d="M8 0v20M3 15l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <span className="bg-lav-50 px-2.5 py-0.5 rounded-full border border-lav-200/80 text-[10px] text-ink/60">
                                    Prerequisite for Unit {index + 1} &bull; Requires understanding of <b>{prereqTopic}</b>
                                  </span>
                                </div>
                              )}

                              {/* Interactive Node Card */}
                              <div
                                onClick={() => setFocusedTopic(topic)}
                                className={`p-4 md:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                                  level === "weak"
                                    ? "bg-rose-50/40 border-rose-200 hover:border-tomato hover:shadow-md"
                                    : level === "strong"
                                    ? "bg-emerald-50/30 border-emerald-200 hover:border-emerald-500 hover:shadow-md"
                                    : level === "medium"
                                    ? "bg-amber-50/30 border-amber-200 hover:border-amber-500 hover:shadow-md"
                                    : "bg-white border-lav-200 hover:border-lav-500 hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Step Order Badge */}
                                  <div className="flex flex-col items-center">
                                    <span className="w-9 h-9 rounded-xl bg-ink text-chart font-extrabold text-sm flex items-center justify-center shadow-xs">
                                      {index + 1}
                                    </span>
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink/40 mt-1">
                                      Step {index + 1}
                                    </span>
                                  </div>

                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                      <span
                                        className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                                          level === "weak"
                                            ? "bg-tomato text-white"
                                            : level === "medium"
                                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                                            : level === "strong"
                                            ? "bg-chart text-ink font-bold"
                                            : "bg-lav-100 text-lav-600"
                                        }`}
                                      >
                                        {level === "weak" ? "⚠️ Weak Gap" : level === "strong" ? "✓ Mastered" : level === "medium" ? "Developing" : "Untested"}
                                      </span>

                                      {isFirst ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-chart/20 text-ink border border-chart/40">
                                          🌟 Start Here (Foundations)
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-semibold text-ink/50">
                                          Prerequisite: {prereqTopic}
                                        </span>
                                      )}
                                    </div>

                                    <h3 className="text-base font-bold text-ink font-display group-hover:text-lav-700 transition-colors">
                                      {topic}
                                    </h3>
                                    <p className="text-xs text-ink/60 mt-1 max-w-xl leading-relaxed">
                                      {matchedGap ? matchedGap.reason : "Core curriculum unit. Diagnostic questions grounded in your course materials are ready."}
                                    </p>
                                  </div>
                                </div>

                                {/* Node Actions */}
                                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-lav-100 shrink-0">
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setActiveTab("quiz");
                                      loadQuiz(topic, 2);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-chart text-ink font-bold text-xs hover:bg-chart/90 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                  >
                                    <Icon name="target" className="w-3.5 h-3.5" />
                                    Quiz Unit (2 Qs)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setActiveTab("ask");
                                      setChatInput(`Explain ${topic} in detail and give me real exam practice problems.`);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-lav-50 hover:bg-lav-100 text-lav-700 font-semibold text-xs transition-colors flex items-center gap-1 border border-lav-200 cursor-pointer"
                                  >
                                    <Icon name="message" className="w-3.5 h-3.5" />
                                    Tutor
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CARDS GRID VIEW */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.topics.map((topic: string, index: number) => {
                      const matchedGap = state.gaps?.find((g: any) => g.topic === topic);
                      const level = matchedGap?.level || "untested";
                      return (
                        <GlassCard
                          key={topic}
                          onClick={() => setFocusedTopic(topic)}
                          className="hover:-translate-y-1 hover:border-lav-500 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="w-7 h-7 rounded-lg bg-lav-100 text-lav-700 font-bold text-xs flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                                  level === "weak"
                                    ? "bg-tomato text-white"
                                    : level === "medium"
                                    ? "bg-lav-300 text-ink"
                                    : level === "strong"
                                    ? "bg-chart text-ink"
                                    : "bg-lav-100 text-lav-500"
                                }`}
                              >
                                {level}
                              </span>
                            </div>
                            <h3 className="font-bold text-ink text-base font-display group-hover:text-lav-700 transition-colors">
                              {topic}
                            </h3>
                            <p className="text-xs text-ink/60 mt-2 line-clamp-2">
                              {matchedGap ? matchedGap.reason : "Diagnostic questions ready. Click to practice this topic."}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-lav-100 flex items-center justify-between text-xs font-semibold">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setActiveTab("ask");
                                setChatInput(`Explain ${topic} in detail with examples.`);
                              }}
                              className="text-lav-700 hover:text-ink flex items-center gap-1"
                            >
                              <Icon name="message" className="w-3.5 h-3.5" />
                              Ask Tutor
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setActiveTab("quiz");
                                loadQuiz(topic, 5);
                              }}
                              className="text-lav-700 hover:text-ink underline"
                            >
                              Quiz Topic &rarr;
                            </button>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                )
              ) : (
                <GlassCard className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-lav-100 text-lav-700 flex items-center justify-center mb-4">
                    <Icon name="map" className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-ink font-display">No Topics Mapped Yet</h3>
                  <p className="text-xs text-ink/60 max-w-md mx-auto mt-1 mb-6">
                    Upload your syllabus under the <b>Materials</b> tab, or click below to extract the curriculum topic graph.
                  </p>
                  <ActionBtn onClick={() => runAction("Structuring topic taxonomy", () => api("topics", { subjectId: currentSubjectId }))} variant="primary">
                    Build Topic Map Now
                  </ActionBtn>
                </GlassCard>
              )}
            </div>
          )}

          {/* TAB 3: QUIZ */}
          {/* TAB 3: DIAGNOSTIC QUIZ (WITH CUSTOM QUESTION COUNT & TOPIC SCOPE) */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              
              {/* Quiz Header & Controls */}
              <div className="p-6 rounded-2xl bg-white border border-lav-200 space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-chart/20 text-ink font-extrabold text-[10px] uppercase tracking-wider">
                        Cognitive Telemetry Test
                      </span>
                      <span className="text-xs text-ink/50">• {state?.currentSubjectName}</span>
                    </div>
                    <h2 className="text-lg font-bold text-ink font-display">Diagnostic Examination</h2>
                    <p className="text-xs text-ink/60">
                      Choose how many questions you want and select specific units or comprehensive full-syllabus testing.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <ActionBtn
                      onClick={() => loadQuiz(selectedQuizTopic, quizQuestionCount)}
                      variant="accent"
                    >
                      <Icon name="target" className="w-4 h-4" />
                      {questions.length ? "Regenerate Test" : `Start (${quizQuestionCount} Questions)`}
                    </ActionBtn>
                  </div>
                </div>

                {/* Question Count Selector Bar */}
                <div className="pt-3 border-t border-lav-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-lav-700 uppercase tracking-wider">
                      Question Count:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { count: 5, label: "5 Qs (Speed)" },
                        { count: 10, label: "10 Qs (Standard)" },
                        { count: 15, label: "15 Qs (Deep)" },
                        { count: 999, label: "All Questions" }
                      ].map(opt => (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => {
                            setQuizQuestionCount(opt.count);
                            loadQuiz(selectedQuizTopic, opt.count);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            quizQuestionCount === opt.count
                              ? "bg-ink text-chart shadow-sm"
                              : "bg-lav-50 text-lav-700 hover:bg-lav-100 border border-lav-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Switcher inside Quiz Header */}
                  <div className="flex items-center gap-1.5 bg-lav-50 px-2.5 py-1.5 rounded-xl border border-lav-200">
                    <span className="text-[10px] font-bold text-ink/60 uppercase">Subject:</span>
                    <select
                      value={currentSubjectId}
                      onChange={e => handleSwitchSubject(e.target.value)}
                      className="bg-transparent text-xs font-bold text-ink cursor-pointer outline-none"
                    >
                      {state?.subjects?.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Topic Selector Pill Bar */}
                <div className="pt-3 border-t border-lav-100">
                  <span className="text-[11px] font-bold text-lav-700 uppercase tracking-wider block mb-2">
                    Scope & Topic Filter:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadQuiz("all", quizQuestionCount)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedQuizTopic === "all"
                          ? "bg-lav-700 text-white shadow-sm"
                          : "bg-lav-50 text-lav-700 hover:bg-lav-100 border border-lav-200"
                      }`}
                    >
                      🌟 All Topics (Full Curriculum Coverage)
                    </button>
                    {state?.topics?.map((topic: string) => {
                      const matchedGap = state.gaps?.find((g: any) => g.topic === topic);
                      const isWeak = matchedGap?.level === "weak";
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => loadQuiz(topic, quizQuestionCount)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedQuizTopic === topic
                              ? "bg-lav-700 text-white shadow-sm font-bold"
                              : "bg-white text-ink/80 hover:bg-lav-50 border border-lav-200"
                          }`}
                        >
                          {isWeak && <span className="w-2 h-2 rounded-full bg-tomato animate-pulse" />}
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Questions Stream */}
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const isEvaluated = score !== null;
                    const correctIdx = q.correct ?? q.answer;
                    const isPickedCorrect = picks[idx] === correctIdx;

                    return (
                      <GlassCard key={idx} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-lav-700 bg-lav-100 px-3 py-1 rounded-full">
                            Question {idx + 1} &bull; {q.topic}
                          </span>
                          {isEvaluated && (
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                isPickedCorrect ? "bg-chart text-ink" : "bg-tomato text-white"
                              }`}
                            >
                              <Icon name={isPickedCorrect ? "check" : "x"} className="w-3.5 h-3.5" />
                              {isPickedCorrect ? "Correct" : "Missed"}
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-base text-ink mb-4 leading-relaxed font-display">
                          {q.q}
                        </h3>

                        {/* Options with Clean Radio Selector Indicators */}
                        <div className="space-y-2.5">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isSelected = picks[idx] === optIdx;
                            let style = "bg-white border-lav-200 hover:bg-lav-50/70 text-ink";
                            let badgeStyle = "bg-lav-100 text-lav-700 border-lav-200";

                            if (isEvaluated) {
                              if (optIdx === correctIdx) {
                                style = "bg-chart/20 text-ink font-bold border-chart ring-2 ring-chart/40";
                                badgeStyle = "bg-chart text-ink border-chart font-bold";
                              } else if (isSelected) {
                                style = "bg-red-50 text-tomato font-medium border-tomato";
                                badgeStyle = "bg-tomato text-white border-tomato font-bold";
                              } else {
                                style = "bg-lav-50/40 opacity-50 border-lav-100";
                                badgeStyle = "bg-lav-100/60 text-ink/40 border-lav-100";
                              }
                            } else if (isSelected) {
                              style = "bg-lav-100/80 font-semibold border-lav-500 ring-2 ring-lav-500/25";
                              badgeStyle = "bg-lav-700 text-white border-lav-700 font-bold";
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isEvaluated}
                                onClick={() => setPicks(picks.map((v, k) => (k === idx ? optIdx : v)))}
                                className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-150 flex items-center justify-between gap-3 ${style}`}
                              >
                                <span className="flex-1">{opt}</span>
                                <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-mono transition-colors ${badgeStyle}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Citation & Grounding Quote if Evaluated */}
                        {isEvaluated && (
                          <div className="mt-4 p-4 rounded-xl bg-lav-50/70 border border-lav-200 text-xs text-ink/80 space-y-1.5 shadow-sm">
                            <p className="font-semibold text-lav-700">💡 Explanation & Source Citation:</p>
                            <p>{q.explanation}</p>
                            <div className="pt-2 border-t border-lav-200/60 text-[11px] text-ink/60 flex items-center gap-1.5 font-mono">
                              <span className="font-bold text-ink">Source:</span> {q.citation} &mdash; "{q.quote}..."
                            </div>
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}

                  {/* Submission Action Bar */}
                  {score === null ? (
                    <div className="p-6 rounded-2xl bg-white border border-lav-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-ink">Ready to evaluate your answers?</h4>
                        <p className="text-xs text-ink/60">
                          {picks.filter(p => p >= 0).length} of {questions.length} questions completed.
                        </p>
                      </div>
                      <ActionBtn
                        disabled={!allAnswered}
                        onClick={() =>
                          runAction("Scoring and computing cognitive diagnosis", async () => {
                            const res = await api("evaluate", {
                              answers: questions.map((q, i) => ({ ...q, chosen: picks[i] })),
                              subjectId: currentSubjectId
                            });
                            setScore(res.score);
                            setSuccessMsg(`Test scored: ${res.score}%! Your gap report has been updated.`);
                          })
                        }
                        variant="primary"
                        className="w-full sm:w-auto"
                      >
                        Submit & Evaluate Answers
                      </ActionBtn>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-chart/20 border border-chart/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-chart" />
                          <span className="text-xs font-bold uppercase tracking-wider text-lav-700">Cognitive Diagnosis Complete</span>
                        </div>
                        <h3 className="text-2xl font-extrabold text-ink font-display">Score: {score}%</h3>
                        <p className="text-xs text-ink/70 mt-0.5">
                          Your knowledge telemetry has been logged to your auditable Gap Report.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <ActionBtn onClick={() => setActiveTab("gaps")} variant="primary">
                          📈 View Updated Gap Report &rarr;
                        </ActionBtn>
                        <ActionBtn onClick={() => setActiveTab("plan")} variant="accent">
                          📅 Build Revision Plan &rarr;
                        </ActionBtn>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Quiz State */
                <GlassCard className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-chart/30 text-ink flex items-center justify-center mb-4">
                    <Icon name="target" className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-ink font-display">Ready for Diagnostic Testing</h3>
                  <p className="text-xs text-ink/60 max-w-md mx-auto mt-1 mb-6">
                    Pick a topic above or click below to launch a comprehensive diagnostic quiz on {state?.currentSubjectName}.
                  </p>
                  <ActionBtn onClick={() => loadQuiz("all")} variant="accent">
                    Start Full Diagnostic Quiz
                  </ActionBtn>
                </GlassCard>
              )}
            </div>
          )}

          {/* TAB 4: GAP REPORT */}
          {activeTab === "gaps" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-lav-200">
                <div>
                  <h2 className="text-lg font-bold text-ink font-display">
                    {state?.currentSubjectName} &bull; Knowledge Gap Diagnostic
                  </h2>
                  <p className="text-xs text-ink/60">
                    Deterministic diagnosis: <b>Weak</b> (&lt;50%), <b>Medium</b> (&lt;80%), and <b>Strong</b> (&ge;80%).
                  </p>
                </div>
                <ActionBtn onClick={() => setActiveTab("plan")} variant="primary">
                  <Icon name="calendar" className="w-4 h-4" />
                  Generate Personalized Plan
                </ActionBtn>
              </div>

              {state?.gaps?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.gaps.map((gap: any) => {
                    const isWeak = gap.level === "weak";
                    const isMed = gap.level === "medium";
                    const percentage = Math.round(100 * (gap.right / (gap.total || 1)));
                    return (
                      <GlassCard
                        key={gap.topic}
                        className={`border-l-4 ${
                          isWeak ? "border-l-tomato" : isMed ? "border-l-lav-500" : "border-l-chart"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-base text-ink font-display">{gap.topic}</h3>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                              isWeak ? "bg-tomato text-white" : isMed ? "bg-lav-300 text-ink" : "bg-chart text-ink"
                            }`}
                          >
                            {gap.level}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="space-y-1 my-3">
                          <div className="flex justify-between text-xs text-ink/60 font-semibold">
                            <span>Accuracy: {percentage}%</span>
                            <span>{gap.right}/{gap.total} Correct</span>
                          </div>
                          <div className="h-2 rounded-full bg-lav-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isWeak ? "bg-tomato" : isMed ? "bg-lav-500" : "bg-chart"
                              }`}
                              style={{ width: `${Math.max(8, percentage)}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-ink/70 leading-relaxed">{gap.reason}</p>

                        <div className="mt-4 pt-3 border-t border-lav-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => {
                              setActiveTab("quiz");
                              loadQuiz(gap.topic);
                            }}
                            className="text-lav-700 font-semibold hover:underline"
                          >
                            Practice this topic quiz &rarr;
                          </button>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              ) : (
                <GlassCard className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-lav-100 text-lav-700 flex items-center justify-center mb-4">
                    <Icon name="shield" className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-ink font-display">No Diagnostic Data Yet</h3>
                  <p className="text-xs text-ink/60 max-w-md mx-auto mt-1 mb-6">
                    Take the diagnostic quiz to populate your gap analysis and discover your revision priorities.
                  </p>
                  <ActionBtn onClick={() => { setActiveTab("quiz"); loadQuiz("all"); }} variant="accent">
                    Take Diagnostic Quiz Now
                  </ActionBtn>
                </GlassCard>
              )}
            </div>
          )}

          {/* TAB 5: REVISION PLAN (2 Modes: Exam Date vs Paced Study) */}
          {activeTab === "plan" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Revision Schedule & Mode Switcher */}
              <div className="lg:col-span-8 space-y-6">
                <GlassCard>
                  
                  {/* Mode Selector Tabs with Subject Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-lav-100">
                    <div>
                      <h2 className="text-lg font-bold text-ink font-display">
                        Adaptive Study Plan &bull; {state?.currentSubjectName}
                      </h2>
                      <p className="text-xs text-ink/60">
                        Target an upcoming exam deadline or choose a custom self-paced study schedule.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Subject Switcher inside Revision Plan */}
                      <div className="flex items-center gap-1.5 bg-lav-50 px-2.5 py-1.5 rounded-xl border border-lav-200">
                        <span className="text-[10px] font-bold text-ink/60 uppercase">Subject:</span>
                        <select
                          value={currentSubjectId}
                          onChange={e => handleSwitchSubject(e.target.value)}
                          className="bg-transparent text-xs font-bold text-ink cursor-pointer outline-none"
                        >
                          {state?.subjects?.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name} ({sub.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Mode Toggle */}
                      <div className="flex rounded-xl bg-lav-100 p-1">
                        <button
                          type="button"
                          onClick={() => setPlanMode("exam")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            planMode === "exam" ? "bg-white text-lav-700 shadow-sm" : "text-ink/60 hover:text-ink"
                          }`}
                        >
                          🗓️ Exam Date
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlanMode("paced")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            planMode === "paced" ? "bg-white text-lav-700 shadow-sm" : "text-ink/60 hover:text-ink"
                          }`}
                        >
                          ⏱️ Paced Days
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Input Controls */}
                  <div className="py-4 border-b border-lav-100 flex flex-wrap items-end justify-between gap-4">
                    {planMode === "exam" ? (
                      <div className="flex items-end gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-ink/60 block mb-1">Target Exam Date</label>
                          <input
                            type="date"
                            value={examDate}
                            onChange={e => setExamDate(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-lav-300 text-xs font-bold bg-white h-10"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-ink/60 block mb-1">Study Hrs/Day</label>
                          <input
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={planHours}
                            onChange={e => setPlanHours(+e.target.value)}
                            className="w-20 px-3 py-2 rounded-xl border border-lav-300 text-xs font-bold bg-white h-10"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-ink/60 block mb-1">Total Days</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={planDays}
                            onChange={e => setPlanDays(+e.target.value)}
                            className="w-20 px-3 py-2 rounded-xl border border-lav-300 text-xs font-bold bg-white h-10"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-ink/60 block mb-1">Study Hrs/Day</label>
                          <input
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={planHours}
                            onChange={e => setPlanHours(+e.target.value)}
                            className="w-20 px-3 py-2 rounded-xl border border-lav-300 text-xs font-bold bg-white h-10"
                          />
                        </div>
                      </div>
                    )}

                    <ActionBtn
                      onClick={() =>
                        runAction("Generating customized adaptive schedule", () =>
                          api("plan", {
                            mode: planMode,
                            examDate,
                            days: planDays,
                            hours: planHours,
                            subjectId: currentSubjectId
                          })
                        )
                      }
                      variant="primary"
                      className="text-xs h-10"
                    >
                      {state?.plan ? "Re-Generate Plan" : "Generate Plan"}
                    </ActionBtn>
                  </div>

                  {/* Plan Items List with Interactive Completion Checkboxes */}
                  {state?.plan?.items?.length > 0 ? (
                    <div className="divide-y divide-lav-100 mt-2">
                      {state.plan.items.map((item: any) => {
                        const isDone = !!completedDays[item.day];
                        return (
                          <div key={item.day} className={`py-4 flex items-start gap-3.5 transition-opacity ${isDone ? "opacity-60" : ""}`}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => setCompletedDays(prev => ({ ...prev, [item.day]: !prev[item.day] }))}
                              className="w-4 h-4 rounded text-lav-700 mt-3 cursor-pointer shrink-0"
                              title="Mark day as completed"
                            />
                            <div className="w-14 shrink-0 text-center p-2 rounded-xl bg-lav-50">
                              <span className="text-[9px] uppercase font-bold text-lav-500">Day</span>
                              <div className="text-base font-extrabold font-display leading-tight">{item.day}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className={`font-bold text-sm text-ink font-display ${isDone ? "line-through text-ink/50" : ""}`}>
                                  {item.topic}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.priority === "critical"
                                    ? "bg-red-100 text-tomato"
                                    : item.priority === "high"
                                    ? "bg-tomato/15 text-tomato"
                                    : "bg-chart/20 text-ink"
                                }`}>
                                  {item.minutes} mins
                                </span>
                              </div>
                              <p className="text-xs text-ink/70 mt-1 leading-relaxed">{item.focus}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-xs text-ink/60 mb-4">No plan generated yet. Take a quiz or click below to build your schedule.</p>
                      <ActionBtn
                        onClick={() =>
                          runAction("Generating study timetable", () =>
                            api("plan", {
                              mode: planMode,
                              examDate,
                              days: planDays,
                              hours: planHours,
                              subjectId: currentSubjectId
                            })
                          )
                        }
                        variant="primary"
                      >
                        Generate Study Schedule
                      </ActionBtn>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Right Column: Workload Allocation & Focus Breakdown */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Adaptive Time Allocation Card */}
                <GlassCard className="bg-lav-700 text-white relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold text-chart tracking-wider">
                      Adaptive Time Budget
                    </span>
                    <span className="text-xs font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                      {state?.plan?.totalHours || planHours * planDays} Total Hrs
                    </span>
                  </div>

                  <h3 className="font-bold text-base font-display text-white">
                    {planMode === "exam" ? "Exam Countdown Protocol" : "Paced Mastery Protocol"}
                  </h3>
                  <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
                    Prioritizes diagnosed weak topics with 60% of available study blocks.
                  </p>

                  {/* Priority Breakdown Matrix */}
                  <div className="mt-4 pt-3 border-t border-white/20 space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-white/80 mb-1">
                        <span>Weak Topics (Deep Learning)</span>
                        <span className="font-bold text-chart">60% time</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full bg-tomato w-[60%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-white/80 mb-1">
                        <span>Medium Topics (Targeted Practice)</span>
                        <span className="font-bold text-chart">30% time</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full bg-lav-300 w-[30%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-white/80 mb-1">
                        <span>Strong Topics (Mock Check)</span>
                        <span className="font-bold text-chart">10% time</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full bg-chart w-[10%]" />
                      </div>
                    </div>
                  </div>

                  {/* Completion Status */}
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-chart">
                    <span>Plan Progress</span>
                    <span>{stats.completedPct}% Complete</span>
                  </div>
                </GlassCard>

                {/* Daily Study Habits Checklist */}
                <div className="p-5 rounded-2xl border border-lav-200 bg-white space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-lav-700">Daily Study Habits</h4>
                  <ul className="space-y-2 text-xs text-ink/70">
                    <li className="flex items-start gap-2">
                      <span className="text-chart font-bold text-sm">&bull;</span>
                      <span>Review notes immediately before attempting diagnostic questions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-chart font-bold text-sm">&bull;</span>
                      <span>Solve at least 2 practice problems on topics marked Weak.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-chart font-bold text-sm">&bull;</span>
                      <span>Tick off daily cards as you complete revision blocks to track velocity.</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: ASK AI TUTOR */}
          {activeTab === "ask" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Chat Conversation Stream */}
              <div className="lg:col-span-8 flex flex-col h-[calc(100vh-230px)] min-h-[520px]">
                <GlassCard className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 p-2 pr-3">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                              msg.isUser
                                ? "bg-lav-700 text-white rounded-br-sm"
                                : "bg-white border border-lav-200 text-ink shadow-sm rounded-bl-sm"
                            }`}
                          >
                            <p>{msg.text}</p>
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-lav-100 text-[11px] font-mono text-lav-700">
                                <span className="font-bold">Verified in materials:</span> {msg.citations.join("  ")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink/60">
                        <div className="w-14 h-14 rounded-2xl bg-lav-100 text-lav-700 flex items-center justify-center mb-3">
                          <Icon name="message" className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-sm text-ink font-display">
                          Ask Anything About {state?.currentSubjectName}
                        </h4>
                        <p className="text-xs max-w-sm mt-1">
                          The tutor answers strictly using excerpts from your uploaded notes and syllabi, preventing hallucinations.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!chatInput.trim()) return;
                      const text = chatInput;
                      setChatInput("");
                      setChatMessages(prev => [...prev, { isUser: true, text }]);
                      runAction("Retrieving excerpts & preparing grounded response", async () => {
                        const res = await api("chat", { q: text, subjectId: currentSubjectId });
                        setChatMessages(prev => [...prev, { isUser: false, text: res.a, citations: res.cites }]);
                      });
                    }}
                    className="pt-4 border-t border-lav-100 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder={`e.g. Explain ${state?.topics?.[0] || "core concept"} with examples...`}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-lav-300 focus:border-lav-700 text-sm bg-white"
                    />
                    <ActionBtn type="submit" variant="primary" className="py-2.5 px-5">
                      Ask Tutor
                    </ActionBtn>
                  </form>
                </GlassCard>
              </div>

              {/* Right Column: Suggested Inquiries & Grounding Guarantee */}
              <div className="lg:col-span-4 space-y-4">
                <GlassCard>
                  <h3 className="font-bold text-sm text-ink font-display mb-3">Suggested Prompt Starters</h3>
                  <div className="space-y-2">
                    {state?.topics?.slice(0, 4).map((topic: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setChatInput(`Explain ${topic} in detail and show how it relates to exam questions.`)}
                        className="w-full text-left p-2.5 rounded-xl border border-lav-100 bg-lav-50/50 hover:bg-lav-100 text-xs text-ink/80 transition-colors"
                      >
                        "Explain {topic} in detail..."
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <div className="p-5 rounded-2xl bg-white border border-lav-200 text-xs text-ink/70 space-y-2">
                  <h4 className="font-bold text-ink uppercase text-[11px] tracking-wider">Grounded AI Guarantee</h4>
                  <p>
                    If an answer cannot be found in your uploaded materials with at least 40% cosine similarity, the tutor politely refuses to guess.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: PROGRESS & AWARDS (Deep Cognitive Analytics & Tiered Badges) */}
          {activeTab === "progress" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Historical Scores Chart & Cognitive Debt Analysis */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Historical Trajectory Card */}
                <GlassCard>
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-lav-100">
                    <div>
                      <h2 className="text-lg font-bold text-ink font-display">Diagnostic Score Trajectory</h2>
                      <p className="text-xs text-ink/60">
                        Tracks your learning velocity across {state?.currentSubjectName} diagnostic tests.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-lav-700 bg-lav-100 px-3 py-1 rounded-full">
                      {state?.attempts?.length || 0} Test Attempts
                    </span>
                  </div>

                  {state?.attempts?.length > 0 ? (
                    <div className="relative pt-6 pb-2">
                      {/* Grid Scale Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-ink/30 pb-8">
                        <div className="border-b border-lav-100 pb-0.5">100%</div>
                        <div className="border-b border-lav-100 pb-0.5">75%</div>
                        <div className="border-b border-lav-100 pb-0.5">50%</div>
                        <div className="border-b border-lav-100 pb-0.5">25%</div>
                        <div className="border-b border-lav-200 pb-0.5">0%</div>
                      </div>

                      {/* Bar Columns */}
                      <div className="h-60 flex items-end gap-5 pl-8 pr-2 relative z-10">
                        {state.attempts.map((att: any, idx: number) => {
                          const heightPct = Math.max(12, att.score);
                          return (
                            <div key={att.id} className="flex-1 flex flex-col justify-end items-center h-full group">
                              <span className="text-xs font-bold text-lav-700 mb-1.5 transition-transform group-hover:-translate-y-0.5">
                                {att.score}%
                              </span>
                              <div
                                className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-lav-700 via-lav-500 to-chart hover:brightness-110 transition-all duration-300 relative shadow-sm"
                                style={{ height: `${heightPct}%` }}
                              />
                              <span className="text-[11px] font-semibold text-ink/60 mt-2">
                                #{idx + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xs text-ink/60 mb-4">No diagnostic attempts yet. Take your first quiz to chart progress!</p>
                      <ActionBtn onClick={() => { setActiveTab("quiz"); loadQuiz("all"); }} variant="accent">
                        Take Diagnostic Quiz
                      </ActionBtn>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-xs text-ink/60 pt-3 border-t border-lav-100">
                    <span>Evaluation Metric: Grounded MCQs</span>
                    <span className="font-semibold text-lav-700">Average Score: {stats.avgScore}%</span>
                  </div>
                </GlassCard>

                {/* Cognitive Concept Debt Analysis Card */}
                <GlassCard>
                  <h3 className="text-base font-bold text-ink font-display mb-1">
                    Cognitive Concept Debt & Mastery Analysis
                  </h3>
                  <p className="text-xs text-ink/60 mb-4">
                    Identifies high-priority gaps that impact your exam readiness score.
                  </p>

                  <div className="space-y-3">
                    {state?.gaps?.map((g: any) => {
                      const isWeak = g.level === "weak";
                      return (
                        <div key={g.topic} className="p-3.5 rounded-xl border border-lav-100 bg-white flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isWeak ? "bg-tomato" : g.level === "medium" ? "bg-lav-500" : "bg-chart"}`} />
                              <h4 className="font-bold text-xs text-ink truncate">{g.topic}</h4>
                            </div>
                            <p className="text-[11px] text-ink/60 mt-0.5">{g.reason}</p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("quiz");
                              loadQuiz(g.topic);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-lav-200 text-[11px] font-bold text-lav-700 hover:bg-lav-50 shrink-0"
                          >
                            Retest Unit
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>

              {/* Right Column: Mastery Awards & Unlockable Badges */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 3D Mastery Badge Artwork Card */}
                <div className="rounded-2xl overflow-hidden border border-lav-200 shadow-md bg-ink text-white text-center p-6 relative">
                  <div
                    className="w-32 h-32 mx-auto rounded-full bg-cover bg-center border-4 border-chart/30 shadow-lg mb-3"
                    style={{ backgroundImage: `url('/images/achievement.jpg')` }}
                  />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-chart bg-chart/10 px-3 py-1 rounded-full border border-chart/20">
                    Grand Trophy
                  </span>
                  <h3 className="text-base font-bold font-display text-white mt-2">Crystal Brain Mastery</h3>
                  <p className="text-xs text-white/70 mt-1">
                    Awarded when all {state?.topics?.length || 7} units are diagnosed Strong.
                  </p>
                </div>

                {/* Tiered Badges Milestone List */}
                <GlassCard>
                  <h3 className="font-bold text-sm text-ink font-display mb-3">Cognitive Milestones</h3>
                  <div className="space-y-3">
                    {state?.badges?.map((badge: any) => (
                      <div
                        key={badge.id}
                        className={`p-3 rounded-xl border transition-all ${
                          badge.unlocked
                            ? "bg-chart/10 border-chart/40"
                            : "bg-lav-50/50 border-lav-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{badge.unlocked ? "🏆" : "🔒"}</span>
                            <h4 className="font-bold text-xs text-ink">{badge.title}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            badge.unlocked ? "bg-chart text-ink" : "bg-lav-100 text-lav-700"
                          }`}>
                            {badge.unlocked ? "Unlocked" : `${badge.progress}%`}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink/70 mt-1">{badge.desc}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* MODAL 1: Document Inspector Modal */}
      {inspectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-lav-200 animate-fade-in">
            <div className="p-6 border-b border-lav-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-lav-100 text-lav-700">
                  {inspectedDoc.doc?.kind || "Document"}
                </span>
                <h3 className="text-lg font-bold text-ink font-display mt-1">{inspectedDoc.doc?.name}</h3>
              </div>
              <button
                onClick={() => setInspectedDoc(null)}
                className="w-8 h-8 rounded-full bg-lav-100 text-lav-700 flex items-center justify-center hover:bg-lav-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-ink/80 leading-relaxed bg-lav-50/40 whitespace-pre-wrap">
              {inspectedDoc.content}
            </div>

            <div className="p-4 border-t border-lav-100 flex flex-wrap items-center justify-end gap-2 bg-white">
              <ActionBtn
                onClick={() => {
                  const doc = inspectedDoc.doc;
                  setInspectedDoc(null);
                  handleOpenBrief(doc.id);
                }}
                variant="secondary"
                className="text-xs"
              >
                <Icon name="sparkles" className="w-3.5 h-3.5" />
                Read Document Brief
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  const doc = inspectedDoc.doc;
                  setInspectedDoc(null);
                  setActiveTab("topics");
                  runAction(`Extracting topics from ${doc.name}`, () =>
                    api("topics", { docId: doc.id, subjectId: currentSubjectId })
                  );
                }}
                variant="primary"
                className="text-xs"
              >
                Extract Topics
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  const doc = inspectedDoc.doc;
                  setInspectedDoc(null);
                  setActiveTab("quiz");
                  loadQuiz("all");
                }}
                variant="accent"
                className="text-xs"
              >
                Launch Diagnostic Quiz
              </ActionBtn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-lav-200 animate-fade-in">
            <h3 className="text-lg font-bold text-ink font-display">Add New Course or Subject</h3>
            <p className="text-xs text-ink/60 mt-1 mb-4">
              Create a distinct workspace for another subject (e.g. Machine Learning, Physics, Organic Chemistry).
            </p>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-ink/70 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Machine Learning"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-lav-300 text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <ActionBtn onClick={() => setShowAddSubjectModal(false)} variant="secondary" className="text-xs">
                  Cancel
                </ActionBtn>
                <ActionBtn type="submit" variant="primary" className="text-xs">
                  Create Subject
                </ActionBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Focused Topic Drawer/Modal */}
      {focusedTopic && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-lav-200 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-lav-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-lav-700 bg-lav-100 px-2.5 py-0.5 rounded-full">
                Topic Focus
              </span>
              <button
                onClick={() => setFocusedTopic(null)}
                className="w-7 h-7 rounded-full bg-lav-100 text-lav-700 flex items-center justify-center hover:bg-lav-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-ink font-display mt-3">{focusedTopic}</h3>
            <p className="text-xs text-ink/70 mt-2 leading-relaxed">
              Curriculum unit from {state?.currentSubjectName}. Testing your recall on this topic will update your auditable diagnostic report.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <ActionBtn
                onClick={() => {
                  const t = focusedTopic;
                  setFocusedTopic(null);
                  setActiveTab("quiz");
                  loadQuiz(t);
                }}
                variant="accent"
                className="w-full"
              >
                Practice 2-Question Quiz on this Topic
              </ActionBtn>
              <ActionBtn
                onClick={() => {
                  const t = focusedTopic;
                  setFocusedTopic(null);
                  setActiveTab("ask");
                  setChatInput(`Explain ${t} in detail and give me real exam practice problems.`);
                }}
                variant="secondary"
                className="w-full"
              >
                Explain this Topic with AI Tutor
              </ActionBtn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Syllabus & Course Brief Modal */}
      {showBriefModal && syllabusBrief && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-lav-200 animate-fade-in my-auto">
            
            {/* Modal Header */}
            <div className="p-5 md:p-6 bg-gradient-to-r from-ink via-lav-950 to-ink text-white flex items-start justify-between border-b border-lav-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-chart text-ink tracking-wider">
                    {syllabusBrief.code || "Course Code"}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20">
                    ⏱️ ~{syllabusBrief.estimatedHours || 20} Study Hours
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20">
                    📚 {syllabusBrief.totalModules || syllabusBrief.modules?.length || 0} Modules
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-tight">
                  {syllabusBrief.title}
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  Target: {syllabusBrief.targetAudience}
                </p>
              </div>

              <button
                onClick={() => setShowBriefModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors shrink-0 ml-4"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6 bg-[#FAF8FF]">
              
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-white border border-lav-200 shadow-sm">
                <div className="flex items-center gap-2 text-lav-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <Icon name="sparkles" className="w-4 h-4 text-chart fill-lav-700" />
                  Executive Course Summary
                </div>
                <p className="text-xs md:text-sm text-ink/80 leading-relaxed font-medium">
                  {syllabusBrief.summary}
                </p>
              </div>

              {/* Modules & Key Concepts Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-ink font-display flex items-center gap-2">
                    <Icon name="book" className="w-4 h-4 text-lav-700" />
                    Curriculum Units & Key Concepts Breakdown
                  </h4>
                  <span className="text-[11px] text-ink/50 font-medium">
                    What exists inside this subject
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {syllabusBrief.modules?.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-lav-200 hover:border-lav-400 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-lav-100 text-lav-700">
                            {m.unit}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                            {m.examImportance}
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-ink font-display">{m.title}</h5>
                        <p className="text-xs text-ink/70 mt-1 leading-relaxed">
                          {m.whatItIs}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-lav-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40 block mb-1.5">
                            Key Concepts:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.keyConcepts?.map((c: string, cIdx: number) => (
                              <span
                                key={cIdx}
                                className="text-[11px] px-2 py-0.5 rounded-lg bg-lav-50 text-lav-800 border border-lav-200/60 font-medium"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowBriefModal(false);
                          setActiveTab("quiz");
                          loadQuiz(m.title);
                        }}
                        className="mt-3 pt-2 border-t border-lav-100 flex items-center justify-between text-[11px] font-bold text-lav-700 hover:text-ink cursor-pointer"
                      >
                        <span>Test Unit Recall</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-Column Grid: Prerequisites & Common Pitfalls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Prerequisites */}
                <div className="p-4 rounded-2xl bg-white border border-lav-200 shadow-sm">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-ink/70 mb-2.5 flex items-center gap-1.5">
                    <Icon name="check" className="w-3.5 h-3.5 text-lav-700" />
                    Essential Prerequisites
                  </h4>
                  <ul className="space-y-1.5">
                    {syllabusBrief.prerequisites?.map((p: string, pIdx: number) => (
                      <li key={pIdx} className="text-xs text-ink/80 flex items-start gap-2">
                        <span className="text-lav-700 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Exam Pitfalls */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-sm">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800 mb-2.5 flex items-center gap-1.5">
                    <Icon name="shield" className="w-3.5 h-3.5 text-rose-600" />
                    Common Exam Pitfalls & Traps
                  </h4>
                  <ul className="space-y-1.5">
                    {(syllabusBrief.examPitfalls || syllabusBrief.pitfalls)?.map((pit: string, pitIdx: number) => (
                      <li key={pitIdx} className="text-xs text-rose-900/80 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-600 font-bold">⚠️</span>
                        <span>{pit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Recommended Diagnostic Strategy */}
              {(syllabusBrief.diagnosticStrategy || syllabusBrief.recommendedStudyPath) && (
                <div className="p-4 rounded-2xl bg-chart/15 border border-chart/40 shadow-sm">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-ink font-display mb-2 flex items-center gap-2">
                    <Icon name="target" className="w-4 h-4 text-ink" />
                    Recommended Diagnostic & Revision Strategy
                  </h4>
                  <p className="text-xs text-ink/80 font-medium leading-relaxed">
                    {syllabusBrief.diagnosticStrategy || syllabusBrief.recommendedStudyPath?.join(" → ")}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-lav-200 flex flex-wrap items-center justify-between gap-3 bg-white">
              <span className="text-xs text-ink/50">
                GapFinder AI &bull; Grounded Knowledge Diagnosis
              </span>
              <div className="flex items-center gap-2">
                <ActionBtn
                  onClick={() => setShowBriefModal(false)}
                  variant="secondary"
                  className="text-xs"
                >
                  Close Brief
                </ActionBtn>
                <ActionBtn
                  onClick={() => {
                    setShowBriefModal(false);
                    setActiveTab("quiz");
                    loadQuiz("all");
                  }}
                  variant="accent"
                  className="text-xs"
                >
                  <Icon name="target" className="w-3.5 h-3.5" />
                  Launch Diagnostic Quiz
                </ActionBtn>
                <ActionBtn
                  onClick={() => {
                    setShowBriefModal(false);
                    setActiveTab("plan");
                  }}
                  variant="primary"
                  className="text-xs"
                >
                  <Icon name="calendar" className="w-3.5 h-3.5" />
                  Build Revision Plan
                </ActionBtn>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
