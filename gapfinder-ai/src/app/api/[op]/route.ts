import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { gen } from "@/lib/ai";
import { sbFor, ingest, retrieve, gaps } from "@/lib/rag";
import { mockDb } from "@/lib/mock";

export const runtime = "nodejs";
export const maxDuration = 60;
const J = (b: any, s = 200) => Response.json(b, { status: s });

const OPS: Record<string, (sb: any, b: any, f: FormData | null) => Promise<any>> = {
  state: async (sb, b) => {
    const [d, t, a, p] = await Promise.all([
      sb.from("documents").select("id,name,kind").order("created_at"),
      sb.from("topics").select("name").order("position"),
      sb.from("attempts").select("id,score,created_at").order("created_at"),
      sb.from("plans").select("content").order("created_at", { ascending: false }).limit(1)
    ]);
    const last = a.data?.at(-1);
    const ans = last ? (await sb.from("answers").select("topic,is_correct,question").eq("attempt_id", last.id)).data : [];
    return { docs: d.data, topics: (t.data || []).map((x: any) => x.name), attempts: a.data, gaps: gaps(ans || []), plan: p.data?.[0]?.content || null };
  },
  seed: async sb => {
    const { count } = await sb.from("documents").select("id", { count: "exact", head: true });
    if (count) return { ok: true };
    for (const [f, k] of [["syllabus", "syllabus"], ["notes", "notes"]]) {
      await ingest(sb, `DBMS ${f}.txt`, k, fs.readFileSync(path.join(process.cwd(), "data/sample", f + ".txt"), "utf8"));
    }
    return { ok: true };
  },
  upload: async (sb, _, f) => {
    const file = f!.get("file") as File, kind = String(f!.get("kind") || "notes"), buf = Buffer.from(await file.arrayBuffer());
    let text: string;
    if (file.name.toLowerCase().endsWith(".pdf")) {
      /* @ts-ignore */
      const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
      text = (await pdf(buf)).text;
    } else {
      text = buf.toString("utf8");
    }
    if (text.trim().length < 20) throw new Error("No readable text found in this file.");
    await ingest(sb, file.name, kind, text);
    return { ok: true };
  },
  topics: async sb => {
    const { data: ds } = await sb.from("documents").select("id").eq("kind", "syllabus");
    if (!ds?.length) throw new Error("Upload a syllabus first.");
    const { data: ch } = await sb.from("chunks").select("content").in("document_id", ds.map((x: any) => x.id)).order("idx").limit(30);
    const r = await gen(`From this syllabus text list 6-12 distinct study topics in order. JSON: {"topics":["..."]}\n\n${ch.map((c: any) => c.content).join("\n")}`);
    await sb.from("topics").delete().not("id", "is", null);
    await sb.from("topics").insert(r.topics.map((name: string, position: number) => ({ name, position })));
    return { ok: true };
  },
  quiz: async (sb, b) => {
    const { data: t } = await sb.from("topics").select("name").order("position");
    if (!t?.length) throw new Error("Build the topic map first.");
    const requestedTopic = b.topic && b.topic !== "all" ? b.topic : null;
    const topicsToUse = requestedTopic ? t.filter((x: any) => x.name === requestedTopic) : t.slice(0, 8);

    const qs = await Promise.all(topicsToUse.map(async ({ name }: any) => {
      const ex = await retrieve(sb, name, 3);
      const r = await gen(`Based ONLY on these study excerpts about "${name}", generate 1 hard multiple-choice question. Give 4 plausible options, specify the 0-indexed correct option, and cite which excerpt (1, 2, or 3) supports the answer. JSON: {"q":"","options":["A","B","C","D"],"answer":0,"explanation":"","source":1}\n\n${ex.map((e: any, i: number) => `Excerpt ${i + 1}:\n${e.content}`).join("\n\n")}`);
      return (r.questions || [r]).map((q: any) => {
        const e = ex[q.source - 1] || ex[0] || { doc: "DBMS Notes", idx: 0, content: "" };
        return { ...q, topic: name, citation: `${e.doc} §${e.idx + 1}`, quote: (e.content || "").slice(0, 220) };
      });
    }));
    return { questions: qs.flat(), topic: requestedTopic || "all" };
  },
  evaluate: async (sb, b) => {
    const A = b.answers, score = Math.round(100 * A.filter((a: any) => a.chosen === a.answer).length / A.length);
    const { data: at } = await sb.from("attempts").insert({ score }).select().single();
    await sb.from("answers").insert(A.map((a: any) => ({
      attempt_id: at.id, topic: a.topic, question: a.q, chosen: a.chosen, correct: a.answer, is_correct: a.chosen === a.answer, explanation: a.explanation, citation: a.citation
    })));
    return { score };
  },
  plan: async (sb, b) => {
    const { data: a } = await sb.from("attempts").select("id").order("created_at", { ascending: false }).limit(1);
    if (!a?.length) throw new Error("Take the quiz first.");
    const { data: ans } = await sb.from("answers").select("topic,is_correct,question").eq("attempt_id", a[0].id);
    const days = b.days || 7;
    const hours = b.hours || 2;
    const r = await gen(`Build an adaptive revision plan for ${days} days with ${hours} study hours per day. Give weak topics the most time, medium less, strong only a brief final review. Gap report: ${JSON.stringify(gaps(ans || []))}. JSON: {"plan":[{"day":1,"topic":"","minutes":0,"focus":""}]}`);
    await sb.from("plans").insert({ content: r.plan });
    return { ok: true, plan: { items: r.plan, days, hours, totalHours: days * hours } };
  },
  chat: async (sb, b) => {
    let ex: any[] = [];
    try {
      ex = await retrieve(sb, b.q, 5);
    } catch {}
    const validEx = (ex || []).filter((e: any) => e.sim > 0.1);
    let prompt = "";
    if (validEx.length > 0) {
      prompt = `You are GapFinder AI, an expert computer science university tutor. Answer the student's question clearly, thoroughly, and pedagogically. Ground your response in the course material excerpts provided below and cite them with [1], [2], etc.\n\nCourse Excerpts:\n${validEx.map((e: any, i: number) => `[${i + 1}] ${e.content}`).join("\n\n")}\n\nStudent Question: ${b.q}`;
    } else {
      prompt = `You are GapFinder AI, an expert computer science and university engineering tutor. Answer the student's question accurately, clearly, and with structured bullet points or concrete examples.\n\nStudent Question: ${b.q}`;
    }
    const a = await gen(prompt, false);
    return { a, cites: validEx.map((e: any, i: number) => `[${i + 1}] ${e.doc} §${e.idx + 1}`) };
  }
};

