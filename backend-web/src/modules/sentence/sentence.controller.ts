import { Response } from "express";
import { checkTranslationWithAI } from "./sentence.service.js";
import { lookupWord as lookupWordAI, analyzeGrammar, analyzeSentence } from "../ai/services/groqClient.js";
import { generatePassage } from "../ai/services/passageGenerator.js";
import { AuthenticatedRequest } from "../../common/types/api.types.js";

export const analyzeSentenceRoute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sentence } = req.body;
    if (!sentence || typeof sentence !== "string") {
      res.status(400).json({ error: "sentence is required" });
      return;
    }
    const result = await analyzeSentence(String(sentence).trim());
    res.json(result);
  } catch (error: any) {
    console.error("analyzeSentence:", error);
    res.status(500).json({ error: error.message || "Analysis failed" });
  }
};

export const translateCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vietnameseSentence, userTranslation } = req.body;
    if (!vietnameseSentence || !userTranslation) {
      res.status(400).json({ error: "vietnameseSentence và userTranslation là bắt buộc." });
      return;
    }
    const result = await checkTranslationWithAI(
      String(vietnameseSentence).trim(),
      String(userTranslation).trim()
    );
    res.json(result);
  } catch (error: any) {
    console.error("checkTranslation:", error);
    res.status(500).json({ error: error.message || "Translation check failed" });
  }
};

export const lookupWord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { word: wordText, context } = req.body;
    if (!wordText || typeof wordText !== "string") {
      res.status(400).json({ error: "word is required" });
      return;
    }
    const ctx = typeof context === "string" ? context : "";
    const result = await lookupWordAI(wordText, ctx);
    res.json(result);
  } catch (error: any) {
    console.error("word lookup:", error);
    res.status(500).json({ error: error.message || "Lookup failed" });
  }
};

export const grammarBreakdown = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sentence } = req.body;
    if (!sentence || typeof sentence !== "string") {
      res.status(400).json({ error: "sentence is required" });
      return;
    }
    const result = await analyzeGrammar(sentence);
    res.json(result);
  } catch (error: any) {
    console.error("grammar breakdown:", error);
    res.status(500).json({ error: error.message || "Grammar analysis failed" });
  }
};

export const generatePassageRoute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { level = "intermediate", contentType = "article", usedTopics = [] } = req.body;
    const passage = await generatePassage(
      String(level),
      String(contentType),
      Array.isArray(usedTopics) ? usedTopics.map(String) : []
    );
    res.json(passage);
  } catch (error: any) {
    console.error("generatePassage:", error);
    res.status(500).json({ error: error.message || "Passage generation failed" });
  }
};