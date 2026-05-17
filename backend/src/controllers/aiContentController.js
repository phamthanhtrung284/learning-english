import {
  generateLessonAI,
} from "../services/aiContentService.js";

// =====================================
// CREATE LESSON
// =====================================

export const createLesson =
  async (req, res) => {

    try {

      const {
        topic,
        level,
      } = req.body;

      if (!topic) {

        return res.status(400).json({
          error: "Topic is required",
        });
      }

      const lesson =
        await generateLessonAI(
          topic,
          level
        );

      res.json(lesson);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: error.message,
      });
    }
  };