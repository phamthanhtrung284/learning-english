import express from "express";
import { protect } from "../../common/middleware/auth.middleware.js";
import { dailyLimit } from "../../common/middleware/dailyLimit.middleware.js";
import { createLesson } from "./ai.controller.js";

const router = express.Router();

router.post("/generate-lesson", protect, dailyLimit, createLesson);

export const aiRoutes = router;
