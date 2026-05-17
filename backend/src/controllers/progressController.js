import VocabularyProgress
  from "../models/VocabularyProgress.js";

import {
  calculateNextReview
}
from "../services/reviewEngine.js";

export const saveWordResult =
  async (req, res) => {

  try {

    const {
  word,
  meaning,
  isCorrect
} = req.body;

const userId =
  req.user._id;

    let progress =
      await VocabularyProgress.findOne({
        userId,
        word
      });

    if (!progress) {

      progress =
        new VocabularyProgress({

          userId,
          word,
          meaning,
        });
    }

    if (isCorrect) {

      progress.correctCount += 1;

      progress.masteryLevel += 1;

    } else {

      progress.wrongCount += 1;

      progress.masteryLevel =
        Math.max(
          0,
          progress.masteryLevel - 1
        );
    }

    progress.lastReviewedAt =
      new Date();

    progress.nextReviewDate =
      calculateNextReview(
        progress.masteryLevel
      );

    await progress.save();

    res.json(progress);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};