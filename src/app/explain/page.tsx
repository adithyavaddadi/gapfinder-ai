"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import {
  MessageSquareQuote,
  Send,
  Sparkles,
  FileText,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  FileCheck2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: Array<{
    chunkId: string;
    pageNumber: number;
    heading: string;
    filename: string;
    passage: string;
  }>;
  hasSufficientEvidence?: boolean;
}

export default function ExplainPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-[#736E66]">Loading Explain Assistant...</div>}>
      <ExplainContent />
    </React.Suspense>
  );
}

function ExplainContent() {
  const searchParams = useSearchParams();
  const preselectedTopicId = searchParams.get("topicId");
  const preselectedTopicTitle = searchParams.get("topic");

  const [topics, setTopics] = React.useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>(preselectedTopicId || "");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "intro",
      sender: "assistant",
      text: "Hello! I am your Explain-This-Topic Assistant. Ask any question about your curriculum, and I will formulate an explanation grounded strictly in your uploaded course materials with source citations.",
      citations: [],
      hasSufficientEvidence: true,
    },
  ]);
  const [inputQuery, setInputQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Citation drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeCitation, setActiveCitation] = React.useState<any | null>(null);

  React.useEffect(() => {
    async function loadTopics() {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          const list = data.topics || [];
          setTopics(list);
          if (preselectedTopicTitle) {
            const found = list.find((t: any) => t.title.toLowerCase() === preselectedTopicTitle.toLowerCase());
            if (found) setSelectedTopicId(found.id);
          } else if (!selectedTopicId && list.length > 0) {
            setSelectedTopicId(list[0].id);
          }
        }
      } catch (e) {
        console.warn("Load topics error:", e);
      }
    }
    loadTopics();
  }, [selectedTopicId, preselectedTopicTitle]);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const handleSendMessage = async (queryToSend?: string, mode: "explain" | "example" | "brief" = "explain") => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsgId = Math.random().toString(36).substring(2, 9);
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, sender: "user", text },
    ];
    setMessages(newMessages);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          topicTitle: selectedTopic?.title,
          mode,
        }),
      });

      const data = await res.json();
      const assistantMsgId = Math.random().toString(36).substring(2, 9);

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          sender: "assistant",
          text: data.answer || "No response received",
          citations: data.citations || [],
          hasSufficientEvidence: data.hasSufficientEvidence !== false,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "assistant",
          text: "An error occurred while generating the grounded explanation. Please try again.",
          hasSufficientEvidence: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#121316]">
                Grounded Concept Explainer
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF]">
                Strict Grounding
              </span>
            </div>
            <p className="text-xs text-[#5A554E] mt-1 max-w-xl leading-relaxed">
              Grounded answers citing only your uploaded syllabus, textbooks, and notes. Explicitly abstains if evidence is insufficient.
            </p>
          </div>

          {/* Topic Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5A554E] font-bold whitespace-nowrap">Topic:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="px-3.5 py-1.5 rounded-full border border-[#E8E5DF] bg-white text-xs font-semibold text-[#121316] focus:outline-none focus:ring-2 focus:ring-[#121316]"
            >
              <option value="">All Uploaded Materials</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Stream Card */}
        <Card className="min-h-[500px] flex flex-col justify-between p-6 sm:p-8">
          {/* Messages list */}
          <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-5 text-xs md:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#121316] text-white rounded-br-xs shadow-sm"
                      : "bg-[#FBF9F5] border border-[#E8E5DF] text-[#121316] rounded-bl-xs shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Abstention alert */}
                  {msg.sender === "assistant" && msg.hasSufficientEvidence === false && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Out-of-scope abstention: this concept is not stated in your uploaded course notes.</span>
                    </div>
                  )}

                  {/* Grounded Citation Chips */}
                  {msg.sender === "assistant" && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E8E5DF] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-[#736E66]">
                        Grounded In:
                      </span>
                      {msg.citations.map((cite, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveCitation(cite);
                            setDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EFEB] border border-[#E8E5DF] text-[#121316] hover:bg-[#E8E5DF] text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3 text-[#121316]" />
                          <span>
                            {cite.filename} (p.{cite.pageNumber})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#121316] font-semibold py-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#121316]" />
                <span>Searching retrieved document chunks and grounding response...</span>
              </div>
            )}
          </div>

          {/* Quick Action Chips & Input Area */}
          <div className="pt-6 border-t border-[#E8E5DF] space-y-4">
            {/* Quick Action Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#736E66] font-bold uppercase tracking-wider">Quick Actions:</span>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Explain the core rules and definitions of ${selectedTopic?.title || "this topic"}`,
                    "explain"
                  )
                }
                className="px-3.5 py-1.5 rounded-full border border-[#E8E5DF] bg-[#F2EFEB] text-[#121316] hover:bg-[#E8E5DF] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#121316]" />
                <span>Core Explanation</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Show a step-by-step worked example demonstrating ${selectedTopic?.title || "this topic"}`,
                    "example"
                  )
                }
                className="px-3.5 py-1.5 rounded-full border border-[#E8E5DF] bg-[#F2EFEB] text-[#121316] hover:bg-[#E8E5DF] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#121316]" />
                <span>Step-by-step Example</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Generate a concise Class Brief summary of ${selectedTopic?.title || "this topic"}`,
                    "brief"
                  )
                }
                className="px-3.5 py-1.5 rounded-full border border-[#E8E5DF] bg-[#F2EFEB] text-[#121316] hover:bg-[#E8E5DF] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Class Brief (Executive Summary)</span>
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  selectedTopic
                    ? `Ask anything about "${selectedTopic.title}"...`
                    : "Ask about any topic in your uploaded course materials..."
                }
                className="flex-1 px-5 py-3 rounded-full border border-[#E8E5DF] bg-white text-xs text-[#121316] placeholder:text-[#A09A90] focus:outline-none focus:ring-2 focus:ring-[#121316]"
              />
              <Button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                size="md"
                className="px-6"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Ask AI
              </Button>
            </form>
          </div>
        </Card>

        {/* Source Citation Drawer */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={activeCitation?.filename || "Source Evidence Excerpt"}
          subtitle={`Page ${activeCitation?.pageNumber} • Section: "${activeCitation?.heading}"`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F2EFEB] border border-[#E8E5DF] text-xs text-[#5A554E]">
              <span className="font-bold text-[#121316] block mb-1">
                Grounded Provenance Verification
              </span>
              This cited passage from your course documents was retrieved to construct the explanation.
            </div>

            <div className="p-5 rounded-2xl border border-[#E8E5DF] bg-[#FBF9F5] text-xs md:text-sm text-[#121316] leading-relaxed whitespace-pre-wrap font-serif">
              {activeCitation?.passage}
            </div>
          </div>
        </Drawer>
      </div>
    </AppShell>
  );
}
