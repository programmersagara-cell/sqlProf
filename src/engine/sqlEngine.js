// SQL engine wrapper around sql.js (SQLite compiled to WASM).
// Runs entirely in the browser. No server involved.
import { DATABASES } from '../data/databases.js';

const SQLJS_WASM_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/';

let SQL = null;          // sql.js module
let db = null;           // current database handle
let currentDbId = null;  // which sample database is loaded

/** Load the sql.js WASM module. Throws on failure. */
export async function initEngine() {
  if (SQL) return SQL;
  if (typeof initSqlJs === 'undefined') {
    throw new Error('SQL engine script failed to load. Check your internet connection and reload the page.');
  }
  try {
    SQL = await initSqlJs({ locateFile: (f) => SQLJS_WASM_BASE + f });
  } catch (e) {
    throw new Error('Could not initialize the SQL engine (WASM). ' + (e && e.message ? e.message : e));
  }
  return SQL;
}

function buildDb(dbId) {
  const def = DATABASES.find((d) => d.id === dbId) || DATABASES[0];
  currentDbId = def.id;
  const newDb = new SQL.Database();
  try {
    newDb.exec(def.schema);
  } catch (e) {
    newDb.close();
    throw new Error('Database initialization failed: ' + e.message);
  }
  return newDb;
}

/** (Re)load a sample database. */
export function loadDatabase(dbId) {
  if (!SQL) throw new Error('Engine not initialized');
  if (db) { try { db.close(); } catch (_) { /* ignore */ } }
  db = buildDb(dbId);
  return currentDbId;
}

/** Reset the current database to its original seed data. */
export function resetDatabase() {
  return loadDatabase(currentDbId);
}

export function getCurrentDbId() { return currentDbId; }

/**
 * Execute SQL on the current database (may contain multiple statements).
 * Returns { ok, results, error, elapsedMs }
 */
export function execute(sql) {
  return runOn(db, sql);
}

/** Raw serialized snapshot of the current database (Uint8Array). */
export function getSnapshot() {
  if (!db) throw new Error('Database is not loaded yet');
  return db.export();
}

/**
 * Execute SQL against an isolated copy built from a snapshot.
 * The live database is never touched — used for answer validation.
 */
export function runIsolated(snapshotBytes, sql) {
  const tmp = new SQL.Database(snapshotBytes);
  try {
    return runOn(tmp, sql);
  } finally {
    tmp.close();
  }
}

function runOn(target, sql) {
  if (!target) return { ok: false, error: 'Database is not loaded yet.', results: [], elapsedMs: 0 };
  if (!sql || !sql.trim()) {
    return { ok: false, error: 'The query is empty. Type some SQL first — try: SELECT * FROM employees;', results: [], elapsedMs: 0 };
  }
  const t0 = performance.now();
  try {
    const res = target.exec(sql); // executes all statements; returns results for SELECTs
    const elapsedMs = performance.now() - t0;
    const results = res.map((r) => ({
      columns: r.columns,
      rows: r.values.map((v) => v.slice()),
      rowCount: r.values.length,
      isSelect: true,
    }));
    return { ok: true, results, elapsedMs, changes: results.length === 0 };
  } catch (e) {
    return { ok: false, error: e.message || String(e), results: [], elapsedMs: performance.now() - t0 };
  }
}

/** Get table names in the loaded database. */
export function getTableNames() {
  if (!db) return [];
  const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  return res.length ? res[0].values.map((r) => r[0]) : [];
}

/** Column metadata for a table: [{name, type, pk, notnull}] */
export function getTableSchema(tableName) {
  if (!db || !tableName) return [];
  const safe = tableName.replace(/'/g, "''");
  const res = db.exec(`PRAGMA table_info('${safe}')`);
  if (!res.length) return [];
  return res[0].values.map((r) => ({
    cid: r[0], name: r[1], type: r[2], notnull: !!r[3], pk: !!r[5],
  }));
}

/** All rows of a table (limited). */
export function getTableData(tableName, limit = 100) {
  if (!db || !tableName) return { columns: [], rows: [] };
  const safe = tableName.replace(/"/g, '""');
  const r = db.exec(`SELECT * FROM "${safe}" LIMIT ${limit}`);
  if (!r.length) {
    const cols = getTableSchema(tableName).map((c) => c.name);
    return { columns: cols, rows: [] };
  }
  return { columns: r[0].columns, rows: r[0].values.map((v) => v.slice()) };
}

export function getRowCount(tableName) {
  if (!db || !tableName) return 0;
  const safe = tableName.replace(/"/g, '""');
  const r = db.exec(`SELECT COUNT(*) FROM "${safe}"`);
  return r.length ? r[0].values[0][0] : 0;
}
