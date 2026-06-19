/**
 * Sidebar: habit list with terminal-style cards, status indicators, and actions.
 */
export default function Sidebar({ habits, habitStats, onLog, onDelete, onAdd }) {
  return (
    <aside className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 font-mono">
            Active Tracks
          </h2>
          <span className="badge bg-gray-100 dark:bg-surface-700 text-gray-500 dark:text-gray-400">
            {habits.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[11px] font-mono font-medium px-3 py-1.5 transition-all shadow-sm shadow-blue-600/20"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </button>
      </div>

      {/* Habit list */}
      {habits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-mono">
            No habits tracked yet.
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 font-mono">
            Click <span className="text-blue-500">+ New</span> to begin.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {habits.map((h) => {
            const stats = habitStats?.[h.id];
            const loggedToday = stats && getTodayCount(stats) > 0;
            return (
              <li
                key={h.id}
                className="group rounded-xl bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/40 p-3.5 transition-all hover:border-blue-300/40 dark:hover:border-blue-500/30 hover:shadow-sm hover:shadow-blue-500/5 animate-fade-in"
              >
                {/* Top row: name + actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Status dot */}
                    <span className={`shrink-0 w-2 h-2 rounded-full ${
                      loggedToday
                        ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`} />
                    <span className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
                      {h.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onDelete(h.id)}
                    title="Delete"
                    className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>

                {/* Metadata row */}
                <div className="flex items-center gap-2 mt-1.5 ml-4">
                  <span className="badge bg-gray-100 dark:bg-surface-700 text-gray-500 dark:text-gray-400">
                    {h.target_frequency}
                  </span>
                  {stats && (
                    <>
                      <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                        🔥 {stats.current_streak}d
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600">
                        {Math.round(stats.completion_rate_30d * 100)}% 30d
                      </span>
                    </>
                  )}
                </div>

                {/* Log button */}
                <button
                  onClick={() => onLog(h)}
                  disabled={loggedToday}
                  className="mt-3 ml-4 flex items-center gap-1.5 rounded-lg text-[11px] font-mono font-medium px-3 py-1.5 transition-all disabled:opacity-40 disabled:cursor-default bg-gray-100 dark:bg-surface-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-gray-600 dark:text-gray-300 shadow-none hover:shadow-sm hover:shadow-blue-600/20"
                >
                  {loggedToday ? (
                    <>
                      <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Logged
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Log Today
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

function getTodayCount(stats) {
  const t = new Date();
  const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  return stats.heatmap?.[key] ?? 0;
}
