import express from "express";
import { startSpeaking, continueSpeaking } from "../controllers/speakingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { dailyLimit } from "../middleware/dailyLimitMiddleware.js";

const router = express.Router();

router.post("/start",    protect, dailyLimit, startSpeaking);
router.post("/continue", protect, dailyLimit, continueSpeaking);

export default router;
