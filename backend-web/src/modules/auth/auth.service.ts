import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../../models/User.js";
import { PublicUser } from "../../common/types/user.types.js";

const todayUTC = () => new Date().toISOString().slice(0, 10);

const FREE_LIMIT = 20;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export const toPublicUser = (user: IUser): PublicUser => {
  const today = todayUTC();
  const usage = user.dailyUsage || { count: 0, date: "" };
  const usedToday = usage.date === today ? (usage.count || 0) : 0;
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    level: user.level,
    xp: user.xp ?? 0,
    streak: user.streak ?? 0,
    isAdmin: Boolean(user.isAdmin),
    isPremium: Boolean(user.isPremium),
    avatar: user.avatar || "",
    dailyUsage: {
      used: usedToday,
      limit: user.isAdmin || user.isPremium ? null : FREE_LIMIT,
      remaining: user.isAdmin || user.isPremium ? null : Math.max(0, FREE_LIMIT - usedToday),
    },
  };
};

interface TokenResponse {
  token: string;
  user: PublicUser;
}

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<TokenResponse> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const desiredEmail = String(email || "").trim().toLowerCase();

  // Determine isAdmin: explicit ADMIN_EMAIL match takes priority.
  const shouldBeAdmin = Boolean(adminEmail && desiredEmail === adminEmail);

  const user = await User.create({
    username,
    email: desiredEmail,
    password: hashedPassword,
    isAdmin: shouldBeAdmin,
  });

  // If ADMIN_EMAIL is not configured, promote the very first user atomically.
  // We compare _id to the oldest document instead of using countDocuments() to
  // avoid the race condition where two concurrent registrations both see count === 0.
  if (!shouldBeAdmin && !adminEmail) {
    const oldest = await User.findOne().sort({ createdAt: 1 }).select("_id").lean();
    if (oldest && String(oldest._id) === String(user._id)) {
      await User.findByIdAndUpdate(user._id, { isAdmin: true });
      user.isAdmin = true;
    }
  }

  const token = jwt.sign(
    { id: String(user._id) },
    getJwtSecret(),
    { expiresIn: "30d" }
  );

  return { token, user: toPublicUser(user) };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<TokenResponse> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: String(user._id) },
    getJwtSecret(),
    { expiresIn: "30d" }
  );

  return { token, user: toPublicUser(user) };
};

export const getUserProfile = async (userId: string): Promise<PublicUser> => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return toPublicUser(user);
};

export const updateUserProfile = async (
  userId: string,
  updates: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<PublicUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (updates.username !== undefined) {
    const u = String(updates.username).trim();
    if (u.length < 2) {
      throw new Error("Username must be at least 2 characters");
    }
    user.username = u;
  }

  if (updates.email !== undefined) {
    const e = String(updates.email).trim().toLowerCase();
    if (e !== user.email) {
      const taken = await User.findOne({ email: e });
      if (taken) {
        throw new Error("Email already in use");
      }
      user.email = e;
    }
  }

  if (updates.newPassword) {
    const np = String(updates.newPassword);
    if (np.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }
    if (!updates.currentPassword) {
      throw new Error("Current password is required to set a new password");
    }
    const ok = await bcrypt.compare(String(updates.currentPassword), user.password);
    if (!ok) {
      throw new Error("Current password is incorrect");
    }
    user.password = await bcrypt.hash(np, 10);
  }

  await user.save();
  const fresh = await User.findById(user._id).select("-password");
  if (!fresh) {
    throw new Error("User not found");
  }
  return toPublicUser(fresh);
};

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  xp: number;
  level: string;
  streak: number;
}

export const getLeaderboard = async (rawLimit: number): Promise<LeaderboardEntry[]> => {
  const raw = Number.isFinite(rawLimit) ? rawLimit : 15;
  const limit = Math.min(Math.max(raw, 5), 50);
  const rows = await User.find()
    .select("username xp level streak")
    .sort({ xp: -1, username: 1 })
    .limit(limit)
    .lean();

  return rows.map((u: any, i: number) => ({
    rank: i + 1,
    id: String(u._id),
    username: u.username,
    xp: u.xp ?? 0,
    level: u.level,
    streak: u.streak ?? 0,
  }));
};

interface ListUsersResult {
  users: PublicUser[];
  total: number;
  page: number;
  pages: number;
}

export const listUsersAdmin = async (
  page: number,
  limit: number,
  search: string
): Promise<ListUsersResult> => {
  // Escape special regex characters to prevent regex injection from user input
  const escapedSearch = search
    ? search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    : "";

  const filter = escapedSearch
    ? {
        $or: [
          { username: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u: any) => toPublicUser(u)),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

export const updateUserByAdmin = async (
  userId: string,
  updates: { isPremium?: boolean; isAdmin?: boolean }
): Promise<PublicUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (updates.isPremium !== undefined) user.isPremium = Boolean(updates.isPremium);
  if (updates.isAdmin !== undefined) user.isAdmin = Boolean(updates.isAdmin);

  await user.save();
  const fresh = await User.findById(userId).select("-password");
  if (!fresh) {
    throw new Error("User not found");
  }
  return toPublicUser(fresh);
};
