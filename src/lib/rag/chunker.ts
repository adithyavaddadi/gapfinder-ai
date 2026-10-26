import { ExtractedPage } from "./parser";

export interface DocumentChunk {
  chunkIndex: number;
  content: string;
  heading: string | null;
  pageNumber: number;
  metadata: {
    filename: string;
    sectionHeading: string;
    page: number;
    charLength: number;
  };
}

export interface ChunkerOptions {
  chunkSize?: number; // Target characters (~800 chars)
  overlap?: number; // Character overlap (~100 chars)
}

/**
 * Intelligent chunking by headings and paragraphs with sliding overlap
 */
export function chunkDocument(
  pages: ExtractedPage[],
  filename: string,
  options: ChunkerOptions = {}
): DocumentChunk[] {
  const targetSize = options.chunkSize || 800;
  const overlap = options.overlap || 100;
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const pageText = page.text;
    const pageNumber = page.pageNumber;

    // Detect section headings (lines starting with #, or all caps, or Roman numerals / digits like 1.2 Normalization)
    const paragraphs = pageText.split(/\n\s*\n/);
    let currentHeading = `Section (Page ${pageNumber})`;
    let accumulatedText = "";

    for (const paragraph of paragraphs) {
      const trimmedPara = paragraph.trim();
      if (!trimmedPara) continue;

      // Heading detection heuristic
      const isHeading =
        /^#{1,4}\s+/.test(trimmedPara) ||
        /^(Chapter|Section|Module|\d+\.\d+|\d+\.)\s+[A-Z]/i.test(trimmedPara) ||
        (trimmedPara.length < 75 && trimmedPara === trimmedPara.toUpperCase() && /[A-Z]/.test(trimmedPara));

      if (isHeading) {
        currentHeading = trimmedPara.replace(/^#+\s*/, "").slice(0, 100);
      }

      if (accumulatedText.length + trimmedPara.length + 1 <= targetSize) {
        accumulatedText = accumulatedText
          ? `${accumulatedText}\n\n${trimmedPara}`
          : trimmedPara;
      } else {
        if (accumulatedText) {
          chunks.push({
            chunkIndex,
            content: accumulatedText,
            heading: currentHeading,
            pageNumber,
            metadata: {
              filename,
              sectionHeading: currentHeading,
              page: pageNumber,
              charLength: accumulatedText.length,
            },
          });
          chunkIndex++;

          // Slide overlap
          const overlapText = accumulatedText.slice(-overlap);
          accumulatedText = `${overlapText} ${trimmedPara}`.slice(0, targetSize * 1.2);
        } else {
          // Paragraph itself is larger than targetSize, split by sentence or length
          chunks.push({
            chunkIndex,
            content: trimmedPara.slice(0, targetSize),
            heading: currentHeading,
            pageNumber,
            metadata: {
              filename,
              sectionHeading: currentHeading,
              page: pageNumber,
              charLength: Math.min(trimmedPara.length, targetSize),
            },
          });
          chunkIndex++;
          accumulatedText = "";
        }
      }
    }

    if (accumulatedText.trim()) {
      chunks.push({
        chunkIndex,
        content: accumulatedText.trim(),
        heading: currentHeading,
        pageNumber,
        metadata: {
          filename,
          sectionHeading: currentHeading,
          page: pageNumber,
          charLength: accumulatedText.trim().length,
        },
      });
      chunkIndex++;
    }
  }

  return chunks;
}
