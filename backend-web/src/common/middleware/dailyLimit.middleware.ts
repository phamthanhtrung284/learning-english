import { Response, NextFunction } from "express";
import User from "../../models/User.js";
import { AuthenticatedRequest } from "../types/api.types.js";

const FREE_DAILY_LIMIT = 20;

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export const dailyLimit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next();

    const user = await User.findById(req.user.id).select("isAdmin isPremium dailyUsage");
    if (!user) return next();

    if (user.isAdmin || user.isPremium) return next();

    const today = todayUTC();

    // Atomic increment: only increment if the date matches today.
    // For a new day, reset count to 1 atomically.
    // We use findOneAndUpdate with a conditional to enforce the limit atomically.
    const isToday = user.dailyUsage?.date === today;
    const currentCount = isToday ? (user.dailyUsage?.count ?? 0) : 0;

    if (currentCount >= FREE_DAILY_LIMIT) {
      return res.status(429).json({
        error: `Daily limit reached. Free accounts get ${FREE_DAILY_LIMIT} AI requests per day. Upgrade to Premium for unlimited access.`,
        code: "DAILY_LIMIT_REACHED",
        limit: FREE_DAILY_LIMIT,
        used: currentCount,
        resetsAt: "midnight UTC",
      });
    }

    // Atomically increment. If the date rolled over, reset count to 1 instead of incrementing.
    if (isToday) {
      // Conditional update: only increment if count is still under the limit
      const updated = await User.findOneAndUpdate(
        {
          _id: user._id,
          "dailyUsage.date": today,
          "dailyUsage.count": { $lt: FREE_DAILY_LIMIT },
        },
        { $inc: { "dailyUsage.count": 1 } }
      );

      // If nothing was updated, another concurrent request pushed it over the limit
      if (!updated) {
        return res.status(429).json({
          error: `Daily limit reached. Free accounts get ${FREE_DAILY_LIMIT} AI requests per day. Upgrade to Premium for unlimited access.`,
          code: "DAILY_LIMIT_REACHED",
          limit: FREE_DAILY_LIMIT,
          used: FREE_DAILY_LIMIT,
          resetsAt: "midnight UTC",
        });
      }
    } else {
      // New day — reset counter atomically
      await User.findByIdAndUpdate(user._id, {
        "dailyUsage.count": 1,
        "dailyUsage.date": today,
      });
    }

    next();
  } catch (err: any) {
    console.error("dailyLimit middleware error:", err?.message);
    // Fail closed: if we can't check the limit, block the request
    return res.status(503).json({ error: "Service temporarily unavailable. Please try again." });
  }
};
