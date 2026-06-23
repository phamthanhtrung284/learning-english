import crypto from "crypto";
import path from "path";
import fs from "fs";
import LibrarySeries from "../../models/LibrarySeries.js";
import LibraryChapter from "../../models/LibraryChapter.js";
import { parsePdf } from "./pdfParser.service.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../cloudinary/cloudinary.service.js";

function slugify(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function splitTextToParagraphs(rawText: string) {
  return String(rawText || "")
    .replace(/\r/g, "")
    .split(/\n\s*\n/g)
    .map((x) => x.trim().replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .map((en) => ({ en }));
}

async function findOrCreateSeries(payload: {
  displayTitle: string;
  author?: string;
  tagline?: string;
  accent?: string;
  coverEmoji?: string;
}, userId?: string) {
  const displayTitle = String(payload.displayTitle || "").trim();
  if (!displayTitle) throw new Error("Series title is required");

  const update: Record<string, string | undefined> = {
    author: String(payload.author || "").trim(),
    tagline: String(payload.tagline || "").trim(),
    accent: String(payload.accent || "").trim() || undefined,
    coverEmoji: String(payload.coverEmoji || "").trim() || undefined,
  };
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const series = await LibrarySeries.findOneAndUpdate(
    { displayTitle },
    { $setOnInsert: { displayTitle, createdBy: userId }, $set: update },
    { new: true, upsert: true }
  );
  return series;
}

export async function listSeries() {
  const series = await LibrarySeries.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
  const seriesIds = series.map((s) => s._id);
  const chapters = await LibraryChapter.find({ seriesId: { $in: seriesIds } })
    .select("seriesId label chapterTitle")
    .sort({ createdAt: -1 })
    .lean();

  const bySeries = new Map<string, { id: string; label: string; chapterTitle: string }[]>();
  chapters.forEach((ch) => {
    const key = String(ch.seriesId);
    const arr = bySeries.get(key) || [];
    arr.push({
      id: ch._id.toString(),
      label: ch.label,
      chapterTitle: ch.chapterTitle,
    });
    bySeries.set(key, arr);
  });

  return series.map((s) => ({
    id: s._id,
    displayTitle: s.displayTitle,
    author: s.author || "",
    tagline: s.tagline || "",
    accent: s.accent || "from-slate-500 via-slate-600 to-slate-700",
    coverEmoji: s.coverEmoji || "📚",
    coverImage: s.coverImage || "",
    chapters: bySeries.get(String(s._id)) || [],
  }));
}

export async function listSeriesAdmin() {
  const series = await LibrarySeries.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
  const seriesIds = series.map((s) => s._id);
  const chapters = await LibraryChapter.find({ seriesId: { $in: seriesIds } })
    .sort({ createdAt: -1 })
    .lean();

  const bySeries = new Map<string, {
    id: string;
    label: string;
    slug: string;
    chapterTitle: string;
    authorLine: string;
    blurb: string;
    paragraphCount: number;
    pdf: object | null;
    createdAt: Date;
    updatedAt: Date;
  }[]>();
  chapters.forEach((ch) => {
    const key = String(ch.seriesId);
    const arr = bySeries.get(key) || [];
    arr.push({
      id: ch._id.toString(),
      label: ch.label,
      slug: ch.slug,
      chapterTitle: ch.chapterTitle,
      authorLine: ch.authorLine || "",
      blurb: ch.blurb || "",
      paragraphCount: Array.isArray(ch.paragraphs) ? ch.paragraphs.length : 0,
      pdf: ch.pdf || null,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    });
    bySeries.set(key, arr);
  });

  return series.map((s) => ({
    id: s._id,
    displayTitle: s.displayTitle,
    author: s.author || "",
    tagline: s.tagline || "",
    accent: s.accent || "from-slate-500 via-slate-600 to-slate-700",
    coverEmoji: s.coverEmoji || "📚",
    coverImage: s.coverImage || "",
    chapters: bySeries.get(String(s._id)) || [],
  }));
}

export async function getChapterById(chapterId: string) {
  const chapter = await LibraryChapter.findById(chapterId).lean();
  if (!chapter) return null;

  const series = await LibrarySeries.findById(chapter.seriesId).lean();
  if (!series) return null;

  return {
    slug: chapter.slug,
    readerTitle: series.displayTitle,
    chapterTitle: chapter.chapterTitle,
    authorLine: chapter.authorLine || series.author || "",
    blurb: chapter.blurb || series.tagline || "",
    source: chapter.source || null,
    paragraphs: Array.isArray(chapter.paragraphs) ? chapter.paragraphs : [],
    glossary: chapter.glossary || {},
  };
}

export async function importPdfChapter(data: {
  file: { path: string; originalname: string; size: number; buffer: Buffer };
  seriesTitle: string;
  chapterTitle: string;
  chapterLabel?: string;
  seriesAuthor?: string;
  seriesTagline?: string;
  seriesAccent?: string;
  seriesEmoji?: string;
  authorLine?: string;
  blurb?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceLicense?: string;
  userId?: string;
}) {
  const seriesTitle = String(data.seriesTitle || "").trim();
  const chapterTitle = String(data.chapterTitle || "").trim();
  const label = String(data.chapterLabel || "").trim() || chapterTitle || "Chapter";
  if (!seriesTitle) throw new Error("seriesTitle is required");
  if (!chapterTitle) throw new Error("chapterTitle is required");

  const series = await findOrCreateSeries(
    {
      displayTitle: seriesTitle,
      author: data.seriesAuthor,
      tagline: data.seriesTagline,
      accent: data.seriesAccent,
      coverEmoji: data.seriesEmoji,
    },
    data.userId
  );

  const buf = fs.readFileSync(data.file.path);
  const { paragraphs, pages } = await parsePdf(buf);
  const slugBase = `${slugify(series.displayTitle)}-${slugify(label) || slugify(chapterTitle)}`;
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;

  const chapter = await LibraryChapter.create({
    seriesId: series._id,
    label,
    slug,
    chapterTitle,
    authorLine: String(data.authorLine || "").trim(),
    blurb: String(data.blurb || "").trim(),
    source: data.sourceName || data.sourceUrl || data.sourceLicense
      ? {
          name: String(data.sourceName || "").trim(),
          url: String(data.sourceUrl || "").trim(),
          license: String(data.sourceLicense || "").trim(),
        }
      : null,
    paragraphs,
    glossary: {},
    pdf: {
      originalName: data.file.originalname,
      storedName: path.basename(data.file.path),
      path: data.file.path,
      size: data.file.size,
      pages,
    },
    createdBy: data.userId,
  });

  return {
    seriesId: series._id,
    chapterId: chapter._id,
    paragraphCount: paragraphs.length,
  };
}

export async function updateChapter(chapterId: string, updates: {
  chapterTitle?: string;
  label?: string;
  authorLine?: string;
  blurb?: string;
  paragraphsText?: string;
  source?: Record<string, string> | null;
  glossary?: Record<string, unknown>;
}) {
  const chapter = await LibraryChapter.findById(chapterId);
  if (!chapter) throw new Error("Chapter not found");

  if (updates.chapterTitle !== undefined) chapter.chapterTitle = String(updates.chapterTitle || "").trim();
  if (updates.label !== undefined) chapter.label = String(updates.label || "").trim();
  if (updates.authorLine !== undefined) chapter.authorLine = String(updates.authorLine || "").trim();
  if (updates.blurb !== undefined) chapter.blurb = String(updates.blurb || "").trim();

  if (updates.source === null) chapter.source = null;
  if (updates.source && typeof updates.source === "object") {
    chapter.source = {
      name: String(updates.source.name || "").trim(),
      url: String(updates.source.url || "").trim(),
      license: String(updates.source.license || "").trim(),
    };
  }

  if (updates.paragraphsText !== undefined) {
    chapter.paragraphs = splitTextToParagraphs(updates.paragraphsText);
  }

  if (updates.glossary !== undefined) {
    chapter.glossary = updates.glossary || {};
  }

  await chapter.save();
  return { ok: true as const };
}

export async function deleteChapter(chapterId: string) {
  const chapter = await LibraryChapter.findById(chapterId);
  if (!chapter) throw new Error("Chapter not found");

  if (chapter.pdf?.path) {
    try {
      fs.unlinkSync(chapter.pdf.path);
    } catch {
      /* ignore */
    }
  }

  await chapter.deleteOne();
  return { ok: true as const };
}

export async function uploadSeriesCover(seriesId: string, fileBuffer: Buffer) {
  const series = await LibrarySeries.findById(seriesId);
  if (!series) throw new Error("Series not found");

  if (series.coverPublicId) {
    await deleteFromCloudinary(series.coverPublicId);
  }

  const { url, public_id } = await uploadToCloudinary(fileBuffer, {
    folder: "english-studio/covers",
    public_id: `cover-${seriesId}`,
    overwrite: true,
    transformation: [{ width: 400, height: 600, crop: "fill" }],
  });

  series.coverImage = url;
  series.coverPublicId = public_id;
  await series.save();

  return { ok: true as const, coverImage: url };
}
