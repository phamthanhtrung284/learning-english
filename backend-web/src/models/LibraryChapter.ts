import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISource {
  name: string;
  url: string;
  license: string;
}

export interface IParagraph {
  en: string;
}

export interface IPdf {
  originalName: string;
  storedName: string;
  path: string;
  size: number;
  pages: number;
}

export interface ILibraryChapter extends Document {
  seriesId: Types.ObjectId;
  label: string;
  slug: string;
  chapterTitle: string;
  authorLine: string;
  blurb: string;
  source: ISource | null;
  paragraphs: IParagraph[];
  glossary: Record<string, unknown>;
  pdf: IPdf | null;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    name: { type: String, default: "" },
    url: { type: String, default: "" },
    license: { type: String, default: "" },
  },
  { _id: false }
);

const ParagraphSchema = new Schema<IParagraph>(
  {
    en: { type: String, default: "" },
  },
  { _id: false }
);

const PdfSchema = new Schema<IPdf>(
  {
    originalName: { type: String, default: "" },
    storedName: { type: String, default: "" },
    path: { type: String, default: "" },
    size: { type: Number, default: 0 },
    pages: { type: Number, default: 0 },
  },
  { _id: false }
);

const LibraryChapterSchema = new Schema<ILibraryChapter>(
  {
    seriesId: { type: Schema.Types.ObjectId, ref: "LibrarySeries", required: true },
    label: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    chapterTitle: { type: String, required: true, trim: true },
    authorLine: { type: String, default: "", trim: true },
    blurb: { type: String, default: "", trim: true },
    source: { type: SourceSchema, default: null },
    paragraphs: { type: [ParagraphSchema], default: [] },
    glossary: { type: Schema.Types.Mixed, default: {} },
    pdf: { type: PdfSchema, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

LibraryChapterSchema.index({ seriesId: 1, createdAt: -1 });

export default mongoose.model<ILibraryChapter>("LibraryChapter", LibraryChapterSchema);
