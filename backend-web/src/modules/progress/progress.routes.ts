import express from "express";
import { protect } from "../../common/middleware/auth.middleware.js";
import { saveWordResultHandler } from "./progress.controller.js";

const router = express.Router();

router.post("/word-result", protect, saveWordResultHandler);

export const progressRoutes = router;
