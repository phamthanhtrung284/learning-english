import { Response } from "express";
import { AuthenticatedRequest } from "../../common/types/api.types.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok, fail, notFound } from "../../common/utils/httpResponse.js";
import * as libraryService from "./library.service.js";

export const listSeriesPublic = asyncHandler(async (_req, res: Response) => {
  const data = await libraryService.listSeries();
  ok(res, data);
});

export const listSeriesAdmin = asyncHandler(async (_req, res: Response) => {
  const data = await libraryService.listSeriesAdmin();
  ok(res, data);
});

export const getChapterForReader = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const chapter = await libraryService.getChapterById(id);
  if (!chapter) return notFound(res, "Chapter not found");
  ok(res, chapter);
});

export const importPdfChapter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) return fail(res, "PDF file is required");

  const result = await libraryService.importPdfChapter({
    file: req.file,
    seriesTitle: req.body.seriesTitle,
    chapterTitle: req.body.chapterTitle,
    chapterLabel: req.body.chapterLabel,
    seriesAuthor: req.body.seriesAuthor,
    seriesTagline: req.body.seriesTagline,
    seriesAccent: req.body.seriesAccent,
    seriesEmoji: req.body.seriesEmoji,
    authorLine: req.body.authorLine,
    blurb: req.body.blurb,
    sourceName: req.body.sourceName,
    sourceUrl: req.body.sourceUrl,
    sourceLicense: req.body.sourceLicense,
    userId: req.user?.id,
  });

  res.status(201).json(result);
});

export const updateChapterAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await libraryService.updateChapter(id, req.body);
    ok(res, result);
  } catch (err: any) {
    if (err.message === "Chapter not found") return notFound(res, err.message);
    throw err;
  }
});

export const deleteChapterAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await libraryService.deleteChapter(id);
    ok(res, result);
  } catch (err: any) {
    if (err.message === "Chapter not found") return notFound(res, err.message);
    throw err;
  }
});

export const uploadSeriesCover = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!req.file) return fail(res, "Image file is required");

  try {
    const result = await libraryService.uploadSeriesCover(id, req.file.buffer);
    ok(res, result);
  } catch (err: any) {
    if (err.message === "Series not found") return notFound(res, err.message);
    throw err;
  }
});
