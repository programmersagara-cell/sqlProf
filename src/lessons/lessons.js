// Structured learning mode content.

export const LESSONS = [
  {
    id: 'select', title: 'SELECT',
    what: 'SELECT is how you ask a database for data. It never changes the data — it only reads it. You choose which columns you want and which table they come from.',
    syntax: 'SELECT column1, column2\nFROM table_name;',
    example: 'SELECT first_name, salary\nFROM employees;',
    result: 'A table with two columns (first_name, salary) containing one row per employee.',
    trySql: 'SELECT first_name, salary FROM employees;',
    mistakes: [
      'Forgetting the FROM clause — SELECT first_name; alone is invalid.',
      'Writing SELCT or SELECTT — SQL keywords must be spelled exactly.',
      'Using * everywhere: it works, but selecting only needed columns is a good habit.',
    ],
  },
  {
    id: 'distinct', title: 'DISTINCT',
    what: 'DISTINCT removes duplicate rows from the result, so each value appears only once.',
    syntax: 'SELECT DISTINCT column\nFROM table;',
    example: 'SELECT DISTINCT department_id\nFROM employees;',
    result: 'One row per distinct department_id, e.g. 1, 2, 3, 4, 5.',
    trySql: 'SELECT DISTINCT department_id FROM employees;',
    mistakes: [
      'Putting DISTINCT before the column list ends: SELECT department_id DISTINCT is wrong.',
      'Expecting DISTINCT to affect only one column — it applies to the whole row combination.',
    ],
  },
  {
    id: 'where', title: 'WHERE',
    what: 'WHERE filters rows: only rows where the condition is true are returned.',
    syntax: 'SELECT *\nFROM table_name\nWHERE condition;',
    example: "SELECT first_name, salary\nFROM employees\nWHERE salary > 60000;",
    result: 'Only employees whose salary is greater than 60000.',
    trySql: "SELECT first_name, salary FROM employees WHERE salary > 60000;",
    mistakes: [
      'Using = with NULL — use IS NULL / IS NOT NULL instead.',
      'Using == (not valid in SQL). Use a single =.',
      'Putting WHERE after GROUP BY — it must come right after FROM/JOIN.',
    ],
  },
  {
    id: 'orderby', title: 'ORDER BY',
    what: 'ORDER BY sorts the result rows. ASC is ascending (default), DESC is descending.',
    syntax: 'SELECT *\nFROM table_name\nORDER BY column DESC;',
    example: 'SELECT first_name, salary\nFROM employees\nORDER BY salary DESC;',
    result: 'Employees from the highest paid to the lowest.',
    trySql: 'SELECT first_name, salary FROM employees ORDER BY salary DESC;',
    mistakes: [
      'Writing ORDER salary BY instead of ORDER BY salary.',
      'Forgetting that numbers sort numerically but text sorts alphabetically.',
    ],
  },
  {
    id: 'limit', title: 'LIMIT',
    what: 'LIMIT restricts how many rows are returned. Combine it with ORDER BY to get "top N" results.',
    syntax: 'SELECT *\nFROM table_name\nORDER BY column\nLIMIT 5;',
    example: 'SELECT first_name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 3;',
    result: 'The 3 highest paid employees.',
    trySql: 'SELECT first_name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
    mistakes: [
      'Using LIMIT without ORDER BY when you want the "top" rows — you get arbitrary rows.',
      'LIMIT comes last, after ORDER BY.',
    ],
  },
  {
    id: 'aggregates', title: 'Aggregates (COUNT, SUM, AVG, MIN, MAX)',
    what: 'Aggregate functions collapse many rows into a single summary value.',
    syntax: 'SELECT COUNT(*), AVG(column)\nFROM table_name;',
    example: 'SELECT COUNT(*) AS employees,\n       AVG(salary) AS avg_salary\nFROM employees;',
    result: 'One row: the number of employees and their average salary.',
    trySql: 'SELECT COUNT(*) AS employees, AVG(salary) AS avg_salary FROM employees;',
    mistakes: [
      'Mixing normal columns with aggregates without GROUP BY.',
      'COUNT(column) skips NULLs, COUNT(*) counts every row.',
    ],
  },
  {
    id: 'groupby', title: 'GROUP BY',
    what: 'GROUP BY groups rows that share a value so aggregates can be computed per group.',
    syntax: 'SELECT column, COUNT(*)\nFROM table_name\nGROUP BY column;',
    example: 'SELECT department_id, COUNT(*) AS num\nFROM employees\nGROUP BY department_id;',
    result: 'One row per department with the number of employees in it.',
    trySql: 'SELECT department_id, COUNT(*) AS num FROM employees GROUP BY department_id;',
    mistakes: [
      'Selecting a non-grouped column without an aggregate — error in most databases.',
      'Confusing WHERE (filters rows before grouping) with HAVING (filters groups after).',
    ],
  },
  {
    id: 'having', title: 'HAVING',
    what: 'HAVING filters groups after GROUP BY, usually based on an aggregate like COUNT or SUM.',
    syntax: 'SELECT column, COUNT(*)\nFROM table_name\nGROUP BY column\nHAVING COUNT(*) > 2;',
    example: 'SELECT department_id, COUNT(*) AS num\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 2;',
    result: 'Only departments with more than 2 employees.',
    trySql: 'SELECT department_id, COUNT(*) AS num FROM employees GROUP BY department_id HAVING COUNT(*) > 2;',
    mistakes: [
      'Using HAVING without GROUP BY (works only for whole-table aggregates).',
      'Trying to use an alias inside HAVING — repeat the aggregate instead.',
    ],
  },
  {
    id: 'join', title: 'JOIN',
    what: 'JOIN combines rows from two tables using a related column. INNER JOIN keeps only matches; LEFT JOIN keeps all rows of the first table.',
    syntax: 'SELECT a.column, b.column\nFROM table_a a\nJOIN table_b b ON a.key = b.key;',
    example: 'SELECT e.first_name, d.name\nFROM employees e\nJOIN departments d\n  ON e.department_id = d.department_id;',
    result: 'Each employee with the name of their department.',
    trySql: 'SELECT e.first_name, d.name FROM employees e JOIN departments d ON e.department_id = d.department_id;',
    mistakes: [
      'Forgetting the ON condition — you get a cartesian product (every row × every row).',
      'Ambiguous column names — prefix them: d.name.',
      'Using LEFT JOIN when you actually want only matches (INNER JOIN).',
    ],
  },
  {
    id: 'advanced', title: 'Advanced SQL',
    what: 'Subqueries, CASE, CTEs, UNION and window functions let you answer much more complex questions.',
    syntax: 'WITH cte AS (\n  SELECT ... FROM ...\n)\nSELECT ... FROM cte;',
    example: 'WITH dept_avg AS (\n  SELECT department_id, AVG(salary) AS avg_salary\n  FROM employees GROUP BY department_id\n)\nSELECT * FROM dept_avg;',
    result: 'Average salary per department, computed in a named sub-result (CTE).',
    trySql: 'WITH dept_avg AS (SELECT department_id, AVG(salary) AS avg_salary FROM employees GROUP BY department_id) SELECT * FROM dept_avg;',
    mistakes: [
      'Forgetting that a CTE name must be used in the main query.',
      'Using window functions without OVER() — every window function needs OVER.',
      'UNION removes duplicates; use UNION ALL to keep them.',
    ],
  }
];
