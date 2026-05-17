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
import api from "../services/api";
import WordTooltip from "./WordTooltip";
import {
  readWordLookupCache,
  writeWordLookupCache,
} from "../cache/wordLookupCache";
import { estimateTooltipSize } from "../utils/lnTooltipClamp";
import {
  useLnCursorActiveAnchorId,
  useLnCursorTooltipActions,
} from "./LnCursorTooltipProvider";

const TOOLTIP_GAP = 28;

/** Neo theo từ + portal riêng (Sentence Analyzer, v.v.) */
function InteractiveWordWordAnchored({
  wordData,
  contextParagraph = "",
  grammarTitle = "",
}) {
  const needsFetch = wordData.fromGlossary === false;

  const lemmaKey = useMemo(
    () => wordData.text.toLowerCase().replace(/^'+|'+$/g, ""),
    [wordData.text]
  );

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({
    left: 0,
    placement: "bottom",
    top: null,
    bottom: null,
  });
  const [live, setLive] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  const wordRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const fetchDelayRef = useRef(null);
  const abortRef = useRef(null);

  const display = useMemo(() => {
    if (!needsFetch) {
      return {
        meaning: wordData.meaning || "",
        ipa: wordData.ipa || "",
        pos: wordData.pos || "",
        explanation: wordData.explanation || "",
      };
    }
    return {
      meaning: live?.meaning || wordData.meaning || "",
      ipa: live?.ipa || wordData.ipa || "",
      pos: live?.pos || wordData.pos || "",
      explanation: live?.explanation || wordData.explanation || "",
    };
  }, [needsFetch, wordData, live]);

  const speakWord = (e) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(wordData.text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const updateWordAnchoredPosition = useCallback(() => {
    if (!wordRef.current) return;

    const rect = wordRef.current.getBoundingClientRect();
    const { estH, vw, vh, margin } = estimateTooltipSize();
    const tooltipWidth = Math.min(360, vw - 2 * margin);

    let left = rect.left + rect.width / 2;
    if (left + tooltipWidth / 2 > vw - margin) {
      left = vw - tooltipWidth / 2 - margin;
    }
    if (left < tooltipWidth / 2 + margin) {
      left = tooltipWidth / 2 + margin;
    }

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
        {
          word: wordData.text,
          context: contextParagraph || "",
        },
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
    } catch (error) {
      if (error?.code === "ERR_CANCELED") return;
      setLookupError(
        error?.response?.data?.error || error?.message || "Lookup failed"
      );
      setLive(null);
    } finally {
      setLookupLoading(false);
      abortRef.current = null;
    }
  }, [lemmaKey, wordData.text, contextParagraph]);

  const handleRetryLookup = useCallback(() => {
    setLookupError(null);
    runLookup();
  }, [runLookup]);

  const handleMouseEnter = () => {
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      updateWordAnchoredPosition();
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
          fetchDelayRef.current = setTimeout(() => {
            runLookup();
          }, 150);
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
    cancelPendingFetch();
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
      setLookupLoading(false);
      setLookupError(null);
    }, 140);
  };

  useEffect(() => {
    if (!showTooltip) return;
    const reposition = () => updateWordAnchoredPosition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [showTooltip, updateWordAnchoredPosition]);

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
  };

  const spanClass = [
    "relative inline cursor-help select-none text-inherit",
    "underline decoration-dashed underline-offset-[7px] transition-[color,text-decoration-color,decoration-thickness] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    showTooltip
      ? "decoration-[color-mix(in_srgb,var(--primary)_70%,transparent)] decoration-[1.5px] text-[var(--text)]"
      : "decoration-transparent hover:decoration-[color-mix(in_srgb,var(--text-soft)_45%,transparent)] hover:decoration-[1px]",
  ].join(" ");

  return (
    <>
      <span
        ref={wordRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={speakWord}
        title={grammarTitle || "Giữ chuột để xem nghĩa · click để nghe"}
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
                  needsFetch && lookupError ? handleRetryLookup : undefined
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

/** Light Novel: một tooltip chung, bám con trỏ — không chồng portal. */
function LnInteractiveWordSpan({
  wordData,
  contextParagraph = "",
  grammarUnderlineClass = "",
  grammarTitle = "",
}) {
  const actions = useLnCursorTooltipActions();
  const activeAnchorId = useLnCursorActiveAnchorId();
  const anchorId = useId();

  const speakWord = (e) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(wordData.text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  if (!actions) {
    return (
      <InteractiveWordWordAnchored
        wordData={wordData}
        contextParagraph={contextParagraph}
        grammarUnderlineClass={grammarUnderlineClass}
        grammarTitle={grammarTitle}
      />
    );
  }

  const isHot = activeAnchorId === anchorId;

  const spanClass = [
    "relative inline cursor-help select-none text-inherit",
    "rounded-sm px-0.5 align-baseline transition-colors duration-200",
    "hover:bg-[color-mix(in_srgb,var(--yellow)_22%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
    grammarUnderlineClass || "no-underline",
    isHot ? "bg-[color-mix(in_srgb,var(--yellow)_18%,transparent)]" : "",
  ].join(" ");

  return (
    <span
      onMouseEnter={(e) =>
        actions.openAt(e, {
          anchorId,
          wordData,
          contextParagraph,
          grammarUnderlineClass,
          grammarTitle,
        })
      }
      onMouseMove={(e) => actions.move(e)}
      onMouseLeave={() => actions.leave()}
      onClick={speakWord}
      title={grammarTitle || "Giữ chuột để xem nghĩa · click để nghe"}
      className={spanClass}
    >
      {wordData.text}
    </span>
  );
}

function InteractiveWordRoot(props) {
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
      grammarUnderlineClass={props.grammarUnderlineClass}
      grammarTitle={props.grammarTitle}
    />
  );
}

export default memo(InteractiveWordRoot);
