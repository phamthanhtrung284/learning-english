import InteractiveWord from "./InteractiveWord";

export default function SentenceReaderWeb({ data }) {
  const posList = [...new Set((data.words || []).map((w) => (w.pos || "").trim()).filter(Boolean))];

  return (
    <div className="mt-12 space-y-6">
      <div className="surface-panel relative overflow-hidden p-7 md:p-8">
        <p className="font-mascot relative text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
          Tokens
        </p>
        {posList.length > 0 && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {posList.map((p) => (
              <span
                key={p}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text)]"
              >
                {p}
              </span>
            ))}
          </div>
        )}
        <div className="relative mt-6 flex flex-wrap items-baseline gap-x-1 gap-y-1 text-[clamp(1.25rem,3.5vw,1.85rem)] font-semibold leading-relaxed tracking-tight text-[var(--text)]">
          {data.words.map((word, index) => (
            <InteractiveWord key={index} wordData={word} />
          ))}
        </div>
      </div>

      <div
        className="surface-panel border border-[var(--border)] p-7 md:p-8"
      >
        <h2 className="font-mascot text-xs font-bold uppercase tracking-[0.2em] text-[var(--green)]">
          Sentence meaning
        </h2>
        <p className="mt-4 font-ln-reading text-[clamp(1.05rem,2.5vw,1.35rem)] leading-relaxed text-[var(--text)]">
          {data.translatedSentence}
        </p>
      </div>
    </div>
  );
}
