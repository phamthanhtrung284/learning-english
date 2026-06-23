"use client";

import { useState } from "react";
import api from "@share/services/api";
import { speak } from "@share/utils/speak";

interface Token {
  word: string;
  pos: string;
  fromGlossary: boolean;
  meaning: string;
  ipa: string;
  explanation: string;
}

interface AnalyzeResult {
  tokens: Token[];
  posTags: string[];
  translation: string;
}

// POS tag color map
const POS_COLOR: Record<string, string> = {
  noun:   "sky",
  verb:   "rose",
  adj:    "amber",
  adv:    "emerald",
  prep:   "violet",
  conj:   "violet",
  det:    "slate",
  pron:   "sky",
  aux:    "rose",
  part:   "slate",
  num:    "amber",
  intj:   "emerald",
};

const POS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  sky:     { bg: "rgba(56,189,248,0.12)",  text: "#38bdf8", border: "rgba(56,189,248,0.25)"  },
  rose:    { bg: "rgba(251,113,133,0.12)", text: "#fb7185", border: "rgba(251,113,133,0.25)" },
  amber:   { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)"  },
  emerald: { bg: "rgba(52,211,153,0.12)",  text: "#34d399", border: "rgba(52,211,153,0.25)"  },
  violet:  { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", border: "rgba(167,139,250,0.25)" },
  slate:   { bg: "rgba(148,163,184,0.10)", text: "#94a3b8", border: "rgba(148,163,184,0.20)" },
};

function getPosStyle(pos: string) {
  const key = pos.toLowerCase().replace(/[^a-z]/g, "");
  const colorKey = POS_COLOR[key] || "slate";
  return POS_STYLE[colorKey] || POS_STYLE.slate;
}

// Single token card — shows POS above, word below, tooltip on click
function TokenCard({ token }: { token: Token }) {
  const [open, setOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "loading" | "saved">("idle");
  const style = getPosStyle(token.pos);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!localStorage.getItem("token")) { alert("Please login first"); return; }
    setSaveState("loading");
    try {
      await api.post("/vocabulary/save", {
        word: token.word,
        meaning: token.meaning,
        ipa: token.ipa,
        type: token.pos,
        explanation: token.explanation,
      });
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  };

  // Punctuation — render plain, no interaction
  if (/^[.,!?;:'"()\-–—…]+$/.test(token.word)) {
    return (
      <span className="inline-flex flex-col items-center">
        <span className="h-5" /> {/* spacer for POS row */}
        <span className="text-[var(--text-soft)]">{token.word}</span>
      </span>
    );
  }

  return (
    <span className="relative inline-flex flex-col items-center">
      {/* POS badge */}
      <span
        className="mb-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest leading-none"
        style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
      >
        {token.pos || "—"}
      </span>

      {/* Word */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded px-0.5 text-[17px] font-medium leading-snug text-[var(--text)] transition-colors hover:text-[var(--primary)]"
        style={open ? { color: "var(--primary)" } : undefined}
      >
        {token.word}
      </button>

      {/* Tooltip */}
      {open && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-3 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-0.5 w-full" style={{ background: "var(--gradient-primary)" }} />
          <div className="p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-extrabold text-[var(--text)]">{token.word}</p>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                  style={{ background: style.bg, color: style.text }}
                >
                  {token.pos}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); speak(token.word); }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                </svg>
              </button>
            </div>

            {token.meaning && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Nghĩa (VI)</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">{token.meaning}</p>
              </div>
            )}

            {token.ipa && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">IPA</p>
                <p className="mt-0.5 font-mono text-sm text-[var(--text)]">{token.ipa}</p>
              </div>
            )}

            {token.explanation && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Definition (EN)</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-soft)]">{token.explanation}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saveState !== "idle"}
              className="w-full rounded-xl py-2 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: saveState === "saved" ? undefined : "var(--gradient-primary)", border: saveState === "saved" ? "1px solid var(--border)" : undefined, color: saveState === "saved" ? "var(--text)" : "white" }}
            >
              {saveState === "loading" ? "Saving…" : saveState === "saved" ? "✓ Saved" : "Save to notebook"}
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

export default function SentenceReaderWeb({ data }: { data: AnalyzeResult }) {
  return (
    <div className="space-y-6">
      {/* Token row — POS above each word */}
      {data.tokens && data.tokens.length > 0 && (
        <div className="flex flex-wrap items-end gap-x-2 gap-y-3">
          {data.tokens.map((token, i) => (
            <TokenCard key={i} token={token} />
          ))}
        </div>
      )}

      {/* Translation */}
      {data.translation && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">Translation</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--text)]">{data.translation}</p>
        </div>
      )}
    </div>
  );
}
