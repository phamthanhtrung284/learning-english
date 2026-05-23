import mongoose from "mongoose";

const turnSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, default: "" },
  feedback: { type: mongoose.Schema.Types.Mixed, default: null },
}, { _id: false });

const speakingSessionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic:       { type: String, required: true },
  topicLabel:  { type: String, default: "" },
  turns:       { type: [turnSchema], default: [] },
  turnCount:   { type: Number, default: 0 },
}, { timestamps: true });

// Max 3 sessions per user — enforced in controller
speakingSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("SpeakingSession", speakingSessionSchema);
