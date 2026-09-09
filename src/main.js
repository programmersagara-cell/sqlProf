// SQL Lab — application bootstrap, navigation and theme handling.
import { initEngine, loadDatabase } from './engine/sqlEngine.js';
import * as editor from './editor/editor.js';
import { initPractice, renderDbExplorer, openChallenge, selectTable, refreshXpPill, resetResultPanel } from './ui/practice.js';
import {
  renderLessonList, renderLesson, renderCheatSheet, renderChallengeGrid,
  initChallengeTabs, renderProgress, renderHeroProgress,
} from './ui/views.js';
import { toast } from './ui/helpers.js';

const $ = (id) => document.getElementById(id);
const VIEWS = ['welcome', 'learn', 'practice', 'challenges', 'cheatsheet', 'progress'];

/* ---------------- Theme ---------------- */

const THEME_KEY = 'sqllab.theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('themeToggle').textContent = theme === 'light' ? '☀️' : '🌙';
  $('themeToggle').setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  editor.refreshTheme();
}

function initTheme() {
  let theme = 'dark';
  try { theme = localStorage.getItem(THEME_KEY) || 'dark'; } catch { /* ignore */ }
  applyTheme(theme);
  $('themeToggle').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  });
}

/* ---------------- Navigation ---------------- */

function showView(name) {
  if (!VIEWS.includes(name)) name = 'welcome';
  for (const v of VIEWS) {
    $(`view-${v}`).hidden = v !== name;
  }
  document.querySelectorAll('.nav-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === name));
  if (name === 'challenges') { import('./ui/views.js').then((m) => m.renderChallengeGrid()); }
  if (name === 'progress') { import('./ui/views.js').then((m) => m.renderProgress()); }
  if (name === 'welcome') { import('./ui/views.js').then((m) => m.renderHeroProgress()); }
  if (name === 'practice') { resetResultPanel(); editor.focus(); }
  try { location.hash = name; } catch { /* ignore */ }
}

function initNav() {
  document.querySelectorAll('.nav-btn').forEach((b) =>
    b.addEventListener('click', () => showView(b.dataset.view)));
  document.querySelectorAll('[data-go]').forEach((b) =>
    b.addEventListener('click', () => {
      showView(b.dataset.go);
      if (b.dataset.topic) {
        import('./ui/views.js').then((m) => {
          m.setLesson(b.dataset.topic);
        });
      }
    }));
  window.addEventListener('sqllab:navigate', (e) => showView(e.detail));
  window.addEventListener('sqllab:challenge', (e) => {
    showView('practice');
    openChallenge(e.detail);
  });
  window.addEventListener('sqllab:loadsql', (e) => editor.setValue(e.detail));
  const initial = (location.hash || '').replace('#', '');
  showView(VIEWS.includes(initial) ? initial : 'welcome');
}


/* ---------------- Boot ---------------- */

async function boot() {
  initTheme();
  initNav();
  initChallengeTabs();
  renderLessonList();
  renderLesson();
  renderCheatSheet();
  try {
    await initEngine();
    loadDatabase('company_db');
    initPractice();
    renderDbExplorer();
    selectTable('employees');
    refreshXpPill();
  } catch (err) {
    toast(err.message || 'Failed to start the SQL engine.', 'error', 8000);
    $('resultBody').innerHTML = `
      <div class="result-error">
        <p class="status-line fail">⚠ Could not start the SQL engine</p>
        <p>${err.message || 'Unknown error'}</p>
        <p class="muted">The SQL engine (WASM) is loaded from a CDN — check your internet connection and reload the page.</p>
      </div>`;
  } finally {
    // Remove the loading screen once the app is ready (or failed to start).
    const splash = document.getElementById('loadingScreen');
    if (splash) {
      splash.classList.add('done');
      setTimeout(() => splash.remove(), 450);
    }
  }
}

boot();

