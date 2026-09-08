# 🗄️ SQL·LAB

**the in-browser query workbench** — an interactive SQL learning platform that runs **entirely in your browser**. No PHP, no MySQL, no Node server, no signup. Deploy it anywhere static files can be served (GitHub Pages, Netlify, Vercel, ...).

![SQL Lab](https://img.shields.io/badge/SQL-Practice%20Lab-4f8cff) ![static](https://img.shields.io/badge/hosting-GitHub%20Pages-success)

## ✨ Features

- **Real SQL engine in the browser** — [sql.js](https://sql.js.org) (SQLite compiled to WebAssembly). Every query executes locally; nothing is ever sent to a server.
- **4 sample databases** — `company_db` (employees, departments, projects, salaries, employee_projects), `school_db`, `shop_db`, `library_db`. Switch them from the Database panel.
- **Database explorer** — click any table to see its structure (columns, types, primary keys, nullability) and its data.
- **Professional SQL editor** — syntax highlighting, line numbers, autocomplete (`Ctrl+Space` and while typing), `Ctrl+Enter` to run, error/success highlighting.
- **45 challenges across 3 levels and 4 databases** — Beginner (SELECT → BETWEEN), Intermediate (aggregates, GROUP BY, HAVING, JOINs), Advanced (subqueries, CASE, CTEs, UNION, window functions, DML), plus dedicated challenge sets for `school_db`, `shop_db` and `library_db`.
- **Result-based validation** — your answer is never compared as text. The app runs the official solution and compares *datasets*, so any logically equivalent query passes.
- **Progressive hints & solutions** — 3 hints per challenge before the full answer is revealed.
- **Learning mode** — structured lessons (SELECT, WHERE, ORDER BY, GROUP BY, JOIN, Advanced) with "Try it yourself" mini-editors and common-mistake callouts.
- **Interactive cheat sheet** — 25+ topics with syntax, examples, common mistakes and "when to use".
- **Query history** — the last 50 queries, saved in localStorage; reopen or delete individual entries.
- **Progress + gamification** — XP, streaks, 7 unlockable badges, per-level progress bars. All stored locally.
- **Dark / light mode** — remembered between visits.
- **Responsive** — three-panel desktop workspace gracefully reflows to a stacked layout on tablets and phones.
- **Accessible** — semantic HTML, ARIA labels, visible focus states, keyboard-navigable history and navigation.

## 🚀 Deploy to GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "SQL Lab"
   git branch -M main
   git remote add origin https://github.com/<your-user>/sqlProf.git
   git push -u origin main
   ```
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Choose branch `main` and folder `/ (root)`, then **Save**.
4. Your app is live at `https://<your-user>.github.io/sqlProf/`.

It also works on **Netlify / Vercel**: just point them at the repo root (no build command, no output directory).

## 🖥️ Run locally

Any static file server works, e.g. Python or VS Code Live Server:

```bash
python -m http.server 8080
# then open http://localhost:8080
```

Opening `index.html` directly via `file://` also works in most browsers, but a local server is recommended because ES modules require `http(s)` in some browsers.

> **Note:** the SQL engine (WASM) and CodeMirror are loaded from a CDN, so an internet connection is required on first load.

## 📁 Project structure

```
sqlProf/
├── index.html                  # App shell (views, panels, modals)
├── package.json
├── README.md
└── src/
    ├── main.js                 # Bootstrap, navigation, theme
    ├── engine/sqlEngine.js     # sql.js WASM wrapper (execute, schema, reset)
    ├── editor/editor.js        # CodeMirror setup + autocomplete
    ├── data/
    │   ├── databases.js        # Database registry
    │   ├── companyDb.js        # company_db schema + seed data
    │   └── otherDbs.js         # school_db, shop_db, library_db
    ├── challenges/             # 45 challenges (company/school/shop/library sets)
    ├── lessons/lessons.js      # Learning mode topics
    ├── cheatsheet/cheatsheet.js# Cheat sheet entries
    ├── validation/validator.js # Result-set comparison + friendly errors
    ├── progress/progress.js    # XP, badges, streaks (localStorage)
    ├── history/history.js      # Query history (localStorage)
    ├── ui/                     # practice workspace, views, helpers
    └── styles/main.css         # Theme (dark/light), responsive layout
```

## 🧪 Self-testing

Open `tests/test.html` (served over HTTP) to run the built-in smoke tests for the SQL engine, challenge validation and storage helpers.

## 🔒 Privacy & security

- All SQL runs inside a sandboxed WASM SQLite instance in your browser.
- No network requests carry your queries; the only external calls are the CDN assets.
- Only non-sensitive data (progress, history, theme) is stored in localStorage.
- All dynamic output is HTML-escaped before rendering.

## 📄 License

MIT
