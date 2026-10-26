import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = (formData.get("file_type") as string) || "notes";
    const title = (formData.get("title") as string) || file?.name || "Uploaded Document";

    if (!file) {
      return NextResponse.json({ error: "No file provided", code: "INVALID_FILE" }, { status: 400 });
    }

    // Size limit check (< 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    // Extension check
    const filename = file.name;
    const lowerName = filename.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".txt")) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are supported", code: "UNSUPPORTED_TYPE" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert record in documents table
    const { data: docRecord, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        filename,
        title,
        file_type: fileType,
        status: "uploaded",
        file_size: file.size,
      })
      .select()
      .single();

    if (docError) {
      console.error("Document insert error:", docError);
      return NextResponse.json(
        { error: "Failed to create document record", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage if bucket exists, or buffer directly for processing
    const arrayBuffer = await file.arrayBuffer();
    const storagePath = `${user.id}/${docRecord.id}-${filename}`;

    try {
      await supabase.storage.from("materials").upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

      await supabase
        .from("documents")
        .update({ storage_path: storagePath })
        .eq("id", docRecord.id);
    } catch (storageErr) {
      console.warn("Storage upload note (can process in-memory):", storageErr);
    }

    return NextResponse.json({
      success: true,
      document: docRecord,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal upload error";
    return NextResponse.json({ error: msg, code: "UPLOAD_FAILED" }, { status: 500 });
  }
}
