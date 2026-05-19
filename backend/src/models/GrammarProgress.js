import mongoose from "mongoose";

const grammarProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    grammarPoint: { type: String, required: true },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    masteryLevel: { type: Number, default: 0 },
  },
  { timestamps: true }
);

grammarProgressSchema.index({ userId: 1, grammarPoint: 1 }, { unique: true });

export default mongoose.model("GrammarProgress", grammarProgressSchema);
