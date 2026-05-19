import express from "express";

import {
  saveWord,
  getVocabulary,
  deleteWord
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

router.delete(
  "/:id",
  protect,
  deleteWord
);

export default router;
