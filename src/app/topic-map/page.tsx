"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import {
  Network,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowRight,
  Sparkles,
  GitFork,
  HelpCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface TopicItem {
  id: string;
  title: string;
  description: string | null;
  parent_id: string | null;
  source: "syllabus" | "ai" | "user";
  mastery: {
    level: "weak" | "medium" | "strong" | "not_assessed";
    score_percentage: number;
    evidence_badge: "insufficient" | "preliminary" | "established";
    questions_attempted: number;
    questions_correct: number;
    missed_concepts: string[];
    why_rating: string;
  };
  prerequisites: Array<{
    id: string;
    prerequisiteTopicId: string;
    prerequisiteTitle: string;
    status: "suspected" | "supported";
    reason: string;
  }>;
}

export default function TopicMapPage() {
  const [topics, setTopics] = React.useState<TopicItem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [collapsedNodes, setCollapsedNodes] = React.useState<Record<string, boolean>>({});

  // Add topic modal state
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newParentId, setNewParentId] = React.useState<string | null>(null);

  // Edit title state
  const [editingTopicId, setEditingTopicId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState("");

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/topics");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
        if (data.topics?.length > 0 && !selectedTopicId) {
          setSelectedTopicId(data.topics[0].id);
        }
      }
    } catch (e) {
      console.warn("Fetch topics error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTopics();
  }, []);

  const handleGenerateTopics = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchTopics();
      }
    } catch (err) {
      console.error("Topic extraction error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          parent_id: newParentId,
        }),
      });
      if (res.ok) {
        setAddModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewParentId(null);
        await fetchTopics();
      }
    } catch (e) {
      console.error("Failed to add topic:", e);
    }
  };

  const handleUpdateTitle = async (topicId: string) => {
    if (!editingTitle.trim()) {
      setEditingTopicId(null);
      return;
    }
    try {
      await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
      setEditingTopicId(null);
      await fetchTopics();
    } catch (e) {
      console.error("Failed to update topic:", e);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await fetch(`/api/topics/${topicId}`, { method: "DELETE" });
      if (selectedTopicId === topicId) setSelectedTopicId(null);
      await fetchTopics();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build tree structure
  const rootTopics = topics.filter((t) => !t.parent_id);
  const childMap = new Map<string, TopicItem[]>();
  topics.forEach((t) => {
    if (t.parent_id) {
      const list = childMap.get(t.parent_id) || [];
      list.push(t);
      childMap.set(t.parent_id, list);
    }
  });

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const getStatusColorDot = (level: string) => {
    if (level === "strong") return "bg-[#16A34A]";
    if (level === "medium") return "bg-[#D97706]";
    if (level === "weak") return "bg-[#DC2626]";
    return "bg-[#78716C]";
  };

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || t.mastery?.level === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Knowledge X-Ray & Topic Map
              </h1>
              <Badge variant="ai" label="Interactive Hierarchy" />
            </div>
            <p className="text-xs text-[#57534E] mt-1">
              Structured diagnostic view of your curriculum, suspected dependencies, and evidence-backed mastery ratings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTopics}
              isLoading={isGenerating}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#7C3AED]" />
              Extract from Materials
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setNewParentId(null);
                setAddModalOpen(true);
              }}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Topic
            </Button>
          </div>
        </div>

        {/* Knowledge X-Ray Two-Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
          {/* Left Pane: Collapsible Topic Tree & Filters (7 cols) */}
          <Card className="lg:col-span-7 p-5 flex flex-col justify-between">
            <div>
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search curriculum topics..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E7E5E4] bg-[#FAF9F6] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {["all", "weak", "medium", "strong", "not_assessed"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize whitespace-nowrap transition-colors ${
                        statusFilter === status
                          ? "bg-[#7C3AED] text-white shadow-xs"
                          : "bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Tree Content */}
              {isLoading ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-[#F5F5F4] animate-pulse" />
                  ))}
                </div>
              ) : rootTopics.length === 0 ? (
                <EmptyState
                  icon={Network}
                  title="No topics mapped yet"
                  description="Upload your syllabus and click 'Extract from Materials' to automatically generate your curriculum tree."
                  action={
                    <Button size="sm" onClick={handleGenerateTopics} isLoading={isGenerating}>
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Extract Topic Tree
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {rootTopics.map((root) => {
                    const children = childMap.get(root.id) || [];
                    const isCollapsed = collapsedNodes[root.id];
                    const isSelected = selectedTopicId === root.id;

                    return (
                      <div key={root.id} className="space-y-1">
                        {/* Parent Node */}
                        <div
                          onClick={() => setSelectedTopicId(root.id)}
                          className={`group p-3 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#F3EEFF] border-[#DDD6FE] shadow-xs"
                              : "bg-white border-[#E7E5E4] hover:bg-[#FAF9F6]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {children.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => toggleCollapse(root.id, e)}
                                className="p-0.5 text-[#78716C] hover:text-[#1C1917]"
                              >
                                {isCollapsed ? (
                                  <ChevronRight className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <div
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusColorDot(
                                root.mastery?.level
                              )}`}
                            />

                            {editingTopicId === root.id ? (
                              <div
                                className="flex items-center gap-1 flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="px-2 py-0.5 rounded border border-[#7C3AED] text-xs font-semibold"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTitle(root.id)}
                                  className="text-[#16A34A] p-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTopicId(null)}
                                  className="text-[#DC2626] p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold text-[#1C1917] truncate block">
                                  {root.title}
                                </span>
                                {root.description && (
                                  <span className="text-[11px] text-[#78716C] truncate block">
                                    {root.description}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <Badge
                              variant={root.mastery?.level || "not_assessed"}
                              className="text-[10px] py-0 px-2"
                            />
                            {/* Action icons on hover */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTopicId(root.id);
                                  setEditingTitle(root.title);
                                }}
                                className="p-1 text-[#78716C] hover:text-[#1C1917]"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewParentId(root.id);
                                  setAddModalOpen(true);
                                }}
                                className="p-1 text-[#78716C] hover:text-[#7C3AED]"
                                title="Add subtopic"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTopic(root.id);
                                }}
                                className="p-1 text-[#78716C] hover:text-[#DC2626]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Child Subtopics */}
                        {!isCollapsed && children.length > 0 && (
                          <div className="pl-6 border-l-2 border-[#E7E5E4] ml-4 space-y-1 my-1">
                            {children.map((child) => {
                              const isChildSelected = selectedTopicId === child.id;
                              return (
                                <div
                                  key={child.id}
                                  onClick={() => setSelectedTopicId(child.id)}
                                  className={`p-2.5 rounded-lg border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                    isChildSelected
                                      ? "bg-[#F3EEFF] border-[#DDD6FE]"
                                      : "bg-white/80 border-[#E7E5E4] hover:bg-[#FAF9F6]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div
                                      className={`w-2 h-2 rounded-full shrink-0 ${getStatusColorDot(
                                        child.mastery?.level
                                      )}`}
                                    />
                                    <span className="text-xs font-medium text-[#1C1917] truncate">
                                      {child.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={child.mastery?.level || "not_assessed"}
                                      className="text-[10px] py-0 px-2"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#F5F5F4] flex items-center justify-between text-[11px] text-[#78716C]">
              <span>{topics.length} total curriculum topics mapped</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Strong
                <span className="w-2 h-2 rounded-full bg-[#D97706] ml-2" /> Medium
                <span className="w-2 h-2 rounded-full bg-[#DC2626] ml-2" /> Weak
              </span>
            </div>
          </Card>

          {/* Right Pane: Topic Detail & Diagnostic Actions (5 cols) */}
          <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
            {selectedTopic ? (
              <div className="space-y-6">
                {/* Header & Score Ring */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider block mb-1">
                      {selectedTopic.parent_id ? "Subtopic Details" : "Curriculum Module"}
                    </span>
                    <h3 className="text-lg font-bold text-[#1C1917] leading-snug">
                      {selectedTopic.title}
                    </h3>
                    <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                      {selectedTopic.description || "No specific syllabus description specified."}
                    </p>
                  </div>

                  <ScoreRing
                    score={selectedTopic.mastery?.score_percentage || 0}
                    size={84}
                    strokeWidth={7}
                    label="Score"
                  />
                </div>

                {/* Evidence & Status Badges */}
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#57534E] font-medium">Diagnostic Status:</span>
                    <Badge variant={selectedTopic.mastery?.level || "not_assessed"} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#57534E] font-medium">Evidence Rigor:</span>
                    <Badge variant={selectedTopic.mastery?.evidence_badge || "insufficient"} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#57534E] font-medium">Questions Attempted:</span>
                    <span className="font-mono font-semibold text-[#1C1917]">
                      {selectedTopic.mastery?.questions_correct || 0} /{" "}
                      {selectedTopic.mastery?.questions_attempted || 0}
                    </span>
                  </div>
                </div>

                {/* Diagnostic Reason / Why this rating */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                    Why this rating:
                  </h4>
                  <div className="p-3 rounded-xl border border-[#E7E5E4] bg-white text-xs text-[#1C1917] leading-relaxed">
                    {selectedTopic.mastery?.why_rating ||
                      "Topic has not been evaluated in diagnostic quizzes yet. Take a quiz to assess mastery."}
                  </div>
                </div>

                {/* Suspected Prerequisites */}
                {selectedTopic.prerequisites && selectedTopic.prerequisites.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                      Suspected Prerequisites:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.prerequisites.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-[#D97706] bg-[#FFFBEB] text-[#D97706] text-xs font-medium"
                        >
                          <GitFork className="w-3 h-3" />
                          <span>{p.prerequisiteTitle}</span>
                          <span className="text-[10px] text-[#B45309] font-mono">({p.status})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missed Concepts Chips */}
                {selectedTopic.mastery?.missed_concepts &&
                  selectedTopic.mastery.missed_concepts.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#DC2626] mb-2">
                        Missed Concepts Identified:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTopic.mastery.missed_concepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-medium"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-[#78716C]">
                Select a topic on the left to inspect its Knowledge X-Ray details.
              </div>
            )}

            {/* Action Buttons */}
            {selectedTopic && (
              <div className="pt-6 border-t border-[#F5F5F4] flex items-center gap-3">
                <Link
                  href={`/quiz?topicId=${selectedTopic.id}`}
                  className="flex-1"
                >
                  <Button size="md" className="w-full text-xs">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Take Diagnostic Quiz
                  </Button>
                </Link>
                <Link
                  href={`/explain?topicId=${selectedTopic.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="md" className="w-full text-xs">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#7C3AED]" />
                    Explain Topic
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Topic Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={newParentId ? "Add Subtopic" : "Add Curriculum Topic"}
        description="Expand your curriculum tree with custom course sections."
      >
        <form onSubmit={handleSaveTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Topic Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. BCNF Decomposition and Lossless Joins"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              placeholder="Brief summary of concepts covered in this topic..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Topic
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
