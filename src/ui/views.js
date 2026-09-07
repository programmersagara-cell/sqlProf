// Learn, Cheat Sheet, Challenges list and Progress views.
import { LESSONS } from '../lessons/lessons.js';
import { CHEATSHEET } from '../cheatsheet/cheatsheet.js';
import { CHALLENGES, challengeNumber, LEVEL_LABELS } from '../challenges/index.js';
import * as engine from '../engine/sqlEngine.js';
import { getProgress, BADGES, resetProgress, countByLevel, overallPercent } from '../progress/progress.js';
import { escapeHtml, toast, confirmModal, resultTable } from './helpers.js';
import { CHALLENGE_TOTAL } from './counts.js';

const $ = (id) => document.getElementById(id);

/* ---------------- Learn ---------------- */

let currentLesson = LESSONS[0].id;

export function renderLessonList() {
  $('lessonList').innerHTML = LESSONS.map((l) =>
    `<li><button class="side-btn ${l.id === currentLesson ? 'active' : ''}" data-lesson="${l.id}">${escapeHtml(l.title)}</button></li>`).join('');
  $('lessonList').querySelectorAll('.side-btn').forEach((b) =>
    b.addEventListener('click', () => { currentLesson = b.dataset.lesson; renderLessonList(); renderLesson(); }));
}

function tryItEditorHtml(sql, idSuffix) {
  return `
    <div class="tryit">
      <textarea class="tryit-input" data-tryit="${idSuffix}" aria-label="Try this topic in the editor">${escapeHtml(sql)}</textarea>
      <div class="tryit-actions">
        <button class="btn btn-primary btn-sm" data-tryit-run="${idSuffix}">▶ Run</button>
        <button class="btn btn-secondary btn-sm" data-tryit-main="${idSuffix}">Open in main editor ↗</button>
      </div>
      <div class="tryit-result" id="tryit-result-${idSuffix}" aria-live="polite"></div>
    </div>`;
}

export function renderLesson() {
  const l = LESSONS.find((x) => x.id === currentLesson) || LESSONS[0];
  $('lessonBody').innerHTML = `
    <article>
      <h2>${escapeHtml(l.title)}</h2>
      <h3>What is it?</h3>
      <p>${escapeHtml(l.what)}</p>
      <h3>Syntax</h3>
      <pre class="code-block"><code>${escapeHtml(l.syntax)}</code></pre>
      <h3>Example</h3>
      <pre class="code-block"><code>${escapeHtml(l.example)}</code></pre>
      <h3>Result</h3>
      <p>${escapeHtml(l.result)}</p>
      <h3>Try it yourself</h3>
      ${tryItEditorHtml(l.trySql, l.id)}
      <h3>Common mistakes</h3>
      <ul>${l.mistakes.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
      <div class="lesson-cta">
        <button class="btn btn-primary" id="btnPracticeTopic">Practice This Topic →</button>
      </div>
    </article>`;
  bindTryIt(l.id);
  $('btnPracticeTopic').addEventListener('click', () => {
    const firstChallenge = CHALLENGES.find((c) => c.title.toLowerCase().includes(l.title.split(' ')[0].toLowerCase()));
    window.dispatchEvent(new CustomEvent('sqllab:navigate', { detail: 'challenges' }));
    if (firstChallenge) window.dispatchEvent(new CustomEvent('sqllab:challenge', { detail: firstChallenge.id }));
  });
}

/** Self-contained mini editor inside lessons (textarea + run against engine). */
function bindTryIt(id) {
  const ta = document.querySelector(`[data-tryit="${id}"]`);
  const runBtn = document.querySelector(`[data-tryit-run="${id}"]`);
  const openBtn = document.querySelector(`[data-tryit-main="${id}"]`);
  if (!ta) return;
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart;
      ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = s + 2;
    }
  });
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 260) + 'px'; });
  runBtn.addEventListener('click', run);
  openBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sqllab:loadsql', { detail: ta.value }));
    window.dispatchEvent(new CustomEvent('sqllab:navigate', { detail: 'practice' }));
  });
  function run() {
    const res = engine.execute(ta.value);
    const out = document.getElementById(`tryit-result-${id}`);
    if (!res.ok) {
      out.innerHTML = `<div class="result-error"><p class="status-line fail">✕ SQL Error</p><pre><code>${escapeHtml(res.error)}</code></pre></div>`;
      return;
    }
    const first = res.results[0];
    out.innerHTML = first
      ? `<p class="status-line ok">✓ ${first.rowCount} rows · ${res.elapsedMs.toFixed(1)} ms</p>${first.rows.length ? resultTable(first.columns, first.rows, 30) : '<p class="muted">No rows returned.</p>'}`
      : `<p class="status-line ok">✓ Statement executed (no result set).</p>`;
  }
}


/* ---------------- Cheat Sheet ---------------- */

export function renderCheatSheet() {
  const cats = [...new Set(CHEATSHEET.map((c) => c.cat))];
  $('cheatNav').innerHTML = cats.map((cat) => `
    <li>
      <div class="side-cat">${escapeHtml(cat)}</div>
      ${CHEATSHEET.filter((c) => c.cat === cat).map((c) =>
        `<button class="side-btn sub" data-cheat="${c.id}">${escapeHtml(c.name)}</button>`).join('')}
    </li>`).join('');
  $('cheatNav').querySelectorAll('.side-btn').forEach((b) =>
    b.addEventListener('click', () => showCheat(b.dataset.cheat)));
  showCheat(CHEATSHEET[0].id);
}

