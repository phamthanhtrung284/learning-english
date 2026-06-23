import Paragraph, { IWord } from "../../models/Paragraph.js";
import { groq } from "../ai/services/groqClient.js";
import { cleanJson } from "../../common/utils/cleanJson.js";

export interface AnalyzeResult {
  translatedText: string;
  words: IWord[];
}

const createFallbackWord = (word: string): IWord => ({
  text: word,
  pos: "unknown",
  meaning: "",
  ipa: "",
  explanation: "",
  collocations: [],
  native_nuance: "",
  linking_instruction: "",
});

export async function analyzeParagraphWithAI(paragraphText: string): Promise<AnalyzeResult> {
  const trimmed = String(paragraphText || "").trim();
  if (!trimmed) {
    throw new Error("Paragraph text is required");
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.15,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an English-Vietnamese language teacher. Analyze the given English paragraph for Vietnamese learners.

Return ONLY valid JSON in this exact shape:
{
  "translatedText": "string (natural, fluent Vietnamese translation of the whole paragraph)",
  "words": [
    {
      "text": "string (word or phrase token)",
      "pos": "string (noun | verb | adj | adv | prep | conj | det | pron | expression | etc.)",
      "meaning": "string (concise Vietnamese meaning in context)",
      "ipa": "string (IPA pronunciation, e.g. /wɜːrd/)",
      "explanation": "string (short English definition for this sense)",
      "collocations": ["string"],
      "native_nuance": "string (usage notes in Vietnamese or English)",
      "linking_instruction": "string (pronunciation linking tip, can be empty)"
    }
  ]
}

Rules:
- translatedText must be natural Vietnamese, not word-for-word.
- meaning must be Vietnamese.
- explanation must be English.
- Cover all meaningful words/phrases in the paragraph.
- NO markdown. NO text outside JSON.`,
      },
      {
        role: "user",
        content: trimmed,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AI returned empty response");

  const data = cleanJson(raw);

  const translatedText = String(data.translatedText || "");
  const words: IWord[] = Array.isArray(data.words)
    ? data.words.map((w: any) => ({
        text: String(w.text || ""),
        pos: String(w.pos || ""),
        meaning: String(w.meaning || ""),
        ipa: String(w.ipa || ""),
        explanation: String(w.explanation || ""),
        collocations: Array.isArray(w.collocations) ? w.collocations : [],
        native_nuance: String(w.native_nuance || ""),
        linking_instruction: String(w.linking_instruction || ""),
      }))
    : trimmed.split(" ").map(createFallbackWord);

  return { translatedText, words };
}

export async function lookupParagraphCache(storyId: number, paragraphId: number) {
  const existing = await Paragraph.findOne({ storyId, paragraphId });
  return existing;
}

export async function saveParagraphAnalysis(storyId: number, paragraphId: number, text: string, analyzed: AnalyzeResult) {
  // Use upsert so concurrent requests for the same paragraph don't create duplicates.
  // The unique index on (storyId, paragraphId) acts as a second safeguard.
  const paragraph = await Paragraph.findOneAndUpdate(
    { storyId, paragraphId },
    {
      $setOnInsert: {
        storyId,
        paragraphId,
        originalText: text,
        translatedText: analyzed.translatedText,
        words: analyzed.words,
      },
    },
    { upsert: true, new: true }
  );
  return paragraph;
}
