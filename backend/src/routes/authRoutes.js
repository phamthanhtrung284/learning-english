import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  leaderboard,
  listUsersAdmin,
  updateUserAdmin,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Avatar upload — memory storage (goes straight to Cloudinary)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files allowed"), ok);
  },
});

router.post("/register", register);
router.post("/login", login);
router.get("/leaderboard", leaderboard);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post("/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);

// Admin user management
router.get("/admin/users", protect, adminOnly, listUsersAdmin);
router.patch("/admin/users/:id", protect, adminOnly, updateUserAdmin);

export default router;
