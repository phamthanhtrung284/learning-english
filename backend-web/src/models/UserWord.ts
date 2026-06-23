import mongoose, { Document, Schema, Types } from "mongoose";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface IUserWord extends Document {
  userId: Types.ObjectId;
  word: string;
  meaning?: string;
  explanation?: string;
  ipa?: string;
  type?: string;
  tags: string[];
  level: Level;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userWordSchema = new Schema<IUserWord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    word: { type: String, required: true },
    meaning: { type: String },
    explanation: { type: String },
    ipa: { type: String },
    type: { type: String },
    tags: [{ type: String }],
    level: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"], default: "C1" },
    interval: { type: Number, default: 0 },
    repetition: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    nextReviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userWordSchema.index({ userId: 1, word: 1 }, { unique: true });

export default mongoose.model<IUserWord>("UserWord", userWordSchema);
