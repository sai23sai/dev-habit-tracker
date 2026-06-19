import { useEffect, useState } from "react";

const FREQUENCIES = ["daily", "weekly", "custom"];

export default function CreateHabitModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [customFreq, setCustomFreq] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setName(""); setFrequency("daily"); setCustomFreq(""); setError(""); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    const target_frequency = frequency === "custom" ? customFreq.trim() || "custom" : frequency;
    onCreate({ name: name.trim(), target_frequency });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-surface-900 border border-gray-200 dark:border-gray-700/60 shadow-2xl shadow-blue-500/5 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              New Habit
            </h3>
            <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
              Define a new track to monitor
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 font-mono">
              Habit Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ship code before noon"
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-850 px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 font-mono">
              Target Frequency
            </label>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium capitalize transition-all ${
                    frequency === f
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : "bg-gray-100 dark:bg-surface-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-surface-700/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {frequency === "custom" && (
              <input
                value={customFreq}
                onChange={(e) => setCustomFreq(e.target.value)}
                placeholder="e.g. 3x per week, Mon/Wed/Fri"
                className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-850 px-3.5 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-3 py-2 text-[11px] font-mono text-red-600 dark:text-red-400">
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-[11px] font-mono font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all"
            >
              Create Track
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
