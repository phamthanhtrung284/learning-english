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
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an advanced English learning AI for Vietnamese users.
Return ONLY valid JSON. 

STRICT FORMAT & LANGUAGE RULES:
{
  "originalSentence": "string (The original English sentence)",
  "translatedSentence": "string (MUST be translated to Vietnamese)",
  "words":[
    {
      "text": "string (The exact English word from the sentence)",
      "pos": "string (Part of speech: noun, verb, adj, adv, etc.)",
      "meaning": "string (MUST be the concise Vietnamese meaning of this word in context)",
      "ipa": "string (Phonetic transcription, e.g., /tɛst/)",
      "explanation": "string (MUST be an English definition of the word)",
      "collocations": ["string (English collocations)"],
      "native_nuance": "string (English or Vietnamese explanation of nuance)",
      "synonyms":["string (English synonyms)"]
    }
  ]
}

CRITICAL RULES:
1. 'meaning' inside the words array MUST ALWAYS be in VIETNAMESE (Tiếng Việt).
2. 'explanation' inside the words array MUST ALWAYS be in ENGLISH.
3. Every word in the original sentence MUST be extracted into the words array.
4. NO markdown formatting. NO text outside JSON.
`,
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
