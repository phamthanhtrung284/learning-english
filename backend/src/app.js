import express from "express";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";

import storyRoutes from "./routes/storyRoutes.js";
import sentenceRoutes from "./routes/sentenceRoutes.js";
import paragraphRoutes from "./routes/paragraphRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adaptiveRoutes from "./routes/adaptiveRoutes.js";
import aiContentRoutes from "./routes/aiContentRoutes.js";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import speakingRoutes from "./routes/speakingRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

export const app = express();

// CORS: set FRONTEND_ORIGIN="http://localhost:5173" (or comma-separated list) in production
const rawOrigins = process.env.FRONTEND_ORIGIN || "";
const allowlist = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowlist.length
      ? (origin, cb) => {
          // allow tools like curl / server-to-server calls (no origin)
          if (!origin) return cb(null, true);
          if (allowlist.includes(origin)) return cb(null, true);
          return cb(new Error("Not allowed by CORS"));
        }
      : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Rate limiters ──────────────────────────────────────────────────────────────

// AI routes (Groq calls): 30 requests / 1 minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests — please wait a moment and try again." },
});

// Auth routes: 20 requests / 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts — please try again later." },
});

app.use("/api/stories", storyRoutes);
app.use("/api/sentences", aiLimiter, sentenceRoutes);
app.use("/api/paragraphs", paragraphRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/adaptive", adaptiveRoutes);
app.use("/api/ai", aiLimiter, aiContentRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/speaking", speakingRoutes);

// Serve uploaded cover images as static files
app.use("/uploads/covers", express.static(path.join(process.cwd(), "uploads", "covers")));

app.get("/", (req, res) => {
  res.send("API running...");
});

// error handlers (must be after routes)
app.use(notFound);
app.use(errorHandler);
