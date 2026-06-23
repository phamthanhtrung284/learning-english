export interface GlossaryEntry {
  meaning: string;
  ipa: string;
  pos: string;
  explanation: string;
  synonyms: string[];
  collocations: string[];
  native_nuance: string;
}

interface WordSegment {
  type: "word";
  wordData: {
    text: string;
    fromGlossary: boolean;
    meaning: string;
    ipa: string;
    pos: string;
    explanation: string;
    synonyms: string[];
    collocations: string[];
    native_nuance: string;
  };
}

interface PlainSegment {
  type: "plain";
  text: string;
}

type Segment = WordSegment | PlainSegment;

export function segmentLnParagraph(
  en: string,
  glossary: Record<string, Omit<GlossaryEntry, "text">> = {},
  commonGloss: Record<string, Omit<GlossaryEntry, "text">> = {}
): Segment[] {
  const re = /(\b[\w']+\b)|(\s+)|([^\w\s]+)/g;
  const segments: Segment[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(en)) !== null) {
    const word = m[1];
    const space = m[2];
    const punct = m[3];
    if (word) {
      const key = word.toLowerCase().replace(/^'+|'+$/g, "");
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
