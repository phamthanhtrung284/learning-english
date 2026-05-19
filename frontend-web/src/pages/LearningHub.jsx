import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import mascotImg from "../assets/hero.png";

export default function LearningHub({ profile = {} }) {
  const navigate = useNavigate();
  const [wordCount, setWordCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/vocabulary/list");
        if (!cancelled && Array.isArray(data)) setWordCount(data.length);
      } catch { /* ignore */ }
    };
    const id = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback(load, { timeout: 2500 })
      : setTimeout(load, 80);
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#080809" }}>

      {/* ── Character image — absolute, right side, full height ── */}
      <div className="absolute inset-y-0 right-0 z-0 hidden md:block" style={{ width: "55%" }}>
        <img
          src={mascotImg}
          alt=""
          aria-hidden
          draggable={false}
          className="h-full w-full select-none object-cover object-top"
          style={{
            filter: "invert(1) contrast(1.05)",
            mixBlendMode: "screen",
          }}
        />
        {/* Gradient mask: fade left edge into bg so no hard line */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, #080809 0%, rgba(8,8,9,0.55) 30%, rgba(8,8,9,0.0) 65%)",
          }}
          aria-hidden
        />
        {/* Gradient mask: fade bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, #080809 0%, transparent 25%)",
          }}
          aria-hidden
        />
      </div>

      {/* ── Manga speed-lines ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          background: "repeating-conic-gradient(from 0deg at 62% 50%, transparent 0deg, transparent 4deg, rgba(255,255,255,0.8) 4.1deg, transparent 4.2deg)",
        }}
        aria-hidden
      />

      {/* ── Red atmospheric glow left ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 45% 70% at 0% 65%, rgba(140,12,4,0.32) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      {/* ── Halftone dots ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.018]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />

      {/* ── Text content — left side, above everything ── */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 py-10 md:w-[52%] md:px-12 lg:px-16 xl:px-20">

        {/* Online tag */}
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c0392b]/35 bg-[#c0392b]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e74c3c]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e74c3c]" />
          Online · Miễn phí
        </div>

        {/* Headline */}
        <h1
          className="mt-5 font-black leading-[1.05] tracking-tight"
          style={{
            fontFamily: "'Cinzel', 'DM Sans', serif",
            fontSize: "clamp(2.6rem, 5.2vw, 4.4rem)",
            color: "#ede9e0",
            textShadow: "0 2px 60px rgba(0,0,0,0.8)",
          }}
        >
          HỌC TIẾNG ANH<br />
          <span
            style={{
              background: "linear-gradient(90deg, #e74c3c 0%, #c0392b 60%, #8b0000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TỰ NHIÊN
          </span>
          <br />
          QUA ĐỌC SÁCH
        </h1>

        <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-[#6b6860]">
          Click vào bất kỳ từ nào để xem nghĩa, IPA, và lưu vào sổ từ — không cần rời khỏi trang đọc.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/read")}
            className="inline-flex min-h-[50px] items-center gap-2.5 rounded-xl px-8 py-3 text-[15px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: "linear-gradient(135deg, #c0392b 0%, #8b0000 100%)",
              boxShadow: "0 4px 24px rgba(192,57,43,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            Bắt đầu đọc
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => navigate("/analyze")}
            className="inline-flex min-h-[50px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-[15px] font-bold text-[#ede9e0] backdrop-blur-sm transition hover:border-[#c0392b]/40 hover:bg-[#c0392b]/8 active:scale-[0.99]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Phân tích câu
          </button>
        </div>

        {/* Feature list */}
        <ul className="mt-9 space-y-3">
          {[
            { icon: "📖", text: "Thư viện Light Novel — đọc văn học thật" },
            { icon: "✦",  text: "Click từ — nghĩa tiếng Việt + IPA ngay lập tức" },
            { icon: "📒", text: `Sổ từ vựng — ${wordCount ?? "…"} từ đã lưu` },
            { icon: "🎯", text: "Double-click câu — tô màu ngữ pháp" },
          ].map((f) => (
            <li key={f.text} className="flex items-center gap-3 text-[14px] text-[#6b6860]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-white/8 bg-white/5 text-sm">
                {f.icon}
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
