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

    next();

  } catch (error) {

    res.status(401).json({
      error:
        "Token invalid"
    });
  }
};