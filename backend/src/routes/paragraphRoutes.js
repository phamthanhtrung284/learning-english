import express from "express";

import {
  analyzeParagraphController,
} from "../controllers/paragraphController.js";

const router = express.Router();

router.post(
  "/analyze",
  analyzeParagraphController
);

export default router;