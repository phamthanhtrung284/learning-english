import express from "express";
import { startSpeaking, continueSpeaking, getSessions, deleteSession } from "../controllers/speakingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { dailyLimit } from "../middleware/dailyLimitMiddleware.js";

const router = express.Router();

router.post("/start",         protect, dailyLimit, startSpeaking);
router.post("/continue",      protect, dailyLimit, continueSpeaking);
router.get("/sessions",       protect, getSessions);
router.delete("/sessions/:id", protect, deleteSession);

export default router;
