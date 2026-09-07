// Progress tracking + gamification, persisted in localStorage.
// No account/login required.

const KEY = 'sqllab.progress.v1';

const DEFAULTS = {
  completed: {},       // { [challengeId]: { attempts, hintsUsed, completedAt } }
  attempts: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  hintsUsed: 0,
  xp: 0,
  badges: [],
};

export const BADGES = [
  { id: 'first-blood', name: 'First Query', icon: '🥇', desc: 'Complete your first challenge' },
  { id: 'beginner-done', name: 'WHERE Explorer', icon: '🧭', desc: 'Finish all Beginner challenges' },
  { id: 'intermediate-done', name: 'Join Journeyman', icon: '🔗', desc: 'Finish all Intermediate challenges' },
  { id: 'advanced-done', name: 'SQL Sensei', icon: '🥋', desc: 'Finish all Advanced challenges' },
  { id: 'streak5', name: 'On Fire', icon: '🔥', desc: '5 correct answers in a row' },
  { id: 'xp1000', name: 'XP Collector', icon: '💎', desc: 'Earn 1000 XP' },
  { id: 'no-hints', name: 'Purist', icon: '🧠', desc: 'Complete a challenge with no hints' },
];

const XP_PER_LEVEL = { beginner: 100, intermediate: 150, advanced: 250 };

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); }
  catch { /* storage unavailable — progress stays in memory only */ }
}

let progress = loadProgress();
export function getProgress() { return progress; }

function unlock(badgeId) {
  const b = BADGES.find((x) => x.id === badgeId);
  if (b && !progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
    return b;
  }
  return null;
}

/** Record an attempt. Returns { newlyCompleted, badges, xpGained } */
export function recordAttempt(challenge, status, hintsUsed) {
  const out = { newlyCompleted: false, badges: [], xpGained: 0 };
  progress.attempts += 1;
  if (status === 'correct') {
    progress.correct += 1;
    progress.streak += 1;
    progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
  } else if (status === 'incorrect' || status === 'error') {
    progress.streak = 0;
  }
  progress.hintsUsed += hintsUsed || 0;

  const rec = progress.completed[challenge.id];
  const isNew = !rec || !rec.completedAt;
  if (status === 'correct' && isNew) {
    progress.completed[challenge.id] = {
      attempts: (rec ? rec.attempts : 0) + 1,
      hintsUsed,
      completedAt: Date.now(),
    };
    out.newlyCompleted = true;
    const xp = XP_PER_LEVEL[challenge.level] || 100;
    progress.xp += xp;
    out.xpGained = xp;
    const b1 = unlock('first-blood'); if (b1) out.badges.push(b1);
    if (hintsUsed === 0) { const b = unlock('no-hints'); if (b) out.badges.push(b); }
    if (progress.streak >= 5) { const b = unlock('streak5'); if (b) out.badges.push(b); }
    if (progress.xp >= 1000) { const b = unlock('xp1000'); if (b) out.badges.push(b); }
    if (countByLevel('beginner') >= 10) { const b = unlock('beginner-done'); if (b) out.badges.push(b); }
    if (countByLevel('intermediate') >= 10) { const b = unlock('intermediate-done'); if (b) out.badges.push(b); }
    if (countByLevel('advanced') >= 10) { const b = unlock('advanced-done'); if (b) out.badges.push(b); }
  }
  save(progress);
  return out;
}

export function countByLevel(level) {
  return Object.keys(progress.completed).filter((id) => id.startsWith(level + '-')).length;
}

export function overallPercent(total) {
  const done = Object.keys(progress.completed).length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function resetProgress() {
  progress = { ...DEFAULTS };
  save(progress);
}
