import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import { routes as authRoutes, prefix as authPrefix } from "./modules/auth/index.js";
import { routes as libraryRoutes, prefix as libraryPrefix } from "./modules/library/index.js";
import { routes as speakingRoutes, prefix as speakingPrefix } from "./modules/speaking/index.js";
import { routes as vocabularyRoutes, prefix as vocabularyPrefix } from "./modules/vocabulary/index.js";
import { routes as sentenceRoutes, prefix as sentencePrefix } from "./modules/sentence/index.js";
import { routes as aiRoutes, prefix as aiPrefix } from "./modules/ai/index.js";
import { routes as storyRoutes, prefix as storyPrefix } from "./modules/story/index.js";
import { routes as paragraphRoutes, prefix as paragraphPrefix } from "./modules/paragraph/index.js";
import { routes as courseRoutes, prefix as coursePrefix } from "./modules/course/index.js";
import { routes as exerciseRoutes, prefix as exercisePrefix } from "./modules/exercise/index.js";
import { routes as progressRoutes, prefix as progressPrefix } from "./modules/progress/index.js";
import { routes as adaptiveRoutes, prefix as adaptivePrefix } from "./modules/adaptive/index.js";
import { notFound, errorHandler } from "./common/middleware/error.middleware.js";
import { aiLimiter, authLimiter } from "./common/middleware/rateLimit.middleware.js";

export const app = express();

const rawOrigins = process.env.FRONTEND_ORIGIN || "";
const allowlist = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Security headers
app.use(helmet());

app.use(
  cors({
    origin: allowlist.length
      ? (origin, cb) => {
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

// Routes — AI-related routes all get aiLimiter
app.use(storyPrefix, aiLimiter, storyRoutes);
app.use(sentencePrefix, aiLimiter, sentenceRoutes);
app.use(paragraphPrefix, aiLimiter, paragraphRoutes);
app.use(coursePrefix, courseRoutes);
app.use(exercisePrefix, exerciseRoutes);
app.use(progressPrefix, progressRoutes);
app.use(authPrefix, authLimiter, authRoutes);
app.use(adaptivePrefix, aiLimiter, adaptiveRoutes);
app.use(aiPrefix, aiLimiter, aiRoutes);
app.use(vocabularyPrefix, vocabularyRoutes);
app.use(libraryPrefix, libraryRoutes);
app.use(speakingPrefix, aiLimiter, speakingRoutes);

// Serve uploaded files as static
app.use("/uploads/covers", express.static(path.join(process.cwd(), "uploads", "covers")));
app.use("/uploads/avatars", express.static(path.join(process.cwd(), "uploads", "avatars")));

app.get("/", (_req, res) => {
  res.send("API running...");
});

app.use(notFound);
app.use(errorHandler);
