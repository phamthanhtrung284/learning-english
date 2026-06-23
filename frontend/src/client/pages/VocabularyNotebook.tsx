"use client";

import { useEffect, useState } from "react";
import api from "@share/services/api";

interface VocabEntry {
  _id: string;
  word: string;
  meaning: string;
  ipa?: string;
  type?: string;
}

const PAGE_SIZE = 20;

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "noun", label: "Noun" },
  { key: "verb", label: "Verb" },
  { key: "adj", label: "Adj" },
];

export default function VocabularyNotebook() {
  const [words, setWords] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/vocabulary/list");
        if (!cancelled) setWords(Array.isArray(res.data) ? res.data : []);
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = words.filter((w) => {
    const okSearch =
      !search.trim() ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      (w.meaning || "").toLowerCase().includes(search.toLowerCase());
    if (!okSearch) return false;
    if (filterType === "all") return true;
    const t = (w.type || "").toLowerCase();
    if (filterType === "noun") return t.includes("noun");
    if (filterType === "verb") return t.includes("verb");
    if (filterType === "adj") return t.includes("adj") || t.includes("adjective");
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageWords = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const deleteOne = async (w: VocabEntry) => {
    if (!w._id) return;
    setDeletingId(w._id);
    const prev = words;
    setWords((cur) => cur.filter((x) => x._id !== w._id));
    try {
      await api.delete(`/vocabulary/${w._id}`);
    } catch {
      setWords(prev);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-rise space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            Word Journal
          </p>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Vocabulary Notebook
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--text-soft)]">
            Your saved vocabulary in a clean workspace.
          </p>
        </div>
        <div className="surface-panel flex shrink-0 flex-wrap items-center gap-4 px-6 py-4">
          <div>
            <div className="font-display text-3xl font-extrabold tabular-nums tracking-tight text-[var(--primary)]">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--primary)_18%,transparent)]" />
              ) : (
                words.length
              )}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-soft)]">
              Total words
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--border)]" aria-hidden />
          <div className="text-sm font-semibold text-[var(--text-soft)]">
            Keep collecting from reading
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search words or meaning…"
            className="input-magic w-full rounded-[22px] px-4 py-4 text-[15px]"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setPage(0); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] hover:text-[var(--text)]"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => { setFilterType(f.key); setPage(0); }}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
                filterType === f.key
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="hidden grid-cols-[1.2fr_0.9fr_2fr_0.9fr_auto_auto] gap-3 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-soft)] md:grid">
          <span>Word</span>
          <span>IPA</span>
          <span>Meaning</span>
          <span>Type</span>
          <span>Audio</span>
          <span className="text-right">Delete</span>
        </div>

        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid gap-3 border-b border-[var(--border)] px-5 py-4 md:grid-cols-[1.2fr_0.9fr_2fr_0.9fr_auto_auto] md:items-center"
              >
                <div className="h-5 w-24 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]" />
                <div className="h-4 w-20 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--text-soft)_15%,transparent)]" />
                <div className="h-4 w-40 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--text-soft)_15%,transparent)]" />
                <div className="h-4 w-16 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--text-soft)_10%,transparent)]" />
              </div>
            ))}
          </div>
        ) : (
          pageWords.map((word) => (
            <div
              key={word._id}
              className="grid gap-3 border-b border-[var(--border)] px-5 py-4 transition hover:bg-[color-mix(in_srgb,var(--primary)_4%,transparent)] md:grid-cols-[1.2fr_0.9fr_2fr_0.9fr_auto_auto] md:items-center"
            >
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-[var(--text)]">
                  {word.word}
                </p>
              </div>
              <p className="font-mono text-sm text-[var(--text-soft)]">{word.ipa || "—"}</p>
              <p className="text-sm text-[var(--text)]">{word.meaning || "—"}</p>
              <p className="text-xs text-[var(--text-soft)]">{word.type || "Reader"}</p>
              <button
                type="button"
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(word.word);
                    u.lang = "en-US";
                    u.rate = 0.85;
                    window.speechSynthesis.speak(u);
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] hover:text-[var(--primary)] active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                </svg>
              </button>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => deleteOne(word)}
                  disabled={deletingId === word._id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950"
                >
                  {deletingId === word._id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-soft)]">
            Page {safePage + 1} / {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-sm font-bold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ←
            </button>
            {safePage + 1} / {totalPages}
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-sm font-bold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      )}

      {!loading && (
        <p className="text-sm text-[var(--text-soft)]">
          {filtered.length === words.length
            ? `${words.length} words`
            : `${filtered.length} / ${words.length} words`}
          {filtered.length > PAGE_SIZE && ` · page ${safePage + 1}/${totalPages}`}
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="surface-panel border-2 border-dashed border-[var(--border)] py-16 text-center">
          <p className="text-lg text-[var(--text-soft)]">
            {words.length === 0
              ? "No words yet — hover words in the reader or analyzer and tap Save."
              : "No matches — try another search or filter."}
          </p>
          {words.length > 0 && (
            <button
              type="button"
              onClick={() => { setSearch(""); setFilterType("all"); }}
              className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
