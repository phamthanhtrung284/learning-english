import bcrypt
  from "bcryptjs";

import jwt
  from "jsonwebtoken";

import User
  from "../models/User.js";


const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  level: user.level,
  xp: user.xp ?? 0,
  streak: user.streak ?? 0,
  isAdmin: Boolean(user.isAdmin),
});

// REGISTER
export const register =
  async (req, res) => {

  try {

    const {
      username,
      email,
      password
    } = req.body;

    // check existing
    const existingUser =
      await User.findOne({
        email
      });

    if (existingUser) {

      return res.status(400).json({
        error:
          "Email already exists"
      });
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // create user
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const desiredEmail = String(email || "").trim().toLowerCase();
    const isFirstUser = (await User.countDocuments()) === 0;

    const user =
      await User.create({
        username,
        email: desiredEmail,
        password: hashedPassword,
        isAdmin: Boolean((adminEmail && desiredEmail === adminEmail) || isFirstUser),
      });

    // create token
    const token =
      jwt.sign(

        {
          id: user._id
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "30d"
        }
      );

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// LOGIN
export const login =
  async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // find user
    const user =
      await User.findOne({
        email
      });

    if (!user) {

      return res.status(400).json({
        error:
          "Invalid credentials"
      });
    }

    // compare password
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        error:
          "Invalid credentials"
      });
    }

    // create token
    const token =
      jwt.sign(

        {
          id: user._id
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "30d"
        }
      );

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username !== undefined) {
      const u = String(username).trim();
      if (u.length < 2) {
        return res.status(400).json({ error: "Username must be at least 2 characters" });
      }
      user.username = u;
    }

    if (email !== undefined) {
      const e = String(email).trim().toLowerCase();
      if (e !== user.email) {
        const taken = await User.findOne({ email: e });
        if (taken) {
          return res.status(400).json({ error: "Email already in use" });
        }
        user.email = e;
      }
    }

    if (newPassword) {
      const np = String(newPassword);
      if (np.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new password" });
      }
      const ok = await bcrypt.compare(String(currentPassword), user.password);
      if (!ok) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(np, 10);
    }

    await user.save();
    const fresh = await User.findById(user._id).select("-password");
    res.json({ user: publicUser(fresh) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const leaderboard = async (req, res) => {
  try {
    const raw = parseInt(String(req.query.limit || "15"), 10);
    const limit = Math.min(Math.max(Number.isFinite(raw) ? raw : 15, 5), 50);
    const rows = await User.find()
      .select("username xp level streak")
      .sort({ xp: -1, username: 1 })
      .limit(limit)
      .lean();
    res.json(
      rows.map((u, i) => ({
        rank: i + 1,
        id: u._id,
        username: u.username,
        xp: u.xp ?? 0,
        level: u.level,
        streak: u.streak ?? 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
