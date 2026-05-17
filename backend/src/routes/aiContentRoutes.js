import express from "express";

import {
  createLesson,
} from "../controllers/aiContentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================
// GENERATE AI LESSON
// =====================================

router.post(
  "/generate-lesson",
  protect,
  createLesson
);

export default router;