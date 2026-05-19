import UserWord from "../models/UserWord.js";
import GrammarProgress from "../models/GrammarProgress.js";

/**
 * Weak vocabulary: read from UserWord (the actual saved-word store).
 * Words with low SRS repetition or overdue review are considered "weak".
 */
export const getWeakVocabulary = async (userId) => {
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
};

/**
 * Weak grammar: read from GrammarProgress (populated when exercises are done).
 */
export const getWeakGrammar = async (userId) => {
  const weakGrammar = await GrammarProgress.find({
    userId,
    masteryLevel: { $lte: 2 },
  })
    .sort({ wrongCount: -1 })
    .limit(10);

  return weakGrammar;
};
