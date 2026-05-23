import { useState, useCallback, useEffect } from "react";
import api from "../services/api";
import { speak } from "../utils/speak";

// ── Config ────────────────────────────────────────────────────────────────────
const LEVELS = [
  { id: "beginner",     label: "Beginner",     sub: "Simple sentences & everyday vocabulary" },
  { id: "intermediate", label: "Intermediate", sub: "Mixed grammar, varied vocabulary" },
  { id: "advanced",     label: "Advanced",     sub: "Complex structures, TOEIC 900+" },
];

const CONTENT_TYPES = [
  { id: "diary",   label: "Diary",   icon: "📔", desc: "Personal reflections & feelings" },
  { id: "essay",   label: "Essay",   icon: "✍️", desc: "Opinion & argumentative writing" },
  { id: "article", label: "Article", icon: "📰", desc: "News & magazine content" },
  { id: "story",   label: "Story",   icon: "📖", desc: "Short stories & narratives" },
];

const PASS_SCORE = 80;

// ── Helpers ───────────────────────────────────────────────────────────────────

function HighlightExample({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span className="italic text-[var(--text-soft)]">
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-bold not-italic text-[var(--primary)]">{p}</strong>
          : p
      )}
    </span>
  );
}

const TYPE_COLOR = {
  word:        "bg-[var(--bg-soft)] text-[var(--text-soft)]",
  phrase:      "bg-blue-500/15 text-blue-400",
  idiom:       "bg-purple-500/15 text-purple-400",
  collocation: "bg-amber-500/15 text-amber-400",
};

// ── Level + Type selector screen ──────────────────────────────────────────────
function SelectScreen({ onStart }) {
  const [level, setLevel] = useState("intermediate");
  const [type, setType]   = useState(null);

  const levelMeta = {
    beginner:     { bar: "w-1/3",  color: "bg-green-500" },
    intermediate: { bar: "w-2/3",  color: "bg-amber-500" },
    advanced:     { bar: "w-full", color: "bg-[var(--primary)]" },
  };

  return (
    <div className="animate-fade-rise flex h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl space-y-10">

        {/* Header */}
        <div className="border-l-2 border-[var(--primary)] pl-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Translation Practice</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Vietnamese → English
          </h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Choose your level and content type. AI generates a new passage every time.
          </p>
        </div>

        {/* Level */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Level</p>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l.id} type="button" onClick={() => setLevel(l.id)}
                className={`flex-1 rounded-xl border py-3 text-center transition-all ${
                  level === l.id
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
                }`}>
                <p className={`text-sm font-bold ${level === l.id ? "text-[var(--text)]" : "text-[var(--text-soft)]"}`}>{l.label}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-soft)]">
            <div className={`h-full rounded-full transition-all duration-300 ${levelMeta[level].bar} ${levelMeta[level].color}`} />
          </div>
          <p className="mt-1.5 text-xs text-[var(--text-soft)]">{LEVELS.find(l => l.id === level)?.sub}</p>
        </div>

        {/* Content type */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Content Type</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONTENT_TYPES.map(t => (
              <button key={t.id} type="button" onClick={() => setType(t.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all ${
                  type === t.id
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[color-mix(in_srgb,var(--primary)_25%,transparent)]"
                }`}>
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${type === t.id ? "text-[var(--text)]" : "text-[var(--text-soft)]"}`}>{t.label}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-soft)]">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button type="button"
          disabled={!level || !type}
          onClick={() => onStart(level, type)}
          className="btn-primary-glow w-full rounded-xl py-3.5 text-[15px] font-bold disabled:pointer-events-none disabled:opacity-35">
          {type
            ? `Start · ${LEVELS.find(l=>l.id===level)?.label} · ${CONTENT_TYPES.find(t=>t.id===type)?.label}`
            : "Select a content type to continue"}
        </button>
      </div>
    </div>
  );
}

