import fs from "fs";
import path from "path";
import crypto from "crypto";
import pdfParse from "pdf-parse";
import LibrarySeries from "../models/LibrarySeries.js";
import LibraryChapter from "../models/LibraryChapter.js";

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function splitPdfTextToParagraphs(rawText) {
  const text = String(rawText || "")
    .replace(/\r/g, "")
    // bỏ khoảng trắng cuối dòng
    .replace(/[ \t]+\n/g, "\n")
    // gộp nhiều dòng trống
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return [];

  const blocks = text
    .split(/\n\s*\n/g)
    .map((b) =>
      b
        .trim()
        // gộp các line trong cùng paragraph thành 1 dòng để tránh bể sentence split
        .replace(/\n+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
    )
    .filter(Boolean);

  return blocks.map((en) => ({ en }));
}

async function findOrCreateSeries(payload, userId) {
  const displayTitle = String(payload.displayTitle || "").trim();
  if (!displayTitle) throw new Error("Series title is required");

  const update = {
    author: String(payload.author || "").trim(),
    tagline: String(payload.tagline || "").trim(),
    accent: String(payload.accent || "").trim() || undefined,
    coverEmoji: String(payload.coverEmoji || "").trim() || undefined,
  };
  // remove undefined fields
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const series = await LibrarySeries.findOneAndUpdate(
    { displayTitle },
    { $setOnInsert: { displayTitle, createdBy: userId }, $set: update },
    { new: true, upsert: true }
  );
  return series;
}

export async function listSeriesPublic(req, res) {
  const series = await LibrarySeries.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
  const seriesIds = series.map((s) => s._id);
  const chapters = await LibraryChapter.find({ seriesId: { $in: seriesIds } })
    .select("seriesId label chapterTitle")
    .sort({ createdAt: -1 })
    .lean();

  const bySeries = new Map();
  chapters.forEach((ch) => {
    const key = String(ch.seriesId);
    const arr = bySeries.get(key) || [];
    arr.push({
      id: ch._id,
      label: ch.label,
      chapterTitle: ch.chapterTitle,
    });
    bySeries.set(key, arr);
  });

  res.json(
    series.map((s) => ({
      id: s._id,
      displayTitle: s.displayTitle,
      author: s.author || "",
      tagline: s.tagline || "",
      accent: s.accent || "from-slate-500 via-slate-600 to-slate-700",
      coverEmoji: s.coverEmoji || "📚",
      coverImage: s.coverImage || "",
      chapters: bySeries.get(String(s._id)) || [],
    }))
  );
}

export async function listSeriesAdmin(req, res) {
  const series = await LibrarySeries.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
  const seriesIds = series.map((s) => s._id);
  const chapters = await LibraryChapter.find({ seriesId: { $in: seriesIds } })
    .sort({ createdAt: -1 })
    .lean();

  const bySeries = new Map();
  chapters.forEach((ch) => {
    const key = String(ch.seriesId);
    const arr = bySeries.get(key) || [];
    arr.push({
      id: ch._id,
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

  res.json(
    series.map((s) => ({
      id: s._id,
      displayTitle: s.displayTitle,
      author: s.author || "",
      tagline: s.tagline || "",
      accent: s.accent || "from-slate-500 via-slate-600 to-slate-700",
      coverEmoji: s.coverEmoji || "📚",
      coverImage: s.coverImage || "",
      chapters: bySeries.get(String(s._id)) || [],
    }))
  );
}

export async function getChapterForReader(req, res) {
  const { id } = req.params;
  const chapter = await LibraryChapter.findById(id).lean();
  if (!chapter) return res.status(404).json({ error: "Chapter not found" });

  const series = await LibrarySeries.findById(chapter.seriesId).lean();
  if (!series) return res.status(404).json({ error: "Series not found" });

  res.json({
    slug: chapter.slug,
    readerTitle: series.displayTitle,
    chapterTitle: chapter.chapterTitle,
    authorLine: chapter.authorLine || series.author || "",
    blurb: chapter.blurb || series.tagline || "",
    source: chapter.source || null,
    paragraphs: Array.isArray(chapter.paragraphs) ? chapter.paragraphs : [],
    glossary: chapter.glossary || {},
  });
}

export async function importPdfChapter(req, res) {
  if (!req.file) return res.status(400).json({ error: "PDF file is required" });

  const seriesTitle = String(req.body.seriesTitle || "").trim();
  const chapterTitle = String(req.body.chapterTitle || "").trim();
  const label = String(req.body.chapterLabel || "").trim() || chapterTitle || "Chapter";
  if (!seriesTitle) return res.status(400).json({ error: "seriesTitle is required" });
  if (!chapterTitle) return res.status(400).json({ error: "chapterTitle is required" });

  const series = await findOrCreateSeries(
    {
      displayTitle: seriesTitle,
      author: req.body.seriesAuthor,
      tagline: req.body.seriesTagline,
      accent: req.body.seriesAccent,
      coverEmoji: req.body.seriesEmoji,
    },
    req.user?.id
  );

  const buf = fs.readFileSync(req.file.path);
  const parsed = await pdfParse(buf);

  const paragraphs = splitPdfTextToParagraphs(parsed.text);
  const slugBase = `${slugify(series.displayTitle)}-${slugify(label) || slugify(chapterTitle)}`;
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;

  const chapter = await LibraryChapter.create({
    seriesId: series._id,
    label,
    slug,
    chapterTitle,
    authorLine: String(req.body.authorLine || "").trim(),
    blurb: String(req.body.blurb || "").trim(),
    source: req.body.sourceName || req.body.sourceUrl || req.body.sourceLicense
      ? {
          name: String(req.body.sourceName || "").trim(),
          url: String(req.body.sourceUrl || "").trim(),
          license: String(req.body.sourceLicense || "").trim(),
        }
      : null,
    paragraphs,
    glossary: {},
    pdf: {
      originalName: req.file.originalname,
      storedName: path.basename(req.file.path),
      path: req.file.path,
      size: req.file.size,
      pages: parsed.numpages || 0,
    },
    createdBy: req.user?.id,
  });

  res.status(201).json({
    seriesId: series._id,
    chapterId: chapter._id,
    paragraphCount: paragraphs.length,
  });
}

export async function updateChapterAdmin(req, res) {
  const { id } = req.params;
  const chapter = await LibraryChapter.findById(id);
  if (!chapter) return res.status(404).json({ error: "Chapter not found" });

  const up = req.body || {};

  if (up.chapterTitle !== undefined) chapter.chapterTitle = String(up.chapterTitle || "").trim();
  if (up.label !== undefined) chapter.label = String(up.label || "").trim();
  if (up.authorLine !== undefined) chapter.authorLine = String(up.authorLine || "").trim();
  if (up.blurb !== undefined) chapter.blurb = String(up.blurb || "").trim();

  if (up.source === null) chapter.source = null;
  if (up.source && typeof up.source === "object") {
    chapter.source = {
      name: String(up.source.name || "").trim(),
      url: String(up.source.url || "").trim(),
      license: String(up.source.license || "").trim(),
    };
  }

  // paragraphsText: admin gửi 1 textarea (blank line = new paragraph)
  if (up.paragraphsText !== undefined) {
    const p = String(up.paragraphsText || "")
      .replace(/\r/g, "")
      .split(/\n\s*\n/g)
      .map((x) => x.trim().replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim())
      .filter(Boolean)
      .map((en) => ({ en }));
    chapter.paragraphs = p;
  }

  if (up.glossary !== undefined) {
    // optional: cho phép update sau
    chapter.glossary = up.glossary || {};
  }

  await chapter.save();
  res.json({ ok: true });
}

export async function uploadSeriesCover(req, res) {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: "Image file is required" });

  const series = await LibrarySeries.findById(id);
  if (!series) return res.status(404).json({ error: "Series not found" });

  // Delete old cover from Cloudinary
  if (series.coverPublicId) {
    const { deleteFromCloudinary } = await import("../services/cloudinaryService.js");
    await deleteFromCloudinary(series.coverPublicId);
  }

  const { uploadToCloudinary } = await import("../services/cloudinaryService.js");
  const { url, public_id } = await uploadToCloudinary(req.file.buffer, {
    folder: "english-studio/covers",
    public_id: `cover-${id}`,
    overwrite: true,
    transformation: [{ width: 400, height: 600, crop: "fill" }],
  });

  series.coverImage = url;
  series.coverPublicId = public_id;
  await series.save();

  res.json({ ok: true, coverImage: url });
}

export async function deleteChapterAdmin(req, res) {
  const { id } = req.params;
  const chapter = await LibraryChapter.findById(id);
  if (!chapter) return res.status(404).json({ error: "Chapter not found" });

  // xóa file pdf nếu có
  if (chapter.pdf?.path) {
    try {
      fs.unlinkSync(chapter.pdf.path);
    } catch {
      /* ignore */
    }
  }

  await chapter.deleteOne();
  res.json({ ok: true });
}

