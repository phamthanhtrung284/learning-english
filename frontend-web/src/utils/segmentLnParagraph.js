/**
 * Tách đoạn tiếng Anh thành segment plain / word (cho InteractiveWord).
 * glossary: Record<lemma, Omit<wordData,'text'>>
 */
export function segmentLnParagraph(en, glossary = {}, commonGloss = {}) {
  const re = /(\b[\w']+\b)|(\s+)|([^\w\s]+)/g;
  const segments = [];
  let m;
  while ((m = re.exec(en)) !== null) {
    const word = m[1];
    const space = m[2];
    const punct = m[3];
    if (word) {
      const key = word
        .toLowerCase()
        .replace(/^'+|'+$/g, "");
      const raw = glossary[key] || commonGloss[key];
      segments.push({
        type: "word",
        wordData: {
          text: word,
          fromGlossary: Boolean(raw),
          meaning: raw?.meaning ?? "",
          ipa: raw?.ipa ?? "",
          pos: raw?.pos ?? "",
          explanation: raw?.explanation ?? "",
          synonyms: raw?.synonyms ?? [],
          collocations: raw?.collocations ?? [],
          native_nuance: raw?.native_nuance ?? "",
        },
      });
    } else if (space) {
      segments.push({ type: "plain", text: space });
    } else if (punct) {
      segments.push({ type: "plain", text: punct });
    }
  }
  return segments;
}
