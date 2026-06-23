"use client";

import { useState } from "react";
import api from "@share/services/api";
import SentenceReaderWeb from "@share/component/SentenceReaderWeb";

// Shape returned by /sentences/analyze — mapped to what SentenceReaderWeb expects
interface AnalyzeResult {
  tokens: { word: string; pos: string; fromGlossary: boolean; meaning: string; ipa: string; explanation: string }[];
  posTags: string[];
  translation: string;
}

function mapAnalyzeResponse(data: Record<string, unknown>): AnalyzeResult {
  // Backend returns { originalSentence, translatedSentence, words: [{text, pos, meaning, ipa, explanation, ...}] }
  const words = Array.isArray(data.words) ? (data.words as Record<string, unknown>[]) : [];
  return {
    translation: String(data.translatedSentence || data.translation || ""),
    posTags: words.map((w) => String(w.pos || "")),
    tokens: words.map((w) => ({
      word: String(w.text || w.word || ""),
      pos: String(w.pos || ""),
      fromGlossary: false,
      meaning: String(w.meaning || ""),
      ipa: String(w.ipa || ""),
      explanation: String(w.explanation || ""),
    })),
  };
}

export default function AnalyzePage() {
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!sentence.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.post("/sentences/analyze", { sentence });
      setResult(mapAnalyzeResponse(data as Record<string, unknown>));
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-rise space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Sentence study</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-[var(--text)]">
          Sentence Analyzer
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-soft)]">
          Analyze a sentence for contextual meaning, IPA, and quick vocabulary saving.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/35 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="surface-panel p-6 space-y-4">
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyze(); } }}
          placeholder="Paste a sentence to study…"
          rows={3}
          className="input-magic w-full resize-none text-base"
        />
        <button
          type="button"
          onClick={analyze}
          disabled={loading || !sentence.trim()}
          className="btn-primary-glow rounded-2xl px-8 py-3 text-sm font-bold disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {result !== null && (
        <div className="surface-panel p-6">
          <SentenceReaderWeb data={result} />
        </div>
      )}
    </div>
  );
}
