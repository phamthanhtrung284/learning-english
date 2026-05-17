import express from "express";

import { getStory } from "../controllers/storyController.js";

const router = express.Router();

router.get("/:level/:id", getStory);

export default router;