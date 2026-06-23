"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function UserHome() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.username?.trim() || user?.email?.split("@")[0] || "Warrior";

  return (
    <div className="relative flex h-full items-center overflow-hidden">
      {/* Casca — right, bottom-anchored, slightly larger */}
      <div
        className="pointer-events-none absolute bottom-0 right-[4vw] select-none"
        aria-hidden
        style={{ width: "clamp(280px, 44vw, 620px)" }}
      >
        <Image
          src="/hero.png"
          alt=""
          width={620}
          height={880}
          priority
          draggable={false}
          className="h-auto w-full object-contain object-bottom"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 14%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 14%)",
          }}
        />
      </div>

      {/* Left content */}
      <div className="relative z-10 px-8 md:px-14 lg:px-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]">
          English Studio
        </p>
        <h1
          className="font-display mt-4 font-extrabold leading-[1.06] tracking-tight text-[var(--text)]"
          style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)" }}
        >
          Forge your
          <br />
          <span
            style={{
              backgroundImage: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            English
          </span>{" "}
          here.
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-[var(--text-soft)]">
          Welcome back,{" "}
          <span className="font-semibold text-[var(--text)]">{displayName}</span>.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/read")}
            className="btn-primary-glow rounded-xl px-7 py-3 text-[15px] font-bold"
          >
            Start reading →
          </button>
          <button
            type="button"
            onClick={() => router.push("/translate")}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-7 py-3 text-[15px] font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
          >
            Practice translation
          </button>
        </div>
      </div>
    </div>
  );
}
