import { useMemo } from "react";

// 5-level intensity scale — cool-to-warm gradient matching the tech aesthetic.
function levelFor(count, max) {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const CELL_CLASSES = [
  "bg-gray-100 dark:bg-surface-850",                 // 0 — empty
  "bg-blue-200 dark:bg-blue-900/60",                 // 1 — low
  "bg-blue-400 dark:bg-blue-700/80",                 // 2 — med-low
  "bg-blue-500 dark:bg-blue-500",                    // 3 — med-high
  "bg-blue-600 dark:bg-blue-400",                    // 4 — high
];

const CELL_HOVER = "hover:ring-1 hover:ring-blue-400/50 hover:scale-125 transition-all duration-150";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * GitHub-style contribution heatmap — 53 columns × 7 rows CSS grid.
 * Matches GitHub's layout (column = week, index 0 = Sunday).
 */
export default function Heatmap({ data, compact = false }) {
  const { grid, monthLabels, max } = useMemo(() => buildGrid(data), [data]);

  const cellSize = compact ? "w-[10px] h-[10px]" : "w-[11px] h-[11px]";
  const gap = compact ? "gap-[2px]" : "gap-[3px]";

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <div className="inline-block">
        {/* Month labels */}
        <div
          className={`grid ${gap} mb-1`}
          style={{ gridTemplateColumns: `repeat(53, 11px)` }}
        >
          {monthLabels.map((m, i) => (
            <div key={i} className="h-3 text-[9px] font-mono text-gray-400 dark:text-gray-600 leading-3 whitespace-nowrap">
              {m}
            </div>
          ))}
        </div>

        {/* Grid: day labels + week columns */}
        <div className="flex gap-[6px]">
          {/* Day-of-week labels (only for non-compact) */}
          {!compact && (
            <div className="flex flex-col gap-[3px] shrink-0 w-6">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className={`h-[11px] text-[9px] font-mono text-gray-400 dark:text-gray-600 leading-[11px] ${
                    // Show every other row to avoid clutter
                    i % 2 === 0 ? "" : "invisible"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
          )}

          {/* Week columns */}
          {grid.map((week, wi) => (
            <div key={wi} className={`flex flex-col ${gap}`}>
              {week.map((cell, di) => {
                if (!cell) return <div key={di} className="w-[11px] h-[11px]" />;
                const lvl = levelFor(cell.count, max);
                return (
                  <div
                    key={di}
                    title={`${cell.date} — ${cell.count} log${cell.count === 1 ? "" : "s"}`}
                    className={`${cellSize} rounded-[2px] ${CELL_CLASSES[lvl]} ${CELL_HOVER}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend bar */}
        <div className="flex items-center justify-end gap-[3px] mt-2">
          <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600 mr-1">Less</span>
          {CELL_CLASSES.map((c, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${c}`} />
          ))}
          <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600 ml-1">More</span>
        </div>
      </div>
    </div>
  );
}

function buildGrid(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(cursor);
      cellDate.setDate(cursor.getDate() + d);
      if (cellDate > today || cellDate < start) {
        week.push(null);
      } else {
        const key = iso(cellDate);
        week.push({ date: key, count: data?.[key] ?? 0 });
      }
    }
    weeks.push(week);
    cursor.setDate(cursor.getDate() + 7);
  }

  while (weeks.length < 53) weeks.push(Array.from({ length: 7 }, () => null));
  const grid = weeks.slice(0, 53);

  const monthLabels = [];
  let lastMonth = -1;
  for (const week of grid) {
    const first = week.find((c) => c);
    if (first) {
      const m = new Date(first.date).getMonth();
      monthLabels.push(m !== lastMonth ? MONTHS[m + 1] : "");
      if (m !== lastMonth) lastMonth = m;
    } else {
      monthLabels.push("");
    }
  }

  const max = Math.max(1, ...Object.values(data || {}));
  return { grid, monthLabels, max };
}

function iso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
