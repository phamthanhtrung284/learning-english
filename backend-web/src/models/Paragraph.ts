import mongoose, { Document, Schema } from "mongoose";

export interface IWord {
  text?: string;
  pos?: string;
  meaning?: string;
  ipa?: string;
  explanation?: string;
  collocations?: string[];
  native_nuance?: string;
  linking_instruction?: string;
}

export interface IParagraph extends Document {
  storyId?: number;
  paragraphId?: number;
  originalText?: string;
  translatedText?: string;
  words: IWord[];
}

const WordSchema = new Schema<IWord>({
  text: String,
  pos: String,
  meaning: String,
  ipa: String,
  explanation: String,
  collocations: [String],
  native_nuance: String,
  linking_instruction: String,
});

const ParagraphSchema = new Schema<IParagraph>({
  storyId: Number,
  paragraphId: Number,
  originalText: String,
  translatedText: String,
  words: [WordSchema],
});

// Unique compound index ensures we never store duplicate analyses for the same paragraph
ParagraphSchema.index({ storyId: 1, paragraphId: 1 }, { unique: true });

export default mongoose.model<IParagraph>("Paragraph", ParagraphSchema);
