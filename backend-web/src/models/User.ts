import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  level: string;
  xp: number;
  streak: number;
  password: string;
  isAdmin: boolean;
  isPremium: boolean;
  avatar: string;
  avatarPublicId: string;
  dailyUsage: { count: number; date: string };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    level: { type: String, default: "C1" },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    dailyUsage: {
      count: { type: Number, default: 0 },
      date: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
