import { Response } from "express";
import { AuthenticatedRequest } from "../../common/types/api.types.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok } from "../../common/utils/httpResponse.js";
import { generateAdaptivePlan } from "./adaptive.service.js";

export const getPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const plan = await generateAdaptivePlan(userId);
  ok(res, plan);
});
