import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const cleanJson = (text) => {
  try {
    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Model output did not contain JSON object");
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("lesson JSON parse:", e?.message);
    throw new Error("AI trả về JSON không hợp lệ. Thử lại hoặc rút ngắn chủ đề.");
  }
};

const normalizeLesson = (data) => {
  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : "Story";

  if (!Array.isArray(data.paragraphs)) {
    throw new Error("Invalid lesson: missing paragraphs array");
  }

  data.title = title;
  data.paragraphs = data.paragraphs.map((p) => ({
    text: p.text || "",
    translatedText: p.translatedText || "",
    sentences: Array.isArray(p.sentences)
      ? p.sentences.map((s) => ({
          originalSentence: s.originalSentence || "",
          translatedSentence: s.translatedSentence || "",
          words: Array.isArray(s.words)
            ? s.words.map((w) => ({
                text: w.text || "",
                meaning: w.meaning || "",
                ipa: w.ipa || "",
                pos: w.pos || "",
                explanation: w.explanation || "",
                collocations: Array.isArray(w.collocations)
                  ? w.collocations
                  : [],
                native_nuance: w.native_nuance || "",
                synonyms: Array.isArray(w.synonyms) ? w.synonyms : [],
              }))
            : [],
        }))
      : [],
  }));

  return data;
};

// =====================================
// GENERATE LESSON (Groq — cùng key với Sentence Analyzer)
// =====================================

export const generateLessonAI = async (topic, level = "C2") => {
  if (!process.env.GROQ_API_KEY?.trim()) {
    throw new Error("Thiếu GROQ_API_KEY trong .env backend");
  }

  const prompt = `
You are an English learning content generator for Vietnamese learners.

TOPIC: ${topic}
CEFR LEVEL: ${level}

Write an engaging short story (2–3 paragraphs total). Use vocabulary appropriate for the level.

Return ONLY valid JSON (no markdown) with this exact shape:

{
  "title": "string",
  "paragraphs": [
    {
      "text": "English paragraph as one string",
      "translatedText": "Vietnamese translation of the whole paragraph",
      "sentences": [
        {
          "originalSentence": "English sentence",
          "translatedSentence": "Vietnamese translation",
          "words": [
            {
              "text": "word from sentence",
              "meaning": "Vietnamese meaning in context",
              "ipa": "IPA e.g. /wɜːd/",
              "pos": "noun|verb|adj|...",
              "explanation": "short English definition",
              "collocations": ["English collocation"],
              "native_nuance": "nuance in English or Vietnamese",
              "synonyms": ["English synonym"]
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- The story itself: paragraph "text", every "originalSentence", every "text" in words, collocations, synonyms, explanations — MUST be natural ENGLISH only (no Vietnamese in the English lines).
- Vietnamese appears ONLY in: translatedText, translatedSentence, and word "meaning" (Vietnamese gloss in context).
- Every word in originalSentence must appear as one entry in words (punctuation excluded).
- meaning must be Vietnamese.
- synonyms must be an array (can be empty).
- Keep the story concise so the JSON stays complete.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      max_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output only a single valid JSON object. No markdown, no commentary.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Groq returned empty content");
    }

    if (completion.choices[0]?.finish_reason === "length") {
      throw new Error(
        "Bài quá dài, model bị cắt. Thử topic ngắn hơn hoặc generate lại."
      );
    }

    const parsed = cleanJson(raw);
    return normalizeLesson(parsed);
  } catch (error) {
    console.error("generateLessonAI:", error?.message || error);
    if (error instanceof Error && error.message.startsWith("Thiếu")) {
      throw error;
    }
    if (error instanceof Error && error.message.includes("JSON")) {
      throw error;
    }
    throw new Error(
      error?.message ||
        "Không thể generate lesson. Kiểm tra GROQ_API_KEY và thử lại."
    );
  }
};
