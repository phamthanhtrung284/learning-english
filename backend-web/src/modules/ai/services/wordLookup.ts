import { lookupWord } from "./groqClient.js";

export async function lookupWordWithAI(word: string, context: string) {
  return lookupWord(word, context);
}
