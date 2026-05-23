import { useState } from "react";
import api from "../services/api";
import { speak } from "../utils/speak";

function SkeletonLine({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[color-mix(in_srgb,var(--text-soft)_14%,var(--bg-soft))] ${className}`}
    />
  );
}

export default function WordTooltip({
  word,
  meaning,
  ipa,
  pos,
  explanation,
  placement = "top",
  lookupLoading = false,
  lookupError = null,
  onRetryLookup,
  canSave = true,
  hideCaret = false,
}) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    speak(word);
  };

  const handleSaveWord = async (e) => {
    e.stopPropagation();
    try {
      setSaveLoading(true);

      if (!localStorage.getItem("token")) {
        alert("Please login first");
        return;
      }

      await api.post("/vocabulary/save", {
        word,
        meaning,
        ipa,
        type: pos,
        explanation,
      });

      setSaved(true);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.error || "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const showBody = !lookupLoading && !lookupError;

  return (
    <div className="tooltip-glass tooltip-pop-in relative w-[min(calc(100vw-2rem),360px)]">
      <div
        className="h-0.5 w-full rounded-t-[28px]"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden
      />
      <div className="max-h-[min(68vh,480px)] overflow-y-auto overscroll-auto rounded-b-2xl px-5 py-5 text-[var(--text-soft)] sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-[var(--text)] break-words">
              {word}
            </h2>
            {showBody && (pos || "").trim() && (
              <span className="mt-2 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                {pos}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_25%,transparent)] active:scale-95"
            aria-label="Play pronunciation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 4.5 4.5 0 0 1 0 6.364.75.75 0 0 1-1.06-1.06 3 3 0 0 0 0-4.244.75.75 0 0 1 0-1.061Z" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {lookupLoading && (
            <div className="space-y-3 rounded-[18px] border border-[var(--border)] bg-[var(--bg-card)] p-4">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-5 w-full" />
              <SkeletonLine className="mt-3 h-3 w-16" />
              <SkeletonLine className="h-5 w-[88%]" />
              <SkeletonLine className="mt-3 h-3 w-28" />
              <SkeletonLine className="h-10 w-full" />
            </div>
          )}

          {lookupError && (
            <div className="rounded-[18px] border border-red-400/35 bg-[color-mix(in_srgb,#ef4444_10%,var(--bg-card))] px-4 py-3 text-sm text-red-800 dark:text-red-100">
              <p className="font-bold">{lookupError}</p>
              {onRetryLookup && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetryLookup();
                  }}
                  className="mt-3 w-full rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] py-2.5 text-xs font-bold text-[var(--primary)] shadow-sm transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
                >
                  Thử lại
                </button>
              )}
            </div>
          )}

          {showBody && (
            <>
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Nghĩa (VI)
                </div>
                <p className="mt-1.5 text-[16px] font-semibold leading-snug text-[var(--text)]">
                  {(meaning || "").trim() || "—"}
                </p>
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  IPA
                </div>
                <p className="mt-1.5 font-mono text-[15px] tracking-wide text-[var(--text)]">
                  {(ipa || "").trim() || "—"}
                </p>
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Định nghĩa (EN)
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[color-mix(in_srgb,var(--text)_70%,var(--text-soft))]">
                  {(explanation || "").trim() || "No definition available."}
                </p>
              </section>
            </>
          )}
        </div>

        {showBody && (
          <button
            type="button"
            onClick={handleSaveWord}
            disabled={saveLoading || saved || !canSave}
            className={`mt-5 w-full rounded-[18px] py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
              saved
                ? "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)]"
                : "text-white shadow-md hover:brightness-110"
            } ${saveLoading || !canSave ? "pointer-events-none opacity-45" : ""}`}
            style={!saved ? { background: "var(--gradient-primary)" } : undefined}
          >
            {saveLoading ? "Đang lưu…" : saved ? "Đã lưu" : "Lưu vào sổ từ"}
          </button>
        )}
      </div>

      {!hideCaret &&
        (placement === "top" ? (
          <div className="pointer-events-none absolute -bottom-1.5 left-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-[var(--border)] bg-[var(--bg-card)]" />
        ) : (
          <div className="pointer-events-none absolute -top-1.5 left-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-[var(--border)] bg-[var(--bg-card)]" />
        ))}
    </div>
  );
}
