import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { clampCursorTooltip } from "../utils/lnTooltipClamp";

const ActionsContext = createContext(null);
const ActiveAnchorContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */

function lemmaKey(text) {
  return text.toLowerCase().replace(/^'+|'+$/g, "");
}

export function useLnCursorTooltipActions() {
  return useContext(ActionsContext);
}

export function useLnCursorActiveAnchorId() {
  return useContext(ActiveAnchorContext)?.anchorId ?? null;
}

export function LnCursorTooltipProvider({ children }) {
  const pointerRef = useRef({ x: 0, y: 0 });
  const [pointerTick, setPointerTick] = useState(0);
  const bumpPointer = useCallback(() => {
    setPointerTick((t) => t + 1);
  }, []);

  const [layer, setLayer] = useState({
    open: false,
    anchorId: null,
    wordData: null,
    contextParagraph: "",
    grammarUnderlineClass: "",
    grammarTitle: "",
    left: 0,
    top: 0,
    placement: "bottom",
    live: null,
    lookupLoading: false,
    lookupError: null,
  });

  const hideT = useRef(null);
  const fetchT = useRef(null);
  const abortRef = useRef(null);
  const fetchGen = useRef(0);

  const cancelPending = useCallback(() => {
    clearTimeout(fetchT.current);
    fetchT.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const closeNow = useCallback(() => {
    clearTimeout(hideT.current);
    cancelPending();
    fetchGen.current += 1;
    setLayer((s) => ({
      ...s,
      open: false,
      anchorId: null,
      wordData: null,
      contextParagraph: "",
      grammarUnderlineClass: "",
      grammarTitle: "",
      live: null,
      lookupLoading: false,
      lookupError: null,
    }));
  }, [cancelPending]);

  const applyPointerClamp = useCallback(() => {
    const { x, y } = pointerRef.current;
    const pos = clampCursorTooltip(x, y);
    setLayer((s) =>
      s.open ? { ...s, left: pos.left, top: pos.top, placement: pos.placement } : s
    );
  }, []);

  const runLookupForLayer = useCallback(
    (anchorId, wordData, contextParagraph, gen) => {
      const lk = lemmaKey(wordData.text);
      const ac = new AbortController();
      abortRef.current = ac;
      api
        .post(
          "/sentences/lookup-word",
          {
            word: wordData.text,
            context: contextParagraph || "",
          },
          { signal: ac.signal }
        )
        .then(({ data }) => {
          if (gen !== fetchGen.current) return;
          const entry = {
            meaning: data.meaning || "",
            ipa: data.ipa || "",
            pos: data.pos || "",
            explanation: data.explanation || "",
          };
          writeWordLookupCache(lk, entry);
          setLayer((s) =>
            s.anchorId === anchorId
              ? { ...s, live: entry, lookupLoading: false, lookupError: null }
              : s
          );
        })
        .catch((err) => {
          if (err?.code === "ERR_CANCELED" || gen !== fetchGen.current) return;
          setLayer((s) =>
            s.anchorId === anchorId
              ? {
                  ...s,
                  lookupLoading: false,
                  lookupError:
                    err?.response?.data?.error || err?.message || "Lookup failed",
                  live: null,
                }
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
  useEffect(() => {
    layerRef.current = layer;
  }, [layer]);

  const handleRetryLookup = useCallback(() => {
    const s = layerRef.current;
    if (!s.open || !s.wordData || !s.anchorId) return;
    cancelPending();
    fetchGen.current += 1;
    const gen = fetchGen.current;
    setLayer((prev) => ({
      ...prev,
      lookupLoading: true,
      lookupError: null,
      live: null,
    }));
    runLookupForLayer(s.anchorId, s.wordData, s.contextParagraph, gen);
  }, [cancelPending, runLookupForLayer]);

  const openAt = useCallback(
    (e, payload) => {
      clearTimeout(hideT.current);
      const { anchorId, wordData, contextParagraph, grammarUnderlineClass, grammarTitle } =
        payload;
      const x = e.clientX;
      const y = e.clientY;
      pointerRef.current = { x, y };
      bumpPointer();

      const pos = clampCursorTooltip(x, y);
      const needsFetch = wordData.fromGlossary === false;
      const lk = lemmaKey(wordData.text);
      const cached = needsFetch ? readWordLookupCache(lk) : null;

      cancelPending();
      fetchGen.current += 1;
      const gen = fetchGen.current;

      setLayer({
        open: true,
        anchorId,
        wordData,
        contextParagraph: contextParagraph || "",
        grammarUnderlineClass: grammarUnderlineClass || "",
        grammarTitle: grammarTitle || "",
        left: pos.left,
        top: pos.top,
        placement: pos.placement,
        live: cached,
        lookupLoading: Boolean(needsFetch && !cached),
        lookupError: null,
      });

      if (!needsFetch || cached) return;

      fetchT.current = setTimeout(() => {
        runLookupForLayer(anchorId, wordData, contextParagraph || "", gen);
      }, 80);
    },
    [bumpPointer, cancelPending, runLookupForLayer]
  );

  const move = useCallback(
    (e) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      bumpPointer();
      setLayer((s) => {
        if (!s.open) return s;
        const pos = clampCursorTooltip(e.clientX, e.clientY);
        return { ...s, left: pos.left, top: pos.top, placement: pos.placement };
      });
    },
    [bumpPointer]
  );

  const leave = useCallback(() => {
    clearTimeout(hideT.current);
    hideT.current = setTimeout(closeNow, 100);
  }, [closeNow]);

  const cancelHide = useCallback(() => {
    clearTimeout(hideT.current);
  }, []);

  useEffect(() => {
    if (!layer.open) return;
    const onScrollOrResize = () => applyPointerClamp();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [layer.open, applyPointerClamp, pointerTick]);

  const actions = useMemo(
    () => ({ openAt, move, leave, cancelHide, closeNow }),
    [openAt, move, leave, cancelHide, closeNow]
  );

  const activeAnchorValue = useMemo(
    () => ({ anchorId: layer.open ? layer.anchorId : null }),
    [layer.open, layer.anchorId]
  );

  const needsFetch = layer.wordData && layer.wordData.fromGlossary === false;

  const display = useMemo(() => {
    if (!layer.wordData) {
      return { meaning: "", ipa: "", pos: "", explanation: "" };
    }
    const w = layer.wordData;
    if (!needsFetch) {
      return {
        meaning: w.meaning || "",
        ipa: w.ipa || "",
        pos: w.pos || "",
        explanation: w.explanation || "",
      };
    }
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

  const portal =
    layer.open && layer.wordData ? (
      createPortal(
        <div
          className="fixed z-[2147483647] pointer-events-auto max-h-[min(72vh,520px)] flex flex-col"
          style={{
            left: layer.left,
            top: layer.top,
            transform: "none",
          }}
          onMouseEnter={cancelHide}
          onMouseLeave={leave}
        >
          <div
            className={layer.placement === "top" ? "pt-2 pb-1" : "pb-2 pt-1"}
          >
            <WordTooltip
              word={layer.wordData.text}
              meaning={display.meaning}
              ipa={display.ipa}
              pos={display.pos}
              explanation={display.explanation}
              placement={layer.placement}
              lookupLoading={Boolean(needsFetch && layer.lookupLoading)}
              lookupError={needsFetch ? layer.lookupError : null}
              onRetryLookup={
                needsFetch && layer.lookupError ? handleRetryLookup : undefined
              }
              canSave={canSave}
              hideCaret
            />
          </div>
        </div>,
        document.body
      )
    ) : null;

  return (
    <ActionsContext.Provider value={actions}>
      <ActiveAnchorContext.Provider value={activeAnchorValue}>
        {children}
        {portal}
      </ActiveAnchorContext.Provider>
    </ActionsContext.Provider>
  );
}
