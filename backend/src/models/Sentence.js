import mongoose from "mongoose";

const WordSchema = new mongoose.Schema({
  text: String,
  pos: String,
  meaning: String,
  ipa: String,
});

const SentenceSchema = new mongoose.Schema({
  originalSentence: { type: String, unique: true },
  translatedSentence: String,
  words: [WordSchema],
});

export default mongoose.model("Sentence", SentenceSchema);
