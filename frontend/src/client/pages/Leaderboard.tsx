"use client";

import { useEffect, useState } from "react";
import api from "@share/services/api";

function RankMedal({ rank }: { rank: number }) {
  const top = rank <= 3;
  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] font-mono text-sm font-extrabold ${
        top
          ? "bg-[var(--gradient-primary)] text-white shadow-[var(--shadow-soft)]"
          : "bg-[var(--bg-card)] text-[var(--text)]"
      }`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

function PodiumCard({ r, tall }: { r: { rank: number; username: string; xp: number; level?: string; streak?: number }; tall: boolean }) {
  if (!r) return <div className="w-[min(30%,140px)]" aria-hidden />;
  return (
    <div
      className={`flex w-[min(30%,140px)] flex-col items-center rounded-[24px] border border-[var(--border)] bg-[var(--bg-card)] px-3 text-center shadow-[var(--shadow-soft)] ${
        tall ? "pb-6 pt-8" : "pb-5 pt-6"
      }`}
      style={
        tall
          ? {
              boxShadow: "var(--shadow-card), 0 0 40px -10px color-mix(in srgb, var(--yellow) 40%, transparent)",
              borderColor: "color-mix(in srgb, var(--yellow) 55%, transparent)",
              background: "color-mix(in srgb, var(--yellow) 12%, var(--bg-card))",
            }
          : undefined
      }
    >
      <RankMedal rank={r.rank} />
      <p className={`mt-3 truncate font-bold text-[var(--text)] ${tall ? "text-sm" : "text-xs"}`}>{r.username}</p>
      <p className={`mt-1 font-mono font-bold text-[var(--primary)] ${tall ? "text-base" : "text-sm"}`}>
        {(r.xp ?? 0).toLocaleString()} XP
      </p>
      <p className="mt-1 text-[10px] font-bold text-[var(--text-soft)]">
        {r.level || "—"} · streak {r.streak ?? 0}
      </p>
    </div>
  );
}

interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  xp: number;
  level?: string;
  streak?: number;
}

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/leaderboard", { params: { limit: 20 } });
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Could not load leaderboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const second = top3[1];
  const first = top3[0];
  const third = top3[2];

  return (
    <div className="surface-panel animate-fade-rise relative overflow-hidden p-6 md:p-10">
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--gradient-yellow)] opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[var(--gradient-primary)] opacity-20 blur-3xl" />

      <p className="font-mascot relative text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Progress</p>
      <h1 className="font-display relative mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] md:text-[2.25rem]">
        Leaderboard
      </h1>
      <p className="relative mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--text-soft)]">
        Ranked by XP. Earn points by analyzing sentences (+10) and saving new vocabulary (+5).
      </p>

      {loading && (
        <div className="mt-12 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--primary)_25%,transparent)] border-t-[var(--primary)]" />
        </div>
      )}
      {error && (
        <p className="relative mt-8 rounded-[18px] border border-red-400/35 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-4 py-3 text-sm text-red-800 dark:text-red-100">
          {error}
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="relative mt-10">
          {rows.length === 1 ? (
            <div className="flex justify-center">
              <PodiumCard r={first} tall />
            </div>
          ) : rows.length === 2 ? (
            <div className="flex items-end justify-center gap-4">
              <PodiumCard r={second} tall={false} />
              <PodiumCard r={first} tall />
            </div>
          ) : (
            <div className="flex items-end justify-center gap-3 md:gap-6">
              <PodiumCard r={second} tall={false} />
              <PodiumCard r={first} tall />
              <PodiumCard r={third} tall={false} />
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-10 space-y-3">
              {rest.map((r) => (
                <div key={r.id} className="flex items-center gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 shadow-[var(--shadow-soft)]">
                  <RankMedal rank={r.rank} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-[var(--text)]">{r.username}</p>
                    <p className="text-xs font-semibold text-[var(--text-soft)]">{r.level || "—"} · streak {r.streak ?? 0}</p>
                  </div>
                  <div className="text-right font-mono text-sm font-extrabold tabular-nums text-[var(--primary)]">
                    {(r.xp ?? 0).toLocaleString()}
                    <span className="block text-[10px] font-bold uppercase text-[var(--text-soft)]">XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="relative mt-12 rounded-[22px] border border-dashed border-[var(--border)] py-12 text-center text-[var(--text-soft)]">
          No learners yet. Be the first to earn XP.
        </p>
      )}
    </div>
  );
}
