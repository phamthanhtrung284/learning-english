"use client";

import { useMemo } from "react";

interface VocabWord {
  createdAt?: string;
}

function HeatmapCell({ level }: { level: number }) {
  return (
    <div
      className={`heatmap-l${level} h-3 w-3 rounded-sm`}
      style={{
        background:
          level === 0
            ? "color-mix(in srgb, var(--text-soft) 8%, transparent)"
            : level === 1
              ? "color-mix(in srgb, var(--primary) 25%, transparent)"
              : level === 2
                ? "color-mix(in srgb, var(--primary) 50%, transparent)"
                : level === 3
                  ? "color-mix(in srgb, var(--primary) 75%, transparent)"
                  : "var(--primary)",
      }}
    />
  );
}

export default function VocabularyHeatmap({ words = [] }: { words?: VocabWord[] }) {
  const { counts, maxCount, weeks } = useMemo(() => {
    const now = new Date();
    const dayCounts: Record<string, number> = {};

    for (const w of words) {
      if (!w.createdAt) continue;
      const d = new Date(w.createdAt);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    }

    const totalDays = 12 * 7;
    const dates: Date[] = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d);
    }

    const weeksArr: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];
    for (const d of dates) {
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      currentWeek.push({ date: d, count: dayCounts[key] || 0 });
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeksArr.push(currentWeek);

    const vals = Object.values(dayCounts);
    const max = vals.length > 0 ? Math.max(...vals) : 0;

    return { counts: dayCounts, maxCount: max, weeks: weeksArr };
  }, [words]);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (maxCount <= 1) return count;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels: { label: string; offset: number }[] = useMemo(() => {
    const labels: { label: string; offset: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const m = week[0]?.date.getUTCMonth();
      if (m !== undefined && m !== lastMonth) {
        labels.push({ label: MONTH_LABELS[m], offset: wi });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        <div className="flex flex-col gap-[3px] pr-1 pt-5">
          {DAY_LABELS.map((l, i) => (
            <div key={i} className="flex h-3 items-center text-[9px] font-semibold text-[var(--text-soft)]">
              {l}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="relative mb-1 flex" style={{ height: 14 }}>
            {monthLabels.map((m) => (
              <div
                key={m.label}
                className="absolute text-[9px] font-semibold text-[var(--text-soft)]"
                style={{ left: `${(m.offset / weeks.length) * 100}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <HeatmapCell key={di} level={getLevel(day.count)} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[9px] font-semibold text-[var(--text-soft)]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <HeatmapCell key={l} level={l} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
