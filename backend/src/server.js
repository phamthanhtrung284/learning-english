import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set; auth will fail.");
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Groq API key: ${process.env.GROQ_API_KEY ? "configured" : "missing"}`
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connect failed:", err?.message || err);
    process.exit(1);
  });
