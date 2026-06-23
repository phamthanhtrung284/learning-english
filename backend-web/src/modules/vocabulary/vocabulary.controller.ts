import { Response } from "express";
import { listWords, saveWord, deleteWord, updateSrs } from "./vocabulary.service.js";
import { AuthenticatedRequest } from "../../common/types/api.types.js";

export const listWordsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const words = await listWords(req.user!.id);
    res.json(words);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveWordHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { word, meaning, explanation, ipa, type, tags, level } = req.body;
    if (!word) {
      res.status(400).json({ success: false, message: "word is required" });
      return;
    }
    const result = await saveWord(req.user!.id, { word, meaning, explanation, ipa, type, tags, level });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWordHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "id is required" });
      return;
    }
    const result = await deleteWord(req.user!.id, id);
    res.json(result);
  } catch (error: any) {
    const status = error.message === "Word not found" ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateSrsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quality } = req.body;
    if (!id || quality === undefined) {
      res.status(400).json({ success: false, message: "id and quality are required" });
      return;
    }
    const updated = await updateSrs(req.user!.id, id, Number(quality));
    res.json({ success: true, word: updated });
  } catch (error: any) {
    const status = error.message === "Word not found" ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};