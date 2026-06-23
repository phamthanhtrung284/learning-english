import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import User from "../../models/User.js";
import { AuthenticatedRequest } from "../types/api.types.js";

interface JwtPayload {
  id: string;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("protect middleware: JWT_SECRET is not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { id: user._id.toString(), isAdmin: Boolean((user as any).isAdmin) };
    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalid" });
  }
};

export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ error: "Admin only" });
};
