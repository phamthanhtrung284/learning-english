import { useCallback, useEffect, useRef, useState } from "react";
import { WEB_LIGHT_NOVEL_SERIES } from "../data/chapters/index.js";
import LnChapterView from "./LnChapterView";
import api from "../services/api";
import {
  buildQuizletImportText,
  exportVocabularyAnkiTsv,
  exportVocabularyCsv,
} from "../utils/vocabularyExport";

export default function LightNovelLibrary({
  chapter,
  onSelectChapter,
  zenMode = false,
  onZenModeChange,
  nightMode = false,
}) {
  const [vocabWords, setVocabWords] = useState([]);
  const [readProgress, setReadProgress] = useState(0);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const scrollerRef = useRef(null);
  const exportMenuRef = useRef(null);
  const rafRef = useRef(0);

  const refreshVocab = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setVocabWords([]);
      return;
    }
    try {
      const { data } = await api.get("/vocabulary/list");
      setVocabWords(Array.isArray(data) ? data : []);
    } catch {
      setVocabWords([]);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refreshVocab());
  }, [refreshVocab]);

  useEffect(() => {
    const close = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const computeScrollProgress = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const p = max <= 0 ? 1 : el.scrollTop / max;
    setReadProgress(Math.min(1, Math.max(0, p)));
  }, []);

  const scheduleScrollProgress = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      computeScrollProgress();
    });
  }, [computeScrollProgress]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    computeScrollProgress();
    el.addEventListener("scroll", scheduleScrollProgress, { passive: true });
    window.addEventListener("resize", scheduleScrollProgress);
    return () => {
      el.removeEventListener("scroll", scheduleScrollProgress);
      window.removeEventListener("resize", scheduleScrollProgress);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [chapter, computeScrollProgress, scheduleScrollProgress]);

  const handleExport = useCallback(
    async (kind) => {
      setExportMenuOpen(false);
      let words = vocabWords;
      if (!words.length && localStorage.getItem("token")) {
        try {
          const { data } = await api.get("/vocabulary/list");
          words = Array.isArray(data) ? data : [];
        } catch {
          alert("Could not load vocabulary.");
          return;
        }
      }
      if (!words.length) {
        alert("Chưa có từ nào — hãy lưu từ khi đọc hoặc dùng phân tích câu.");
        return;
      }
      if (kind === "csv") exportVocabularyCsv(words);
      else if (kind === "anki") exportVocabularyAnkiTsv(words);
      else if (kind === "quizlet") {
        const text = buildQuizletImportText(words);
        try {
          await navigator.clipboard.writeText(text);
          alert("Đã copy dạng tab-separated (Quizlet/Excel).");
        } catch {
          prompt("Copy nội dung này:", text);
        }
      }
    },
    [vocabWords]
  );

  if (chapter) {
    const zenShell = zenMode
      ? nightMode
        ? "ln-zen-shell-night"
        : "ln-zen-shell-day"
      : "";

    return (
      <div
        className={`ln-studio ln-studio-ui relative flex h-full min-h-0 flex-1 flex-col text-[var(--text)] ${zenShell}`}
        style={!zenMode ? { background: "transparent" } : undefined}
      >
        <div className="relative flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
          <div className="glass-frame flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4 md:p-5">
            {!zenMode && (
              <div className="z-40 shrink-0">
                <div className="flex items-center justify-between gap-3 px-1 pb-3">
                  <button
                    type="button"
                    onClick={() => onSelectChapter(null)}
                    className="glass-btn inline-flex h-10 items-center gap-2 px-3.5 text-sm font-semibold text-[var(--text)]"
                  >
                    ← Thư viện
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onZenModeChange?.(!zenMode)}
                      className="glass-btn h-10 px-3.5 text-sm font-semibold text-[var(--text)]"
                    >
                      Zen
                    </button>
                    <div className="relative" ref={exportMenuRef}>
                      <button
                        type="button"
                        onClick={() => setExportMenuOpen((o) => !o)}
                        className="glass-btn h-10 px-3.5 text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg,var(--primary-2),var(--primary))" }}
                      >
                        Xuất từ ▾
                      </button>
                      {exportMenuOpen ? (
                        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-card)_84%,transparent)] py-1 shadow-[var(--shadow-card)] backdrop-blur-[18px]">
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                            onClick={() => handleExport("csv")}
                          >
                            CSV
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                            onClick={() => handleExport("anki")}
                          >
                            Anki (.txt)
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                            onClick={() => handleExport("quizlet")}
                          >
                            Copy Quizlet
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--text-soft)_10%,transparent)]">
                  <div
                    className="ln-progress-fill h-full rounded-full"
                    style={{
                      width: `${readProgress * 100}%`,
                      background: "var(--gradient-primary)",
                    }}
                  />
                </div>
              </div>
            )}

            {zenMode && (
              <button
                type="button"
                className="glass-btn mt-3 h-11 w-full px-4 text-sm font-bold text-white"
                style={{ background: "var(--gradient-primary)" }}
                onClick={() => onZenModeChange?.(false)}
              >
                Thoát Zen
              </button>
            )}

            <div
              ref={scrollerRef}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain"
            >
              <div className="mx-auto w-full max-w-[840px] px-3 py-8 sm:px-6 md:py-10">
                <LnChapterView chapter={chapter} zenMode={zenMode} nightMode={nightMode} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ln-studio ln-studio-ui mx-auto w-full max-w-6xl px-4 pb-16 pt-6 text-[var(--text)] sm:px-8 md:px-10 md:pt-10">
      <header className="surface-panel relative mb-10 overflow-hidden p-8 md:p-10">
        <p className="font-mascot relative text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
          Reading
        </p>
        <h1 className="font-display relative mt-4 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
          Light novel library
        </h1>
        <p className="relative mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-soft)] md:text-[17px]">
          Hover a word to see meaning. Double-click a sentence to highlight grammar lightly.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WEB_LIGHT_NOVEL_SERIES.map((series) => (
          <article
            key={series.id}
            className="group surface-panel card-hover relative flex flex-col overflow-hidden"
          >
            <div className={`relative h-32 bg-gradient-to-br ${series.accent} opacity-90`} aria-hidden>
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
            </div>
            <div className="absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-[var(--bg-card)] text-3xl shadow-[var(--shadow-soft)]">
              {series.coverEmoji}
            </div>
            <div className="relative flex flex-1 flex-col p-6 pt-7">
              <h2 className="font-display text-lg font-extrabold leading-snug text-[var(--text)] md:text-xl">
                {series.displayTitle}
              </h2>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)]">
                {series.author}
              </p>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[var(--text-soft)]">
                {series.tagline}
              </p>
              <div className="mt-6 space-y-2">
                {series.chapters.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onSelectChapter(ch.chapter)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-soft)_90%,transparent)] px-4 py-3 text-left text-sm font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] active:scale-[0.99]"
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-center text-[11px] font-medium text-[var(--text-soft)]">
                Vol.1 — thêm chương sau
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
