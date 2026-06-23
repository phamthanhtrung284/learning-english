import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStoryProgress extends Document {
  userId: Types.ObjectId;
  storyId: string;
  completedSentences: number[];
  isCompleted: boolean;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storyProgressSchema = new Schema<IStoryProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    storyId: { type: String, required: true },
    completedSentences: [{ type: Number }],
    isCompleted: { type: Boolean, default: false },
    lastReadAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

storyProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export default mongoose.model<IStoryProgress>("StoryProgress", storyProgressSchema);
