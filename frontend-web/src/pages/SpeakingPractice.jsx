import { useState, useCallback, useRef, useEffect } from "react";
import api from "../services/api";
import { speak } from "../utils/speak";

const TOPICS = [
  { id: "daily_life", label: "Daily Life", icon: "☀️", desc: "Chat about routines, hobbies, life" },
  { id: "work",       label: "Work",       icon: "💼", desc: "Talk about jobs, goals, workplace" },
];

const SpeakBtn = ({ onClick }) => (
  <button type="button" onClick={onClick}
    className="mt-1 text-[var(--text-soft)] hover:text-[var(--primary)] transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 1.5 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796a.75.75 0 0 0 1.264-.546V3.75ZM16.45 5.05a.75.75 0 0 0-1.06 1.06 5.5 5.5 0 0 1 0 7.78.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.9Z" />
    </svg>
  </button>
);

// ── Topic selector ────────────────────────────────────────────────────────────
function TopicSelect({ onStart }) {
  const [topic, setTopic] = useState("daily_life");
  return (
    <div className="animate-fade-rise flex h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="border-l-2 border-[var(--primary)] pl-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Speaking Practice</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Talk with Alex
          </h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            A real conversation with an AI friend. Type or use your voice.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map(t => (
            <button key={t.id} type="button" onClick={() => setTopic(t.id)}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all ${
                topic === t.id
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[color-mix(in_srgb,var(--primary)_25%,transparent)]"
              }`}>
              <span className="text-3xl">{t.icon}</span>
              <div>
                <p className={`font-bold ${topic === t.id ? "text-[var(--text)]" : "text-[var(--text-soft)]"}`}>{t.label}</p>
                <p className="mt-0.5 text-xs text-[var(--text-soft)]">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button type="button" onClick={() => onStart(topic)}
          className="btn-primary-glow w-full rounded-xl py-3.5 text-[15px] font-bold">
          Start talking →
        </button>
      </div>
    </div>
  );
}

// ── Feedback card ─────────────────────────────────────────────────────────────
function FeedbackCard({ feedback }) {
  if (!feedback) return null;
  const scoreColor = feedback.score >= 85 ? "#27ae60" : feedback.score >= 70 ? "#f39c12" : "#c0392b";
  return (
    <div className="mt-2 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-3 text-xs">
      {/* Score + good point */}
      <div className="flex items-center gap-2">
        <span className="font-extrabold" style={{ color: scoreColor }}>{feedback.score}/100</span>
        {feedback.goodPoints && (
          <span className="text-green-400 truncate">✓ {feedback.goodPoints}</span>
        )}
      </div>

      {/* Grammar correction */}
      {feedback.correctedVersion && (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] px-3 py-2">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">Better version</p>
          <p className="italic text-[var(--text)]">"{feedback.correctedVersion}"</p>
        </div>
      )}

      {/* More natural — chi tiết */}
      {feedback.nativeAlternative && !feedback.correctedVersion && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-blue-400">More natural</p>
          <p className="leading-relaxed text-[var(--text-soft)]">{feedback.nativeAlternative}</p>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements?.length > 0 && (
        <ul className="space-y-1">
          {feedback.improvements.map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[var(--text-soft)]">
              <span className="mt-0.5 shrink-0 text-[var(--primary)]">•</span><span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Right panel: suggestions ──────────────────────────────────────────────────
function SuggestionsPanel({ suggestions, turnCount, onUse }) {
  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="glass-frame flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">
          Gợi ý câu trả lời
        </p>
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
                {/* Vietnamese */}
                <p className="text-xs text-[var(--text-soft)] leading-relaxed">{s.vi}</p>
                {/* English */}
                <p className="mt-1.5 text-sm font-medium text-[var(--text)] leading-relaxed italic">"{s.en}"</p>
                <button type="button" onClick={() => onUse(s.en)}
                  className="mt-2 text-[10px] font-bold text-[var(--primary)] hover:opacity-75 transition">
                  Use this →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-soft)] italic leading-relaxed">
            {turnCount === 0
              ? "Gợi ý sẽ xuất hiện sau lượt đầu tiên."
              : "Đang tải gợi ý…"}
          </p>
        )}
      </div>

      {/* Static tips */}
      <div className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Tips</p>
        <ul className="space-y-1.5 text-xs text-[var(--text-soft)]">
          <li>• Dùng câu đầy đủ, không chỉ từ đơn lẻ</li>
          <li>• Thêm chi tiết: khi nào, ở đâu, tại sao</li>
          <li>• Dùng connectors: <span className="text-[var(--text)]">however, although</span></li>
          <li>• Bày tỏ ý kiến: <span className="text-[var(--text)]">I think, In my opinion</span></li>
        </ul>
      </div>
    </div>
  );
}

// ── Conversation screen ───────────────────────────────────────────────────────
function ConversationScreen({ topic, onBack }) {
  const [history, setHistory]         = useState([]);
  const [current, setCurrent]         = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [turnCount, setTurnCount]     = useState(0);
  const [inputMode, setInputMode]     = useState("text");
  const [recording, setRecording]     = useState(false);
  const [voiceError, setVoiceError]   = useState("");
  const recognitionRef = useRef(null);
  const bottomRef      = useRef(null);
  const topicInfo      = TOPICS.find(t => t.id === topic);

  const resetAndStart = useCallback(() => {
    setHistory([]); setCurrent(null); setTurnCount(0);
    setSuggestions([]); setInput(""); setError("");
    setLoading(true);
    api.post("/speaking/start", { topic })
      .then(({ data }) => { setCurrent(data); speak(data.question); })
      .catch(e => setError(e?.response?.data?.error || "Failed to start"))
      .finally(() => setLoading(false));
  }, [topic]);

  useEffect(() => { resetAndStart(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, current]);

  const toggleRecording = useCallback(() => {
    if (recording) { recognitionRef.current?.stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError("Use Chrome or Edge for voice input."); return; }
    window.speechSynthesis.cancel();
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
    let final = "";
    rec.onstart  = () => { setRecording(true); setVoiceError(""); final = ""; };
    rec.onend    = () => { setRecording(false); if (final.trim()) setInput(final.trim()); };
    rec.onerror  = (e) => { setRecording(false); if (e.error !== "aborted") setVoiceError(`Voice error: ${e.error}`); };
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setInput((final + (interim ? " " + interim : "")).trim());
    };
    recognitionRef.current = rec;
    rec.start();
  }, [recording]);

  const handleSubmit = async (textOverride) => {
    const answer = (textOverride !== undefined ? textOverride : input).trim();
    if (!answer || submitting || !current) return;
    setSubmitting(true); setError(""); setInput("");
    try {
      const historyForApi = history.map(h => ({ question: h.question, answer: h.answer }));
      historyForApi.push({ question: current.question, answer: null });
      const { data } = await api.post("/speaking/continue", { topic, history: historyForApi, userAnswer: answer });
      setHistory(h => [...h, { question: current.question, hint: current.hint, answer, feedback: data.feedback }]);
      setCurrent({ question: data.nextQuestion, hint: "" });
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setTurnCount(c => c + 1);
      setTimeout(() => speak(data.nextQuestion), 400);
    } catch (e) {
      setError(e?.response?.data?.error || "Something went wrong.");
      setInput(answer);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="flex h-full w-full gap-4 overflow-hidden">

      {/* ── LEFT: chat ── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex shrink-0 items-center gap-2 pb-3">
          <button type="button" onClick={onBack}
            className="glass-btn h-8 w-8 shrink-0 text-sm font-bold text-[var(--text-soft)]">←</button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h1 className="font-display text-base font-extrabold text-[var(--text)]">
                {topicInfo?.icon} {topicInfo?.label}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                {turnCount} {turnCount === 1 ? "turn" : "turns"}
              </span>
            </div>
          </div>
          {/* Mode toggle */}
          <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
            {[["text","⌨"], ["voice","🎙"]].map(([m, icon]) => (
              <button key={m} type="button" onClick={() => { setInputMode(m); setVoiceError(""); }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${inputMode === m ? "bg-[var(--primary)] text-white" : "text-[var(--text-soft)]"}`}>
                {icon}
              </button>
            ))}
          </div>
          <button type="button" onClick={resetAndStart}
            className="glass-btn h-8 w-8 text-sm text-[var(--text-soft)]">↻</button>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pb-2">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
              Alex is typing…
            </div>
          )}

          {history.map((turn, i) => (
            <div key={i} className="space-y-2">
              {/* AI */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_40%,transparent)]">
                  A
                </div>
                <div className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                    <p className="text-[14px] leading-relaxed text-[var(--text)]">{turn.question}</p>
                  </div>
                  <SpeakBtn onClick={() => speak(turn.question)} />
                </div>
              </div>
              {/* User */}
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tr-sm border border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--bg-card))] px-4 py-3">
                    <p className="text-[14px] leading-relaxed text-[var(--text)]">{turn.answer}</p>
                  </div>
                  <FeedbackCard feedback={turn.feedback} />
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text)]">
                  You
                </div>
              </div>
            </div>
          ))}

          {/* Current AI message */}
          {current && !loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_40%,transparent)]">
                A
              </div>
              <div className="max-w-[85%]">
                <div className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                  <p className="text-[14px] leading-relaxed text-[var(--text)]">{current.question}</p>
                </div>
                <SpeakBtn onClick={() => speak(current.question)} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {error && <p className="mb-1 shrink-0 text-xs text-red-400">{error}</p>}
        {voiceError && <p className="mb-1 shrink-0 text-xs text-amber-400">{voiceError}</p>}

        <div className="shrink-0 border-t border-[var(--border)] pt-3">
          {inputMode === "text" ? (
            <div className="flex gap-2">
              <textarea className="textarea-analyzer flex-1 resize-none text-[14px]" rows={2}
                placeholder="Reply to Alex…"
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                disabled={submitting || loading || !current} />
              <button type="button" onClick={() => handleSubmit()}
                disabled={submitting || !input.trim() || loading || !current}
                className="btn-primary-glow shrink-0 self-end rounded-xl px-4 py-2.5 text-sm font-bold disabled:pointer-events-none disabled:opacity-40">
                {submitting ? "…" : "Send"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {input && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">
                    {recording ? "🔴 Listening…" : "Recognized"}
                  </p>
                  <p className="text-sm text-[var(--text)]">{input}</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button type="button" onClick={toggleRecording}
                  disabled={submitting || loading || !current}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all disabled:opacity-40 ${
                    recording
                      ? "border-red-500 bg-red-500/15 shadow-[0_0_16px_rgba(239,68,68,0.35)]"
                      : "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    className={`h-5 w-5 ${recording ? "text-red-400" : "text-[var(--primary)]"}`}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                    <path d="M19 10a7 7 0 0 1-14 0M12 19v3M9 22h6" />
                  </svg>
                </button>
                <p className="text-xs text-[var(--text-soft)]">
                  {recording ? "🔴 Recording — click to stop" : "Click to start recording"}
                </p>
                {input && !recording && (
                  <div className="ml-auto flex gap-2">
                    <button type="button" onClick={() => handleSubmit()}
                      disabled={submitting || !current}
                      className="btn-primary-glow rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-40">
                      {submitting ? "…" : "Send ✓"}
                    </button>
                    <button type="button" onClick={() => setInput("")}
                      className="glass-btn h-9 w-9 text-sm text-[var(--text-soft)]">✕</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: suggestions ── */}
      <div className="hidden w-60 shrink-0 md:flex md:flex-col">
        <SuggestionsPanel
          suggestions={suggestions}
          turnCount={turnCount}
          onUse={(en) => { setInput(en); setInputMode("text"); }}
        />
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function SpeakingPractice() {
  const [topic, setTopic] = useState(null);
  if (!topic) return <TopicSelect onStart={setTopic} />;
  return <ConversationScreen topic={topic} onBack={() => setTopic(null)} />;
}
