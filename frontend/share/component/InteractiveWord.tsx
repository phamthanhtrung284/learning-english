"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { speak } from "@share/utils/speak";
import api from "@share/services/api";
import WordTooltip from "./WordTooltip";
import {
  readWordLookupCache,
  writeWordLookupCache,
} from "@share/utils/wordLookupCache";
import { estimateTooltipSize } from "@share/utils/lnTooltipClamp";
import {
  useLnCursorActiveAnchorId,
  useLnCursorTooltipActions,
} from "./LnCursorTooltipProvider";

const TOOLTIP_GAP = 28;

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

interface InteractiveWordProps {
  wordData: WordData;
  contextParagraph?: string;
  tooltipAnchor?: "word" | "cursor";
  grammarUnderlineClass?: string;
  grammarTitle?: string;
}

// ── Word-anchored tooltip ──────────────────────────────────────────────────────
function InteractiveWordWordAnchored({
  wordData,
  contextParagraph = "",
  grammarTitle = "",
}: {
  wordData: WordData;
  contextParagraph?: string;
  grammarTitle?: string;
}) {
  const needsFetch = wordData.fromGlossary === false;

  const lemmaKey = useMemo(
    () => wordData.text.toLowerCase().replace(/^'+|'+$/g, ""),
    [wordData.text]
  );

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    left: number;
    placement: "top" | "bottom";
    top: number | null;
    bottom: number | null;
  }>({ left: 0, placement: "bottom", top: null, bottom: null });
  const [live, setLive] = useState<Record<string, string> | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const wordRef = useRef<HTMLSpanElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fetchDelayRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const display = useMemo(() => {
    if (!needsFetch)
      return {
        meaning: wordData.meaning || "",
        ipa: wordData.ipa || "",
        pos: wordData.pos || "",
        explanation: wordData.explanation || "",
      };
    return {
      meaning: live?.meaning || wordData.meaning || "",
      ipa: live?.ipa || wordData.ipa || "",
      pos: live?.pos || wordData.pos || "",
      explanation: live?.explanation || wordData.explanation || "",
    };
  }, [needsFetch, wordData, live]);

  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(wordData.text);
  };

  const updatePosition = useCallback(() => {
    if (!wordRef.current) return;
    const rect = wordRef.current.getBoundingClientRect();
    const { estH, vw, vh, margin } = estimateTooltipSize();
    const tooltipWidth = Math.min(360, vw - 2 * margin);
    let left = rect.left + rect.width / 2;
    if (left + tooltipWidth / 2 > vw - margin)
      left = vw - tooltipWidth / 2 - margin;
    if (left < tooltipWidth / 2 + margin)
      left = tooltipWidth / 2 + margin;
    const spaceBelow = vh - rect.bottom - TOOLTIP_GAP;
    const spaceAbove = rect.top - TOOLTIP_GAP;
    const preferBelow =
      spaceBelow >= estH || (spaceBelow >= spaceAbove && spaceBelow >= 160);
    if (preferBelow && spaceBelow >= 120) {
      setTooltipPos({
        left,
        placement: "bottom",
        top: rect.bottom + TOOLTIP_GAP,
        bottom: null,
      });
      return;
    }
    if (spaceAbove >= 120) {
      setTooltipPos({
        left,
        placement: "top",
        top: null,
        bottom: vh - rect.top + TOOLTIP_GAP,
      });
      return;
    }
    setTooltipPos({
      left,
      placement: "bottom",
      top: Math.min(rect.bottom + TOOLTIP_GAP, vh - estH - margin),
      bottom: null,
    });
  }, []);

  const cancelPendingFetch = () => {
    clearTimeout(fetchDelayRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const runLookup = useCallback(async () => {
    const cached = readWordLookupCache(lemmaKey);
    if (cached) {
      setLive(cached);
      setLookupLoading(false);
      setLookupError(null);
      return;
    }
    cancelPendingFetch();
    const ac = new AbortController();
    abortRef.current = ac;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const { data } = await api.post(
        "/sentences/lookup-word",
        { word: wordData.text, context: contextParagraph || "" },
        { signal: ac.signal }
      );
      const entry = {
        meaning: data.meaning || "",
        ipa: data.ipa || "",
        pos: data.pos || "",
        explanation: data.explanation || "",
      };
      writeWordLookupCache(lemmaKey, entry);
      setLive(entry);
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === "ERR_CANCELED") return;
      setLookupError(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || (error as Error)?.message || "Lookup failed"
      );
      setLive(null);
    } finally {
      setLookupLoading(false);
      abortRef.current = null;
    }
  }, [lemmaKey, wordData.text, contextParagraph]);

  const handleMouseEnter = () => {
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      updatePosition();
      setShowTooltip(true);
      if (needsFetch) {
        const cached = readWordLookupCache(lemmaKey);
        if (cached) {
          setLive(cached);
          setLookupLoading(false);
          setLookupError(null);
        } else {
          setLookupLoading(true);
          setLookupError(null);
          setLive(null);
          fetchDelayRef.current = setTimeout(runLookup, 150);
        }
      }
    }, 110);
  };

  const cancelHideTooltip = useCallback(() => {
    clearTimeout(hideTimeoutRef.current);
  }, []);

  const handleMouseLeave = () => {
    clearTimeout(showTimeoutRef.current);
    clearTimeout(fetchDelayRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      cancelPendingFetch();
      setShowTooltip(false);
      setLookupLoading(false);
      setLookupError(null);
    }, 420);
  };

  useEffect(() => {
    if (!showTooltip) return;
    const reposition = () => updatePosition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [showTooltip, updatePosition]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
      clearTimeout(fetchDelayRef.current);
      cancelPendingFetch();
    };
  }, []);

  const canSave =
    !lookupLoading &&
    Boolean((display.meaning || "").trim() || (display.explanation || "").trim());
  const portalStyle = {
    left: tooltipPos.left,
    transform: "translateX(-50%)",
    ...(tooltipPos.top != null
      ? { top: tooltipPos.top }
      : { bottom: tooltipPos.bottom }),
  } as React.CSSProperties;

  const spanClass = [
    "relative inline cursor-help select-text text-inherit",
    "underline decoration-dashed underline-offset-[7px] transition-[color,text-decoration-color,decoration-thickness] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    showTooltip
      ? "decoration-[color-mix(in_srgb,var(--primary)_55%,transparent)] decoration-[1.5px] text-[var(--text)]"
      : "decoration-transparent hover:decoration-[color-mix(in_srgb,var(--text-soft)_45%,transparent)] hover:decoration-[1px]",
  ].join(" ");

  return (
    <>
      <span
        ref={wordRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={speakWord}
        title={grammarTitle || "Hover to see meaning · click to hear"}
        className={spanClass}
      >
        {wordData.text}
      </span>
      {showTooltip &&
        createPortal(
          <div
            className="fixed z-[2147483647] pointer-events-auto max-h-[min(72vh,520px)] flex flex-col"
            style={portalStyle}
            onMouseEnter={cancelHideTooltip}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={
                tooltipPos.placement === "top" ? "pt-2 pb-1" : "pb-2 pt-1"
              }
            >
              <WordTooltip
                word={wordData.text}
                meaning={display.meaning}
                ipa={display.ipa}
                pos={display.pos}
                explanation={display.explanation}
                placement={tooltipPos.placement}
                lookupLoading={Boolean(needsFetch && lookupLoading)}
                lookupError={needsFetch ? lookupError : null}
                onRetryLookup={
                  needsFetch && lookupError
                    ? () => {
                        setLookupError(null);
                        runLookup();
                      }
                    : undefined
                }
                canSave={canSave}
                hideCaret={false}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// ── LN reader word span — click-based ──────────────────────────────────────────
function LnInteractiveWordSpan({
  wordData,
  contextParagraph = "",
  grammarUnderlineClass = "",
  grammarTitle = "",
}: {
  wordData: WordData;
  contextParagraph?: string;
  grammarUnderlineClass?: string;
  grammarTitle?: string;
}) {
  const actions = useLnCursorTooltipActions();
  const activeAnchorId = useLnCursorActiveAnchorId();
  const anchorId = useId();

  if (!actions) {
    return (
      <InteractiveWordWordAnchored
        wordData={wordData}
        contextParagraph={contextParagraph}
        grammarTitle={grammarTitle}
      />
    );
  }

  const isActive = activeAnchorId === anchorId;

  const spanClass = [
    "relative inline cursor-pointer select-text text-inherit",
    "rounded-sm px-0.5 align-baseline transition-colors duration-150",
    grammarUnderlineClass ||
      "underline decoration-dashed underline-offset-[6px] decoration-[color-mix(in_srgb,var(--text-soft)_35%,transparent)] decoration-[1px]",
    isActive
      ? "bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] decoration-[color-mix(in_srgb,var(--primary)_60%,transparent)] decoration-[1.5px]"
      : "hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]",
  ].join(" ");

  return (
    <span
      data-ln-word="true"
      onClick={(e) =>
        actions.openAt(e, {
          anchorId,
          wordData,
          contextParagraph,
          grammarUnderlineClass,
          grammarTitle,
        })
      }
      title={grammarTitle || "Click để xem nghĩa"}
      className={spanClass}
    >
      {wordData.text}
    </span>
  );
}

function InteractiveWordRoot(props: InteractiveWordProps) {
  const anchor = props.tooltipAnchor === "cursor" ? "cursor" : "word";
  if (anchor === "cursor") {
    return (
      <LnInteractiveWordSpan
        wordData={props.wordData}
        contextParagraph={props.contextParagraph}
        grammarUnderlineClass={props.grammarUnderlineClass}
        grammarTitle={props.grammarTitle}
      />
    );
  }
  return (
    <InteractiveWordWordAnchored
      wordData={props.wordData}
      contextParagraph={props.contextParagraph}
      grammarTitle={props.grammarTitle}
    />
  );
}

export default memo(InteractiveWordRoot);
