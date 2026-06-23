import { Response } from "express";
import { AuthenticatedRequest } from "../../common/types/api.types.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok } from "../../common/utils/httpResponse.js";
import { saveWordResult } from "./progress.service.js";

export const saveWordResultHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { word, meaning, isCorrect } = req.body;
  const userId = req.user!.id;

  const progress = await saveWordResult({ userId, word, meaning, isCorrect });
  ok(res, progress);
});
