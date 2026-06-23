import { Response } from "express";
import { AuthenticatedRequest } from "../../common/types/api.types.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok, fail } from "../../common/utils/httpResponse.js";
import { generateLessonAI } from "./services/aiContent.js";

export const createLesson = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { topic, level } = req.body;

  if (!topic) {
    void fail(res, "Topic is required");
    return;
  }

  const lesson = await generateLessonAI(topic, level);
  void ok(res, lesson);
});
