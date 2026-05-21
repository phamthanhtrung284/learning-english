import mongoose from "mongoose";

const LibrarySeriesSchema = new mongoose.Schema(
  {
    displayTitle: { type: String, required: true, trim: true },
    author: { type: String, default: "", trim: true },
    tagline: { type: String, default: "", trim: true },
    accent: { type: String, default: "from-slate-500 via-slate-600 to-slate-700" },
    coverEmoji: { type: String, default: "📚" },
    coverImage: { type: String, default: "" }, // relative path: /uploads/covers/<filename>

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

LibrarySeriesSchema.index({ displayTitle: 1 }, { unique: true });

export default mongoose.model("LibrarySeries", LibrarySeriesSchema);

