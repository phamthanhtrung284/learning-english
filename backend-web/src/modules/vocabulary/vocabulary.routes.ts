import { Router } from "express";
import { listWordsHandler, saveWordHandler, deleteWordHandler, updateSrsHandler } from "./vocabulary.controller.js";
import { protect } from "../../common/middleware/auth.middleware.js";

const router = Router();

router.get("/list", protect, listWordsHandler);
router.post("/save", protect, saveWordHandler);
router.delete("/:id", protect, deleteWordHandler);
router.patch("/:id/srs", protect, updateSrsHandler);

export default router;