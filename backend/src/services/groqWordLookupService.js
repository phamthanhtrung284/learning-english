import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
  } catch {
    throw new Error("Invalid AI response");
  }
};

/**
 * Single-word gloss for Vietnamese learners: Vietnamese meaning + IPA + English definition in context.
 */
export const lookupWordWithAI = async (word, context) => {
  const w = String(word || "")
    .trim()
    .slice(0, 80);
  const ctx = String(context || "")
    .trim()
    .slice(0, 2800);

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
};
