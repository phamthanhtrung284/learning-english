import { groq } from "../ai/services/groqClient.js";
import { cleanJson } from "../../common/utils/cleanJson.js";

interface TranslationCheckResult {
  score: number;
  referenceTranslation: string;
  highlightedUserTranslation: string;
  suggestion: string;
  suggestedImprovements: string[];
  overallComment: string;
  grammarErrors: { original: string; correction: string; explanation: string }[];
}

export const checkTranslationWithAI = async (
  vietnameseSentence: string,
  userTranslation: string
): Promise<TranslationCheckResult> => {
  const prompt = `
You are an experienced English teacher grading a Vietnamese student's translation for TOEIC 900+ preparation.
Be thorough, specific, and educational — like a teacher marking a student's paper with detailed annotations.

ORIGINAL (Vietnamese): ${vietnameseSentence}
STUDENT'S TRANSLATION: ${userTranslation}

Evaluate at TOEIC 900+ standard. Focus on:
- Grammar accuracy (tense, articles, prepositions, subject-verb agreement, word order)
- Vocabulary precision (right word for the context, natural collocations)
- Sentence naturalness (how a native speaker would say it)
- Completeness (did the student capture all meaning from the Vietnamese)

Return ONLY valid JSON (no markdown):

{
  "score": <integer 0-100>,
  "referenceTranslation": "<the most natural, accurate English translation at TOEIC 900+ level>",
  "highlightedUserTranslation": "<student's translation with HTML: wrap CORRECT/GOOD parts in <mark class='correct'>...</mark>, WRONG/AWKWARD parts in <mark class='wrong'>...</mark>>",
  "suggestion": "<1-2 sentences in Vietnamese: the single most important thing to fix, written like a teacher pointing out the key issue. Start with 'Suggestion:' or 'Gợi ý:'>",
  "suggestedImprovements": [
    "<specific improvement in Vietnamese — explain WHY it's wrong and HOW to fix it, reference exact words/phrases from the student's translation>",
    "<another improvement if needed — focus on vocabulary choice, grammar rule, or natural expression>"
  ],
  "overallComment": "<2-3 sentences in Vietnamese: teacher's overall assessment. Start positive, then address the main weakness, end with encouragement. Be specific, not generic.>",
  "grammarErrors": [
    {
      "original": "<exact wrong phrase from student's translation>",
      "correction": "<corrected version>",
      "explanation": "<why in Vietnamese — cite the grammar rule or explain the natural usage, max 2 sentences>"
    }
  ]
}

Rules:
- score: 90-100 = excellent (near-native), 80-89 = good (minor issues), 65-79 = acceptable (clear errors), below 65 = needs significant work
- suggestedImprovements: max 3 items, each must reference specific words from the student's translation
- grammarErrors: only real errors, not style preferences. Max 3 errors.
- overallComment: MUST be specific to this student's translation, not generic praise
- All Vietnamese text must sound natural, like a real teacher speaking to a student
- If the translation is very good (90+), still point out 1 thing that could make it even more natural
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a thorough English teacher grading student translations. Be specific and educational. Output only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AI không trả về kết quả.");

  const data = cleanJson(raw);

  return {
    score: Math.min(100, Math.max(0, Number(data.score) || 0)),
    referenceTranslation: String(data.referenceTranslation || ""),
    highlightedUserTranslation: String(data.highlightedUserTranslation || userTranslation),
    suggestion: String(data.suggestion || ""),
    suggestedImprovements: Array.isArray(data.suggestedImprovements) ? data.suggestedImprovements.slice(0, 3) : [],
    overallComment: String(data.overallComment || ""),
    grammarErrors: Array.isArray(data.grammarErrors) ? data.grammarErrors.slice(0, 3) : [],
  };
};