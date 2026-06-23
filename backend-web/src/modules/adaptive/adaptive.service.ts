import UserWord from "../../models/UserWord.js";
import GrammarProgress from "../../models/GrammarProgress.js";
import { c1Course } from "../course/course.service.js";

async function getWeakVocabulary(userId: string) {
  const now = new Date();
  const weakWords = await UserWord.find({
    userId,
    $or: [
      { repetition: { $lte: 2 } },
      { nextReviewDate: { $lte: now } },
    ],
  })
    .sort({ nextReviewDate: 1, repetition: 1 })
    .limit(20);

  return weakWords;
}

async function getWeakGrammar(userId: string) {
  const weakGrammar = await GrammarProgress.find({
    userId,
    masteryLevel: { $lte: 2 },
  })
    .sort({ wrongCount: -1 })
    .limit(10);

  return weakGrammar;
}

export async function generateAdaptivePlan(userId: string) {
  const [weakWords, weakGrammar] = await Promise.all([
    getWeakVocabulary(userId),
    getWeakGrammar(userId),
  ]);

  let recommendedChapters: typeof c1Course.chapters = [];
  if (weakGrammar.length > 0) {
    const weakPoints = new Set(weakGrammar.map((g) => g.grammarPoint));
    recommendedChapters = c1Course.chapters.filter((chapter) =>
      chapter.grammarFocus.some((g) => weakPoints.has(g))
    );
  }

  if (recommendedChapters.length === 0) {
    recommendedChapters = c1Course.chapters.slice(0, 3);
  }

  return { weakWords, weakGrammar, recommendedChapters };
}
