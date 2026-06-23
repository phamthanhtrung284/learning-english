import VocabularyProgress from "../../models/VocabularyProgress.js";

function calculateNextReview(masteryLevel: number): Date {
  const now = new Date();
  let days = 1;

  if (masteryLevel >= 1) days = 3;
  if (masteryLevel >= 3) days = 7;
  if (masteryLevel >= 5) days = 14;
  if (masteryLevel >= 7) days = 30;

  now.setDate(now.getDate() + days);
  return now;
}

export async function saveWordResult(payload: {
  userId: string;
  word: string;
  meaning: string;
  isCorrect: boolean;
}) {
  const { userId, word, meaning, isCorrect } = payload;

  let progress = await VocabularyProgress.findOne({ userId, word });

  if (!progress) {
    progress = new VocabularyProgress({ userId, word, meaning });
  }

  if (isCorrect) {
    progress.correctCount += 1;
    progress.masteryLevel += 1;
  } else {
    progress.wrongCount += 1;
    progress.masteryLevel = Math.max(0, progress.masteryLevel - 1);
  }

  progress.lastReviewedAt = new Date();
  progress.nextReviewDate = calculateNextReview(progress.masteryLevel);

  await progress.save();
  return progress;
}
