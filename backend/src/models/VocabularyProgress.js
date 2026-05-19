import mongoose from "mongoose";

const vocabularyProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    word: { type: String, required: true },
    meaning: { type: String, default: "" },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    masteryLevel: { type: Number, default: 0 },
    nextReviewDate: { type: Date, default: Date.now },
    lastReviewedAt: { type: Date },
  },
  { timestamps: true }
);

vocabularyProgressSchema.index({ userId: 1, word: 1 }, { unique: true });

export default mongoose.model("VocabularyProgress", vocabularyProgressSchema);
