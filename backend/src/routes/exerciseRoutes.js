import express from "express";

import c1Course
  from "../data/courses/c1-course.js";

import {
  generateExercises
}
from "../services/exerciseGenerator.js";

const router =
  express.Router();

// GET EXERCISES
router.get(
  "/c1/chapter/:id",

  (req, res) => {

    const chapterId =
      Number(req.params.id);

    const chapter =
      c1Course.chapters.find(
        (c) =>
          c.id === chapterId
      );

    if (!chapter) {

      return res
        .status(404)
        .json({
          error:
            "Chapter not found"
        });
    }

    const exercises =
      generateExercises(
        chapter.story
      );

    res.json(exercises);
  }
);

export default router;