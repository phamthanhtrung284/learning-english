import { Response } from "express";
import { AuthenticatedRequest } from "../../common/types/api.types.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok, fail, notFound } from "../../common/utils/httpResponse.js";
import * as storyService from "./story.service.js";

export const listStories = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const stories = await storyService.listStories();
  void ok(res, stories);
});

export const getStory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { level, id } = req.params;

  if (!level || !id) {
    void fail(res, "Level and story ID are required");
    return;
  }

  try {
    const story = await storyService.getStory(level, id);
    void ok(res, story);
  } catch (error) {
    void notFound(res, "Cannot load story");
  }
});
