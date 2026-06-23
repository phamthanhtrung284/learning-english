import mongoose from "mongoose";
import { loadEnv } from "./env.js";

export async function connectDB(): Promise<void> {
  const { MONGO_URI } = loadEnv();
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 7000 });
  console.log("MongoDB connected");
}
