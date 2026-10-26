"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
      // Immediately trigger processing
      fetchDocuments();

      const procRes = await fetch(`/api/documents/${docId}/process`, {
        method: "POST",
      });
      const procData = await procRes.json();
      if (!procRes.ok && procData.code === "SCANNED_PDF") {
        setUploadError("Scanned PDF detected: OCR text extraction is not supported. Please upload a digital PDF with searchable text.");
      }

      fetchDocuments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload or processing failed";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRetryProcessing = async (id: string) => {
    try {
      await fetch(`/api/documents/${id}/process`, { method: "POST" });
      fetchDocuments();
    } catch (e) {
      console.error("Retry failed:", e);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
              Course Materials & Evidence Sources
            </h1>
            <p className="text-xs text-[#57534E] mt-1">
              Upload course syllabi, lecture notes, textbook chapters, and past exam papers. Every diagnostic question citations links back to these files.
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3 text-xs text-[#DC2626]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{uploadError}</div>
          </div>
        )}

        {/* Drag and drop upload zone */}
        <Card className="border-dashed border-2 border-[#E7E5E4] bg-white p-6 md:p-8 text-center transition-all">
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
            <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6" />
            </div>

            <h3 className="text-base font-semibold text-[#1C1917] mb-1">
              Upload Course Material (PDF or TXT)
            </h3>
            <p className="text-xs text-[#57534E] mb-5 max-w-md leading-relaxed">
              Drag & drop your syllabus, textbook sections, or lecture notes here. Maximum size 10MB. Digital searchable PDFs recommended.
            </p>

            {/* Document Type Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {(["syllabus", "textbook", "notes", "past_paper"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    selectedType === type
                      ? "bg-[#7C3AED] text-white shadow-xs font-semibold"
                      : "bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]"
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
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Select File to Upload
            </Button>
          </div>
        </Card>

        {/* Uploaded Documents List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1C1917]">
              Indexed Documents ({documents.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDocuments}
              className="text-xs text-[#57534E]"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-xl bg-white border border-[#E7E5E4] animate-pulse" />
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
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F5F5F4] flex items-center justify-center text-[#57534E] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#1C1917] truncate">
                            {doc.title || doc.filename}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
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
                      <p className="text-xs text-[#DC2626] bg-[#FEF2F2] p-2 rounded-lg mb-3">
                        {doc.error_message}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#57534E] py-2 border-y border-[#F5F5F4] my-2">
                      <div className="flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>{doc.page_count || 1} pages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>{doc.chunk_count || 0} chunks</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-[#78716C]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(doc.created_at)}
                    </span>

                    {doc.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => handleRetryProcessing(doc.id)}
                        className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
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
