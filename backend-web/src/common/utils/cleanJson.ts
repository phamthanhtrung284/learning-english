/**
 * Shared utility to extract and parse a JSON object from a string that may
 * be wrapped in markdown code fences or have surrounding text.
 *
 * Throws a descriptive error if no valid JSON object is found.
 */
export function cleanJson(text: string): any {
  try {
    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Model output did not contain a JSON object");
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleaned);
  } catch (e: any) {
    console.error("cleanJson parse error:", e?.message);
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}
