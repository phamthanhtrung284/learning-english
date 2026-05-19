import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(uri, {
    // fail fast if Mongo is down / URI is wrong (better DX)
    serverSelectionTimeoutMS: 7000,
  });
  console.log("MongoDB connected");
};
