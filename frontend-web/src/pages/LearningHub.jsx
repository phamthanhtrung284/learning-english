import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import mascotImg from "../assets/hero.png";

export default function LearningHub() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const d = isDark;

  // ── colours ──────────────────────────────────────────────────────────────
  const imgFilter = d ? "invert(1) contrast(1.05)" : "contrast(1.08) brightness(0.96)";
  const imgBlend  = d ? "screen"                   : "multiply";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse 45% 70% at 0% 65%, var(--glow-red) 0%, transparent 60%)",
      }} aria-hidden />

      {/* Character image */}
      <div className="absolute inset-y-0 z-0 hidden md:block" style={{ left: "28%", right: 0 }}>
        <img
          src={mascotImg} alt="" aria-hidden draggable={false}
          className="h-full w-full select-none object-contain object-bottom"
          style={{ filter: imgFilter, mixBlendMode: imgBlend }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--bg) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 30%, transparent 62%)" }} aria-hidden />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg) 0%, transparent 20%)" }} aria-hidden />
      </div>

      {/* ── Left content ── */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className="w-full px-8 py-10 md:w-[50%] md:px-12 lg:px-16 xl:px-20">

          {/* Tag */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ border: "1px solid color-mix(in srgb, var(--primary) 32%, transparent)", background: "var(--accent-soft)", color: "var(--primary-2)" }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--primary-2)" }} />
            Online · Free
          </div>

          {/* Headline */}
          <h1 className="mt-5 font-black leading-[1.06] tracking-tight"
            style={{ fontFamily: "'Cinzel','DM Sans',serif", fontSize: "clamp(2.4rem,5vw,4.2rem)", color: "var(--text)" }}>
            LEARN ENGLISH<br />
            <span style={{
              background: "linear-gradient(90deg, var(--primary-2) 0%, var(--primary) 55%, #8b0000 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              NATURALLY
            </span><br />
            THROUGH READING
          </h1>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => navigate("/read")}
              className="inline-flex min-h-[50px] items-center gap-2.5 rounded-xl px-8 py-3 text-[15px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                fontFamily: "'DM Sans',sans-serif",
                background: "linear-gradient(135deg, var(--primary-2) 0%, var(--primary) 60%, #8b0000 100%)",
                boxShadow: "0 4px 24px rgba(192,57,43,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}>
              Start Reading Now →
            </button>
            <button type="button" onClick={() => navigate("/analyze")}
              className="inline-flex min-h-[50px] items-center gap-2 rounded-xl px-8 py-3 text-[15px] font-bold transition hover:opacity-80 active:scale-[0.99]"
              style={{ fontFamily: "'DM Sans',sans-serif", border: "1.5px solid var(--border)", background: "color-mix(in srgb, var(--bg-card) 60%, transparent)", color: "var(--text)" }}>
              Try Sentence Analyzer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
