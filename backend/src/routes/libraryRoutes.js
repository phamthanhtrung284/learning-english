import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  listSeriesPublic,
  listSeriesAdmin,
  getChapterForReader,
  importPdfChapter,
  updateChapterAdmin,
  deleteChapterAdmin,
  uploadSeriesCover,
} from "../controllers/libraryController.js";

const router = express.Router();

// ── PDF upload storage ────────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads", "library-pdfs");
fs.mkdirSync(uploadDir, { recursive: true });

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = String(file.originalname || "file.pdf")
      .replace(/[^\w.\-]+/g, "_")
      .slice(-80);
    cb(null, `${Date.now()}-${safe}`);
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === "application/pdf" || String(file.originalname || "").toLowerCase().endsWith(".pdf");
    cb(ok ? null : new Error("Only PDF is allowed"), ok);
  },
});

// ── Cover image upload storage ────────────────────────────────────────────────
const coverDir = path.join(process.cwd(), "uploads", "covers");
fs.mkdirSync(coverDir, { recursive: true });

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coverDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg").toLowerCase() || ".jpg";
    cb(null, `cover-${Date.now()}${ext}`);
  },
});

const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

// Public
router.get("/series", listSeriesPublic);
router.get("/chapters/:id", getChapterForReader);

// Admin
router.get("/admin/series", protect, adminOnly, listSeriesAdmin);
router.post("/admin/import-pdf", protect, adminOnly, uploadPdf.single("file"), importPdfChapter);
router.patch("/admin/chapters/:id", protect, adminOnly, updateChapterAdmin);
router.delete("/admin/chapters/:id", protect, adminOnly, deleteChapterAdmin);
router.post("/admin/series/:id/cover", protect, adminOnly, uploadCover.single("cover"), uploadSeriesCover);

export default router;

