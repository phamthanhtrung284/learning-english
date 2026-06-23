import pdfParse from "pdf-parse";

export interface Paragraph {
  en: string;
}

function splitPdfTextToParagraphs(rawText: string): Paragraph[] {
  const text = String(rawText || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return [];

  const blocks = text
    .split(/\n\s*\n/g)
    .map((b) =>
      b
        .trim()
        .replace(/\n+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
    )
    .filter(Boolean);

  return blocks.map((en) => ({ en }));
}

export async function parsePdf(buffer: Buffer): Promise<{ paragraphs: Paragraph[]; pages: number }> {
  const parsed = await pdfParse(buffer);
  return {
    paragraphs: splitPdfTextToParagraphs(parsed.text),
    pages: parsed.numpages || 0,
  };
}
