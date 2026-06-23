import { Router } from "express";
import { startSession, continueSession, listSessions, getSession, deleteSession } from "./speaking.controller.js";
import { protect } from "../../common/middleware/auth.middleware.js";
import { dailyLimit } from "../../common/middleware/dailyLimit.middleware.js";

const router = Router();

// Both /start and /continue call the AI — both count against the daily quota
router.post("/start", protect, dailyLimit, startSession);
router.post("/continue", protect, dailyLimit, continueSession);
router.get("/sessions", protect, listSessions);
router.get("/:id", protect, getSession);
router.delete("/sessions/:id", protect, deleteSession);

export default router;