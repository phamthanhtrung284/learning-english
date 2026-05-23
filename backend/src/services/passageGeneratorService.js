import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cleanJson = (text) => {
  try {
    let c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const f = c.indexOf("{"), l = c.lastIndexOf("}");
    return JSON.parse(c.substring(f, l + 1));
  } catch (e) {
    throw new Error("Invalid JSON: " + e.message);
  }
};

const LEVEL_GUIDE = {
  beginner: {
    label: "Beginner",
    vocab: "simple everyday vocabulary (A2-B1 level)",
    grammar: "simple present, simple past, basic conjunctions (and, but, because)",
    sentences: "short sentences, 10-15 words each",
    count: 4,
  },
  intermediate: {
    label: "Intermediate",
    vocab: "varied vocabulary including collocations and common idioms (B1-B2 level)",
    grammar: "mixed tenses, relative clauses, passive voice, conditionals",
    sentences: "medium sentences, 15-25 words each",
    count: 5,
  },
  advanced: {
    label: "Advanced",
    vocab: "sophisticated vocabulary, phrasal verbs, idioms, business/academic terms (B2-C1 level)",
    grammar: "complex structures, inversion, cleft sentences, advanced connectors",
    sentences: "complex sentences, 20-35 words each",
    count: 5,
  },
};

const TYPE_GUIDE = {
  email:   { label: "Email",   desc: "professional or personal email correspondence" },
  diary:   { label: "Diary",   desc: "personal diary entry with feelings and reflections" },
  essay:   { label: "Essay",   desc: "opinion or argumentative paragraph" },
  article: { label: "Article", desc: "news or magazine article paragraph" },
  story:   { label: "Story",   desc: "short story or narrative paragraph" },
  report:  { label: "Report",  desc: "business or research report paragraph" },
};

/**
 * Generate a Vietnamese passage for translation practice.
 * Returns { topic, sentences: string[] }
 */
export const generatePassage = async (level, contentType, usedTopics = []) => {
  const lvl  = LEVEL_GUIDE[level]  || LEVEL_GUIDE.intermediate;
  const type = TYPE_GUIDE[contentType] || TYPE_GUIDE.article;

  const avoidStr = usedTopics.length
    ? `Avoid these topics already used: ${usedTopics.slice(-10).join(", ")}.`
    : "";

  const prompt = `
You are a Vietnamese language teacher creating translation practice material for TOEIC preparation.

Generate a Vietnamese paragraph for a student to translate into English.

Requirements:
- Content type: ${type.desc}
- Level: ${lvl.label} — when translated to English, it should use ${lvl.vocab} and ${lvl.grammar}
- Split into exactly ${lvl.count} sentences
- Each sentence: ${lvl.sentences}
- Topic: choose a fresh, interesting topic related to work, daily life, travel, technology, health, or relationships
- ${avoidStr}
- The Vietnamese must be natural and fluent, not translated from English

Return ONLY valid JSON:
{
  "topic": "short topic name in Vietnamese (3-6 words)",
  "sentences": ["sentence 1", "sentence 2", ...]
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.8,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Generate Vietnamese passage for translation practice. Output only JSON." },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const data = cleanJson(raw);

  if (!Array.isArray(data.sentences) || data.sentences.length < 2) {
    throw new Error("AI generated invalid passage");
  }

  return {
    topic: String(data.topic || "Luyện tập"),
    sentences: data.sentences.map(s => String(s).trim()).filter(Boolean),
  };
};
