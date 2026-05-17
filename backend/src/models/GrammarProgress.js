import mongoose
  from "mongoose";

const grammarProgressSchema =
  new mongoose.Schema({

    userId: {
  type: String,
},

    grammarPoint: {
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
    }

  },

  {
    timestamps: true
  }
);

export default mongoose.model(
  "GrammarProgress",
  grammarProgressSchema
);