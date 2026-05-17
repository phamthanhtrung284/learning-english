import mongoose from "mongoose";

const WordSchema = new mongoose.Schema({
  text: String,

  pos: String,

  meaning: String,

  ipa: String,

  explanation: String,

  collocations: [String],

  native_nuance: String,

  linking_instruction: String,
});

const ParagraphSchema = new mongoose.Schema({
  storyId: Number,

  paragraphId: Number,

  originalText: String,

  translatedText: String,

  words: [WordSchema],
});

export default mongoose.model(
  "Paragraph",
  ParagraphSchema
);