"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  UploadCloud,
  FileText,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  BookOpen,
} from "lucide-react";
import { formatDate, formatTimeAgo } from "@/lib/utils";

interface DocumentItem {
  id: string;
  filename: string;
  title: string;
  file_type: "syllabus" | "textbook" | "notes" | "past_paper";
  status: "uploaded" | "processing" | "ready" | "failed";
  error_message: string | null;
  page_count: number;
  chunk_count: number;
  file_size: number;
  created_at: string;
}

export default function MaterialsPage() {
  const [documents, setDocuments] = React.useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<"syllabus" | "textbook" | "notes" | "past_paper">("syllabus");
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.warn("Fetch documents error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadError(null);

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds 10MB limit. Please upload a smaller document.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", selectedType);
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const docId = uploadData.document.id;
      fetchDocuments();

      const procRes = await fetch(`/api/documents/${docId}/process`, {
        method: "POST",
      });
      const procData = await procRes.json();
      if (!procRes.ok && procData.code === "SCANNED_PDF") {
        setUploadError("Scanned PDF detected: OCR text extraction is not supported. Please upload a digital PDF with searchable text.");
      }

      await fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || "Failed to process document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      await fetchDocuments();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#121316]">
                Course Study Materials
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF]">
                Grounding Knowledge Base
              </span>
            </div>
            <p className="text-xs text-[#5A554E] mt-1 max-w-xl leading-relaxed">
              Upload your syllabus, textbooks, and notes. GapFinder AI parses passages, creates chunk embeddings, and grounds all diagnostic questions.
            </p>
          </div>
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Dropzone Card */}
        <Card
          className={`p-8 sm:p-12 border-2 border-dashed transition-all duration-200 text-center ${
            dragActive
              ? "border-[#121316] bg-white shadow-xl"
              : "border-[#D5D1C8] bg-white/70 hover:border-[#121316]"
          }`}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className="flex flex-col items-center justify-center max-w-lg mx-auto"
          >
            <div className="w-14 h-14 rounded-full bg-[#F2EFEB] border border-[#E8E5DF] text-[#121316] flex items-center justify-center mb-4 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#121316] mb-1 tracking-tight">
              Upload Course Material (PDF or TXT)
            </h3>
            <p className="text-xs text-[#5A554E] mb-6 max-w-md leading-relaxed">
              Drag & drop your syllabus, textbook sections, or lecture notes here. Maximum size 10MB. Digital searchable PDFs recommended.
            </p>

            {/* Document Type Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {(["syllabus", "textbook", "notes", "past_paper"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize cursor-pointer ${
                    selectedType === type
                      ? "bg-[#121316] text-white shadow-xs"
                      : "bg-[#F2EFEB] text-[#5A554E] hover:text-[#121316] hover:bg-[#E8E5DF]"
                  }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              size="md"
              className="font-semibold px-6"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Select File to Upload
            </Button>
          </div>
        </Card>

        {/* Uploaded Documents List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#121316]">
              Indexed Documents ({documents.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDocuments}
              className="text-xs text-[#5A554E] hover:text-[#121316]"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-white border border-[#E8E5DF] animate-pulse" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No materials uploaded yet"
              description="Upload your syllabus or lecture notes above to let GapFinder AI build your Knowledge X-Ray and diagnostic quiz."
              action={
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  Upload First Syllabus
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F2EFEB] border border-[#E8E5DF] flex items-center justify-center text-[#121316] shrink-0">
                          <FileText className="w-4 h-4 text-[#121316]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#121316] truncate">
                            {doc.title || doc.filename}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-[#736E66] tracking-wider">
                            {doc.file_type.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {doc.status === "ready" && (
                        <Badge variant="strong" label="Ready" />
                      )}
                      {doc.status === "processing" && (
                        <Badge variant="medium" label="Processing" />
                      )}
                      {doc.status === "failed" && (
                        <Badge variant="weak" label="Failed" />
                      )}
                      {doc.status === "uploaded" && (
                        <Badge variant="neutral" label="Uploaded" />
                      )}
                    </div>

                    {doc.status === "failed" && doc.error_message && (
                      <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-2xl border border-rose-200 mb-3">
                        {doc.error_message}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#5A554E] py-2 border-y border-[#E8E5DF] my-2">
                      <div className="flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-[#121316]" />
                        <span>{doc.page_count || 1} pages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#121316]" />
                        <span>{doc.chunk_count || 0} chunks</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-[#736E66] font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#736E66]" />
                      {formatTimeAgo(doc.created_at)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 text-[#736E66] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
