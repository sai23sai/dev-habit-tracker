// Thin API client wrapping fetch. All endpoints live under /api.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listHabits: () => request("/api/habits"),
  createHabit: (payload) =>
    request("/api/habits", { method: "POST", body: JSON.stringify(payload) }),
  deleteHabit: (id) => request(`/api/habits/${id}`, { method: "DELETE" }),
  logHabit: (id, note) =>
    request(`/api/habits/${id}/log`, {
      method: "POST",
      body: JSON.stringify(note ? { note } : {}),
    }),
  getStats: () => request("/api/stats"),
};
