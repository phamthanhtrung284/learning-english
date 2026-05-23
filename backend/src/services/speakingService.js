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

const TOPICS = {
  daily_life: "daily life — morning routines, hobbies, food, weekends, friends, personal habits",
  work:       "work and career — job experiences, workplace stories, career goals, colleagues, work-life balance",
};

/**
 * Start a new conversation — AI introduces itself and opens naturally.
 */
export const startConversation = async (topic) => {
  const topicDesc = TOPICS[topic] || TOPICS.daily_life;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    max_tokens: 200,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are Alex, a friendly 25-year-old American who is chatting with a Vietnamese friend learning English.
You are having a REAL, natural conversation — not an interview or a quiz.

Topic area: ${topicDesc}

Your personality:
- Warm, casual, genuinely curious about the other person
- You share your own opinions and experiences, not just ask questions
- You react naturally to what they say ("Oh really?", "That's interesting!", "Same here!")
- You keep it light and fun, like texting a friend

Opening message rules:
- Introduce yourself briefly OR jump straight into a casual opener
- Keep it short (1-2 sentences max)
- End with ONE natural question or comment that invites them to share

Return JSON: { "question": "your opening message", "hint": "" }`,
      },
      { role: "user", content: "Start the conversation." },
    ],
  });

  const data = cleanJson(completion.choices[0]?.message?.content || "{}");
  return {
    question: String(data.question || "Hey! How's your day going so far?"),
    hint: "",
  };
};

/**
 * Continue conversation — AI responds naturally AND gives brief language feedback.
 */
export const continueConversation = async (topic, history, userAnswer) => {
  const topicDesc = TOPICS[topic] || TOPICS.daily_life;

  const messages = [
    {
      role: "system",
      content: `You are Alex, a friendly 25-year-old American having a REAL casual conversation with a Vietnamese friend learning English.
Topic area: ${topicDesc}

CONVERSATION RULES (most important):
1. ALWAYS respond to what they actually said first — react, agree, share your own experience
2. Be natural: "Oh wow, that's cool!", "Haha same!", "Wait really?", "I totally get that"
3. Share YOUR own thoughts/experiences related to what they said (1-2 sentences)
4. Then naturally continue the conversation with a follow-up (can be a question OR just a comment)
5. Keep your response SHORT — like a real text message (2-4 sentences total)
6. NEVER sound like a teacher or interviewer — you're a friend

FEEDBACK RULES (secondary):
- Give brief, kind feedback on their English
- Only point out 1-2 things max
- If they wrote something inappropriate/nonsensical, gently redirect while still being friendly
- score: 60-100 based on naturalness and grammar

Return JSON:
{
  "aiResponse": "<your natural conversational reply — react + share + continue>",
  "feedback": {
    "score": <60-100>,
    "correctedVersion": "<only if there's a clear grammar error, show the corrected sentence. Empty string if fine>",
    "goodPoints": "<one thing they did well, in English, 1 short sentence>",
    "improvements": ["<max 1-2 specific tips, only if needed>"],
    "nativeAlternative": "<a more natural way to say the same thing, only if their English was correct but unnatural>"
  },
  "suggestions": [
    { "vi": "<câu tiếng Việt gợi ý để trả lời>", "en": "<bản dịch tiếng Anh tự nhiên>" },
    { "vi": "<câu tiếng Việt khác>", "en": "<bản dịch tiếng Anh>" },
    { "vi": "<câu tiếng Việt thứ 3>", "en": "<bản dịch tiếng Anh>" }
  ]
}

FEEDBACK DETAIL RULES:
- nativeAlternative: if their English was grammatically OK but unnatural, explain in Vietnamese WHY it sounds unnatural and give 1-2 alternative ways to say it more naturally. Format: "Câu của bạn đúng ngữ pháp nhưng... Người bản ngữ thường nói: [option1] hoặc [option2]"
- correctedVersion: only for clear grammar errors, show the fixed sentence
- improvements: max 2, each must reference the EXACT words they used`,
    },
  ];

  for (const turn of history) {
    messages.push({ role: "assistant", content: turn.question });
    if (turn.answer) messages.push({ role: "user", content: turn.answer });
  }
  messages.push({ role: "user", content: userAnswer });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.75,
    max_tokens: 700,
    response_format: { type: "json_object" },
    messages,
  });

  const data = cleanJson(completion.choices[0]?.message?.content || "{}");
  const fb = data.feedback || {};

  // normalize suggestions — support both old string[] and new {vi,en}[] format
  const rawSuggestions = Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : [];
  const suggestions = rawSuggestions.map(s =>
    typeof s === "string" ? { vi: "", en: s } : { vi: String(s.vi || ""), en: String(s.en || "") }
  );

  return {
    feedback: {
      score: Math.min(100, Math.max(0, Number(fb.score) || 70)),
      correctedVersion: String(fb.correctedVersion || ""),
      goodPoints: String(fb.goodPoints || ""),
      improvements: Array.isArray(fb.improvements) ? fb.improvements.slice(0, 2) : [],
      nativeAlternative: String(fb.nativeAlternative || ""),
    },
    nextQuestion: String(data.aiResponse || "That's interesting! Tell me more."),
    hint: "",
    suggestions,
  };
};
