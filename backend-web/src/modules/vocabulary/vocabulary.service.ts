import UserWord from "../../models/UserWord.js";
import User from "../../models/User.js";

export interface WordData {
  word: string;
  meaning?: string;
  explanation?: string;
  ipa?: string;
  type?: string;
  tags?: string[];
  level?: string;
}

export const listWords = async (userId: string) => {
  return UserWord.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const saveWord = async (userId: string, wordData: WordData) => {
  const existing = await UserWord.findOne({ userId, word: wordData.word });

  if (existing) {
    return { success: true, message: "Word already saved", word: existing };
  }

  const newWord = await UserWord.create({
    userId,
    word: wordData.word,
    meaning: wordData.meaning,
    explanation: wordData.explanation,
    ipa: wordData.ipa,
    type: wordData.type,
    tags: wordData.tags || [],
    level: wordData.level || "C1",
  });

  await User.findByIdAndUpdate(userId, { $inc: { xp: 5 } });

  return { success: true, word: newWord };
};

export const deleteWord = async (userId: string, wordId: string) => {
  const removed = await UserWord.findOneAndDelete({ _id: wordId, userId });
  if (!removed) {
    throw new Error("Word not found");
  }
  return { success: true, id: removed._id };
};

function calculateSrs(quality: number, rep: number, interval: number, ef: number) {
  let newRep = rep;
  let newInterval = interval;
  let newEf = ef;

  if (quality >= 3) {
    if (newRep === 0) {
      newInterval = 1;
    } else if (newRep === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEf);
    }
    newRep += 1;
  } else {
    newRep = 0;
    newInterval = 1;
  }

  newEf = newEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEf < 1.3) newEf = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return { repetition: newRep, interval: newInterval, easeFactor: newEf, nextReviewDate: nextReview };
}

export const updateSrs = async (userId: string, wordId: string, quality: number) => {
  const word = await UserWord.findOne({ _id: wordId, userId });
  if (!word) {
    throw new Error("Word not found");
  }

  const q = Math.min(5, Math.max(0, Math.round(quality)));
  const srs = calculateSrs(q, word.repetition, word.interval, word.easeFactor);

  const updated = await UserWord.findByIdAndUpdate(
    wordId,
    {
      $set: {
        repetition: srs.repetition,
        interval: srs.interval,
        easeFactor: srs.easeFactor,
        nextReviewDate: srs.nextReviewDate,
      },
    },
    { new: true }
  );

  return updated;
};