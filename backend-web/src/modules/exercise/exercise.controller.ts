import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok } from "../../common/utils/httpResponse.js";
import { c1Course } from "../course/course.service.js";
import { generateExercises } from "./exercise.service.js";

export const getChapterExercises = asyncHandler(async (req: Request, res: Response) => {
  const chapterId = Number(req.params.id);
  const chapter = c1Course.chapters.find((c) => c.id === chapterId);

  if (!chapter) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }

  const exercises = generateExercises(chapter.story);
  ok(res, exercises);
});
