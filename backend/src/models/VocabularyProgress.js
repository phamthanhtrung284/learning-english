import mongoose
  from "mongoose";

const vocabularyProgressSchema =
  new mongoose.Schema({

    userId: {
  type: String,
},

    word: {
      type: String,
    },

    meaning: {
      type: String,
    },

    correctCount: {
      type: Number,

      default: 0
    },

    wrongCount: {
      type: Number,

      default: 0
    },

    masteryLevel: {

      type: Number,

      default: 0
    },

    nextReviewDate: {
      type: Date,
    },

    lastReviewedAt: {
      type: Date,
    }

  },

  {
    timestamps: true
  }
);

export default mongoose.model(
  "VocabularyProgress",
  vocabularyProgressSchema
);