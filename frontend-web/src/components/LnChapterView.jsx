import { useCallback, useState } from "react";
import InteractiveWord from "./InteractiveWord";
import { LnCursorTooltipProvider } from "./LnCursorTooltipProvider";
import { LN_COMMON_GLOSS } from "../data/lnCommonGloss";
import { segmentLnParagraph } from "../utils/segmentLnParagraph";
import { splitParagraphToSentences } from "../utils/splitParagraphToSentences";
import api from "../services/api";

const GRAMMAR_UNDERLINE = {
  sky: "decoration-sky-400/75 underline decoration-2 underline-offset-[5px]",
  rose: "decoration-rose-400/75 underline decoration-2 underline-offset-[5px]",
  amber: "decoration-amber-500/80 underline decoration-2 underline-offset-[5px]",
  emerald: "decoration-emerald-500/75 underline decoration-2 underline-offset-[5px]",
  violet: "decoration-violet-400/80 underline decoration-2 underline-offset-[5px]",
  slate: "decoration-slate-400/65 underline decoration-2 underline-offset-[5px]",
};

export default function LnChapterView({
  chapter,
  zenMode = false,
  nightMode = false,
  scrollerRef = null,
}) {
  const glossary = chapter.glossary || {};

  const [grammarByKey, setGrammarByKey] = useState({});
  const [grammarLoadingKey, setGrammarLoadingKey] = useState(null);
  const [grammarError, setGrammarError] = useState(null);

  const [page, setPage] = useState(0);
  const PARAGRAPHS_PER_PAGE = 50;
  const totalPages = Math.ceil((chapter.paragraphs?.length || 0) / PARAGRAPHS_PER_PAGE);
  const currentParagraphs = (chapter.paragraphs || []).slice(page * PARAGRAPHS_PER_PAGE, (page + 1) * PARAGRAPHS_PER_PAGE);

  const runGrammar = useCallback(async (sentenceText, sentenceKey) => {
    const trimmed = sentenceText.trim();
    if (!trimmed) return;
    setGrammarError(null);
    setGrammarLoadingKey(sentenceKey);
    try {
      const { data } = await api.post("/sentences/grammar", { sentence: trimmed });
      const words = Array.isArray(data.words) ? data.words : [];
      setGrammarByKey((prev) => ({ ...prev, [sentenceKey]: words }));
    } catch (e) {
      setGrammarError(
        e?.response?.data?.error || e?.message || "Grammar analysis failed"
      );
    } finally {
      setGrammarLoadingKey(null);
    }
  }, []);

  const zenText = zenMode
    ? nightMode
      ? "ln-zen-text-night"
      : "ln-zen-text-day"
    : "text-[var(--text)]";

  return (
    <article className="relative overflow-visible rounded-2xl bg-transparent px-1 py-2 shadow-none sm:px-2">
      {chapter.source && !zenMode && (
        <header className="ln-studio-ui mb-8 rounded-[22px] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 text-sm text-[var(--text-soft)] shadow-[var(--shadow-soft)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-soft)]">
            Source &amp; license
          </div>
          <div className="mt-2">
            {chapter.source.url ? (
              <a
                href={chapter.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[var(--primary)] underline decoration-[color-mix(in_srgb,var(--primary)_40%,transparent)] underline-offset-2 transition hover:opacity-90"
              >
                {chapter.source.name}
              </a>
            ) : (
              <span className="text-[var(--text)]">{chapter.source.name}</span>
            )}
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-soft)]">
              {chapter.source.license}
            </p>
          </div>
        </header>
      )}

      {!zenMode && (
        <>
          <div className="mx-auto max-w-[820px] text-center">
            <div className="ln-studio-ui text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-soft)]">
              {chapter.readerTitle}
            </div>
            <h1 className="font-ln-studio mt-3 text-[clamp(1.75rem,3.2vw,2.6rem)] font-semibold tracking-tight text-[var(--text)]">
              {chapter.chapterTitle}
            </h1>
          </div>
          {chapter.authorLine && (
            <p className="ln-studio-ui mt-3 text-center text-sm text-[var(--text-soft)]">
              {chapter.authorLine}
            </p>
          )}
          {chapter.blurb && (
            <div className="mx-auto mt-8 max-w-[760px] rounded-[22px] border border-[var(--border)] bg-[var(--bg-card)] px-6 py-5 shadow-[var(--shadow-soft)]">
              <p className="font-ln-studio text-[15px] italic leading-relaxed text-[var(--text-soft)]">
                {chapter.blurb}
              </p>
            </div>
          )}
        </>
      )}

      {grammarError && !zenMode && (
        <div
          className="ln-studio-ui mt-6 rounded-[18px] border border-red-400/35 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-4 py-3 text-sm text-red-800 dark:text-red-100"
          role="status"
        >
          {grammarError}
        </div>
      )}

      <LnCursorTooltipProvider>
        <div className={zenMode ? "mt-6 space-y-8 md:space-y-10" : "mt-12 space-y-10 md:space-y-14"}>
          {currentParagraphs.map((p, offsetIndex) => {
          const pi = page * PARAGRAPHS_PER_PAGE + offsetIndex;
          const sentences = splitParagraphToSentences(p.en);
          return (
            <section key={pi} className="overflow-visible">
              {sentences.map((sentenceText, si) => {
                const sentenceKey = `p${pi}-s${si}`;
                const segs = segmentLnParagraph(sentenceText, glossary, LN_COMMON_GLOSS);
                const grammarRow = grammarByKey[sentenceKey];
                let wordIndex = 0;

                return (
                  <p
                    key={sentenceKey}
                    className={`font-ln-studio mb-6 overflow-visible whitespace-pre-wrap text-[clamp(18px,1.6vw,22px)] leading-[1.9] last:mb-0 md:mb-9 ${zenText}`}
                  >
                    <span
                      className={`ln-sentence-wrap rounded-sm outline-none transition-colors ${
                        zenMode
                          ? nightMode
                            ? "hover:bg-white/5"
                            : "hover:bg-amber-900/5"
                          : "hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
                      }`}
                      onDoubleClick={(e) => {
                        runGrammar(sentenceText, sentenceKey);
                      }}
                      title="Double-click for grammar colors"
                    >
                      {segs.map((seg, j) => {
                        if (seg.type === "word") {
                          const g = grammarRow?.[wordIndex];
                          const u = GRAMMAR_UNDERLINE[g?.style] || "";
                          const t = g?.role
                            ? `${g.role} · double-click sentence for grammar`
                            : "Tap word · double-click sentence for grammar";
                          wordIndex += 1;
                          return (
                            <InteractiveWord
                              key={`${sentenceKey}-w-${j}`}
                              wordData={seg.wordData}
                              contextParagraph={sentenceText}
                              tooltipAnchor="cursor"
                              grammarUnderlineClass={u}
                              grammarTitle={t}
                            />
                          );
                        }
                        return (
                          <span key={`${sentenceKey}-p-${j}`}>{seg.text}</span>
                        );
                      })}
                    </span>
                    {grammarLoadingKey === sentenceKey ? (
                      <span className="ln-studio-ui ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--primary)] align-middle" />
                    ) : null}
                  </p>
                );
              })}
            </section>
          );
        })}
        </div>

        {totalPages > 1 && (
          <div className="mt-16 flex flex-wrap items-center justify-center gap-4 border-t border-[var(--border)] pt-8">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => {
                setPage(p => Math.max(0, p - 1));
                const el = scrollerRef?.current;
                if (el) el.scrollTo({ top: 0, behavior: "smooth" });
                else window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="glass-btn h-12 px-6 text-[15px] font-bold disabled:opacity-30"
            >
              ← Trang trước
            </button>
            <span className="font-display text-base font-bold text-[var(--text-soft)]">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => {
                setPage(p => p + 1);
                const el = scrollerRef?.current;
                if (el) el.scrollTo({ top: 0, behavior: "smooth" });
                else window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="glass-btn h-12 px-6 text-[15px] font-bold disabled:opacity-30"
            >
              Trang sau →
            </button>
          </div>
        )}
      </LnCursorTooltipProvider>
    </article>
  );
}
