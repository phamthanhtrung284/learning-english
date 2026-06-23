"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import api from "@share/services/api";
import { readWordLookupCache, writeWordLookupCache } from "@share/utils/wordLookupCache";
import { speak } from "@share/utils/speak";

interface WordData {
  text: string;
  fromGlossary: boolean;
  meaning: string;
  ipa: string;
  pos: string;
  explanation: string;
  synonyms?: string[];
  collocations?: string[];
  native_nuance?: string;
}

interface OpenAtParams {
  anchorId: string;
  wordData: WordData;
  contextParagraph?: string;
  grammarUnderlineClass?: string;
  grammarTitle?: string;
}

interface TooltipActions {
  openAt: (e: React.MouseEvent, params: OpenAtParams) => void;
  close: () => void;
}

interface DisplayData {
  meaning: string;
  ipa: string;
  pos: string;
  explanation: string;
}

interface LayerState {
  open: boolean;
  anchorId: string | null;
  wordData: WordData | null;
  contextParagraph: string;
  live: DisplayData | null;
  lookupLoading: boolean;
  lookupError: string | null;
}

const ActionsContext = createContext<TooltipActions | null>(null);
const ActiveAnchorContext = createContext<{ anchorId: string | null } | null>(null);

function lemmaKey(text: string): string {
  return text.toLowerCase().replace(/^'+|'+$/g, "");
}

