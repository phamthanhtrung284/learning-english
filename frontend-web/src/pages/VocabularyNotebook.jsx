import { useEffect, useState } from "react";
import api from "../services/api";

export default function VocabularyNotebook() {
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState("");
  const [filter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await api.get("/vocabulary/list");
        if (!cancelled) setWords(response.data);
      } catch (error) {
        console.log(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredWords = words.filter((word) => {
    const okSearch = word.word.toLowerCase().includes(search.toLowerCase());
    if (!okSearch) return false;
    if (filter === "all") return true;
    const t = (word.type || "").toLowerCase();
    if (filter === "noun") return t.includes("noun");
    if (filter === "verb") return t.includes("verb");
    if (filter === "adj") return t.includes("adj");
    return true;
  });

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mascot text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Word Journal</p>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-[var(--text)] md:text-[2.25rem]">
            Vocabulary Notebook
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-[var(--text-soft)]">
            Your saved vocabulary in a clean workspace.
          </p>
        </div>
        <div className="surface-panel flex shrink-0 flex-wrap items-center gap-4 px-6 py-4">
          <div>
            <div className="font-display text-3xl font-extrabold tabular-nums tracking-tight text-[var(--primary)]">
              {words.length}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-soft)]">Total words</div>
          </div>
          <div className="h-10 w-px bg-[var(--border)]" aria-hidden />
          <div className="text-sm font-semibold text-[var(--text-soft)]">
            Keep collecting from reading
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm từ vựng..."
            className="input-magic !rounded-[22px] px-4 py-4 text-[15px]"
          />
        </div>
      </div>

      <div className="surface-panel mt-8 overflow-hidden">
        <div className="hidden grid-cols-[1.2fr_1fr_2fr_0.9fr] gap-3 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-soft)] md:grid">
          <span>Từ</span>
          <span>Phát âm</span>
          <span>Nghĩa</span>
          <span>Nguồn</span>
        </div>
        {filteredWords.map((word) => {
          return (
            <article
              key={word._id}
              className="grid gap-3 border-b border-[var(--border)] px-5 py-4 transition hover:bg-[color-mix(in_srgb,var(--primary)_4%,transparent)] md:grid-cols-[1.2fr_1fr_2fr_0.9fr] md:items-center"
            >
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-[var(--text)]">{word.word}</p>
              </div>
              <p className="font-mono text-sm text-[var(--text-soft)]">{word.ipa || "—"}</p>
              <p className="text-sm text-[var(--text)]">{word.meaning || "—"}</p>
              <p className="text-xs text-[var(--text-soft)]">{word.type || "Reader"}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-soft)]">
        <p>Total: {filteredWords.length} words</p>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-1.5 opacity-60" disabled>
            Trước
          </button>
          <span className="rounded-xl border border-[var(--border)] px-3 py-1.5">1 / 1</span>
          <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-1.5 opacity-60" disabled>
            Sau
          </button>
        </div>
      </div>

      {filteredWords.length === 0 && (
        <div className="surface-panel mt-8 border-2 border-dashed border-[var(--border)] py-16 text-center">
          <p className="font-mascot text-lg text-[var(--text-soft)]">
            {words.length === 0
              ? "No words yet — hover words in the reader or analyzer and tap Save."
              : "No matches — try another filter."}
          </p>
        </div>
      )}
    </div>
  );
}
