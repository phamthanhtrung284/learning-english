import c1Course
  from "../data/courses/c1-course.js";

import {
  getWeakVocabulary,
  getWeakGrammar
}
from "./recommendationEngine.js";


export const generateAdaptivePlan =
  async (userId) => {

  // weak vocab
  const weakWords =
    await getWeakVocabulary(
      userId
    );

  // weak grammar
  const weakGrammar =
    await getWeakGrammar(
      userId
    );

  // recommend chapter
  const recommendedChapters =
    c1Course.chapters.filter(
      (chapter) => {

        // grammar match
        const grammarMatch =
          chapter.grammarFocus.some(
            (grammar) =>

              weakGrammar.some(
                (g) =>
                  g.grammarPoint ===
                  grammar
              )
          );

        return grammarMatch;
      }
    );

  return {

    weakWords,

    weakGrammar,

    recommendedChapters
  };
};