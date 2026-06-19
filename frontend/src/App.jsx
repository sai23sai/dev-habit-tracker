import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { useDarkMode } from "./useDarkMode";
import Heatmap from "./components/Heatmap";
import StatCard from "./components/StatCard";
import Sidebar from "./components/Sidebar";
import CreateHabitModal from "./components/CreateHabitModal";

export default function App() {
  const { isDark, toggle } = useDarkMode();

  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [hs, st] = await Promise.all([api.listHabits(), api.getStats()]);
      setHabits(hs);
      setStats(st);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async (payload) => {
    setBusy(true);
    try { await api.createHabit(payload); setModalOpen(false); await refresh(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const handleLog = async (habit) => {
    setBusy(true);
    try { await api.logHabit(habit.id); await refresh(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this habit and all its logs?")) return;
    setBusy(true);
    try { await api.deleteHabit(id); await refresh(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const habitStats = stats?.habits
    ? Object.fromEntries(stats.habits.map((h) => [h.habit_id, h]))
    : {};

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-gray-900 dark:text-gray-100 transition-colors">

      {/* ── Top Bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-surface-50/80 dark:bg-surface-950/80 border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-blue-500/25">
              H
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                Dev Habit Tracker
              </span>
              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600 leading-tight">
                v1.0.0 — local
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* API status indicator */}
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${!error && !loading ? "bg-emerald-500" : loading ? "bg-amber-500" : "bg-red-500"}`} />
              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600">
                localhost:8000
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-800" />

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-white/50 dark:bg-surface-800/50 px-3 py-1.5 text-[11px] font-mono text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-800 transition-all"
              title="Toggle theme"
            >
              {isDark ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-2.5 text-[11px] font-mono text-red-600 dark:text-red-400 animate-fade-in">
            <span className="font-semibold">ERROR:</span> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm font-mono text-gray-400">Loading data…</span>
            </div>
          </div>
        ) : (
          <>
            {/* ── Section 1: Metrics Overview ────────────── */}
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                  Overview
                </span>
                <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-800/60" />
                <span className="text-[10px] font-mono text-gray-300 dark:text-gray-700">
                  last 30d
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  icon="🔥"
                  label="Current Streak"
                  value={`${stats?.current_streak ?? 0}d`}
                  sub="consecutive days"
                  accent="amber"
                />
                <StatCard
                  icon="🏆"
                  label="Best Streak"
                  value={`${stats?.longest_streak ?? 0}d`}
                  sub="all-time record"
                  accent="violet"
                />
                <StatCard
                  icon="📊"
                  label="Completion"
                  value={`${stats ? Math.round(stats.completion_rate_30d * 100) : 0}%`}
                  sub={`${stats?.total_logs ?? 0} total logs`}
                  accent="green"
                />
                <StatCard
                  icon="🎯"
                  label="Active Habits"
                  value={habits.length}
                  sub="being tracked"
                  accent="blue"
                />
              </div>
            </section>

            {/* ── Section 2: Activity Heatmap ───────────── */}
            <section className="mb-6 rounded-xl bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/40 p-5 glow-ring">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                  Activity
                </span>
                <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-800/60" />
                <span className="text-[10px] font-mono text-gray-300 dark:text-gray-700">
                  365 days
                </span>
              </div>
              <Heatmap data={stats?.heatmap || {}} />
            </section>

            {/* ── Section 3: Habits + Detail ────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Sidebar (left) */}
              <div className="lg:col-span-4 xl:col-span-3">
                <Sidebar
                  habits={habits}
                  habitStats={habitStats}
                  onLog={handleLog}
                  onDelete={handleDelete}
                  onAdd={() => setModalOpen(true)}
                />
              </div>

              {/* Detail panel (right) */}
              <div className="lg:col-span-8 xl:col-span-9">
                <div className="rounded-xl bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/40 p-5 glow-ring">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                      Per-Habit Breakdown
                    </span>
                    <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-800/60" />
                  </div>

                  {stats && stats.habits.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {stats.habits.map((h) => (
                        <div key={h.habit_id} className="animate-fade-in">
                          {/* Habit header */}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {h.habit_name}
                            </span>
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                🔥 {h.current_streak}d
                              </span>
                              <span className="badge bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                🏆 {h.longest_streak}d
                              </span>
                              <span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                {Math.round(h.completion_rate_30d * 100)}%
                              </span>
                            </div>
                          </div>
                          {/* Per-habit heatmap */}
                          <Heatmap data={h.heatmap} compact />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-sm font-mono text-gray-300 dark:text-gray-600">
                        No habits tracked yet
                      </p>
                      <p className="text-xs font-mono text-gray-300/60 dark:text-gray-700 mt-1">
                        Data will appear here once you create and log habits
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Footer ────────────────────────────────────── */}
        <footer className="mt-8 pb-4 flex items-center justify-between text-[10px] font-mono text-gray-300 dark:text-gray-700">
          <span>habit-tracker — single user, no auth</span>
          {busy && (
            <span className="text-blue-400 dark:text-blue-500 animate-pulse">syncing…</span>
          )}
          <span>{new Date().getFullYear()}</span>
        </footer>
      </main>

      <CreateHabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
