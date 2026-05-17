import express from "express";

import {
  saveWord,
  getVocabulary
} from "../controllers/vocabularyController.js";

import {
  protect
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/save",
  protect,
  saveWord
);

router.get(
  "/list",
  protect,
  getVocabulary
);

export default router;