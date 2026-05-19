import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =====================================
// SAFE JSON PARSER
// =====================================
const cleanJson = (text) => {
  try {
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleaned);
  } catch (error) {
    console.log("JSON PARSE ERROR:", text);
    throw error;
  }
};

// =====================================
// FALLBACK WORD
// =====================================
const createFallbackWord = (word) => ({
  text: word,
  pos: "unknown",
  meaning: "",
  ipa: "",
  explanation: "",
  collocations: [],
  native_nuance: "",
  synonyms: [],
});

// =====================================
// ANALYZE SENTENCE (Groq)
// =====================================
export const analyzeSentenceWithAI = async (sentence) => {
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

    const raw = completion.choices[0].message.content;
    const data = cleanJson(raw);

    if (!Array.isArray(data.words)) {
      data.words = sentence.split(" ").map(createFallbackWord);
    }

    data.words = data.words.map((word) => ({
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
};

const GRAMMAR_STYLES = new Set(["sky", "rose", "amber", "emerald", "violet", "slate"]);

/**
 * Token-level grammar coloring for a single sentence (for pastel underlines in the reader).
 * One entry per /\b[\w']+\b/ match, in order.
 */
export const analyzeGrammarWithAI = async (sentence) => {
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

    const raw = completion.choices[0].message.content;
    const data = cleanJson(raw);
    let words = Array.isArray(data.words) ? data.words : [];

    words = words.map((w) => ({
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
};
