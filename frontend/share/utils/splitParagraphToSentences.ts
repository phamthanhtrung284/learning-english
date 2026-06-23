export function splitParagraphToSentences(text: string): string[] {
  const s = String(text || "").trim();
  if (!s) return [];
  const chunks = s
    .split(/(?<=[.!?])\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return chunks.length ? chunks : [s];
}