// ── Side panel ─────────────────────────────────────────────────────────────────
function SidePanel({
  layer,
  display,
  canSave,
  needsFetch,
  onClose,
  onRetry,
  onSave,
  saveState,
}: {
  layer: LayerState;
  display: DisplayData;
  canSave: boolean;
  needsFetch: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onSave: () => void;
  saveState: "idle" | "loading" | "saved";
}) {
  if (!layer.open || !layer.wordData) return null;

  const showBody = !layer.lookupLoading && !layer.lookupError;

  return (
    <div className="ln-side-panel" role="dialog" aria-label={`Word: ${layer.wordData.text}`}>
      <div
        className="h-[3px] w-full shrink-0 rounded-t-[18px]"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-extrabold tracking-tight text-[var(--text)] break-words leading-tight">
              {layer.wordData.text}
            </h2>
            {showBody && (display.pos || "").trim() && (
              <span className="mt-1.5 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-soft)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">
                {display.pos}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); speak(layer.wordData!.text); }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] active:scale-95"
              aria-label="Phát âm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 4.5 4.5 0 0 1 0 6.364.75.75 0 0 1-1.06-1.06 3 3 0 0 0 0-4.244.75.75 0 0 1 0-1.061Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-soft)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--text)] active:scale-95"
              aria-label="Đóng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          {layer.lookupLoading && (
            <div className="space-y-2 rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              {[24, 16, 20, 14, 28].map((w, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-md bg-[color-mix(in_srgb,var(--text-soft)_14%,var(--bg-soft))]"
                  style={{ height: 10, width: `${w * 3}px`, maxWidth: "100%" }}
                />
              ))}
            </div>
          )}

          {layer.lookupError && (
            <div className="rounded-[14px] border border-red-400/35 bg-[color-mix(in_srgb,#ef4444_10%,var(--bg-card))] px-3 py-2.5 text-xs text-red-800 dark:text-red-100">
              <p className="font-bold">{layer.lookupError}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2 w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)] py-1.5 text-xs font-bold text-[var(--primary)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
                >
                  Thử lại
                </button>
              )}
            </div>
          )}

          {showBody && (
            <>
              <div className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">Nghĩa (VI)</div>
                <p className="mt-1 text-[14px] font-semibold leading-snug text-[var(--text)]">
                  {(display.meaning || "").trim() || "—"}
                </p>
              </div>

              {(display.ipa || "").trim() && (
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">IPA</div>
                  <p className="mt-1 font-mono text-[13px] tracking-wide text-[var(--text)]">
                    {display.ipa}
                  </p>
                </div>
              )}

              {(display.explanation || "").trim() && (
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">Definition (EN)</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-[color-mix(in_srgb,var(--text)_75%,var(--text-soft))]">
                    {display.explanation}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {showBody && (
          <button
            type="button"
            onClick={onSave}
            disabled={saveState === "loading" || saveState === "saved" || !canSave}
            className={`mt-4 w-full rounded-[14px] py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
              saveState === "saved"
                ? "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)]"
                : "text-white shadow-md hover:brightness-110"
            } ${saveState === "loading" || !canSave ? "pointer-events-none opacity-45" : ""}`}
            style={saveState !== "saved" ? { background: "var(--gradient-primary)" } : undefined}
          >
            {saveState === "loading" ? "Đang lưu…" : saveState === "saved" ? "✓ Đã lưu" : "Lưu vào sổ từ"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function LnCursorTooltipProvider({ children }: { children: ReactNode }) {
  const [layer, setLayer] = useState<LayerState>({
    open: false,
    anchorId: null,
    wordData: null,
    contextParagraph: "",
    live: null,
    lookupLoading: false,
    lookupError: null,
  });

  const [saveState, setSaveState] = useState<"idle" | "loading" | "saved">("idle");

  const fetchT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fetchGen = useRef(0);

  const cancelPending = useCallback(() => {
    if (fetchT.current) clearTimeout(fetchT.current);
    fetchT.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const closeNow = useCallback(() => {
    cancelPending();
    fetchGen.current += 1;
    setSaveState("idle");
    setLayer({
      open: false,
      anchorId: null,
      wordData: null,
      contextParagraph: "",
      live: null,
      lookupLoading: false,
      lookupError: null,
    });
  }, [cancelPending]);

  const runLookup = useCallback(
    (anchorId: string, wordData: WordData, contextParagraph: string, gen: number) => {
      const lk = lemmaKey(wordData.text);
      const ac = new AbortController();
      abortRef.current = ac;
      api
        .post("/sentences/lookup-word", { word: wordData.text, context: contextParagraph || "" }, { signal: ac.signal })
        .then(({ data }: { data: { meaning?: string; ipa?: string; pos?: string; explanation?: string } }) => {
          if (gen !== fetchGen.current) return;
          const entry: DisplayData = {
            meaning: data.meaning || "",
            ipa: data.ipa || "",
            pos: data.pos || "",
            explanation: data.explanation || "",
          };
          writeWordLookupCache(lk, entry as unknown as Record<string, string>);
          setLayer((s) =>
            s.anchorId === anchorId
              ? { ...s, live: entry, lookupLoading: false, lookupError: null }
              : s
          );
        })
        .catch((err: { code?: string; response?: { data?: { error?: string } }; message?: string }) => {
          if (err?.code === "ERR_CANCELED" || gen !== fetchGen.current) return;
          setLayer((s) =>
            s.anchorId === anchorId
              ? { ...s, lookupLoading: false, lookupError: err?.response?.data?.error || err?.message || "Lookup failed", live: null }
              : s
          );
        })
        .finally(() => {
          if (abortRef.current === ac) abortRef.current = null;
        });
    },
    []
  );

  const layerRef = useRef(layer);
  useEffect(() => { layerRef.current = layer; }, [layer]);

  const handleRetry = useCallback(() => {
    const s = layerRef.current;
    if (!s.open || !s.wordData) return;
    cancelPending();
    fetchGen.current += 1;
    const gen = fetchGen.current;
    setLayer((p) => ({ ...p, lookupLoading: true, lookupError: null, live: null }));
    runLookup(s.anchorId!, s.wordData, s.contextParagraph, gen);
  }, [cancelPending, runLookup]);

  const openAt = useCallback(
    (e: React.MouseEvent, payload: OpenAtParams) => {
      e.stopPropagation();
      const { anchorId, wordData, contextParagraph } = payload;

      if (layerRef.current.open && layerRef.current.anchorId === anchorId) {
        closeNow();
        return;
      }

      const needsFetch = wordData.fromGlossary === false;
      const lk = lemmaKey(wordData.text);
      const cached = needsFetch ? readWordLookupCache(lk) : null;

      cancelPending();
      fetchGen.current += 1;
      const gen = fetchGen.current;
      setSaveState("idle");

      setLayer({
        open: true,
        anchorId,
        wordData,
        contextParagraph: contextParagraph || "",
        live: cached as DisplayData | null,
        lookupLoading: Boolean(needsFetch && !cached),
        lookupError: null,
      });

      if (needsFetch && !cached) {
        fetchT.current = setTimeout(() => {
          runLookup(anchorId, wordData, contextParagraph || "", gen);
        }, 60);
      }
    },
    [cancelPending, closeNow, runLookup]
  );

  useEffect(() => {
    if (!layer.open) return;
    const handler = (e: PointerEvent) => {
      const panel = document.querySelector(".ln-side-panel");
      if (panel && panel.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest?.("[data-ln-word]")) return;
      closeNow();
    };
    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
  }, [layer.open, closeNow]);

  const handleSave = useCallback(async () => {
    const s = layerRef.current;
    if (!s.open || !s.wordData) return;
    const d = s.live || s.wordData;
    setSaveState("loading");
    try {
      if (!localStorage.getItem("token")) { alert("Please login first"); setSaveState("idle"); return; }
      await api.post("/vocabulary/save", {
        word: s.wordData.text,
        meaning: d.meaning || s.wordData.meaning || "",
        ipa: d.ipa || s.wordData.ipa || "",
        type: d.pos || s.wordData.pos || "",
        explanation: d.explanation || s.wordData.explanation || "",
      });
      setSaveState("saved");
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Save failed");
      setSaveState("idle");
    }
  }, []);

  const actions = useMemo<TooltipActions>(
    () => ({ openAt, close: closeNow }),
    [openAt, closeNow]
  );

  const activeAnchorValue = useMemo(
    () => ({ anchorId: layer.open ? layer.anchorId : null }),
    [layer.open, layer.anchorId]
  );

  const needsFetch = layer.wordData?.fromGlossary === false;

  const display = useMemo<DisplayData>(() => {
    if (!layer.wordData) return { meaning: "", ipa: "", pos: "", explanation: "" };
    const w = layer.wordData;
    if (!needsFetch) return { meaning: w.meaning || "", ipa: w.ipa || "", pos: w.pos || "", explanation: w.explanation || "" };
    return {
      meaning: layer.live?.meaning || w.meaning || "",
      ipa: layer.live?.ipa || w.ipa || "",
      pos: layer.live?.pos || w.pos || "",
      explanation: layer.live?.explanation || w.explanation || "",
    };
  }, [layer.wordData, layer.live, needsFetch]);

  const canSave =
    !layer.lookupLoading &&
    Boolean((display.meaning || "").trim() || (display.explanation || "").trim());

  return (
    <ActionsContext.Provider value={actions}>
      <ActiveAnchorContext.Provider value={activeAnchorValue}>
        <div className={`ln-reader-with-panel${layer.open ? " ln-panel-open" : ""}`}>
          <div className="ln-reader-content">
            {children}
          </div>
          <SidePanel
            layer={layer}
            display={display}
            canSave={canSave}
            needsFetch={needsFetch}
            onClose={closeNow}
            onRetry={needsFetch && layer.lookupError ? handleRetry : undefined}
            onSave={handleSave}
            saveState={saveState}
          />
        </div>
      </ActiveAnchorContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useLnCursorTooltipActions(): TooltipActions | null {
  return useContext(ActionsContext);
}

export function useLnCursorActiveAnchorId(): string | null {
  return useContext(ActiveAnchorContext)?.anchorId ?? null;
}

