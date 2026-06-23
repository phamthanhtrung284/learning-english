import { Request, Response } from "express";
import { ok, fail, notFound } from "../../common/utils/httpResponse.js";
import * as authService from "./auth.service.js";
import { AuthenticatedRequest } from "../../common/types/api.types.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../cloudinary/cloudinary.service.js";
import User from "../../models/User.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser(username, email, password);
    ok(res, result);
  } catch (error: any) {
    fail(res, error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    ok(res, result);
  } catch (error: any) {
    fail(res, error.message);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await authService.getUserProfile(req.user!.id);
    ok(res, user);
  } catch (error: any) {
    fail(res, error.message);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await authService.updateUserProfile(req.user!.id, {
      username,
      email,
      currentPassword,
      newPassword,
    });
    ok(res, { user });
  } catch (error: any) {
    fail(res, error.message);
  }
};

export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) return fail(res, "No file uploaded");
    const user = await User.findById(req.user!.id);
    if (!user) return notFound(res, "User not found");

    if (user.avatarPublicId) await deleteFromCloudinary(user.avatarPublicId);

    const { url, public_id } = await uploadToCloudinary(req.file.buffer, {
      folder: "english-studio/avatars",
      public_id: `avatar-${req.user!.id}`,
      overwrite: true,
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
    });

    user.avatar = url;
    user.avatarPublicId = public_id;
    await user.save();
    const fresh = await User.findById(user._id).select("-password");
    ok(res, { user: authService.toPublicUser(fresh!) });
  } catch (error: any) {
    fail(res, error.message, 500);
  }
};

export const leaderboard = async (req: Request, res: Response) => {
  try {
    const raw = parseInt(String(req.query.limit || "15"), 10);
    const result = await authService.getLeaderboard(raw);
    ok(res, result);
  } catch (error: any) {
    fail(res, error.message, 500);
  }
};

export const listUsersAdmin = async (req: Request, res: Response) => {
  try {
    const page = Math.max(0, parseInt(String(req.query.page || "0"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const search = String(req.query.search || "").trim();
    const result = await authService.listUsersAdmin(page, limit, search);
    ok(res, result);
  } catch (error: any) {
    fail(res, error.message, 500);
  }
};

export const updateUserAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isPremium, isAdmin } = req.body;
    const user = await authService.updateUserByAdmin(id, { isPremium, isAdmin });
    ok(res, { user });
  } catch (error: any) {
    fail(res, error.message);
  }
};
