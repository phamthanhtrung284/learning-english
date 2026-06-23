import mongoose from "mongoose";
import { Response } from "express";
import { startConversation, continueConversation } from "./speaking.service.js";
import SpeakingSession from "../../models/SpeakingSession.js";
import { AuthenticatedRequest } from "../../common/types/api.types.js";

const MAX_SESSIONS = 3;

export const startSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { topic, topicLabel, sessionId } = req.body;
    if (!topic) {
      res.status(400).json({ error: "topic is required" });
      return;
    }

    const result = await startConversation(String(topic));

    const userId = req.user?.id;
    if (userId) {
      // If resuming an existing session, reuse it — don't create a duplicate
      if (sessionId) {
        // Validate ObjectId before querying to avoid CastError leaking to client
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
          res.status(400).json({ error: "Invalid sessionId" });
          return;
        }
        const existing = await SpeakingSession.findOne({ _id: sessionId, userId });
        if (existing) {
          res.json({ ...result, sessionId: existing._id });
          return;
        }
      }

      // New session — enforce max 3 per user
      const count = await SpeakingSession.countDocuments({ userId });
      if (count >= MAX_SESSIONS) {
        const oldest = await SpeakingSession.findOne({ userId }).sort({ createdAt: 1 });
        if (oldest) await oldest.deleteOne();
      }
      const session = await SpeakingSession.create({
        userId,
        topic,
        topicLabel: topicLabel || topic,
        turns: [],
        turnCount: 0,
      });
      res.json({ ...result, sessionId: session._id });
      return;
    }

    res.json(result);
  } catch (e: any) {
    console.error("startSession:", e);
    res.status(500).json({ error: e.message || "Failed to start conversation" });
  }
};

export const continueSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { topic, history, userAnswer, sessionId } = req.body;
    if (!topic || !userAnswer) {
      res.status(400).json({ error: "topic and userAnswer are required" });
      return;
    }

    const result = await continueConversation(
      String(topic),
      Array.isArray(history) ? history : [],
      String(userAnswer).trim()
    );

    // Save turn to session if sessionId provided
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
  } catch (e: any) {
    console.error("continueSession:", e);
    res.status(500).json({ error: e.message || "Failed to continue conversation" });
  }
};

export const listSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await SpeakingSession.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(MAX_SESSIONS)
      .lean();
    res.json(sessions);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: "Invalid session id" });
      return;
    }
    const session = await SpeakingSession.findOne({ _id: req.params.id, userId: req.user?.id }).lean();
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(session);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: "Invalid session id" });
      return;
    }
    const deleted = await SpeakingSession.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    if (!deleted) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};