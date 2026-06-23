import { Response } from "express";
import { AuthenticatedRequest } from "../../common/types/api.types.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok } from "../../common/utils/httpResponse.js";
import * as paragraphService from "./paragraph.service.js";

export const analyzeParagraphController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { storyId, paragraphId, text } = req.body;

  const existing = await paragraphService.lookupParagraphCache(storyId, paragraphId);

  if (existing) {
    void ok(res, existing);
    return;
  }

  const analyzed = await paragraphService.analyzeParagraphWithAI(text);

  const paragraph = await paragraphService.saveParagraphAnalysis(storyId, paragraphId, text, analyzed);

  void ok(res, paragraph);
});
