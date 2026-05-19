import mongoose from "mongoose";

const SourceSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    url: { type: String, default: "" },
    license: { type: String, default: "" },
  },
  { _id: false }
);

const ParagraphSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
  },
  { _id: false }
);

const PdfSchema = new mongoose.Schema(
  {
    originalName: { type: String, default: "" },
    storedName: { type: String, default: "" },
    path: { type: String, default: "" },
    size: { type: Number, default: 0 },
    pages: { type: Number, default: 0 },
  },
  { _id: false }
);

const LibraryChapterSchema = new mongoose.Schema(
  {
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "LibrarySeries", required: true },
    label: { type: String, required: true, trim: true },

    slug: { type: String, required: true, unique: true, trim: true },

    chapterTitle: { type: String, required: true, trim: true },
    authorLine: { type: String, default: "", trim: true },
    blurb: { type: String, default: "", trim: true },

    source: { type: SourceSchema, default: null },

    paragraphs: { type: [ParagraphSchema], default: [] },

    // Key: lemma lowercase, value: {meaning, ipa, pos, explanation, ...}
    glossary: { type: mongoose.Schema.Types.Mixed, default: {} },

    pdf: { type: PdfSchema, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

LibraryChapterSchema.index({ seriesId: 1, createdAt: -1 });

export default mongoose.model("LibraryChapter", LibraryChapterSchema);

