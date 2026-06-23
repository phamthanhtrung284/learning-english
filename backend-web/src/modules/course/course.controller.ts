import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok } from "../../common/utils/httpResponse.js";
import { getC1Course } from "./course.service.js";

export const getCourse = asyncHandler(async (_req: Request, res: Response) => {
  const course = getC1Course();
  ok(res, course);
});
