import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

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

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/stories", storyRoutes);
app.use("/api/sentences", sentenceRoutes);
app.use("/api/paragraphs", paragraphRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/adaptive", adaptiveRoutes);
app.use("/api/ai", aiContentRoutes);
app.use("/api/vocabulary", vocabularyRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set; auth will fail.");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Groq API key: ${process.env.GROQ_API_KEY ? "configured" : "missing"}`
  );
});
