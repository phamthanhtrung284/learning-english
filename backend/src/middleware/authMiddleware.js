import jwt
  from "jsonwebtoken";

import User
  from "../models/User.js";

export const protect =
  async (req, res, next) => {

  try {

    let token;

    // Authorization: Bearer TOKEN
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        "Bearer"
      )
    ) {

      token =
        req.headers.authorization.split(
          " "
        )[1];
    }

    if (!token) {

      return res.status(401).json({
        error:
          "Not authorized"
      });
    }

    // verify token
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // get user
    req.user =
      await User.findById(
        decoded.id
      ).select("-password");

    // Token hợp lệ nhưng user không còn tồn tại (ví dụ: user bị xoá)
    if (!req.user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    next();

  } catch (error) {

    res.status(401).json({
      error:
        "Token invalid"
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ error: "Admin only" });
};
