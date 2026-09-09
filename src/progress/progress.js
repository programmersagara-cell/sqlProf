// Progress tracking + gamification, persisted in localStorage.
// No account/login required.
import { CHALLENGES } from '../challenges/index.js';

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
  { id: 'streak10', name: 'Unstoppable', icon: '⚡', desc: '10 correct answers in a row' },
  { id: 'xp1000', name: 'XP Collector', icon: '💎', desc: 'Earn 1000 XP' },
  { id: 'xp2500', name: 'XP Master', icon: '👑', desc: 'Earn 2500 XP' },
  { id: 'no-hints', name: 'Purist', icon: '🧠', desc: 'Complete a challenge with no hints' },
  { id: 'one-shot', name: 'One Shot', icon: '🎯', desc: 'Solve a challenge on your first attempt, no hints' },
  { id: 'db-explorer', name: 'Globetrotter', icon: '🗺️', desc: 'Solve at least one challenge in every database' },
  { id: 'halfway', name: 'Halfway There', icon: '🌗', desc: 'Complete half of all challenges' },
  { id: 'completionist', name: 'Grand SQL Master', icon: '🏆', desc: 'Complete every single challenge' },
];

/** Number of challenges per level (derived from the registry). */
function levelTotal(level) {
  return CHALLENGES.filter((c) => c.level === level).length;
}

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
    if (hintsUsed === 0 && rec && rec.attempts === 0) { const b = unlock('one-shot'); if (b) out.badges.push(b); }
    if (progress.streak >= 5) { const b = unlock('streak5'); if (b) out.badges.push(b); }
    if (progress.streak >= 10) { const b = unlock('streak10'); if (b) out.badges.push(b); }
    if (progress.xp >= 1000) { const b = unlock('xp1000'); if (b) out.badges.push(b); }
    if (progress.xp >= 2500) { const b = unlock('xp2500'); if (b) out.badges.push(b); }
    if (countByLevel('beginner') >= levelTotal('beginner')) { const b = unlock('beginner-done'); if (b) out.badges.push(b); }
    if (countByLevel('intermediate') >= levelTotal('intermediate')) { const b = unlock('intermediate-done'); if (b) out.badges.push(b); }
    if (countByLevel('advanced') >= levelTotal('advanced')) { const b = unlock('advanced-done'); if (b) out.badges.push(b); }
    const solvedDbs = new Set(CHALLENGES.filter((c) => progress.completed[c.id] && progress.completed[c.id].completedAt).map((c) => c.db));
    if (solvedDbs.size >= new Set(CHALLENGES.map((c) => c.db)).size) { const b = unlock('db-explorer'); if (b) out.badges.push(b); }
    const solved = Object.keys(progress.completed).filter((id) => progress.completed[id] && progress.completed[id].completedAt).length;
    if (CHALLENGES.length && solved * 2 >= CHALLENGES.length) { const b = unlock('halfway'); if (b) out.badges.push(b); }
    if (CHALLENGES.length && solved >= CHALLENGES.length) { const b = unlock('completionist'); if (b) out.badges.push(b); }
  }
  save(progress);
  return out;
}

export function countByLevel(level) {
  const done = new Set(Object.keys(progress.completed).filter((id) => progress.completed[id] && progress.completed[id].completedAt));
  return CHALLENGES.filter((c) => c.level === level && done.has(c.id)).length;
}

export function overallPercent(total) {
  const done = Object.keys(progress.completed).length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function resetProgress() {
  progress = { ...DEFAULTS };
  save(progress);
}
