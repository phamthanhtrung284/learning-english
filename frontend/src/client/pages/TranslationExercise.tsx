"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@share/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

const LEVELS = [
  { id: "beginner",     label: "Beginner",     sub: "A2–B1" },
  { id: "intermediate", label: "Intermediate", sub: "B1–B2" },
  { id: "advanced",     label: "Advanced",     sub: "B2–C1" },
] as const;

const CONTENT_TYPES = [
  { id: "article", label: "Article" },
  { id: "story",   label: "Story"   },
  { id: "diary",   label: "Diary"   },
  { id: "essay",   label: "Essay"   },
] as const;

type Level = (typeof LEVELS)[number]["id"];
type ContentType = (typeof CONTENT_TYPES)[number]["id"];

interface Passage { topic: string; sentences: string[] }

interface FeedbackResult {
  score: number;
  referenceTranslation: string;
  highlightedUserTranslation: string;
  suggestedImprovements: string[];
  overallComment: string;
  grammarErrors: { original: string; correction: string; explanation: string }[];
}

interface SentenceState {
  vi: string;
  userInput: string;
  feedback: FeedbackResult | null;
  passed: boolean;
  attempts: number;
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#27ae60" : score >= 80 ? "#2ecc71" : score >= 65 ? "#f39c12" : "#c0392b";
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-extrabold"
      style={{ background: `${color}22`, color }}
    >
      {score}/100
    </span>
  );
}

// ─── Setup screen ─────────────────────────────────────────────────────────────

function SetupScreen({ level, setLevel, contentType, setContentType, onGenerate, loading, error }: {
  level: Level; setLevel: (l: Level) => void;
  contentType: ContentType; setContentType: (c: ContentType) => void;
  onGenerate: () => void; loading: boolean; error: string;
}) {
  return (
    <div className="animate-fade-rise flex h-full items-center justify-center">
      <div className="w-full max-w-md space-y-7">
        <div className="border-l-2 border-[var(--primary)] pl-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">Translation Practice</p>
          <h1 className="font-display mt-1.5 text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--text)]">
            Translate &amp; Learn
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-soft)]">
            AI generates a Vietnamese passage (150+ words). Translate sentence by sentence and get teacher-level feedback.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/8 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">Level</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button key={l.id} type="button" onClick={() => setLevel(l.id)}
                className={`flex flex-col items-center gap-0.5 rounded-xl border py-3.5 text-center transition-all ${
                  level === l.id
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[color-mix(in_srgb,var(--primary)_25%,transparent)]"
                }`}>
                <span className={`text-sm font-bold ${level === l.id ? "text-[var(--text)]" : "text-[var(--text-soft)]"}`}>{l.label}</span>
                <span className="text-[10px] text-[var(--text-soft)]">{l.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">Content type</p>
          <div className="grid grid-cols-4 gap-2">
            {CONTENT_TYPES.map((c) => (
              <button key={c.id} type="button" onClick={() => setContentType(c.id)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                  contentType === c.id
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--text)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-soft)] hover:border-[color-mix(in_srgb,var(--primary)_25%,transparent)]"
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={onGenerate} disabled={loading}
          className="btn-primary-glow w-full rounded-xl py-3.5 text-[15px] font-bold disabled:opacity-50">
          {loading
            ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Generating…</span>
            : "Generate passage →"}
        </button>
      </div>
    </div>
  );
}

// ─── Feedback panel (right column) ───────────────────────────────────────────

