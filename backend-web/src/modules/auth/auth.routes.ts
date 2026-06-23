import { Router } from "express";
import { avatarUpload } from "../../common/utils/multerStorage.js";
import { protect, adminOnly } from "../../common/middleware/auth.middleware.js";
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  leaderboard,
  listUsersAdmin,
  updateUserAdmin,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/leaderboard", leaderboard);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post("/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);

router.get("/admin/users", protect, adminOnly, listUsersAdmin);
router.patch("/admin/users/:id", protect, adminOnly, updateUserAdmin);

export { router as authRoutes };
