// Practice workspace: 3 panels (Database / Editor / Result), challenge banner,
// validation, hints, history, database switching and reset.
import * as engine from '../engine/sqlEngine.js';
import * as editor from '../editor/editor.js';
import { validateAttempt } from '../validation/validator.js';
import { recordAttempt, getProgress } from '../progress/progress.js';
import { addHistory, getHistory, deleteHistory, clearHistory } from '../history/history.js';
import { getChallenge, challengeNumber, LEVEL_LABELS } from '../challenges/index.js';
import { DATABASES } from '../data/databases.js';
import { escapeHtml, toast, confirmModal, resultTable, barChart } from './helpers.js';

let currentChallenge = null;
let hintsShown = 0;
let selectedTable = null;
const $ = (id) => document.getElementById(id);

/* ---------------- Database explorer ---------------- */

export function renderDbExplorer() {
  const sel = $('dbSelect');
  sel.innerHTML = DATABASES.map((d) =>
    `<option value="${d.id}" ${d.id === engine.getCurrentDbId() ? 'selected' : ''}>${d.name}</option>`).join('');
  renderTree();
}

function renderTree() {
  const dbId = engine.getCurrentDbId();
  const def = DATABASES.find((d) => d.id === dbId);
  const tables = engine.getTableNames();
  $('dbTree').innerHTML = `
    <div class="db-root"><span class="db-icon">◈</span> ${escapeHtml(def.name)}</div>
    <ul role="tree">
      ${tables.map((t) => `
        <li role="treeitem" aria-selected="${t === selectedTable}">
          <button class="db-table-btn ${t === selectedTable ? 'active' : ''}" data-table="${escapeHtml(t)}">
            <span class="tbl-icon">▦</span> ${escapeHtml(t)}
            <span class="row-count">${engine.getRowCount(t)}</span>
          </button>
        </li>`).join('')}
    </ul>`;
  $('dbTree').querySelectorAll('.db-table-btn').forEach((btn) =>
    btn.addEventListener('click', () => selectTable(btn.dataset.table)));
}

export function selectTable(tableName) {
  selectedTable = tableName;
  renderTree();
  const schema = engine.getTableSchema(tableName);
  const data = engine.getTableData(tableName, 50);
  $('dbInspect').innerHTML = `
    <h3>Table: ${escapeHtml(tableName)}</h3>
    <h4>Columns</h4>
    <div class="table-scroll"><table class="data-table schema-table">
      <thead><tr><th>Column</th><th>Data Type</th><th>Primary Key</th><th>Nullable</th></tr></thead>
      <tbody>${schema.map((c) => `
        <tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.type || '—')}</td>
        <td>${c.pk ? 'YES' : 'NO'}</td><td>${c.notnull ? 'NO' : 'YES'}</td></tr>`).join('')}
      </tbody></table></div>
    <h4>Data</h4>
    ${data.rows.length ? resultTable(data.columns, data.rows, 50)
      : '<p class="muted">This table is empty.</p>'}`;
}

/* ---------------- Editor + run ---------------- */

function getTablesForAutocomplete() {
  const out = {};
  for (const t of engine.getTableNames()) {
    out[t] = engine.getTableSchema(t).map((c) => c.name);
  }
  return out;
}

export function runQuery() {
  const sql = editor.getValue();
  editor.flash(null);
  const snapshot = currentChallenge ? engine.getSnapshot() : null; // pristine state for validation
  const res = engine.execute(sql);
  if (res.ok) addHistory(sql);
  renderResult(res);
  if (currentChallenge) checkChallenge(sql, snapshot);
}


function renderResult(res) {
  const body = $('resultBody');
  const meta = $('resultMeta');
  if (!res.ok) {
    editor.flash('error');
    meta.textContent = '';
    $('editorStatus').textContent = '✕ Error';
    body.innerHTML = `
      <div class="result-error">
        <p class="status-line fail">✕ SQL Error</p>
        <pre><code>${escapeHtml(res.error)}</code></pre>
        <p class="hint-text">${escapeHtml(friendlyError(res.error))}</p>
      </div>`;
    return;
  }
  editor.flash('ok');
  const first = res.results[0];
  if (!first) {
    meta.textContent = '';
    $('editorStatus').textContent = '✓ Done';
    body.innerHTML = `<div class="result-success">
      <p class="status-line ok">✓ Statement executed successfully</p>
      <p class="muted">This was a data-modification statement (INSERT / UPDATE / DELETE / CREATE). Run a SELECT to see the data. Use Reset Database to undo changes.</p></div>`;
    return;
  }
  meta.innerHTML = `<span class="meta-ok">✓ ${first.rowCount} rows</span> · ${res.elapsedMs.toFixed(1)} ms`;
  $('editorStatus').textContent = `✓ ${first.rowCount} rows · ${res.elapsedMs.toFixed(1)} ms`;
  body.innerHTML = `
    <div class="result-success"><p class="status-line ok">✓ Query executed successfully — ${first.rowCount} row${first.rowCount === 1 ? '' : 's'} returned · ${res.elapsedMs.toFixed(1)} ms</p></div>
    ${first.rows.length ? resultTable(first.columns, first.rows) : '<p class="muted">The query returned no rows.</p>'}
    ${barChart(first.columns, first.rows)}`;
}

