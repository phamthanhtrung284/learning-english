import express from "express";
import { getChapterExercises } from "./exercise.controller.js";
import { protect } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.get("/c1/chapter/:id", protect, getChapterExercises);

export const exerciseRoutes = router;
