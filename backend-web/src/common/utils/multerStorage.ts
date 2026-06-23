import multer from "multer";
import path from "path";
import fs from "fs";

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Only image files allowed") as unknown as null, false);
  },
});

export const coverUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Only image files are allowed") as unknown as null, false);
  },
});

const uploadDir = path.join(process.cwd(), "uploads", "library-pdfs");
fs.mkdirSync(uploadDir, { recursive: true });

const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = String(file.originalname || "file.pdf")
      .replace(/[^\w.\-]+/g, "_")
      .slice(-80);
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const pdfUpload = multer({
  storage: pdfStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === "application/pdf" || String(file.originalname || "").toLowerCase().endsWith(".pdf");
    if (ok) cb(null, true);
    else cb(new Error("Only PDF is allowed") as unknown as null, false);
  },
});
