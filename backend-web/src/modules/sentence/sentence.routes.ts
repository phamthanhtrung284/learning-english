import { Router } from "express";
import { translateCheck, lookupWord, grammarBreakdown, generatePassageRoute, analyzeSentenceRoute } from "./sentence.controller.js";
import { protect } from "../../common/middleware/auth.middleware.js";
import { dailyLimit } from "../../common/middleware/dailyLimit.middleware.js";

const router = Router();

router.post("/analyze", protect, dailyLimit, analyzeSentenceRoute);
router.post("/translate-check", protect, dailyLimit, translateCheck);
router.post("/lookup-word", protect, dailyLimit, lookupWord);
router.post("/grammar", protect, dailyLimit, grammarBreakdown);
router.post("/generate-passage", protect, dailyLimit, generatePassageRoute);

export default router;