function showCheat(id) {
  const c = CHEATSHEET.find((x) => x.id === id);
  if (!c) return;
  $('cheatBody').innerHTML = `
    <article>
      <h2>${escapeHtml(c.name)}</h2>
      <span class="pill">${escapeHtml(c.cat)}</span>
      <h3>What is it?</h3>
      <p>${escapeHtml(c.explanation)}</p>
      <h3>Syntax</h3>
      <pre class="code-block"><code>${escapeHtml(c.syntax)}</code></pre>
      <h3>Example</h3>
      <pre class="code-block"><code>${escapeHtml(c.example)}</code></pre>
      <div class="tryit-actions"><button class="btn btn-secondary btn-sm" id="cheatTry">▶ Try this example in the editor</button></div>
      <h3>Common mistakes</h3>
      <ul>${c.mistakes.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
      <h3>When to use it</h3>
      <p>${escapeHtml(c.when)}</p>
    </article>`;
  $('cheatNav').querySelectorAll('.side-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.cheat === id));
  $('cheatTry').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sqllab:loadsql', { detail: c.example }));
    window.dispatchEvent(new CustomEvent('sqllab:navigate', { detail: 'practice' }));
  });
}

/* ---------------- Challenges list ---------------- */

let currentLevel = 'all';

export function renderChallengeGrid() {
  const tabs = document.querySelectorAll('.level-tab');
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.level === currentLevel));
  const prog = getProgress();
  const list = CHALLENGES.filter((c) => currentLevel === 'all' || c.level === currentLevel);
  $('challengeGrid').innerHTML = list.map((c) => {
    const done = prog.completed[c.id] && prog.completed[c.id].completedAt;
    return `
    <button class="challenge-card ${done ? 'done' : ''}" data-challenge="${c.id}">
      <div class="cc-top">
        <span class="cb-level level-${c.level}">${LEVEL_LABELS[c.level]}</span>
        ${done ? '<span class="cc-done">✓</span>' : ''}
      </div>
      <h3>#${challengeNumber(c)} ${escapeHtml(c.title)}</h3>
      <p>${escapeHtml(c.description)}</p>
      <span class="cc-db">🗄 ${escapeHtml(c.db)}</span>
    </button>`;
  }).join('');
  $('challengeGrid').querySelectorAll('.challenge-card').forEach((card) =>
    card.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('sqllab:challenge', { detail: card.dataset.challenge }));
    }));
}

export function initChallengeTabs() {
  document.querySelectorAll('.level-tab').forEach((t) =>
    t.addEventListener('click', () => { currentLevel = t.dataset.level; renderChallengeGrid(); }));
}


/* ---------------- Progress view ---------------- */

export function renderProgress() {
  const p = getProgress();
  const pct = overallPercent(CHALLENGE_TOTAL);
  const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
  const row = (label, key) => {
    const n = countByLevel(key);
    return `<tr><td>${label}</td><td>${n} / 10</td>
      <td><div class="mini-bar"><div style="width:${n * 10}%"></div></div></td></tr>`;
  };
  $('progressBody').innerHTML = `
    <div class="progress-wrap">
      <h2>SQL Progress</h2>
      <div class="xp-line"><strong>⚡ ${p.xp} XP</strong> · 🔥 Best streak: ${p.bestStreak} · Current streak: ${p.streak} ·
        Attempts: ${p.attempts} · Correct: ${p.correct} · Hints used: ${p.hintsUsed}</div>
      <table class="data-table progress-table">
        <thead><tr><th>Level</th><th>Completed</th><th></th></tr></thead>
        <tbody>
          ${row('🟢 Beginner', 'beginner')}
          ${row('🟡 Intermediate', 'intermediate')}
          ${row('🔴 Advanced', 'advanced')}
        </tbody>
      </table>
      <h3>Overall Progress</h3>
      <div class="big-bar"><code>${bar}</code> ${pct}%</div>
      <h3>Badges</h3>
      <div class="badges">
        ${BADGES.map((b) => `
          <div class="badge ${p.badges.includes(b.id) ? 'earned' : ''}" title="${escapeHtml(b.desc)}">
            <span class="badge-icon">${b.icon}</span>
            <span>${escapeHtml(b.name)}</span>
            ${p.badges.includes(b.id) ? '' : `<span class="badge-desc">${escapeHtml(b.desc)}</span>`}
          </div>`).join('')}
      </div>
      <div class="progress-actions">
        <button class="btn btn-danger" id="btnResetProgress">Reset Progress</button>
      </div>
    </div>`;
  $('btnResetProgress').addEventListener('click', () => {
    confirmModal({
      title: 'Reset all progress?',
      body: '<p>All completed challenges, XP, badges and stats will be permanently deleted. This cannot be undone.</p>',
      okText: 'Reset progress', danger: true,
      onConfirm: () => { resetProgress(); renderProgress(); renderChallengeGrid(); toast('Progress reset.', 'success'); },
    });
  });
}

export function setLesson(id) {
  if (LESSONS.some((l) => l.id === id)) {
    currentLesson = id;
    renderLessonList();
    renderLesson();
  }
}

/** Small progress summary for the welcome screen. */
export function renderHeroProgress() {
  const p = getProgress();
  const pct = overallPercent(CHALLENGE_TOTAL);
  $('hero-progress').innerHTML = `
    <div class="hero-progress-inner">
      <span>⚡ ${p.xp} XP</span>
      <span>🏆 ${Object.keys(p.completed).length} / ${CHALLENGE_TOTAL} challenges</span>
      <span>🔥 streak ${p.streak}</span>
      <div class="mini-bar wide"><div style="width:${pct}%"></div></div>
    </div>`;
}


