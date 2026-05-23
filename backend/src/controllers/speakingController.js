import { startConversation, continueConversation } from "../services/speakingService.js";
import SpeakingSession from "../models/SpeakingSession.js";

const MAX_SESSIONS = 3;

export const startSpeaking = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "topic is required" });

    const result = await startConversation(String(topic));

    // Create new session, enforce max 3 per user
    const userId = req.user?.id;
    if (userId) {
      const count = await SpeakingSession.countDocuments({ userId });
      if (count >= MAX_SESSIONS) {
        // Delete oldest session
        const oldest = await SpeakingSession.findOne({ userId }).sort({ createdAt: 1 });
        if (oldest) await oldest.deleteOne();
      }
      const session = await SpeakingSession.create({
        userId,
        topic,
        topicLabel: topic,
        turns: [],
        turnCount: 0,
      });
      return res.json({ ...result, sessionId: session._id });
    }

    res.json(result);
  } catch (e) {
    console.error("startSpeaking:", e);
    res.status(500).json({ error: e.message || "Failed to start conversation" });
  }
};

export const continueSpeaking = async (req, res) => {
  try {
    const { topic, history, userAnswer, sessionId } = req.body;
    if (!topic || !userAnswer) return res.status(400).json({ error: "topic and userAnswer are required" });

    const result = await continueConversation(
      String(topic),
      Array.isArray(history) ? history : [],
      String(userAnswer).trim()
    );

    // Save turn to session
    if (sessionId && req.user?.id) {
      const lastTurn = history?.[history.length - 1];
      if (lastTurn) {
        await SpeakingSession.findOneAndUpdate(
          { _id: sessionId, userId: req.user.id },
          {
            $push: { turns: { question: lastTurn.question, answer: userAnswer, feedback: result.feedback } },
            $inc: { turnCount: 1 },
          }
        );
      }
    }

    res.json(result);
  } catch (e) {
    console.error("continueSpeaking:", e);
    res.status(500).json({ error: e.message || "Failed to continue conversation" });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await SpeakingSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(MAX_SESSIONS)
      .lean();
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    await SpeakingSession.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
