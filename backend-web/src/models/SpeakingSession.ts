import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITurn {
  question: string;
  answer: string;
  feedback: unknown;
}

export interface ISpeakingSession extends Document {
  userId: Types.ObjectId;
  topic: string;
  topicLabel: string;
  turns: ITurn[];
  turnCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const turnSchema = new Schema<ITurn>(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    feedback: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const speakingSessionSchema = new Schema<ISpeakingSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    topicLabel: { type: String, default: "" },
    turns: { type: [turnSchema], default: [] },
    turnCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

speakingSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ISpeakingSession>("SpeakingSession", speakingSessionSchema);
