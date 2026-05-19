import {
  analyzeSentenceWithAI,
  analyzeGrammarWithAI,
} from "../services/groqSentenceService.js";
import User from "../models/User.js";
import { lookupWordWithAI } from "../services/groqWordLookupService.js";

export const analyzeSentence =
  async (req, res) => {

    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const {
        sentence,
      } = req.body;

      if (!sentence) {

        return res.status(400).json({

          error:
            "Sentence is required",
        });
      }

      const result =
        await analyzeSentenceWithAI(
          sentence
        );

      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 10 } });

      res.json(result);

    } catch (error) {

      console.error("sentence analyze:", error);

      res.status(500).json({

        error:
          error.message ||
          "Internal server error",
      });
    }
  };

export const grammarBreakdown = async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence || typeof sentence !== "string") {
      return res.status(400).json({ error: "sentence is required" });
    }
    const result = await analyzeGrammarWithAI(sentence);
    res.json(result);
  } catch (error) {
    console.error("grammar breakdown:", error);
    res.status(500).json({
      error: error.message || "Grammar analysis failed",
    });
  }
};

export const lookupWord = async (req, res) => {
  try {
    const { word, context } = req.body;
    if (!word || typeof word !== "string") {
      return res.status(400).json({ error: "word is required" });
    }
    const ctx = typeof context === "string" ? context : "";
    const result = await lookupWordWithAI(word, ctx);
    res.json(result);
  } catch (error) {
    console.error("word lookup:", error);
    res.status(500).json({
      error: error.message || "Lookup failed",
    });
  }
};
