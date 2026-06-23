import mongoose, { Document, Schema } from "mongoose";

export interface IWord {
  text?: string;
  pos?: string;
  meaning?: string;
  ipa?: string;
}

export interface ISentence extends Document {
  originalSentence?: string;
  translatedSentence?: string;
  words: IWord[];
}

const WordSchema = new Schema<IWord>({
  text: String,
  pos: String,
  meaning: String,
  ipa: String,
});

const SentenceSchema = new Schema<ISentence>({
  originalSentence: { type: String, unique: true },
  translatedSentence: String,
  words: [WordSchema],
});

export default mongoose.model<ISentence>("Sentence", SentenceSchema);
