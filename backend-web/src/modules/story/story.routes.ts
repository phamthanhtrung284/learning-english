import express from "express";
import { listStories, getStory } from "./story.controller.js";
import { protect } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, listStories);
router.get("/:level/:id", protect, getStory);

export const storyRoutes = router;
