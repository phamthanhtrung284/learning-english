import express from "express";
import { protect, adminOnly } from "../../common/middleware/auth.middleware.js";
import { pdfUpload, coverUpload } from "../../common/utils/multerStorage.js";
import {
  listSeriesPublic,
  listSeriesAdmin,
  getChapterForReader,
  importPdfChapter,
  updateChapterAdmin,
  deleteChapterAdmin,
  uploadSeriesCover,
} from "./library.controller.js";

const router = express.Router();

router.get("/series", listSeriesPublic);
router.get("/chapters/:id", getChapterForReader);

router.get("/admin/series", protect, adminOnly, listSeriesAdmin);
router.post("/admin/import-pdf", protect, adminOnly, pdfUpload.single("file"), importPdfChapter);
router.patch("/admin/chapters/:id", protect, adminOnly, updateChapterAdmin);
router.delete("/admin/chapters/:id", protect, adminOnly, deleteChapterAdmin);
router.post("/admin/series/:id/cover", protect, adminOnly, coverUpload.single("cover"), uploadSeriesCover);

export const libraryRoutes = router;
