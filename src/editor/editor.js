// CodeMirror SQL editor wrapper with autocomplete + Ctrl/Cmd+Enter handling.

let cm = null;
let onChangeCb = null;
let tablesProvider = () => [];

export function initEditor(textarea, { onChange, onRun, getTables }) {
  onChangeCb = onChange || null;
  tablesProvider = getTables || tablesProvider;
  cm = CodeMirror.fromTextArea(textarea, {
    mode: 'text/x-sql',
    theme: document.documentElement.dataset.theme === 'light' ? 'default' : 'material-darker',
    lineNumbers: true,
    indentWithTabs: false,
    smartIndent: true,
    autoCloseBrackets: false,
    matchBrackets: true,
    lineWrapping: true,
    extraKeys: {
      'Ctrl-Enter': () => onRun && onRun(),
      'Cmd-Enter': () => onRun && onRun(),
      'Ctrl-Space': 'autocomplete',
    },
  });
  cm.setSize('100%', '100%');
  cm.on('change', () => { if (onChangeCb) onChangeCb(cm.getValue()); });
  cm.on('keyup', (instance, e) => {
    // lightweight autocomplete while typing identifiers
    const valid = /^[a-zA-Z0-9_.]$/;
    if (valid.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
      instance.showHint({
        hint: CodeMirror.hint.sql,
        tables: tablesProvider(),
        completeSingle: false,
        closeOnUnfocus: true,
      });
    }
  });
  return cm;
}

export function getValue() { return cm ? cm.getValue() : ''; }
export function setValue(v) { if (cm) cm.setValue(v || ''); }
export function focus() { if (cm) cm.focus(); }
export function refreshTheme() {
  if (!cm) return;
  cm.setOption('theme', document.documentElement.dataset.theme === 'light' ? 'default' : 'material-darker');
}

/** Mark the editor border red/green on error/success. */
export function flash(state) {
  if (!cm) return;
  const wrap = cm.getWrapperElement();
  wrap.classList.remove('cm-error-state', 'cm-ok-state');
  if (state) {
    wrap.classList.add(state === 'error' ? 'cm-error-state' : 'cm-ok-state');
    setTimeout(() => wrap.classList.remove('cm-error-state', 'cm-ok-state'), 900);
  }
}
