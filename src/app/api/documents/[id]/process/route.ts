import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";
import { parseDocumentBuffer } from "@/lib/rag/parser";
import { chunkDocument } from "@/lib/rag/chunker";
import { generateEmbedding } from "@/lib/ai/provider";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: documentId } = await params;
    const supabase = await createClient();

    // 1. Fetch document and enforce ownership (return 404 on foreign ID per security guidelines)
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Update status to processing
    await supabase.from("documents").update({ status: "processing" }).eq("id", documentId);

    // 2. Download file buffer from storage or request body
    let fileBuffer: Buffer | null = null;

    if (doc.storage_path) {
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from("materials")
        .download(doc.storage_path);

      if (!downloadError && fileBlob) {
        fileBuffer = Buffer.from(await fileBlob.arrayBuffer());
      }
    }

    // If not in storage, check if caller provided buffer in request or fallback
    if (!fileBuffer) {
      try {
        const body = await request.json();
        if (body.text) {
          fileBuffer = Buffer.from(body.text, "utf-8");
        }
      } catch {
        // no body
      }
    }

    if (!fileBuffer) {
      await supabase
        .from("documents")
        .update({
          status: "failed",
          error_message: "Document storage buffer could not be retrieved",
        })
        .eq("id", documentId);

      return NextResponse.json(
        { error: "Could not retrieve document buffer", code: "BUFFER_NOT_FOUND" },
        { status: 400 }
      );
    }

    // 3. Extract text & pages
    const parsed = await parseDocumentBuffer(fileBuffer, doc.filename);

    if (parsed.isScannedPdf) {
      await supabase
        .from("documents")
        .update({
          status: "failed",
          error_message: "Scanned PDF: OCR not supported",
        })
        .eq("id", documentId);

      return NextResponse.json(
        {
          error: "Scanned PDF: OCR not supported",
          code: "SCANNED_PDF",
          isScanned: true,
        },
        { status: 422 }
      );
    }

    // 4. Chunk document
    const chunks = chunkDocument(parsed.pages, doc.filename);

    // 5. Delete previous chunks idempotently
    await supabase.from("document_chunks").delete().eq("document_id", documentId);

    // 6. Generate embeddings and insert chunks in batches
    const BATCH_SIZE = 15;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const chunkRows = await Promise.all(
        batch.map(async (c) => {
          let embedding: number[] | null = null;
          try {
            embedding = await generateEmbedding(c.content);
          } catch (embErr) {
            console.warn(`Embedding failed for chunk ${c.chunkIndex}:`, embErr);
          }

          return {
            user_id: user.id,
            document_id: documentId,
            chunk_index: c.chunkIndex,
            content: c.content,
            heading: c.heading,
            page_number: c.pageNumber,
            embedding,
            metadata: c.metadata,
          };
        })
      );

      const { error: insertError } = await supabase.from("document_chunks").insert(chunkRows);
      if (insertError) {
        console.error("Batch chunk insert error:", insertError);
      }
    }

    // 7. Update document status to ready
    await supabase
      .from("documents")
      .update({
        status: "ready",
        page_count: parsed.pageCount,
        chunk_count: chunks.length,
        error_message: null,
      })
      .eq("id", documentId);

    return NextResponse.json({
      success: true,
      documentId,
      pageCount: parsed.pageCount,
      chunkCount: chunks.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Processing failed";
    console.error("Document processing error:", err);
    return NextResponse.json({ error: msg, code: "PROCESSING_ERROR" }, { status: 500 });
  }
}
