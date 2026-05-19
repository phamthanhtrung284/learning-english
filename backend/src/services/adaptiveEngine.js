import c1Course from "../data/courses/c1-course.js";
import { getWeakVocabulary, getWeakGrammar } from "./recommendationEngine.js";

export const generateAdaptivePlan = async (userId) => {
  const [weakWords, weakGrammar] = await Promise.all([
    getWeakVocabulary(userId),
    getWeakGrammar(userId),
  ]);

  // Recommend chapters that match weak grammar points (if any grammar data exists)
  let recommendedChapters = [];
  if (weakGrammar.length > 0) {
    const weakPoints = new Set(weakGrammar.map((g) => g.grammarPoint));
    recommendedChapters = c1Course.chapters.filter((chapter) =>
      chapter.grammarFocus.some((g) => weakPoints.has(g))
    );
  }

  // Fallback: recommend first 3 chapters if no grammar data yet
  if (recommendedChapters.length === 0) {
    recommendedChapters = c1Course.chapters.slice(0, 3);
  }

  return { weakWords, weakGrammar, recommendedChapters };
};
