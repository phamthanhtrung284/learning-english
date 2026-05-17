import Paragraph from "../models/Paragraph.js";

import { analyzeParagraph } from "../services/paragraphAI.js";

export const analyzeParagraphController =
  async (req, res) => {

    try {

      const {
        storyId,
        paragraphId,
        text,
      } = req.body;

      // CHECK CACHE
      const existing =
        await Paragraph.findOne({
          storyId,
          paragraphId,
        });

      if (existing) {
        return res.json(existing);
      }

      // AI ANALYZE
      const analyzed =
        await analyzeParagraph(text);

      // SAVE DB
      const paragraph =
        await Paragraph.create({
          storyId,
          paragraphId,

          originalText: text,

          translatedText:
            analyzed.translatedText,

          words: analyzed.words,
        });

      res.json(paragraph);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: error.message,
      });
    }
  };