// ── Dictionary panel ──────────────────────────────────────────────────────────
function DictionaryPanel({ items, loading, onSave }) {
  const [saved, setSaved] = useState(new Set());

  const handleSave = async (item, i) => {
    await onSave(item);
    setSaved(s => new Set([...s, i]));
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3,4,5].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--bg-soft)]" />)}
    </div>
  );
  if (!items.length) return (
    <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">Loading vocabulary…</div>
  );
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="font-bold text-[15px] text-[var(--text)]">{item.word}</span>
              <button type="button" onClick={() => speak(item.word)} className="text-[var(--text-soft)] hover:text-[var(--text)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 1.5 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796a.75.75 0 0 0 1.264-.546V3.75ZM16.45 5.05a.75.75 0 0 0-1.06 1.06 5.5 5.5 0 0 1 0 7.78.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.9Z" />
                </svg>
              </button>
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${TYPE_COLOR[item.type] || TYPE_COLOR.word}`}>
                {item.type}
              </span>
            </div>
            <button type="button"
              onClick={() => !saved.has(i) && handleSave(item, i)}
              className={`shrink-0 text-xs font-bold transition whitespace-nowrap ${
                saved.has(i)
                  ? "text-green-400 cursor-default"
                  : "text-[var(--primary)] hover:opacity-75"
              }`}>
              {saved.has(i) ? "✓ Saved" : "+ Save"}
            </button>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-soft)]">
            <span className="font-semibold text-[var(--text)]">Meaning:</span> {item.meaning}
          </p>
          <p className="mt-0.5 text-sm"><HighlightExample text={item.example} /></p>
        </div>
      ))}
    </div>
  );
}

// ── Feedback panel ────────────────────────────────────────────────────────────
function FeedbackPanel({ result, loading }) {
  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--bg-soft)]" />)}
    </div>
  );
  if (!result) return (
    <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">Nộp bài để xem feedback</div>
  );

  const passed = result.score >= PASS_SCORE;
  const color  = result.score >= 85 ? "#27ae60" : result.score >= 65 ? "#f39c12" : "#c0392b";
  const r = 22, circ = 2 * Math.PI * r, dash = (result.score / 100) * circ;

  return (
    <div className="space-y-3">

      {/* Score row */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <svg width="56" height="56" className="-rotate-90">
            <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s ease" }} />
          </svg>
          <span className="absolute text-sm font-extrabold" style={{ color }}>{result.score}</span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-soft)]">
            {result.score >= 85 ? "Xuất sắc" : result.score >= PASS_SCORE ? "Đạt yêu cầu" : "Cần cải thiện"}
          </p>
          {!passed && (
            <p className="mt-0.5 text-xs font-semibold text-red-400">Cần đạt {PASS_SCORE}+ để qua câu tiếp.</p>
          )}
        </div>
      </div>

      {/* Suggestion — nổi bật như web tham khảo */}
      {result.suggestion && (
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] px-3 py-2.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary)] mb-1">Suggestion</p>
          <p className="text-sm leading-relaxed text-[var(--text)]">{result.suggestion}</p>
        </div>
      )}

      {/* Highlighted user translation */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2.5">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Bản dịch của bạn</p>
        <p className="text-sm leading-relaxed text-[var(--text)]
          [&_mark.correct]:rounded [&_mark.correct]:bg-green-500/20 [&_mark.correct]:px-0.5 [&_mark.correct]:text-green-400
          [&_mark.wrong]:rounded [&_mark.wrong]:bg-red-500/20 [&_mark.wrong]:px-0.5 [&_mark.wrong]:text-red-400 [&_mark.wrong]:line-through"
          dangerouslySetInnerHTML={{ __html: result.highlightedUserTranslation }} />
      </div>

      {/* Suggested improvements — chi tiết */}
      {(result.suggestedImprovements || result.suggestions)?.length > 0 && (
        <div>
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Suggested improvements</p>
          <ul className="space-y-2">
            {(result.suggestedImprovements || result.suggestions).map((s, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                <span className="mt-0.5 shrink-0 text-[var(--primary)] font-bold">•</span>
                <span className="text-xs leading-relaxed text-[var(--text-soft)]"
                  dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--text)]">$1</strong>') }} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grammar errors */}
      {result.grammarErrors?.length > 0 && (
        <div>
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Lỗi ngữ pháp</p>
          <div className="space-y-2">
            {result.grammarErrors.map((err, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="rounded bg-red-500/15 px-1.5 py-0.5 font-mono text-red-400 line-through">{err.original}</span>
                  <span className="text-[var(--text-soft)]">→</span>
                  <span className="rounded bg-green-500/15 px-1.5 py-0.5 font-mono text-green-400">{err.correction}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-soft)]">{err.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reference */}
      <div className="rounded-xl border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] px-3 py-2.5">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">Bản dịch tham khảo</p>
        <p className="text-sm leading-relaxed text-[var(--text)]">{result.referenceTranslation}</p>
      </div>

      {/* Overall comment — cuối cùng như thầy giáo tổng kết */}
      {result.overallComment && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2.5">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Nhận xét</p>
          <p className="text-sm leading-relaxed text-[var(--text)]">{result.overallComment}</p>
        </div>
      )}
    </div>
  );
}

// ── Practice screen ───────────────────────────────────────────────────────────
function PracticeScreen({ level, contentType, onBack }) {
  const [passage, setPassage]           = useState(null);
  const [passageLoading, setPassageLoading] = useState(true);
  const [sentenceIdx, setSentenceIdx]   = useState(0);
  const [userInput, setUserInput]       = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [feedback, setFeedback]         = useState(null);
  const [error, setError]               = useState("");
  const [attempts, setAttempts]         = useState(0);
  const [rightTab, setRightTab]         = useState("feedback");
  const [dictItems, setDictItems]       = useState([]);
  const [dictLoading, setDictLoading]   = useState(false);
  const [usedTopics, setUsedTopics]     = useState([]);
  const [passageCount, setPassageCount] = useState(1);

  const loadPassage = useCallback(async (topics) => {
    setPassageLoading(true);
    setPassage(null);
    setSentenceIdx(0);
    setUserInput("");
    setFeedback(null);
    setError("");
    setAttempts(0);
    setDictItems([]);
    try {
      const { data } = await api.post("/sentences/generate-passage", {
        level, contentType, usedTopics: topics,
      });
      setPassage(data);
      setDictLoading(true);
      api.post("/sentences/dictionary", { passage: data.sentences.join(" ") })
        .then(({ data: d }) => setDictItems(Array.isArray(d.items) ? d.items : []))
        .catch(() => {})
        .finally(() => setDictLoading(false));
    } catch (e) {
      setError(e?.response?.data?.error || "Không tải được đoạn văn.");
    } finally {
      setPassageLoading(false);
    }
  }, [level, contentType]);

  useEffect(() => { loadPassage([]); }, []);

  const handleSubmit = async () => {
    if (!userInput.trim() || checkLoading || !passage) return;
    setCheckLoading(true);
    setError("");
    setFeedback(null);
    setRightTab("feedback");
    try {
      const { data } = await api.post("/sentences/translate-check", {
        vietnameseSentence: passage.sentences[sentenceIdx],
        userTranslation: userInput.trim(),
      });
      setFeedback(data);
      setAttempts(a => a + 1);
    } catch (e) {
      setError(e?.response?.data?.error || "Có lỗi xảy ra.");
    } finally {
      setCheckLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (!feedback || feedback.score < PASS_SCORE) return;
    const isLast = sentenceIdx === (passage?.sentences?.length ?? 0) - 1;
    if (isLast) {
      const newTopics = [...usedTopics, passage.topic];
      setUsedTopics(newTopics);
      setPassageCount(c => c + 1);
      loadPassage(newTopics);
    } else {
      setSentenceIdx(i => i + 1);
      setUserInput("");
      setFeedback(null);
      setError("");
      setAttempts(0);
    }
  }, [feedback, sentenceIdx, passage, usedTopics, loadPassage]);

  const handleRetry = () => { setUserInput(""); setFeedback(null); setError(""); };

  const handleSaveWord = async (item) => {
    try {
      await api.post("/vocabulary/save", { word: item.word, meaning: item.meaning, ipa: "", type: item.type, explanation: item.example });
    } catch {}
  };

  const sentences  = passage?.sentences || [];
  const isLast     = sentenceIdx === sentences.length - 1;
  const passed     = feedback && feedback.score >= PASS_SCORE;
  const levelLabel = LEVELS.find(l => l.id === level)?.label || level;
  const typeLabel  = CONTENT_TYPES.find(t => t.id === contentType)?.label || contentType;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center gap-4 pb-3">
        <button type="button" onClick={onBack}
          className="glass-btn h-8 w-8 shrink-0 text-sm font-bold text-[var(--text-soft)]">←</button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display truncate text-base font-extrabold text-[var(--text)]">
              {passageLoading ? "Đang tạo đoạn văn…" : (passage?.topic || "…")}
            </h1>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--text-soft)]">
              {levelLabel} · {typeLabel}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            {/* Progress dots */}
            <div className="flex gap-1">
              {sentences.map((_, i) => (
                <span key={i} className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
                  i < sentenceIdx ? "w-4 bg-[var(--primary)] opacity-40"
                  : i === sentenceIdx ? "w-6 bg-[var(--primary)]"
                  : "w-1.5 bg-[var(--border)]"
                }`} />
              ))}
            </div>
            <span className="text-[10px] text-[var(--text-soft)]">
              Đoạn {passageCount} · Câu {sentences.length ? sentenceIdx + 1 : "-"}/{sentences.length || "-"}
            </span>
          </div>
        </div>
        <button type="button"
          onClick={() => { const t=[...usedTopics,passage?.topic].filter(Boolean); setUsedTopics(t); setPassageCount(c=>c+1); loadPassage(t); }}
          disabled={passageLoading}
          className="glass-btn shrink-0 h-8 px-3 text-xs font-bold text-[var(--text-soft)] disabled:opacity-40">
          Đoạn mới ↻
        </button>
      </div>

      {/* ── 2-col body ── */}
      <div className="flex min-h-0 flex-1 gap-4">

        {/* LEFT — passage + input */}
        <div className="flex min-h-0 w-[52%] shrink-0 flex-col gap-3">

          {/* Passage block */}
          <div className="glass-frame min-h-0 flex-1 overflow-y-auto p-5">
            {passageLoading ? (
              <div className="space-y-4">
                {[80,65,90,70,55].map((w,i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-[var(--bg-soft)]" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <p className="leading-[2] text-[15px]">
                {sentences.map((s, i) => (
                  <span key={i}>
                    <span className={`transition-all duration-200 ${
                      i === sentenceIdx
                        ? "font-semibold text-[var(--text)]"
                        : i < sentenceIdx
                          ? "text-[var(--text-soft)] opacity-40"
                          : "text-[var(--text-soft)] opacity-55"
                    }`}>{s}</span>
                    {i < sentences.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Input area */}
          <div className="shrink-0 space-y-2">
            <textarea
              className="textarea-analyzer w-full resize-none text-[15px]"
              rows={3}
              placeholder="Dịch câu đang sáng sang tiếng Anh…"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              disabled={checkLoading || Boolean(feedback) || passageLoading}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex items-center gap-2">
              {!feedback ? (
                <button type="button" onClick={handleSubmit}
                  disabled={checkLoading || !userInput.trim() || passageLoading}
                  className="btn-primary-glow rounded-xl px-6 py-2.5 text-sm font-bold disabled:pointer-events-none disabled:opacity-40">
                  {checkLoading ? "Đang chấm…" : "Submit"}
                </button>
              ) : passed ? (
                <button type="button" onClick={handleNext}
                  className="btn-primary-glow rounded-xl px-6 py-2.5 text-sm font-bold">
                  {isLast ? "Đoạn tiếp →" : "Câu tiếp →"}
                </button>
              ) : (
                <button type="button" onClick={handleRetry}
                  className="glass-btn h-10 px-5 text-sm font-bold text-[var(--text)]">
                  Thử lại ↺
                </button>
              )}
              {attempts > 0 && !passed && feedback && (
                <span className="text-xs text-[var(--text-soft)]">Lần {attempts}</span>
              )}
              <button type="button" onClick={() => setRightTab(t => t === "dictionary" ? "feedback" : "dictionary")}
                className={`ml-auto glass-btn h-9 px-3 text-xs font-semibold transition ${rightTab === "dictionary" ? "border-[color-mix(in_srgb,var(--primary)_40%,transparent)] text-[var(--text)]" : "text-[var(--text-soft)]"}`}>
                📖 Dict
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — feedback / dictionary */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Tab strip */}
          <div className="mb-3 flex shrink-0 items-center gap-1 border-b border-[var(--border)] pb-2">
            {[{ id:"feedback", label:"Feedback" }, { id:"dictionary", label:"Dictionary" }].map(t => (
              <button key={t.id} type="button" onClick={() => setRightTab(t.id)}
                className={`px-3 py-1.5 text-sm font-bold transition-all ${
                  rightTab === t.id
                    ? "border-b-2 border-[var(--primary)] text-[var(--text)]"
                    : "text-[var(--text-soft)] hover:text-[var(--text)]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {rightTab === "feedback"
              ? <FeedbackPanel result={feedback} loading={checkLoading} />
              : <DictionaryPanel items={dictItems} loading={dictLoading} onSave={handleSaveWord} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function TranslationExercise() {
  const [session, setSession] = useState(null); // { level, contentType }

  if (!session) {
    return <SelectScreen onStart={(level, contentType) => setSession({ level, contentType })} />;
  }

  return (
    <PracticeScreen
      level={session.level}
      contentType={session.contentType}
      onBack={() => setSession(null)}
    />
  );
}
