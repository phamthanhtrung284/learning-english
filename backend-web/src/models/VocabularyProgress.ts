import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVocabularyProgress extends Document {
  userId: Types.ObjectId;
  word: string;
  meaning: string;
  correctCount: number;
  wrongCount: number;
  masteryLevel: number;
  nextReviewDate: Date;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vocabularyProgressSchema = new Schema<IVocabularyProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

export default mongoose.model<IVocabularyProgress>("VocabularyProgress", vocabularyProgressSchema);
