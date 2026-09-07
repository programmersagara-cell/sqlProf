// Result-based answer validation.
// Never compares SQL text — runs the official solution and compares datasets.

const norm = (v) => (v === null || v === undefined ? null : typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : String(v));

function rowKey(row) {
  return JSON.stringify(row.map(norm));
}

/**
 * Compare user's result dataset with the solution's.
 * results are [{columns, rows}]. Compares first SELECT result.
 * - Column names are NOT compared (aliases may differ) but column COUNT is.
 * - Rows compared as sets unless challenge.ordered is true (for ORDER BY tasks).
 */
export function compareResults(userRes, solRes, { ordered = false } = {}) {
  const u = userRes && userRes[0];
  const s = solRes && solRes[0];
  if (!s) return { pass: false, reason: 'internal' };
  if (!u) return { pass: false, reason: 'Your query returned no rows — did you write a SELECT?' };

  if (u.columns.length !== s.columns.length) {
    return {
      pass: false,
      reason: `Your query returns ${u.columns.length} column(s) but the expected result has ${s.columns.length}. Check the SELECT list.`,
    };
  }
  const uRows = u.rows.map(rowKey);
  const sRows = s.rows.map(rowKey);
  if (uRows.length !== sRows.length) {
    return {
      pass: false,
      reason: `Expected ${sRows.length} row(s) but your query returned ${uRows.length}. Check your WHERE / JOIN / GROUP BY conditions.`,
    };
  }
  if (ordered) {
    const same = uRows.every((r, i) => r === sRows[i]);
    return same
      ? { pass: true }
      : { pass: false, reason: 'The rows are correct but the order is different. Check your ORDER BY clause.' };
  }
  const uSet = new Set(uRows);
  const missing = sRows.find((r) => !uSet.has(r));
  if (missing) return { pass: false, reason: 'Your query returned a different set of rows than expected.' };
  return { pass: true };
}

/**
 * Full validation of a challenge attempt.
 * runSql: (sql) => engine execute result
 */
export function validateAttempt(challenge, userSql, runSql) {
  if (!userSql || !userSql.trim()) {
    return { status: 'empty', message: 'The editor is empty. Write your query first!' };
  }
  const userRun = runSql(userSql);
  if (!userRun.ok) {
    return {
      status: 'error',
      message: 'SQL Error',
      detail: explainError(userRun.error),
      raw: userRun.error,
    };
  }
  const solRun = runSql(challenge.solution);
  if (!solRun.ok) return { status: 'internal', message: 'Could not evaluate this challenge: ' + solRun.error };
  const cmp = compareResults(userRun.results, solRun.results, { ordered: !!challenge.ordered });
  return cmp.pass
    ? { status: 'correct', message: 'Correct!' }
    : { status: 'incorrect', message: 'Not quite.', detail: cmp.reason };
}

/** Translate common SQLite errors into beginner-friendly language. */
export function explainError(err) {
  const e = (err || '').toLowerCase();
  if (e.includes('no such column')) {
    const col = err.split(':')[1]?.trim();
    return `The column ${col ? `"${col}"` : ''} does not exist. Check the table structure in the Database panel — spelling matters!`;
  }
  if (e.includes('no such table')) {
    const tbl = err.split(':')[1]?.trim();
    return `The table ${tbl ? `"${tbl}"` : ''} does not exist. Pick a table from the Database panel to see the available tables.`;
  }
  if (e.includes('syntax error')) return 'There is a syntax mistake. Common causes: missing commas, unbalanced parentheses, or a missing FROM clause.';
  if (e.includes('ambiguous column')) return 'A column name exists in more than one joined table. Prefix it with the table name, e.g. employees.salary.';
  if (e.includes('incomplete input')) return 'The query looks incomplete — you may be missing a clause or a closing quote/parenthesis.';
  if (e.includes('misuse') && e.includes('aggregate')) return 'An aggregate function (COUNT, SUM, ...) was used incorrectly. Non-aggregated columns in the SELECT must appear in GROUP BY.';
  return err;
}
