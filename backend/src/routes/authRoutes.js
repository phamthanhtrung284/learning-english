import express from "express";

import {
  register,
  login,
  getMe,
  updateProfile,
  leaderboard,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/leaderboard", leaderboard);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);

export default router;
