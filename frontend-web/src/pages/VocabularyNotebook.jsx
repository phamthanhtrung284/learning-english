import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const PAGE_SIZE = 20;

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 ||
      i === totalPages - 1 ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const btn = (label, target, disabled, active = false) => (
    <button
      key={`${label}-${target}`}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && typeof target === "number" && onChange(target)}
      className={`min-w-[40px] rounded-xl border px-3 py-1.5 text-sm font-bold transition
        ${active
          ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]"
          : disabled
            ? "cursor-not-allowed border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-soft)] opacity-40"
            : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-[var(--text-soft)]">
        Trang {page + 1} / {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {btn("←", page - 1, page === 0)}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-[var(--text-soft)]">
              …
            </span>
          ) : (
            btn(p + 1, p, false, p === page)
          )
        )}
        {btn("→", page + 1, page >= totalPages - 1)}
      </div>
    </div>
  );
}

export default function VocabularyNotebook() {
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingWords(true);
    void (async () => {
      try {
        const response = await api.get("/vocabulary/list");
        if (!cancelled) setWords(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log(error);
      } finally {
        if (!cancelled) setLoadingWords(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset to page 0 when search/filter changes
  useEffect(() => {
    setPage(0);
  }, [search, filterType]);

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const okSearch =
        !search.trim() ||
        word.word.toLowerCase().includes(search.toLowerCase()) ||
        (word.meaning || "").toLowerCase().includes(search.toLowerCase());
      if (!okSearch) return false;
      if (filterType === "all") return true;
      const t = (word.type || "").toLowerCase();
      if (filterType === "noun") return t.includes("noun");
      if (filterType === "verb") return t.includes("verb");
      if (filterType === "adj") return t.includes("adj") || t.includes("adjective");
      return true;
    });
  }, [words, search, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageWords = filteredWords.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const deleteOne = async (w) => {
    if (!w?._id) return;
    const ok = window.confirm(`Xóa từ "${w.word}" khỏi sổ từ?`);
    if (!ok) return;

    setDeletingId(w._id);
    const prev = words;
    setWords((cur) => cur.filter((x) => x._id !== w._id));
    try {
      await api.delete(`/vocabulary/${w._id}`);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || error?.response?.data?.error || "Xóa thất bại");
      setWords(prev);
    } finally {
      setDeletingId(null);
    }
  };

  const TYPE_FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "noun", label: "Noun" },
    { key: "verb", label: "Verb" },
    { key: "adj", label: "Adj" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mascot text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            Word Journal
          </p>
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
              {loadingWords ? (
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

      {/* Search + filter */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm từ vựng hoặc nghĩa..."
            className="input-magic !rounded-[22px] px-4 py-4 text-[15px]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] hover:text-[var(--text)]"
              aria-label="Xóa tìm kiếm"
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
              onClick={() => setFilterType(f.key)}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
                filterType === f.key
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]"
                  : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface-panel mt-6 overflow-hidden">
        <div className="hidden grid-cols-[1.2fr_1fr_2fr_0.9fr_0.6fr] gap-3 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-soft)] md:grid">
          <span>Từ</span>
          <span>Phát âm</span>
          <span>Nghĩa</span>
          <span>Loại từ</span>
          <span className="text-right">Xóa</span>
        </div>

        {loadingWords ? (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid gap-3 border-b border-[var(--border)] px-5 py-4 md:grid-cols-[1.2fr_1fr_2fr_0.9fr_0.6fr] md:items-center"
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
            <article
              key={word._id}
              className="grid gap-3 border-b border-[var(--border)] px-5 py-4 transition hover:bg-[color-mix(in_srgb,var(--primary)_4%,transparent)] md:grid-cols-[1.2fr_1fr_2fr_0.9fr_0.6fr] md:items-center"
            >
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-[var(--text)]">
                  {word.word}
                </p>
              </div>
              <p className="font-mono text-sm text-[var(--text-soft)]">{word.ipa || "—"}</p>
              <p className="text-sm text-[var(--text)]">{word.meaning || "—"}</p>
              <p className="text-xs text-[var(--text-soft)]">{word.type || "Reader"}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => deleteOne(word)}
                  disabled={deletingId === word._id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950"
                  aria-label={`Xóa ${word.word}`}
                >
                  {deletingId === word._id ? "Đang xóa…" : "Xóa"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loadingWords && filteredWords.length > PAGE_SIZE && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {/* Summary */}
      {!loadingWords && (
        <p className="mt-4 text-sm text-[var(--text-soft)]">
          {filteredWords.length === words.length
            ? `${words.length} từ`
            : `${filteredWords.length} / ${words.length} từ`}
          {filteredWords.length > PAGE_SIZE &&
            ` · trang ${safePage + 1}/${totalPages}`}
        </p>
      )}

      {/* Empty state */}
      {!loadingWords && filteredWords.length === 0 && (
        <div className="surface-panel mt-8 border-2 border-dashed border-[var(--border)] py-16 text-center">
          <p className="font-mascot text-lg text-[var(--text-soft)]">
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
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
