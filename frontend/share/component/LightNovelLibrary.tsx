"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import LnChapterView from "./LnChapterView";
import { LnCursorTooltipProvider } from "./LnCursorTooltipProvider";
import api from "@share/services/api";
import {
  buildQuizletImportText,
  exportVocabularyAnkiTsv,
  exportVocabularyCsv,
} from "@share/utils/vocabularyExport";

const BACKEND =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace("/api", "") ||
  "http://localhost:4000";

interface SeriesChapter {
  id: string;
  label: string;
  chapterId?: string;
  chapter?: unknown;
  chapterTitle?: string;
}

interface SeriesData {
  id: string;
  _id?: string;
  displayTitle: string;
  author?: string;
  tagline?: string;
  accent?: string;
  coverEmoji?: string;
  coverImage?: string;
  chapters: SeriesChapter[];
}

interface SeriesPosterProps {
  series: SeriesData;
  openingChapterId: string | null;
  onSelectChapter: (data: unknown) => void;
  setOpeningChapterId: (id: string | null) => void;
}

// ── Poster card ───────────────────────────────────────────────────────────────
function SeriesPoster({ series, openingChapterId, onSelectChapter, setOpeningChapterId }: SeriesPosterProps) {
  const [hover, setHover] = useState(false);

  const coverSrc = series.coverImage ? `${BACKEND}${series.coverImage}` : null;

  const openFirstChapter = async () => {
    const ch = series.chapters?.[0];
    if (!ch) return;
    if (ch.chapter) { onSelectChapter(ch.chapter); return; }
    if (!ch.chapterId) return;
    try {
      setOpeningChapterId(ch.chapterId);
      const { data } = await api.get(`/library/chapters/${ch.chapterId}`);
      onSelectChapter(data);
    } catch (e: unknown) {
      alert((e as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (e as Error)?.message || "Could not open chapter");
    } finally {
      setOpeningChapterId(null);
    }
  };

  const isLoading = series.chapters?.some(
    (ch) => openingChapterId && ch.chapterId === openingChapterId
  );

  return (
    <div
      className="group relative cursor-pointer select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={openFirstChapter}
    >
      <div
        className="relative overflow-hidden rounded-lg transition-transform duration-200"
        style={{
          aspectRatio: "2/3",
          transform: hover ? "scale(1.04)" : "scale(1)",
          boxShadow: hover
            ? "0 12px 32px rgba(0,0,0,0.7)"
            : "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={series.displayTitle}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${series.accent || "from-slate-600 to-slate-800"}`}>
            <span className="text-4xl">{series.coverEmoji || "📚"}</span>
          </div>
        )}

        <div
          className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200"
          style={{ opacity: hover ? 1 : 0 }}
        >
          <div className="w-full p-3">
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-white/90 py-1.5 text-xs font-bold text-black">
              {isLoading ? "Opening…" : "▶ Read now"}
            </div>
          </div>
        </div>

        {series.chapters?.length > 0 && (
          <div className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {series.chapters.length} ch.
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <p className="truncate text-[12px] font-semibold leading-tight text-[var(--text)]">
          {series.displayTitle}
        </p>
        {series.author && (
          <p className="mt-0.5 truncate text-[11px] text-[var(--text-soft)]">
            {series.author}
          </p>
        )}
      </div>
    </div>
  );
}

// ── LightNovelLibrary ─────────────────────────────────────────────────────────
export default function LightNovelLibrary({
  chapter,
  onSelectChapter,
  zenMode = false,
  onZenModeChange,
  nightMode = false,
}: {
  chapter: unknown;
  onSelectChapter: (data: unknown) => void;
  zenMode?: boolean;
  onZenModeChange?: (zen: boolean) => void;
  nightMode?: boolean;
}) {
  const [remoteSeries, setRemoteSeries] = useState<SeriesData[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [remoteError, setRemoteError] = useState("");
  const [openingChapterId, setOpeningChapterId] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRemoteError("");
      try {
        const { data } = await api.get("/library/series");
        if (!cancelled) setRemoteSeries(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        if (!cancelled) {
          setRemoteError(
            (e as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error ||
              (e as Error)?.message ||
              "Could not load series from server"
          );
          setRemoteSeries([]);
        }
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleExport = useCallback(
    async (kind: "csv" | "anki" | "quizlet") => {
      setExportMenuOpen(false);
      try {
        const { data } = await api.get("/vocabulary/list");
        const words = Array.isArray(data) ? data : [];
        if (!words.length) {
          alert("No words saved yet — save words while reading or using the analyzer.");
          return;
        }
        if (kind === "csv") exportVocabularyCsv(words);
        else if (kind === "anki") exportVocabularyAnkiTsv(words);
        else if (kind === "quizlet") {
          const text = buildQuizletImportText(words);
          try {
            await navigator.clipboard.writeText(text);
            alert("Copied tab-separated format (Quizlet/Excel).");
          } catch {
            prompt("Copy this content:", text);
          }
        }
      } catch {
        alert("Could not load vocabulary.");
      }
    },
    []
  );

  if (chapter) {
    const zenShell = zenMode
      ? nightMode
        ? "ln-zen-shell-night"
        : "ln-zen-shell-day"
      : "";

    return (
      <LnCursorTooltipProvider>
        <div
          className={`ln-studio ln-studio-ui relative flex h-full min-h-0 flex-1 flex-col text-[var(--text)] ${zenShell}`}
          style={!zenMode ? { background: "transparent" } : undefined}
        >
          <div className={`relative flex min-h-0 flex-1 flex-col px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-6 ${zenMode ? "pb-0" : "pb-3 sm:pb-4 md:pb-6"}`}>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-4 md:p-5">
              {!zenMode && (
                <div className="z-40 shrink-0">
                  <div className="flex items-center justify-between gap-3 px-1 pb-3">
                    <button
                      type="button"
                      onClick={() => onSelectChapter(null)}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] inline-flex h-10 items-center gap-2 px-3.5 text-sm font-semibold text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
                    >
                      ← Library
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onZenModeChange?.(!zenMode)}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] h-10 px-3.5 text-sm font-semibold text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
                      >
                        Zen
                      </button>
                      <div className="relative" ref={exportMenuRef}>
                        <button
                          type="button"
                          onClick={() => setExportMenuOpen((o) => !o)}
                          className="h-10 rounded-xl px-3.5 text-sm font-semibold text-white"
                          style={{ background: "linear-gradient(135deg,var(--primary-2),var(--primary))" }}
                        >
                          Export ▾
                        </button>
                        {exportMenuOpen && (
                          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-[var(--shadow-card)]">
                            <button type="button" className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-soft)]" onClick={() => handleExport("csv")}>CSV</button>
                            <button type="button" className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-soft)]" onClick={() => handleExport("anki")}>Anki (.txt)</button>
                            <button type="button" className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-soft)]" onClick={() => handleExport("quizlet")}>Copy Quizlet</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {zenMode && (
                <button
                  type="button"
                  className="mt-3 h-11 w-full rounded-xl px-4 text-sm font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => onZenModeChange?.(false)}
                >
                  Exit Zen
                </button>
              )}

              <div
                ref={scrollerRef}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain"
              >
                <div className="mx-auto w-full max-w-[840px] px-3 py-8 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 md:py-10 md:pb-10">
                  <LnChapterView chapter={chapter as Parameters<typeof LnChapterView>[0]["chapter"]} zenMode={zenMode} nightMode={nightMode} scrollerRef={scrollerRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </LnCursorTooltipProvider>
    );
  }

  const seriesList = [
    ...remoteSeries.map((s) => ({
      id: `remote-${s.id}`,
      _id: s.id,
      displayTitle: s.displayTitle,
      author: s.author,
      tagline: s.tagline,
      accent: s.accent,
      coverEmoji: s.coverEmoji,
      coverImage: s.coverImage || "",
      chapters: (s.chapters || []).map((ch) => ({
        id: `remote-ch-${ch.id}`,
        label: ch.label || ch.chapterTitle || "Chapter",
        chapterId: ch.id,
        chapterTitle: ch.chapterTitle || "",
      })),
    })),
  ];

  return (
    <div className="ln-studio ln-studio-ui mx-auto w-full max-w-6xl px-4 pb-16 pt-6 text-[var(--text)] sm:px-8 md:px-10 md:pt-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Reading</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
          Light novel library
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--text-soft)]">
          Click a word to see meaning. Double-click a sentence to highlight grammar.
        </p>
        {remoteLoading && (
          <p className="mt-2 text-xs font-semibold text-[var(--text-soft)]">Loading…</p>
        )}
        {remoteError && (
          <p className="mt-2 text-xs font-semibold text-red-400">{remoteError}</p>
        )}
      </header>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {seriesList.map((series) => (
          <SeriesPoster
            key={series.id}
            series={series}
            openingChapterId={openingChapterId}
            onSelectChapter={onSelectChapter}
            setOpeningChapterId={setOpeningChapterId}
          />
        ))}
      </div>
    </div>
  );
}
