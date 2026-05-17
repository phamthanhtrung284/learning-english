/**
 * Split paragraph text into rough sentence units for reading / grammar targets.
 */
export function splitParagraphToSentences(text) {
  const s = String(text || "").trim();
  if (!s) return [];
  const chunks = s.split(/(?<=[.!?])\s+/).map((t) => t.trim()).filter(Boolean);
  return chunks.length ? chunks : [s];
}
