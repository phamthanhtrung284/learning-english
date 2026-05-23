import {
  analyzeSentenceWithAI,
  analyzeGrammarWithAI,
} from "../services/groqSentenceService.js";
import User from "../models/User.js";
import { lookupWordWithAI } from "../services/groqWordLookupService.js";
import { checkTranslationWithAI } from "../services/translationCheckService.js";
import { extractVocabularyFromPassage } from "../services/dictionaryService.js";
import { generatePassage } from "../services/passageGeneratorService.js";

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

export const checkTranslation = async (req, res) => {
  try {
    const { vietnameseSentence, userTranslation } = req.body;
    if (!vietnameseSentence || !userTranslation) {
      return res.status(400).json({ error: "vietnameseSentence và userTranslation là bắt buộc." });
    }
    const result = await checkTranslationWithAI(
      String(vietnameseSentence).trim(),
      String(userTranslation).trim()
    );
    res.json(result);
  } catch (error) {
    console.error("checkTranslation:", error);
    res.status(500).json({ error: error.message || "Translation check failed" });
  }
};

export const getDictionaryForPassage = async (req, res) => {
  try {
    const { passage } = req.body;
    if (!passage) return res.status(400).json({ error: "passage is required" });
    const items = await extractVocabularyFromPassage(String(passage).trim());
    res.json({ items });
  } catch (error) {
    console.error("getDictionaryForPassage:", error);
    res.status(500).json({ error: error.message || "Dictionary failed" });
  }
};

export const getGeneratedPassage = async (req, res) => {
  try {
    const { level, contentType, usedTopics } = req.body;
    if (!level || !contentType) {
      return res.status(400).json({ error: "level and contentType are required" });
    }
    const passage = await generatePassage(
      String(level).toLowerCase(),
      String(contentType).toLowerCase(),
      Array.isArray(usedTopics) ? usedTopics : []
    );
    res.json(passage);
  } catch (error) {
    console.error("getGeneratedPassage:", error);
    res.status(500).json({ error: error.message || "Passage generation failed" });
  }
};