function friendlyError(err) {
  const e = (err || '').toLowerCase();
  if (e.includes('no such column')) return 'Tip: that column does not exist. Check the exact spelling in the Database panel.';
  if (e.includes('no such table')) return 'Tip: that table does not exist. Pick one from the Database panel.';
  if (e.includes('syntax error')) return 'Tip: check for missing commas, quotes or parentheses.';
  if (e.includes('incomplete input')) return 'Tip: the query seems cut short — a clause may be missing.';
  if (e.includes('ambiguous column')) return 'Tip: two tables have this column name. Prefix it, e.g. employees.salary.';
  return 'Tip: read the error message — SQLite usually points at the problem.';
}

/* ---------------- Challenge flow ---------------- */

export function openChallenge(id) {
  const ch = getChallenge(id);
  if (!ch) return;
  // Always load a pristine copy of the challenge's database so results are deterministic.
  engine.loadDatabase(ch.db);
  selectedTable = null;
  renderDbExplorer();
  currentChallenge = ch;
  hintsShown = 0;
  editor.setValue(ch.starter || '');
  $('challengeBanner').hidden = false;
  $('cbLevel').textContent = LEVEL_LABELS[ch.level];
  $('cbLevel').className = `cb-level level-${ch.level}`;
  $('cbTitle').textContent = `#${challengeNumber(ch)} ${ch.title}`;
  const prog = getProgress();
  const done = prog.completed[ch.id] && prog.completed[ch.id].completedAt;
  $('cbStatus').textContent = done ? '✓ Completed' : '';
  $('cbStatus').className = 'cb-status' + (done ? ' ok' : '');
  $('cbDesc').innerHTML = `
    <p>${escapeHtml(ch.description)}</p>
    <p><strong>Objective:</strong> ${escapeHtml(ch.objective)}</p>
    <p><strong>Task:</strong> ${escapeHtml(ch.instructions)}</p>
    <p class="small"><strong>Example syntax:</strong></p>
    <pre class="code-inline"><code>${escapeHtml(ch.example)}</code></pre>`;
  $('hintBox').hidden = true;
  $('hintBox').innerHTML = '';
  showTableForChallenge(ch);
  editor.focus();
}

function showTableForChallenge(ch) {
  const m = /(employees|departments|projects|salaries|employee_projects|students|teachers|courses|enrollments|customers|products|orders|order_items|authors|books|members|borrowings)/.exec(ch.instructions);
  if (m) selectTable(m[1]);
}


function checkChallenge(sql, snapshot) {
  const ch = currentChallenge;
  const outcome = validateAttempt(ch, sql, (s) => engine.runIsolated(snapshot, s));
  const statusEl = $('cbStatus');
  if (outcome.status === 'correct') {
    const rec = recordAttempt(ch, 'correct', hintsShown);
    statusEl.textContent = '✓ Completed';
    statusEl.className = 'cb-status ok';
    if (rec.newlyCompleted) celebrate(rec);
  } else if (outcome.status === 'incorrect') {
    recordAttempt(ch, 'incorrect', hintsShown);
    statusEl.textContent = '✕ Not quite';
    statusEl.className = 'cb-status fail';
    const body = $('resultBody');
    body.insertAdjacentHTML('afterbegin', `
      <div class="challenge-feedback fail">
        <p class="status-line fail">✕ Not quite — your query returned a different result.</p>
        ${outcome.detail ? `<p class="hint-text">${escapeHtml(outcome.detail)}</p>` : ''}
        <p class="small muted">Compare your output with the data in the Database panel, use a hint, or view the solution.</p>
      </div>`);
  } else if (outcome.status === 'error') {
    recordAttempt(ch, 'error', hintsShown);
    statusEl.textContent = '✕ SQL Error';
    statusEl.className = 'cb-status fail';
  } else if (outcome.status === 'empty') {
    toast(outcome.message, 'info');
  }
}

function celebrate(rec) {
  const badges = rec.badges.map((b) => `<div class="badge-unlock">${b.icon} <strong>Badge Unlocked:</strong> ${escapeHtml(b.name)} — ${escapeHtml(b.desc)}</div>`).join('');
  toast(`🎉 Challenge Complete! +${rec.xpGained} XP`, 'success', 4200);
  $('resultBody').insertAdjacentHTML('afterbegin', `
    <div class="challenge-feedback success">
      <p class="status-line ok">🎉 Challenge Complete! +${rec.xpGained} XP</p>
      ${badges}
    </div>`);
  refreshXpPill();
}

