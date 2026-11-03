import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Releases', (f) => {
  f.node('a243e9', 'Core.Flow.Begin', 'Begin', {});
  f.node('a243ea', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.node('62add9', 'Robomotion.Apps.Action', 'List Releases', { optActionName: 'listReleases' })
    .then('392ddf', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('bd93bf', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  suite_id TEXT,
  suite_name TEXT,
  build TEXT,
  started_at INTEGER,
  finished_at INTEGER,
  total INTEGER,
  passed INTEGER,
  failed INTEGER,
  flaky INTEGER,
  note TEXT
);`,
    })
    .then('25f742', 'Core.Programming.Function', 'What Was Asked For', {
      func: `var p = msg.params || {};
msg.filter = '%' + String(p.filter || '') + '%';
msg.offset = Number(p.offset) || 0;
msg.limit = Number(p.limit) || 25;
if (p.limit === 0) {
  msg.limit = -1;
}
var key = p.sort && p.sort.key ? String(p.sort.key) : 'last_run_at';
var dir = p.sort && p.sort.dir === 'asc' ? 'ASC' : 'DESC';
msg.order = 'last_run_at ' + dir;
if (key === 'build') {
  msg.order = 'build COLLATE NOCASE ' + dir;
}
if (key === 'runs') {
  msg.order = 'runs ' + dir;
}
if (key === 'failed') {
  msg.order = 'failed ' + dir;
}
return msg;`,
    })
    .then('88659a', 'Robomotion.SQLite.Query', 'Read The Page', {
      optConnectionString: Message('db'),
      outResult: Message('page'),
      func: `SELECT r.build AS build,
       MIN(r.started_at) AS first_run_at,
       MAX(r.started_at) AS last_run_at,
       COUNT(*) AS runs,
       SUM(r.passed) AS passed,
       SUM(r.failed) AS failed,
       SUM(r.flaky) AS flaky,
       SUM(CASE WHEN r.failed > 0 THEN 1 ELSE 0 END) AS failing_runs
FROM runs r
WHERE r.build LIKE '{{{filter}}}'
GROUP BY r.build
ORDER BY {{{order}}}
LIMIT {{{limit}}} OFFSET {{{offset}}}`,
    })
    .then('1215dc', 'Robomotion.SQLite.Query', 'Count What Matches', {
      optConnectionString: Message('db'),
      outResult: Message('matching'),
      func: `SELECT COUNT(DISTINCT r.build) AS n
FROM runs r
WHERE r.build LIKE '{{{filter}}}'`,
    })
    .then('9ba772', 'Core.Programming.Function', 'Work Out Where Each Build Stands', {
      func: `var rows = [];
var i;
for (i = 0; i < msg.page.rows.length; i++) {
  var one = msg.page.rows[i];
  var runCount = Number(one.runs) || 0;
  var failing = Number(one.failing_runs) || 0;
  var verdict = 'pass';
  if (failing > 0) {
    verdict = failing >= runCount ? 'fail' : 'mixed';
  }
  rows.push({
    build: one.build,
    first_run_at: Number(one.first_run_at),
    last_run_at: Number(one.last_run_at),
    runs: runCount,
    passed: Number(one.passed) || 0,
    failed: Number(one.failed) || 0,
    flaky: Number(one.flaky) || 0,
    failing_runs: failing,
    verdict: verdict,
  });
}
msg.result = { rows: rows, total: Number(msg.matching.rows[0].n) };
return msg;`,
    })
    .then('99f698', 'Robomotion.Apps.Respond', 'Send The Builds', {});
});
