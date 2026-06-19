/**
 * Technical stat card with monospace value, subtle status bar, and metric label.
 */
export default function StatCard({ label, value, sub, icon, accent = "blue" }) {
  const accents = {
    blue: "text-blue-500",
    green: "text-emerald-500",
    violet: "text-violet-500",
    amber: "text-amber-500",
  };

  return (
    <div className="glow-ring group relative flex flex-col justify-between rounded-xl bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm p-5 transition-all hover:bg-white/90 dark:hover:bg-surface-800/90 overflow-hidden">
      {/* Decorative top bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
        accent === "green" ? "from-emerald-500 to-emerald-500/0" :
        accent === "violet" ? "from-violet-500 to-violet-500/0" :
        accent === "amber" ? "from-amber-500 to-amber-500/0" :
        "from-blue-500 to-blue-500/0"
      }`} />

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${accents[accent]}`}>{icon}</span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="font-mono text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {value}
      </div>

      {/* Sublabel */}
      {sub && (
        <div className="mt-1 text-[11px] font-mono text-gray-400 dark:text-gray-500">
          {sub}
        </div>
      )}
    </div>
  );
}
