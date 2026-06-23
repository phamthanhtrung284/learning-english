import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGrammarProgress extends Document {
  userId: Types.ObjectId;
  grammarPoint: string;
  correctCount: number;
  wrongCount: number;
  masteryLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const grammarProgressSchema = new Schema<IGrammarProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    grammarPoint: { type: String, required: true },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    masteryLevel: { type: Number, default: 0 },
  },
  { timestamps: true }
);

grammarProgressSchema.index({ userId: 1, grammarPoint: 1 }, { unique: true });

export default mongoose.model<IGrammarProgress>("GrammarProgress", grammarProgressSchema);
