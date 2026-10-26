export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  text: string;
  pages: ExtractedPage[];
  pageCount: number;
  isScannedPdf: boolean;
}

/**
 * Extracts clean text and pages from raw PDF or plain text buffer
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  filename: string
): Promise<ExtractedDocument> {
  const isPdf = filename.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    const rawText = buffer.toString("utf-8");
    if (!rawText.trim()) {
      throw new Error("Uploaded file is empty");
    }

    return {
      text: rawText,
      pages: [{ pageNumber: 1, text: rawText }],
      pageCount: 1,
      isScannedPdf: false,
    };
  }

  // Parse PDF
  try {
    // Dynamic import to avoid client-side bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);

    const fullText = (data.text || "").trim();
    const pageCount = data.numpages || 1;

    // Check for scanned PDF (empty or whitespace-only extracted text)
    if (!fullText || fullText.length < 50) {
      return {
        text: "",
        pages: [],
        pageCount,
        isScannedPdf: true,
      };
    }

    // Split text into approximate pages if page markers exist, or distribute evenly
    const pageChunks: ExtractedPage[] = [];
    const rawPages = fullText.split(/\f|\n(?=Page\s+\d+)/i);

    if (rawPages.length > 1) {
      rawPages.forEach((pageText: string, idx: number) => {
        if (pageText.trim()) {
          pageChunks.push({
            pageNumber: idx + 1,
            text: pageText.trim(),
          });
        }
      });
    } else {
      // Divide content proportionally across page count
      const charsPerPage = Math.ceil(fullText.length / pageCount);
      for (let i = 0; i < pageCount; i++) {
        const start = i * charsPerPage;
        const end = Math.min(start + charsPerPage, fullText.length);
        const segment = fullText.slice(start, end).trim();
        if (segment) {
          pageChunks.push({
            pageNumber: i + 1,
            text: segment,
          });
        }
      }
    }

    return {
      text: fullText,
      pages: pageChunks.length > 0 ? pageChunks : [{ pageNumber: 1, text: fullText }],
      pageCount,
      isScannedPdf: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to extract text from PDF: ${msg}`);
  }
}
