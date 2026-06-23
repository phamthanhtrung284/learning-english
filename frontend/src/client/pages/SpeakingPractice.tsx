"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "@share/services/api";
import { speak } from "@share/utils/speak";

// Extend window for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
  interface ISpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    onresult: ((e: ISpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
  }
  interface ISpeechRecognitionEvent {
    results: { [index: number]: { [index: number]: { transcript: string } } };
  }
}

const TOPICS = [
  { id: "daily_life", label: "Daily Life", icon: "☀️", desc: "Chat about routines, hobbies, life" },
  { id: "work",       label: "Work",       icon: "💼", desc: "Talk about jobs, goals, workplace" },
];

interface HistoryEntry {
  question: string;
  answer: string;
  hint?: string;
  feedback?: FeedbackData | null;
}

interface FeedbackData {
  score: number;
  correctedVersion?: string;
  nativeAlternative?: string;
  goodPoints?: string;
  improvements?: string[];
}

interface SessionData {
  _id: string;
  topic: string;
  topicLabel?: string;
  turnCount: number;
  updatedAt: string;
}

interface SugItem {
  vi: string;
  en: string;
}

// ── Topic selector ────────────────────────────────────────────────────────────
function TopicSelect({
  onStart,
  sessions,
  onResume,
  onDeleteSession,
}: {
  onStart: (topic: string) => void;
  sessions: SessionData[];
  onResume: (s: SessionData) => void;
  onDeleteSession: (id: string) => void;
}) {
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

        {sessions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Continue a conversation</p>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s._id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text)] truncate">
                      {TOPICS.find((t) => t.id === s.topic)?.icon} {s.topicLabel || s.topic}
                    </p>
                    <p className="text-xs text-[var(--text-soft)]">{s.turnCount} turns · {new Date(s.updatedAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <button type="button" onClick={() => onResume(s)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] h-8 px-3 text-xs font-bold text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]">Resume</button>
                  <button type="button" onClick={() => onDeleteSession(s._id)}
                    className="text-[var(--text-soft)] hover:text-red-400 transition text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map((t) => (
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
function FeedbackCard({ feedback }: { feedback: FeedbackData | null }) {
  if (!feedback) return null;
  const scoreColor = feedback.score >= 85 ? "#27ae60" : feedback.score >= 70 ? "#f39c12" : "#c0392b";
  return (
    <div className="mt-2 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-extrabold" style={{ color: scoreColor }}>{feedback.score}/100</span>
        {feedback.goodPoints && (
          <span className="text-green-400 truncate">✓ {feedback.goodPoints}</span>
        )}
      </div>

      {feedback.correctedVersion && (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] px-3 py-2">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">Better version</p>
          <p className="italic text-[var(--text)]">&ldquo;{feedback.correctedVersion}&rdquo;</p>
        </div>
      )}

      {feedback.nativeAlternative && !feedback.correctedVersion && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-blue-400">More natural</p>
          <p className="leading-relaxed text-[var(--text-soft)]">{feedback.nativeAlternative}</p>
        </div>
      )}

      {feedback.improvements && feedback.improvements.length > 0 && (
        <ul className="space-y-1">
          {feedback.improvements?.map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[var(--text-soft)]">
              <span className="mt-0.5 shrink-0 text-[var(--primary)]">•</span><span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Suggestions panel ─────────────────────────────────────────────────────────
function SuggestionsPanel({
  suggestions,
  turnCount,
  onUse,
}: {
  suggestions: SugItem[];
  turnCount: number;
  onUse: (text: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex-1 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">
          Suggestions
        </p>
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
                <p className="text-xs text-[var(--text-soft)] leading-relaxed">{s.vi}</p>
                <p className="mt-1.5 text-sm font-medium text-[var(--text)] leading-relaxed italic">&ldquo;{s.en}&rdquo;</p>
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
              ? "Suggestions will appear after the first turn."
              : "Loading suggestions…"}
          </p>
        )}
      </div>

      <div className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-soft)]">Tips</p>
        <ul className="space-y-1.5 text-xs text-[var(--text-soft)]">
          <li>• Use full sentences, not single words</li>
          <li>• Add details: when, where, why</li>
          <li>• Use connectors: <span className="text-[var(--text)]">however, although</span></li>
          <li>• Express opinion: <span className="text-[var(--text)]">I think, In my opinion</span></li>
        </ul>
      </div>
    </div>
  );
}

