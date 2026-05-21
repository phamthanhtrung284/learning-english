import { useCallback, useEffect, useRef, useState } from "react";
import { WEB_LIGHT_NOVEL_SERIES } from "../data/chapters/index.js";
import LnChapterView from "./LnChapterView";
import api from "../services/api";
import {
  buildQuizletImportText,
  exportVocabularyAnkiTsv,
  exportVocabularyCsv,
} from "../utils/vocabularyExport";

// ── Poster card (Netflix style) ───────────────────────────────────────────────
function SeriesPoster({ series, openingChapterId, onSelectChapter, setOpeningChapterId }) {
  const [hover, setHover] = useState(false);
  const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

  const coverSrc = series.coverImage
    ? `${BACKEND}${series.coverImage}`
    : null;

  const openFirstChapter = async () => {
    const ch = series.chapters?.[0];
    if (!ch) return;
    if (ch.chapter) return onSelectChapter(ch.chapter);
    if (!ch.chapterId) return;
    try {
      setOpeningChapterId(ch.chapterId);
      const { data } = await api.get(`/library/chapters/${ch.chapterId}`);
      onSelectChapter(data);
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || "Không mở được chapter");
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
      {/* Poster image */}
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
          /* Fallback gradient + emoji khi chưa có ảnh */
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${series.accent || "from-slate-600 to-slate-800"}`}>
            <span className="text-4xl">{series.coverEmoji || "📚"}</span>
          </div>
        )}

        {/* Overlay khi hover */}
        <div
          className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200"
          style={{ opacity: hover ? 1 : 0 }}
        >
          <div className="w-full p-3">
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-white/90 py-1.5 text-xs font-bold text-black">
              {isLoading ? "Đang mở…" : "▶ Đọc ngay"}
            </div>
          </div>
        </div>

        {/* Badge số chapter */}
        {series.chapters?.length > 0 && (
          <div className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {series.chapters.length} ch.
          </div>
        )}
      </div>

      {/* Tên bên dưới */}
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

export default function LightNovelLibrary({
  chapter,
  onSelectChapter,
  zenMode = false,
  onZenModeChange,
  nightMode = false,
}) {
  const [vocabWords, setVocabWords] = useState([]);
  const [remoteSeries, setRemoteSeries] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");
  const [openingChapterId, setOpeningChapterId] = useState(null);
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
    let cancelled = false;
    setRemoteLoading(true);
    setRemoteError("");
    void (async () => {
      try {
        const { data } = await api.get("/library/series");
        if (!cancelled) setRemoteSeries(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setRemoteError(
            e?.response?.data?.error || e?.message || "Không tải được truyện từ server"
          );
          setRemoteSeries([]);
        }
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        <div className={`relative flex min-h-0 flex-1 flex-col px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-6 ${zenMode ? "pb-0" : "pb-3 sm:pb-4 md:pb-6"}`}>
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
                        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-[var(--shadow-card)]">
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-soft)]"
                            onClick={() => handleExport("csv")}
                          >
                            CSV
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-soft)]"
                            onClick={() => handleExport("anki")}
                          >
                            Anki (.txt)
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-soft)]"
                            onClick={() => handleExport("quizlet")}
                          >
                            Copy Quizlet
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-soft)]">
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
              <div className="mx-auto w-full max-w-[840px] px-3 py-8 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 md:py-10 md:pb-10">
                <LnChapterView chapter={chapter} zenMode={zenMode} nightMode={nightMode} scrollerRef={scrollerRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const seriesList = [
    // server series trước
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
    // fallback hardcode
    ...WEB_LIGHT_NOVEL_SERIES,
  ];

  return (
    <div className="ln-studio ln-studio-ui mx-auto w-full max-w-6xl px-4 pb-16 pt-6 text-[var(--text)] sm:px-8 md:px-10 md:pt-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Reading</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
          Light novel library
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--text-soft)]">
          Hover a word to see meaning. Double-click a sentence to highlight grammar lightly.
        </p>
        {remoteLoading && (
          <p className="mt-2 text-xs font-semibold text-[var(--text-soft)]">Đang tải…</p>
        )}
        {remoteError && (
          <p className="mt-2 text-xs font-semibold text-red-400">{remoteError}</p>
        )}
      </header>

      {/* Poster grid — kiểu Netflix */}
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
