// Shared UI helpers: toasts, modal dialogs, result table rendering.

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function toast(message, type = 'info', ms = 3200) {
  const root = document.getElementById('toastRoot');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, ms);
}

/** Modal with confirm/cancel. onConfirm called on OK. */
export function confirmModal({ title, body, okText = 'OK', danger = false, onConfirm }) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="modal">
        <h3>${escapeHtml(title)}</h3>
        <p>${body}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" data-act="cancel">Cancel</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${escapeHtml(okText)}</button>
        </div>
      </div>
    </div>`;
  const overlay = root.firstElementChild;
  const close = () => (root.innerHTML = '');
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('[data-act="cancel"]').addEventListener('click', close);
  overlay.querySelector('[data-act="ok"]').addEventListener('click', () => { close(); onConfirm && onConfirm(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
  overlay.querySelector('[data-act="ok"]').focus();
}

/** Modal with multiple choices. choices: [{ label, className, onClick, autofocus }] */
export function choiceModal({ title, body, choices }) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="modal">
        <h3>${escapeHtml(title)}</h3>
        <p>${body}</p>
        <div class="modal-actions">
          ${choices.map((c, i) =>
            `<button class="btn ${c.className || 'btn-secondary'}" data-act="${i}">${escapeHtml(c.label)}</button>`).join('')}
        </div>
      </div>
    </div>`;
  const overlay = root.firstElementChild;
  const close = () => (root.innerHTML = '');
  overlay.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) { if (e.target === overlay) close(); return; }
    const choice = choices[+btn.dataset.act];
    close();
    choice.onClick && choice.onClick();
  });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
  const auto = choices.findIndex((c) => c.autofocus);
  overlay.querySelector(`[data-act="${auto === -1 ? 0 : auto}"]`).focus();
}

/** Render a dataset as an HTML table (sanitized). */
export function resultTable(columns, rows, maxRows = 200) {
  const shown = rows.slice(0, maxRows);
  const head = columns.map((c) => `<th scope="col">${escapeHtml(c)}</th>`).join('');
  const body = shown.map((r) =>
    `<tr>${r.map((v) => `<td>${escapeHtml(v === null ? 'NULL' : v)}</td>`).join('')}</tr>`
  ).join('');
  const more = rows.length > maxRows
    ? `<p class="muted small">Showing first ${maxRows} of ${rows.length} rows.</p>` : '';
  return `<div class="table-scroll"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${more}`;
}

/** Simple bar chart for aggregate results (label + numeric column). */
export function barChart(columns, rows) {
  if (!rows.length || rows.length > 24) return '';
  const numIdx = columns.findIndex((c, i) => rows.every((r) => typeof r[i] === 'number'));
  if (numIdx <= 0) return '';
  const labelIdx = 0;
  const max = Math.max(...rows.map((r) => Math.abs(Number(r[numIdx]) || 0)));
  if (!max) return '';
  const bars = rows.map((r) => {
    const val = Math.abs(Number(r[numIdx]) || 0);
    const pct = Math.round((val / max) * 100);
    return `<div class="bar-row">
      <span class="bar-label">${escapeHtml(r[labelIdx])}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="bar-val">${escapeHtml(r[numIdx])}</span>
    </div>`;
  }).join('');
  return `<div class="chart"><h4>Visualization</h4>${bars}</div>`;
}
