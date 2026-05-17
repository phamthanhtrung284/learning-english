import VocabularyProgress
  from "../models/VocabularyProgress.js";

import GrammarProgress
  from "../models/GrammarProgress.js";


export const getWeakVocabulary =
  async (userId) => {

  const weakWords =
    await VocabularyProgress.find({

      userId,

      masteryLevel: {
        $lte: 2
      }

    })

    .sort({
      wrongCount: -1
    })

    .limit(20);

  return weakWords;
};


export const getWeakGrammar =
  async (userId) => {

  const weakGrammar =
    await GrammarProgress.find({

      userId,

      masteryLevel: {
        $lte: 2
      }

    })

    .sort({
      wrongCount: -1
    })

    .limit(10);

  return weakGrammar;
};