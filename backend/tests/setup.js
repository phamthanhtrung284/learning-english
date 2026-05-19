import mongoose from "mongoose";

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
  process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || "test_groq_key";
  process.env.NODE_ENV = "test";

  // Use a real Mongo instance (local in dev, service container in CI)
  process.env.MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/learning_test";

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for tests");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 7000,
  });
}, 30000);

afterEach(async () => {
  // Clean test DB between tests
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
