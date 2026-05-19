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
} from "../controllers/libraryController.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "library-pdfs");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = String(file.originalname || "file.pdf")
      .replace(/[^\w.\-]+/g, "_")
      .slice(-80);
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === "application/pdf" || String(file.originalname || "").toLowerCase().endsWith(".pdf");
    cb(ok ? null : new Error("Only PDF is allowed"), ok);
  },
});

// Public
router.get("/series", listSeriesPublic);
router.get("/chapters/:id", getChapterForReader);

// Admin
router.get("/admin/series", protect, adminOnly, listSeriesAdmin);
router.post("/admin/import-pdf", protect, adminOnly, upload.single("file"), importPdfChapter);
router.patch("/admin/chapters/:id", protect, adminOnly, updateChapterAdmin);
router.delete("/admin/chapters/:id", protect, adminOnly, deleteChapterAdmin);

export default router;

