import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILibrarySeries extends Document {
  displayTitle: string;
  author: string;
  tagline: string;
  accent: string;
  coverEmoji: string;
  coverImage: string;
  coverPublicId: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LibrarySeriesSchema = new Schema<ILibrarySeries>(
  {
    displayTitle: { type: String, required: true, trim: true },
    author: { type: String, default: "", trim: true },
    tagline: { type: String, default: "", trim: true },
    accent: { type: String, default: "from-slate-500 via-slate-600 to-slate-700" },
    coverEmoji: { type: String, default: "📚" },
    coverImage: { type: String, default: "" },
    coverPublicId: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

LibrarySeriesSchema.index({ displayTitle: 1 }, { unique: true });

export default mongoose.model<ILibrarySeries>("LibrarySeries", LibrarySeriesSchema);
