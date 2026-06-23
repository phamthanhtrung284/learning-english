import express from "express";
import { protect } from "../../common/middleware/auth.middleware.js";
import { dailyLimit } from "../../common/middleware/dailyLimit.middleware.js";
import { analyzeParagraphController } from "./paragraph.controller.js";

const router = express.Router();

router.post("/analyze", protect, dailyLimit, analyzeParagraphController);

export const paragraphRoutes = router;
