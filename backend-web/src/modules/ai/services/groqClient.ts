import Groq from "groq-sdk";
import { cleanJson } from "../../../common/utils/cleanJson.js";

// Lazy-initialize the Groq client so it's only created when first used,
// after environment variables have been loaded.
let _groq: Groq | null = null;

export function getGroq(): Groq {
  if (!_groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

// Keep the named export for backwards compat — resolves lazily on first use
export const groq: Groq = new Proxy({} as Groq, {
  get(_target, prop) {
    return (getGroq() as any)[prop];
  },
});

const createFallbackWord = (word: string) => ({
  text: word,
  pos: "unknown",
  meaning: "",
  ipa: "",
  explanation: "",
  collocations: [],
  native_nuance: "",
  synonyms: [],
});

const GRAMMAR_STYLES = new Set(["sky", "rose", "amber", "emerald", "violet", "slate"]);

export async function lookupWord(word: string, context: string) {
  const w = String(word || "").trim().slice(0, 80);
  const ctx = String(context || "").trim().slice(0, 2800);

  if (!w) {
    throw new Error("Word is required");
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.12,
    response_format: { type: "json_object" },
    max_tokens: 380,
    messages: [
      {
        role: "system",
        content: `You help Vietnamese learners understand English vocabulary IN CONTEXT.
Return ONLY valid JSON with this exact shape:
{"pos":"string (part of speech, e.g. noun, verb, adj)","meaning":"string (concise Vietnamese gloss for THIS token in THIS paragraph)","ipa":"string (IPA in slashes, e.g. /wɜːrd/)","explanation":"string (short clear English definition for this sense in context)"}
Rules:
- meaning MUST be Vietnamese.
- explanation MUST be English.
- If the token is a proper name, rare acronym, or non-English, still return best-effort IPA and brief notes in both languages.`,
      },
      {
        role: "user",
        content: JSON.stringify({ targetWord: w, paragraph: ctx }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");

  const data = cleanJson(raw);
  return {
    pos: String(data.pos || "").trim(),
    meaning: String(data.meaning || "").trim(),
    ipa: String(data.ipa || "").trim(),
    explanation: String(data.explanation || "").trim(),
  };
}

export async function generateSentence(words: string[], level: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an English teacher creating example sentences for Vietnamese learners.
Return ONLY valid JSON:
{
  "sentences": [
    {
      "sentence": "English sentence using the given words",
      "translation": "Natural Vietnamese translation"
    }
  ]
}
Rules:
- Use level-appropriate grammar and vocabulary.
- Each sentence must use ALL the given words naturally.
- Translation must be natural Vietnamese, not word-for-word.`,
      },
      {
        role: "user",
        content: JSON.stringify({ words, level }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");
  return cleanJson(raw);
}

export async function analyzeSentence(sentence: string) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert English-Vietnamese translator and language teacher. Your translations must sound like natural, fluent Vietnamese — not word-for-word or robotic.

Return ONLY valid JSON in this exact shape:
{
  "originalSentence": "string",
  "translatedSentence": "string (natural Vietnamese translation — idiomatic, fluent, as a native speaker would say it)",
  "words": [
    {
      "text": "string (exact word from sentence)",
      "pos": "string (noun | verb | adj | adv | prep | conj | det | pron | etc.)",
      "meaning": "string (concise Vietnamese meaning IN CONTEXT — 1-5 words, natural Vietnamese)",
      "ipa": "string (IPA, e.g. /wɜːrd/)",
      "explanation": "string (clear English definition for this sense in context)",
      "collocations": ["string"],
      "native_nuance": "string",
      "synonyms": ["string"]
    }
  ]
}

RULES:
1. translatedSentence: Write as a fluent Vietnamese speaker would naturally say it. Restructure the sentence if needed — do NOT translate word-by-word. Preserve the original tone (formal/informal/academic).
2. meaning: Vietnamese only. Concise. Natural. Match the word's role in THIS sentence.
3. explanation: English only.
4. Every word token in the sentence must appear in the words array, in order.
5. NO markdown. NO text outside JSON.`,
        },
        {
          role: "user",
          content: sentence,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const data = cleanJson(raw);

    if (!Array.isArray(data.words)) {
      data.words = sentence.split(" ").map(createFallbackWord);
    }

    data.words = data.words.map((word: any) => ({
      text: word.text || "",
      pos: word.pos || "",
      meaning: word.meaning || "",
      ipa: word.ipa || "",
      explanation: word.explanation || "",
      collocations: word.collocations || [],
      native_nuance: word.native_nuance || "",
      synonyms: word.synonyms || [],
    }));

    return data;
  } catch (error) {
    console.log("AI ERROR:", error);
    throw new Error("Analyze failed");
  }
}

export async function analyzeGrammar(sentence: string) {
  const trimmed = String(sentence || "").trim();
  if (!trimmed) {
    return { words: [] };
  }

  const wordMatches = [...trimmed.matchAll(/\b[\w']+\b/g)];
  const n = wordMatches.length;
  if (n === 0) {
    return { words: [] };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.05,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You label English grammar for Vietnamese learners. Return ONLY valid JSON.

Format:
{
  "words": [
    { "role": "short label (e.g. Subject, Verb, Object, Relative clause, Determiner, Auxiliary)", "style": "sky|rose|amber|emerald|violet|slate" }
  ]
}

Rules:
- The "words" array MUST contain exactly ${n} objects, in left-to-right order of the ${n} word tokens (letters/apostrophes only; ignore punctuation).
- style must be one of: sky, rose, amber, emerald, violet, slate. Use different styles for different clause constituents when possible (e.g. subject vs verb vs object).
- Keep "role" concise (max ~40 chars).`,
        },
        {
          role: "user",
          content: trimmed,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const data = cleanJson(raw);
    let words = Array.isArray(data.words) ? data.words : [];

    words = words.map((w: any) => ({
      role: String(w?.role || "other").slice(0, 64),
      style: GRAMMAR_STYLES.has(String(w?.style || "").toLowerCase())
        ? String(w.style).toLowerCase()
        : "slate",
    }));

    while (words.length < n) {
      words.push({ role: "other", style: "slate" });
    }
    if (words.length > n) {
      words = words.slice(0, n);
    }

    return { words };
  } catch (error) {
    console.log("GRAMMAR AI ERROR:", error);
    throw new Error("Grammar analysis failed");
  }
}
