import { useMemo } from "react";

const WEEKS = 12;
const DAYS = 7;

const LEVEL_CLASS = ["heatmap-l0", "heatmap-l1", "heatmap-l2", "heatmap-l3", "heatmap-l4"];

function startOfUtcDay(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function formatDayKey(d) {
  return startOfUtcDay(d).toISOString().slice(0, 10);
}

/**
 * @param {{ words?: Array<{ createdAt?: string }> }} props
 */
export default function VocabularyHeatmap({ words = [] }) {
  const { grid, maxCount, monthLabel } = useMemo(() => {
    const counts = {};
    for (const w of words) {
      if (!w?.createdAt) continue;
      const k = formatDayKey(w.createdAt);
      counts[k] = (counts[k] || 0) + 1;
    }
    const today = startOfUtcDay(new Date());
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - (WEEKS * DAYS - 1));

    const cells = [];
    let max = 0;
    for (let i = 0; i < WEEKS * DAYS; i++) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + i);
      const key = formatDayKey(day);
      const c = counts[key] || 0;
      max = Math.max(max, c);
      cells.push({ key, count: c, date: day });
    }

    const grid = [];
    for (let col = 0; col < WEEKS; col++) {
      const column = [];
      for (let row = 0; row < DAYS; row++) {
        column.push(cells[col * DAYS + row]);
      }
      grid.push(column);
    }

    const monthLabel = today.toLocaleString(undefined, { month: "short", year: "numeric" });

    return { grid, maxCount: max, monthLabel };
  }, [words]);

  const level = (count) => {
    if (count <= 0) return 0;
    if (!maxCount) return 1;
    const r = count / maxCount;
    if (r <= 0.25) return 1;
    if (r <= 0.5) return 2;
    if (r <= 0.75) return 3;
    return 4;
  };

  return (
    <div className="ln-studio-ui surface-panel animate-fade-rise overflow-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mascot text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            Words learned
          </p>
          <p className="text-xs font-bold text-[var(--text-soft)]">
            {monthLabel} · last {WEEKS} weeks
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-soft)]">
          <span className="heatmap-cell heatmap-l0" />
          <span className="heatmap-cell heatmap-l2" />
          <span className="heatmap-cell heatmap-l4" />
          <span>less → more</span>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1" role="img" aria-label="Vocabulary activity heatmap">
        {grid.map((column, ci) => (
          <div key={ci} className="flex flex-col items-center gap-1">
            <span className="mb-0.5 text-[9px] font-bold uppercase text-[var(--text-soft)] opacity-80">
              {ci % 4 === 0 ? `W${ci + 1}` : ""}
            </span>
            <div className="flex flex-col gap-1">
              {column.map((cell) => {
                const lv = level(cell.count);
                return (
                  <div
                    key={cell.key}
                    title={`${cell.key}: ${cell.count} saved`}
                    className={`heatmap-cell ${LEVEL_CLASS[lv]}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-[var(--text-soft)]">
        Cells = saved words per day · hover for details
      </p>
    </div>
  );
}