export async function POST(req: Request, { params }: { params: { op: string } }) {
  try {
    const form = (req.headers.get("content-type") || "").includes("multipart") ? await req.formData() : null;
    const body = form ? {} : await req.json().catch(() => ({}));
    const op = params.op;

    // Instant Signup / Register endpoint via Supabase Admin API
    if (op === "signup") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || !password) return J({ error: "Email and password required." }, 400);

      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (serviceKey && url && !url.includes("placeholder")) {
        try {
          const adminSb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
          const { error: createErr } = await adminSb.auth.admin.createUser({
            email,
            password,
            email_confirm: true
          });

          if (createErr && (createErr.message.includes("already registered") || createErr.message.includes("already exists"))) {
            const { data: listData } = await adminSb.auth.admin.listUsers();
            const existing = listData?.users?.find((u: any) => u.email === email);
            if (existing) {
              await adminSb.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
            }
          }
        } catch (e: any) {
          console.warn("Admin signup warning:", e.message);
        }
      }

      if (url && anonKey && !url.includes("placeholder")) {
        try {
          const publicSb = createClient(url, anonKey);
          const { data: authData } = await publicSb.auth.signInWithPassword({ email, password });
          if (authData?.session) {
            return J({ ok: true, session: authData.session });
          }
        } catch {}
      }

      return J({
        ok: true,
        session: { user: { email }, access_token: "demo-token" }
      });
    }

    const tok = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
      !tok ||
      tok === "demo-token";

    if (isMock) {
      if (op === "state") return J(mockDb.getState(body.subjectId));
      if (op === "seed") return J(mockDb.seed(body.subjectId));
      if (op === "switch_subject") return J(mockDb.switchSubject(body.subjectId));
      if (op === "add_subject") return J(mockDb.addSubject(body.name, body.code));
      if (op === "delete_subject") return J(mockDb.deleteSubject(body.subjectId));
      if (op === "inspect_doc") return J(mockDb.inspectDoc(body.docId, body.subjectId));
      if (op === "upload") {
        const file = form!.get("file") as File;
        const kind = String(form!.get("kind") || "notes");
        const subjectId = String(form!.get("subjectId") || "dbms");
        const createNew = form!.get("createNewSubject") === "true";
        const newSubjectName = String(form!.get("newSubjectName") || "").trim();
        const buf = Buffer.from(await file.arrayBuffer());
        let text = buf.toString("utf8");
        if (file.name.toLowerCase().endsWith(".pdf")) {
          try {
            /* @ts-ignore */
            const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
            text = (await pdf(buf)).text;
          } catch {}
        }
        return J(mockDb.upload(file.name, kind, text, subjectId, createNew, newSubjectName));
      }
      if (op === "topics") return J(mockDb.buildTopics(body.docId, body.subjectId));
      if (op === "quiz") return J(mockDb.getQuiz(body.topic, body.subjectId, body.count));
      if (op === "evaluate") return J(mockDb.evaluate(body.answers || [], body.subjectId));
      if (op === "plan") return J(mockDb.buildPlan(body));
      if (op === "chat") {
        // Also call gen for mockDb chat if user asks a general question
        const prompt = `You are GapFinder AI, an expert computer science university tutor. Answer the student's question clearly, accurately, and with structured bullet points or concrete examples.\n\nStudent Question: ${body.q || ""}`;
        try {
          const a = await gen(prompt, false);
          return J({ a, cites: [`[1] Active Subject Study Notes §1`] });
        } catch {
          return J(mockDb.chat(body.q || "", body.subjectId));
        }
      }
      if (op === "brief") return J(mockDb.getBrief(body.subjectId, body.docId));
      return J({ error: "Unknown operation" }, 404);
    }

    const sb = sbFor(tok);
    const { data: { user } } = await sb.auth.getUser(tok);
    if (!user) return J({ error: "Please sign in again." }, 401);
    if (!OPS[params.op]) return J({ error: "Unknown operation" }, 404);
    return J(await OPS[params.op](sb, body, form));
  } catch (e: any) {
    return J({ error: e.message || String(e) }, 500);
  }
}