/* ---------------- Hints / solution ---------------- */

function showNextHint() {
  if (!currentChallenge) { toast('Open a challenge first.', 'info'); return; }
  const box = $('hintBox');
  box.hidden = false;
  if (hintsShown >= currentChallenge.hints.length) {
    box.innerHTML = `<p class="hint-text">No more hints — you have seen them all! Try the solution if you're stuck.</p>`;
    return;
  }
  box.insertAdjacentHTML('beforeend', `
    <div class="hint-item"><strong>Hint ${hintsShown + 1}</strong>
      <p>${escapeHtml(currentChallenge.hints[hintsShown])}</p></div>`);
  hintsShown += 1;
}

function showSolution() {
  if (!currentChallenge) { toast('Open a challenge first.', 'info'); return; }
  confirmModal({
    title: 'View solution?',
    body: '<p>Are you sure? Try the hints first — figuring it out yourself is the best practice!</p>',
    okText: 'Show solution',
    onConfirm: () => {
      const box = $('hintBox');
      box.hidden = false;
      box.insertAdjacentHTML('beforeend', `
        <div class="hint-item solution"><strong>Solution</strong>
          <pre><code>${escapeHtml(currentChallenge.solution)}</code></pre></div>`);
    },
  });
}

export function closeChallenge() {
  currentChallenge = null;
  $('challengeBanner').hidden = true;
}


/* ---------------- History ---------------- */

function renderHistory() {
  const list = $('historyList');
  const items = getHistory();
  if (!items.length) {
    list.innerHTML = '<li class="muted">No saved queries yet. Run something!</li>';
    return;
  }
  list.innerHTML = items.map((it, i) => `
    <li>
      <div class="history-item" role="button" tabindex="0" data-index="${i}" title="Click to load this query">
        <span class="history-time">${new Date(it.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <code>${escapeHtml(it.sql.length > 120 ? it.sql.slice(0, 120) + '…' : it.sql)}</code>
      </div>
      <button class="icon-btn history-del" data-del="${i}" aria-label="Delete this history entry">🗑</button>
    </li>`).join('');
  list.querySelectorAll('.history-item').forEach((el) => {
    const open = () => { editor.setValue(getHistory()[+el.dataset.index].sql); $('historyPanel').hidden = true; editor.focus(); };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  list.querySelectorAll('.history-del').forEach((b) =>
    b.addEventListener('click', () => { deleteHistory(+b.dataset.del); renderHistory(); }));
}

export function refreshXpPill() {
  const p = getProgress();
  $('editorStatus').textContent = `⚡ ${p.xp} XP · 🔥 streak ${p.streak}`;
}

/* ---------------- Init ---------------- */

export function initPractice() {
  editor.initEditor($('sqlInput'), {
    onRun: () => runQuery(),
    getTables: getTablesForAutocomplete,
  });
  $('btnRun').addEventListener('click', runQuery);
  $('btnClear').addEventListener('click', () => editor.setValue(''));
  $('btnResetQuery').addEventListener('click', () => {
    editor.setValue(currentChallenge ? currentChallenge.starter : 'SELECT * FROM employees;');
  });
  $('btnHint').addEventListener('click', showNextHint);
  $('btnSolution').addEventListener('click', showSolution);
  $('btnChallengeList').addEventListener('click', () => {
    closeChallenge();
    window.dispatchEvent(new CustomEvent('sqllab:navigate', { detail: 'challenges' }));
  });
  $('dbSelect').addEventListener('change', (e) => {
    try {
      engine.loadDatabase(e.target.value);
      selectedTable = null;
      renderDbExplorer();
      toast(`Database switched to ${e.target.value}.`, 'success');
    } catch (err) {
      toast('Database failed to load: ' + err.message, 'error');
    }
  });
  $('btnHistory').addEventListener('click', () => {
    const p = $('historyPanel');
    p.hidden = !p.hidden;
    if (!p.hidden) renderHistory();
  });
  $('btnHistoryClose').addEventListener('click', () => { $('historyPanel').hidden = true; });
  $('btnHistoryClear').addEventListener('click', () => {
    confirmModal({
      title: 'Clear all history?',
      body: '<p>All saved queries will be removed. This cannot be undone.</p>',
      okText: 'Clear history', danger: true,
      onConfirm: () => { clearHistory(); renderHistory(); },
    });
  });
  const resetBtn = document.getElementById('btnResetDb');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      confirmModal({
        title: 'Reset database?',
        body: '<p>The database will be restored to its original sample data. Any changes you made (INSERT/UPDATE/DELETE) will be lost.</p>',
        okText: 'Reset database',
        onConfirm: () => {
          engine.resetDatabase();
          renderDbExplorer();
          if (selectedTable) selectTable(selectedTable);
          toast('Database reset to its original state.', 'success');
        },
      });
    });
  }
}



