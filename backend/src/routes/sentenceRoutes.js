import express from "express";
import { analyzeSentence, lookupWord, grammarBreakdown, checkTranslation, getDictionaryForPassage, getGeneratedPassage } from "../controllers/sentenceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { dailyLimit } from "../middleware/dailyLimitMiddleware.js";

const router = express.Router();

router.post("/analyze",          protect, dailyLimit, analyzeSentence);
router.post("/grammar",          protect, dailyLimit, grammarBreakdown);
router.post("/lookup-word",      protect, dailyLimit, lookupWord);
router.post("/translate-check",  protect, dailyLimit, checkTranslation);
router.post("/dictionary",       protect, dailyLimit, getDictionaryForPassage);
router.post("/generate-passage", protect, dailyLimit, getGeneratedPassage);

export default router;
