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
  const searchParams = useSearchParams();
  const preselectedTopicId = searchParams.get("topicId");

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
          setTopics(data.topics || []);
          if (!selectedTopicId && data.topics?.length > 0) {
            setSelectedTopicId(data.topics[0].id);
          }
        }
      } catch (e) {
        console.warn("Load topics error:", e);
      }
    }
    loadTopics();
  }, [selectedTopicId]);

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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Explain-This-Topic Assistant
              </h1>
              <Badge variant="ai" label="Strict Provenance Grounding" />
            </div>
            <p className="text-xs text-[#57534E] mt-1">
              Grounded answers citing only your uploaded syllabus, textbooks, and notes. Explicitly abstains if evidence is insufficient.
            </p>
          </div>

          {/* Topic Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] font-semibold whitespace-nowrap">Topic Context:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
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
        <Card className="min-h-[480px] flex flex-col justify-between p-6">
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
                  className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#7C3AED] text-white rounded-br-xs"
                      : "bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Abstention alert */}
                  {msg.sender === "assistant" && msg.hasSufficientEvidence === false && (
                    <div className="mt-3 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-xs text-[#DC2626]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Out-of-scope abstention: this fact is not in your uploaded notes.</span>
                    </div>
                  )}

                  {/* Grounded Citation Chips */}
                  {msg.sender === "assistant" && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E7E5E4] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#78716C]">
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
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3EEFF] border border-[#DDD6FE] text-[#7C3AED] hover:bg-[#E9DEFF] text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
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
              <div className="flex items-center gap-2 text-xs text-[#7C3AED] font-semibold py-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Searching retrieved document chunks and grounding response...</span>
              </div>
            )}
          </div>

          {/* Quick Action Chips & Input Area */}
          <div className="pt-4 border-t border-[#F5F5F4] space-y-3">
            {/* Quick Action Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#78716C] font-semibold">Quick Actions:</span>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Explain the core rules and definitions of ${selectedTopic?.title || "this topic"}`,
                    "explain"
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[11px] text-[#1C1917] font-medium transition-colors"
              >
                Explain from scratch
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Give me a step-by-step worked example demonstrating ${selectedTopic?.title || "this topic"}`,
                    "example"
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[11px] text-[#1C1917] font-medium transition-colors"
              >
                Worked Example
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Generate an executive Class Brief summarizing ${selectedTopic?.title || "this topic"} for exam prep`,
                    "brief"
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[11px] text-[#1C1917] font-medium transition-colors"
              >
                Executive Class Brief
              </button>
              {selectedTopicId && (
                <Link href={`/quiz?topicId=${selectedTopicId}`}>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F3EEFF] text-[#7C3AED] hover:bg-[#E9DEFF] text-[11px] font-semibold transition-colors inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Quiz me on this
                  </span>
                </Link>
              )}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder={
                  selectedTopic
                    ? `Ask anything about ${selectedTopic.title}...`
                    : "Ask any question about your course materials..."
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-xs md:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
              <Button
                onClick={() => handleSendMessage()}
                isLoading={isLoading}
                disabled={!inputQuery.trim()}
                size="md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Source Citation Drawer */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={activeCitation?.filename || "Grounded Source Passage"}
          subtitle={`Page ${activeCitation?.pageNumber} • Section: "${activeCitation?.heading}"`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4] text-xs text-[#78716C]">
              <span className="font-semibold text-[#1C1917] block mb-1">
                Verified Provenance Proven
              </span>
              This excerpt from your uploaded study material was retrieved and used to generate the assistant's explanation.
            </div>

            <div className="p-4 rounded-xl border border-[#E7E5E4] bg-white text-xs md:text-sm text-[#1C1917] leading-relaxed whitespace-pre-wrap font-serif">
              {activeCitation?.passage}
            </div>
          </div>
        </Drawer>
      </div>
    </AppShell>
  );
}