function FeedbackPanel({ fb, onNext, onRetry, isLast }: {
  fb: FeedbackResult | null;
  onNext: () => void;
  onRetry: () => void;
  isLast: boolean;
}) {
  if (!fb) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-soft)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
          </svg>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Feedback</p>
        <p className="text-xs leading-relaxed text-[var(--text-soft)]">
          Translate the highlighted sentence and press Check.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col gap-3 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
    >
      {/* Score + comment */}
      <div className="flex items-start gap-3">
        <ScoreBadge score={fb.score} />
        <p className="flex-1 text-sm leading-relaxed text-[var(--text-soft)]">{fb.overallComment}</p>
      </div>

      {/* Reference */}
      <div className="rounded-xl border border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] px-4 py-3">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">Reference translation</p>
        <p className="text-sm font-medium italic leading-relaxed text-[var(--text)]">&ldquo;{fb.referenceTranslation}&rdquo;</p>
      </div>

      {/* Annotated user translation */}
      {fb.highlightedUserTranslation && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-3">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Your translation</p>
          <p className="text-sm leading-relaxed text-[var(--text)]"
            dangerouslySetInnerHTML={{ __html: fb.highlightedUserTranslation }} />
        </div>
      )}

      {/* Grammar errors */}
      {fb.grammarErrors.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Grammar</p>
          {fb.grammarErrors.map((e, i) => (
            <div key={i} className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2.5">
              <p className="text-xs">
                <span className="line-through text-red-400">{e.original}</span>
                <span className="mx-1.5 text-[var(--text-soft)]">→</span>
                <span className="font-semibold text-green-400">{e.correction}</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-soft)]">{e.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {fb.suggestedImprovements.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Suggestions</p>
          {fb.suggestedImprovements.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--text-soft)]">
              <span className="mt-0.5 shrink-0 text-[var(--primary)]">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {fb.score >= 80 ? (
          <button type="button" onClick={onNext}
            className="btn-primary-glow w-full rounded-xl py-3 text-sm font-bold">
            {isLast ? "Finish passage →" : "Next sentence →"}
          </button>
        ) : (
          <button type="button" onClick={onRetry}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] py-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]">
            Try again — need 80+ (got {fb.score})
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Exercise screen ──────────────────────────────────────────────────────────

function ExerciseScreen({ passage, sentences, currentIdx, onCheck, onNext, onRetry, onNew, onBack, checkingIdx, setSentenceInput }: {
  passage: Passage; sentences: SentenceState[]; currentIdx: number;
  onCheck: () => void; onNext: () => void; onRetry: () => void;
  onNew: () => void; onBack: () => void;
  checkingIdx: number | null;
  setSentenceInput: (idx: number, val: string) => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const current = sentences[currentIdx];
  const passedCount = sentences.filter((s) => s.passed).length;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [currentIdx]);

  return (
    <div className="animate-fade-rise flex h-full flex-col gap-3 overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center gap-3">
        <button type="button" onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">Translation Practice</p>
          <h1 className="font-display text-[15px] font-extrabold leading-tight text-[var(--text)] truncate">{passage.topic}</h1>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold text-[var(--text-soft)]">
          {passedCount}/{sentences.length}
        </span>
        <button type="button" onClick={onNew}
          className="h-9 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 text-xs font-bold text-[var(--text-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]">
          New
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-[3px] w-full shrink-0 overflow-hidden rounded-full bg-[var(--border)]">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(passedCount / sentences.length) * 100}%`, background: "var(--gradient-primary)" }} />
      </div>

      {/* ── Sentence dots ── */}
      <div className="flex shrink-0 gap-1">
        {sentences.map((s, i) => (
          <div key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              s.passed ? "bg-green-500" : i === currentIdx ? "bg-[var(--primary)]" : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>

      {/* ── Main two-column area ── */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        {/* Left column */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {/* Full passage */}
          <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--text-soft)]">Translate to English</p>
            <p className="text-[16px] leading-[1.95] text-[var(--text)]">
              {sentences.map((s, i) => (
                <span key={i} className={`transition-all duration-200 ${
                  i === currentIdx
                    ? "rounded bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-0.5 font-semibold text-[var(--text)] underline decoration-[var(--primary)] decoration-2 underline-offset-[5px]"
                    : s.passed
                    ? "text-[var(--text-soft)] opacity-50 line-through decoration-green-500/40"
                    : "text-[var(--text-soft)]"
                }`}>
                  {s.vi}{i < sentences.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </div>

          {/* Input */}
          {!current?.passed && (
            <div className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--text-soft)]">
                Sentence {currentIdx + 1} of {sentences.length}
              </p>
              <textarea
                ref={inputRef}
                value={current?.userInput ?? ""}
                onChange={(e) => setSentenceInput(currentIdx, e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onCheck(); }
                }}
                placeholder="Type your English translation of the highlighted sentence…"
                rows={3}
                className="input-magic w-full resize-none text-[15px]"
                disabled={checkingIdx !== null}
              />
              <div className="flex items-center gap-3">
                <button type="button" onClick={onCheck}
                  disabled={checkingIdx !== null || !current?.userInput.trim()}
                  className="btn-primary-glow rounded-xl px-7 py-2.5 text-sm font-bold disabled:opacity-40">
                  {checkingIdx === currentIdx
                    ? <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Checking…</span>
                    : "Check"}
                </button>
                <span className="text-[10px] text-[var(--text-soft)]">⌘Enter to check</span>
              </div>
            </div>
          )}
        </div>

        {/* Right column — feedback */}
        <div className="hidden w-[min(380px,38%)] shrink-0 min-h-0 lg:block">
          <AnimatePresence mode="wait">
            <FeedbackPanel
              key={currentIdx + (current?.feedback ? "-fb" : "-empty")}
              fb={current?.feedback ?? null}
              onNext={onNext}
              onRetry={onRetry}
              isLast={currentIdx === sentences.length - 1}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile feedback (below input on small screens) */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          {current?.feedback && (
            <FeedbackPanel
              key={currentIdx + "-mobile"}
              fb={current.feedback}
              onNext={onNext}
              onRetry={onRetry}
              isLast={currentIdx === sentences.length - 1}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function TranslationExercise() {
  const [level, setLevel] = useState<Level>("intermediate");
  const [contentType, setContentType] = useState<ContentType>("article");
  const [passage, setPassage] = useState<Passage | null>(null);
  const [sentences, setSentences] = useState<SentenceState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [usedTopics, setUsedTopics] = useState<string[]>([]);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [checkingIdx, setCheckingIdx] = useState<number | null>(null);
  const [passageError, setPassageError] = useState("");

  const allDone = passage !== null && sentences.length > 0 && sentences.every((s) => s.passed);

  const loadPassage = useCallback(async () => {
    setLoadingPassage(true);
    setPassageError("");
    setPassage(null);
    setSentences([]);
    setCurrentIdx(0);
    try {
      const { data } = await api.post("/sentences/generate-passage", { level, contentType, usedTopics });
      const p: Passage = { topic: data.topic, sentences: data.sentences };
      setPassage(p);
      setSentences(p.sentences.map((vi) => ({ vi, userInput: "", feedback: null, passed: false, attempts: 0 })));
      setUsedTopics((prev) => [...prev, data.topic].slice(-20));
    } catch (err: unknown) {
      setPassageError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to generate passage. Please try again."
      );
    } finally {
      setLoadingPassage(false);
    }
  }, [level, contentType, usedTopics]);

  const handleCheck = async () => {
    const current = sentences[currentIdx];
    if (!current || checkingIdx !== null) return;
    const trimmed = current.userInput.trim();
    if (!trimmed) return;
    setCheckingIdx(currentIdx);
    try {
      const { data } = await api.post("/sentences/translate-check", {
        vietnameseSentence: current.vi,
        userTranslation: trimmed,
      });
      const fb: FeedbackResult = {
        score: data.score ?? 0,
        referenceTranslation: data.referenceTranslation ?? "",
        highlightedUserTranslation: data.highlightedUserTranslation ?? trimmed,
        suggestedImprovements: data.suggestedImprovements ?? [],
        overallComment: data.overallComment ?? "",
        grammarErrors: data.grammarErrors ?? [],
      };
      setSentences((prev) =>
        prev.map((s, i) => i === currentIdx ? { ...s, feedback: fb, passed: fb.score >= 80, attempts: s.attempts + 1 } : s)
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Check failed.";
      setSentences((prev) =>
        prev.map((s, i) => i === currentIdx ? {
          ...s,
          feedback: { score: 0, referenceTranslation: "", highlightedUserTranslation: "", suggestedImprovements: [], overallComment: msg, grammarErrors: [] },
          attempts: s.attempts + 1,
        } : s)
      );
    } finally {
      setCheckingIdx(null);
    }
  };

  const setSentenceInput = (idx: number, val: string) =>
    setSentences((prev) => prev.map((s, i) => i === idx ? { ...s, userInput: val } : s));

  if (!passage && !loadingPassage) {
    return (
      <SetupScreen
        level={level} setLevel={setLevel}
        contentType={contentType} setContentType={setContentType}
        onGenerate={loadPassage} loading={loadingPassage} error={passageError}
      />
    );
  }

  if (loadingPassage) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <p className="text-sm text-[var(--text-soft)]">Generating passage…</p>
      </div>
    );
  }

  if (allDone) {
    const avg = Math.round(sentences.reduce((s, x) => s + (x.feedback?.score ?? 0), 0) / sentences.length);
    return (
      <div className="animate-fade-rise flex h-full flex-col items-center justify-center gap-6">
        <div className="text-center space-y-3">
          <p className="text-5xl">🎉</p>
          <h2 className="font-display text-2xl font-extrabold text-[var(--text)]">Passage complete!</h2>
          <p className="text-sm text-[var(--text-soft)]">
            Average score: <span className="font-bold text-[var(--text)]">{avg}/100</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={loadPassage}
            className="btn-primary-glow rounded-xl px-7 py-3 text-sm font-bold">
            New passage →
          </button>
          <button type="button" onClick={() => { setPassage(null); setSentences([]); }}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-7 py-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]">
            Change settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExerciseScreen
      passage={passage!}
      sentences={sentences}
      currentIdx={currentIdx}
      onCheck={handleCheck}
      onNext={() => { if (currentIdx < sentences.length - 1) setCurrentIdx((i) => i + 1); }}
      onRetry={() => setSentences((prev) => prev.map((s, i) => i === currentIdx ? { ...s, userInput: "", feedback: null } : s))}
      onNew={loadPassage}
      onBack={() => { setPassage(null); setSentences([]); }}
      checkingIdx={checkingIdx}
      setSentenceInput={setSentenceInput}
    />
  );
}
