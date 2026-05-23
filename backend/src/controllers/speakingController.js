import { startConversation, continueConversation } from "../services/speakingService.js";

export const startSpeaking = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "topic is required" });
    const result = await startConversation(String(topic));
    res.json(result);
  } catch (e) {
    console.error("startSpeaking:", e);
    res.status(500).json({ error: e.message || "Failed to start conversation" });
  }
};

export const continueSpeaking = async (req, res) => {
  try {
    const { topic, history, userAnswer } = req.body;
    if (!topic || !userAnswer) return res.status(400).json({ error: "topic and userAnswer are required" });
    const result = await continueConversation(
      String(topic),
      Array.isArray(history) ? history : [],
      String(userAnswer).trim()
    );
    res.json(result);
  } catch (e) {
    console.error("continueSpeaking:", e);
    res.status(500).json({ error: e.message || "Failed to continue conversation" });
  }
};
