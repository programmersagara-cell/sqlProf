// Query history persisted in localStorage.
const KEY = 'sqllab.history.v1';
const MAX = 50;

let items = (() => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
})();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

export function getHistory() { return items; }

export function addHistory(sql) {
  const trimmed = (sql || '').trim();
  if (!trimmed) return;
  items = items.filter((i) => i.sql !== trimmed);
  items.unshift({ sql: trimmed, time: Date.now() });
  if (items.length > MAX) items = items.slice(0, MAX);
  persist();
}

export function deleteHistory(index) {
  items.splice(index, 1);
  persist();
}

export function clearHistory() {
  items = [];
  persist();
}
