import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cleanJson = (text) => {
  try {
    let c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const f = c.indexOf("["), l = c.lastIndexOf("]");
    return JSON.parse(c.substring(f, l + 1));
  } catch {
    const f = text.indexOf("["), l = text.lastIndexOf("]");
    return JSON.parse(text.substring(f, l + 1));
  }
};

/**
 * Trích xuất từ vựng quan trọng từ đoạn văn tiếng Việt.
 * Trả về mảng gồm từ/cụm từ/idiom đáng học cho TOEIC 900+.
 */
export const extractVocabularyFromPassage = async (vietnamesePassage) => {
  const prompt = `
You are a TOEIC vocabulary expert. Given a Vietnamese passage, extract the key vocabulary
that a learner would need to translate it into English at TOEIC 900+ level.

Vietnamese passage:
${vietnamesePassage}

Return a JSON ARRAY (not object) of 8-12 vocabulary items. Each item:
{
  "word": "English word, phrase, idiom, or collocation",
  "type": "word" | "phrase" | "idiom" | "collocation",
  "meaning": "Vietnamese meaning, concise",
  "example": "One natural English example sentence using this word/phrase (highlight the word with **word**)"
}

Focus on:
- Key nouns, verbs, adjectives needed for the translation
- Useful collocations (e.g. "make a decision", "take responsibility")
- Common idioms or phrases that appear in TOEIC contexts
- Words that Vietnamese learners often mistranslate

Return ONLY the JSON array, no markdown.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: 'Return {"items": [...]} where items is the vocabulary array.' },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from AI");
  }

  const items = Array.isArray(parsed) ? parsed
    : Array.isArray(parsed.items) ? parsed.items
    : Array.isArray(parsed.vocabulary) ? parsed.vocabulary
    : [];

  return items.map((item) => ({
    word: String(item.word || ""),
    type: ["word", "phrase", "idiom", "collocation"].includes(item.type) ? item.type : "word",
    meaning: String(item.meaning || ""),
    example: String(item.example || ""),
  })).filter((item) => item.word);
};
