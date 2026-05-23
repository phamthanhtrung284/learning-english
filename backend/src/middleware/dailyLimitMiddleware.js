/**
 * Daily AI usage limiter.
 * Free users: 20 AI requests/day.
 * Premium / Admin: unlimited.
 */

const FREE_DAILY_LIMIT = 20;

function todayUTC() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export const dailyLimit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return next(); // protect middleware already handles 401

    // Admin and premium users are unlimited
    if (user.isAdmin || user.isPremium) return next();

    const today = todayUTC();
    const usage = user.dailyUsage || { count: 0, date: "" };

    // Reset counter if it's a new day
    const currentCount = usage.date === today ? (usage.count || 0) : 0;

    if (currentCount >= FREE_DAILY_LIMIT) {
      return res.status(429).json({
        error: `Daily limit reached. Free accounts get ${FREE_DAILY_LIMIT} AI requests per day. Upgrade to Premium for unlimited access.`,
        code: "DAILY_LIMIT_REACHED",
        limit: FREE_DAILY_LIMIT,
        used: currentCount,
        resetsAt: "midnight UTC",
      });
    }

    // Increment usage
    await user.constructor.findByIdAndUpdate(user._id, {
      "dailyUsage.count": currentCount + 1,
      "dailyUsage.date": today,
    });

    next();
  } catch (err) {
    // Don't block the request if tracking fails
    console.error("dailyLimit middleware error:", err?.message);
    next();
  }
};