// ── Conversation screen ───────────────────────────────────────────────────────
function ConversationScreen({
  topic,
  sessionId: initialSessionId,
  onBack,
}: {
  topic: string;
  sessionId?: string;
  onBack: () => void;
}) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [current, setCurrent] = useState<{ question: string; hint?: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [suggestions, setSuggestions] = useState<SugItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [restartCounter, setRestartCounter] = useState(0);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topicInfo = TOPICS.find((t) => t.id === topic);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Your browser doesn't support voice input. Try Chrome."); return; }
    const rec: ISpeechRecognition = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setRecording(true);
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.onresult = (e: ISpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        setInput((prev) => (prev.trim() ? prev + " " + transcript : transcript));
      }
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const startedRef = useRef(false);

  // NOTE: sessionId is intentionally excluded from deps — we only want to start
  // once per (topic, restartCounter) pair. Including sessionId would cause an
  // infinite loop because the effect itself sets sessionId.
  // startedRef guards against React StrictMode double-invoke in dev.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!topic) return;
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    api.post("/speaking/start", { topic, sessionId })
      .then(({ data }) => {
        if (cancelled) return;
        setCurrent(data);
        setSessionId(data.sessionId || null);
        speak(data.question);
      })
      .catch((e) => { if (!cancelled) setError(e?.response?.data?.error || "Failed to start"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [topic, restartCounter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, current]);

  const handleRestart = () => {
    setHistory([]);
    setCurrent(null);
    setTurnCount(0);
    setSuggestions([]);
    setInput("");
    setError("");
    setLoading(true);
    setRestartCounter((c) => c + 1);
  };

  const handleSubmit = async (textOverride?: string) => {
    const answer = (textOverride !== undefined ? textOverride : input).trim();
    if (!answer || submitting || !current) return;
    setSubmitting(true); setError(""); setInput("");
    try {
      const historyForApi: Array<{ question: string; answer: string | null }> = history.map((h) => ({ question: h.question, answer: h.answer }));
      historyForApi.push({ question: current.question, answer: null });
      const { data } = await api.post("/speaking/continue", {
        topic, history: historyForApi, userAnswer: answer, sessionId,
      });
      setHistory((h) => [...h, { question: current.question, hint: current.hint, answer, feedback: data.feedback }]);
      setCurrent({ question: data.nextQuestion, hint: "" });
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setTurnCount((c) => c + 1);
      setTimeout(() => speak(data.nextQuestion), 400);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Something went wrong.");
      setInput(answer);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="flex h-full w-full gap-4 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 pb-3">
          <button type="button" onClick={onBack}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] h-8 w-8 shrink-0 text-sm font-bold text-[var(--text-soft)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]">←</button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h1 className="font-display text-base font-extrabold text-[var(--text)]">
                {topicInfo?.icon} {topicInfo?.label}
              </h1>
              <span className="text-[10px] text-[var(--text-soft)]">{turnCount} turns</span>
            </div>
            <p className="text-xs text-[var(--text-soft)] truncate">Speaking practice</p>
          </div>
          <button type="button" onClick={handleRestart}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] h-8 px-3 text-[10px] font-bold text-[var(--text-soft)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]">
            Restart
          </button>
        </div>

        {error && (
          <div className="mb-2 rounded-xl border border-red-400/35 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-3 py-2 text-xs text-red-800 dark:text-red-100">
            {error}
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          {loading && !current ? (
            <div className="flex items-center justify-center py-16">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : (
            <>
              {history.map((h, i) => (
                <div key={i}>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-[var(--primary)] px-4 py-2.5 text-sm text-white">
                      {h.answer}
                    </div>
                  </div>
                  {h.feedback && <FeedbackCard feedback={h.feedback} />}
                </div>
              ))}
              {current && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="group max-w-[80%] rounded-2xl bg-[var(--surface-elevated)] px-4 py-2.5 text-sm text-[var(--text)]">
                    <p>{current.question}</p>
                    {current.hint && (
                      <p className="mt-1 text-xs italic text-[var(--text-soft)]">{current.hint}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => speak(current.question)}
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--text-soft)] opacity-0 transition group-hover:opacity-100 hover:text-[var(--primary)]"
                      aria-label="Play"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                      </svg>
                      Play
                    </button>
                  </div>
                </motion.div>
              )}
              {submitting && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-[var(--bg-card)] px-5 py-3">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-soft)]" style={{ animationDelay: "0s" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-soft)]" style={{ animationDelay: "0.15s" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-soft)]" style={{ animationDelay: "0.3s" }} />
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-end gap-2 pt-3">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={recording ? "Listening… speak now" : "Type your answer… (⌘Enter to send)"}
              rows={2}
              className="input-magic w-full resize-none text-sm"
              style={recording ? { borderColor: "color-mix(in srgb, var(--primary) 60%, transparent)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)" } : undefined}
            />
          </div>

          {/* Mic button */}
          <motion.button
            type="button"
            onClick={toggleRecording}
            disabled={submitting}
            title={recording ? "Stop recording" : "Speak your answer"}
            className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border transition-all ${
              recording
                ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-soft)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)] hover:text-[var(--text)]"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {recording ? (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--primary)]" />
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
              </svg>
            )}
          </motion.button>

          {/* Send button */}
          <motion.button
            type="button"
            onClick={() => handleSubmit()}
            disabled={submitting || !input.trim() || !current}
            className="btn-primary-glow flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl font-bold text-white disabled:opacity-35"
            whileHover={{ scale: submitting ? 1 : 1.03 }}
            whileTap={{ scale: submitting ? 1 : 0.97 }}
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      <div className="hidden w-72 shrink-0 lg:block">
        <SuggestionsPanel suggestions={suggestions} turnCount={turnCount} onUse={(text) => setInput(text)} />
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function SpeakingPractice() {
  const [screen, setScreen] = useState<"select" | "conversation">("select");
  const [activeTopic, setActiveTopic] = useState("daily_life");
  const [resumeSessionId, setResumeSessionId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    api.get("/speaking/sessions")
      .then(({ data }) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleStart = (topic: string) => {
    setActiveTopic(topic);
    setResumeSessionId(undefined);
    setScreen("conversation");
  };

  const handleResume = (s: SessionData) => {
    setActiveTopic(s.topic);
    setResumeSessionId(s._id);
    setScreen("conversation");
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api.delete(`/speaking/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch { /* ignore */ }
  };

  const handleBack = () => {
    setScreen("select");
    api.get("/speaking/sessions")
      .then(({ data }) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  if (screen === "conversation") {
    return (
      <ConversationScreen
        key={activeTopic + (resumeSessionId || "")}
        topic={activeTopic}
        sessionId={resumeSessionId}
        onBack={handleBack}
      />
    );
  }

  return (
    <TopicSelect
      onStart={handleStart}
      sessions={sessions}
      onResume={handleResume}
      onDeleteSession={handleDeleteSession}
    />
  );
}
