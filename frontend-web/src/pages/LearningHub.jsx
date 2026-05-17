import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { IconBook, IconNotebook, IconSparkles } from "../components/Icons";

export default function LearningHub({ onNavigate, profile = {} }) {
  const [wordCount, setWordCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void (async () => {
        try {
          const { data } = await api.get("/vocabulary/list");
          if (!cancelled && Array.isArray(data)) setWordCount(data.length);
        } catch {
          if (!cancelled) setWordCount(null);
        }
      })();
    };
    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(load, { timeout: 2500 })
        : setTimeout(load, 1);
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  const displayName =
    profile?.username?.trim() ||
    profile?.email?.split("@")[0] ||
    "Reader";

  const cards = useMemo(() => {
    const savedLabel =
      wordCount != null ? `${wordCount} saved words` : "Saved words";

    return [
      {
        key: "sentence",
        title: "Analyze a sentence",
        body: "Paste an English sentence and get word-by-word meaning.",
        action: () => onNavigate("sentence"),
        cta: "Open",
        icon: IconSparkles,
        meta: "Fast",
      },
      {
        key: "story",
        title: "Read (Light Novel)",
        body: "Read chapters. Hover words for meaning and save what you need.",
        action: () => onNavigate("story"),
        cta: "Open",
        icon: IconBook,
        meta: "Focus",
      },
      {
        key: "notebook",
        title: "Vocabulary notebook",
        body: "Your saved words from reading and analysis.",
        action: () => onNavigate("notebook"),
        cta: "Open",
        icon: IconNotebook,
        meta: savedLabel,
      },
    ];
  }, [onNavigate, wordCount]);

  return (
    <div className="animate-fade-rise space-y-6 pb-8 md:space-y-8">
      <header className="surface-panel p-6 md:p-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)] md:text-3xl">
          Welcome, {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-soft)] md:text-[15px]">
          Choose one activity to start learning.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate("sentence")}
            className="min-h-[44px] rounded-2xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-soft)] transition hover:brightness-110 active:scale-[0.99]"
          >
            Analyze a sentence
          </button>
          <button
            type="button"
            onClick={() => onNavigate("story")}
            className="min-h-[44px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-bold text-[var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)] active:scale-[0.99]"
          >
            Read
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <article key={c.key} className="surface-panel p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-base font-extrabold tracking-tight text-[var(--text)]">
                  <span
                    className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-card)_75%,transparent)] text-[16px] text-[var(--text)]"
                    aria-hidden
                  >
                    <c.icon />
                  </span>
                  {c.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-soft)]">
                  {c.body}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[var(--text-soft)]">{c.meta}</span>
              <button
                type="button"
                onClick={c.action}
                className="min-h-[40px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-bold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)] active:scale-[0.99]"
              >
                {c.cta}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
