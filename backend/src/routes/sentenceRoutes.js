import express from "express";
import { analyzeSentence, lookupWord, grammarBreakdown } from "../controllers/sentenceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze", protect, analyzeSentence);
router.post("/grammar", protect, grammarBreakdown);
router.post("/lookup-word", protect, lookupWord);

export default router;
