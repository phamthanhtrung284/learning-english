import express from "express";
import { getCourse } from "./course.controller.js";
import { protect } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.get("/c1", protect, getCourse);

export const courseRoutes = router;
