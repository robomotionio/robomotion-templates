import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Suites', (f) => {
  f.node('22ad1c', 'Core.Flow.Begin', 'Begin', {});
  f.node('e2b6f0', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.node('22ad1d', 'Core.Flow.Label', 'Say Why', {});
  f.node('8421e0', 'Robomotion.Apps.RespondError', 'Say Why', {
    inMessage: Message('refused'),
    optRetryable: false,
    continueOnError: true,
  });
  f.edge('22ad1d', 0, '8421e0', 0);

  f.node('3f811d', 'Core.Flow.GoTo', 'Say Why', {
    optNodes: { ids: ['22ad1d'], type: 'goto', all: false },
  });

  // listSuites

  f.node('cae313', 'Robomotion.Apps.Action', 'List Suites', { optActionName: 'listSuites' })
    .then('ccdc4b', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('e1778b', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('3f99ca', 'Core.Programming.Function', 'What Was Asked For', {
      func: `var p = msg.params || {};
msg.filter = '%' + String(p.filter || '') + '%';
msg.offset = Number(p.offset) || 0;
msg.limit = Number(p.limit) || 25;
if (p.limit === 0) {
  msg.limit = -1;
}
var key = p.sort && p.sort.key ? String(p.sort.key) : 'name';
var dir = p.sort && p.sort.dir === 'desc' ? 'DESC' : 'ASC';
msg.order = 's.name COLLATE NOCASE ' + dir;
if (key === 'base_url') {
  msg.order = 's.base_url COLLATE NOCASE ' + dir;
}
if (key === 'case_count') {
  msg.order = 'case_count ' + dir;
}
return msg;`,
    })
    .then('e51641', 'Robomotion.SQLite.Query', 'Read The Page', {
      optConnectionString: Message('db'),
      outResult: Message('page'),
      func: `SELECT s.id, s.name, s.base_url,
       (SELECT COUNT(*) FROM cases c WHERE c.suite_id = s.id) AS case_count,
       (SELECT COUNT(*) FROM steps st JOIN cases c2 ON c2.id = st.case_id WHERE c2.suite_id = s.id) AS step_count
FROM suites s
WHERE s.name LIKE '{{{filter}}}' OR s.base_url LIKE '{{{filter}}}'
ORDER BY {{{order}}}
LIMIT {{{limit}}} OFFSET {{{offset}}}`,
    })
    .then('92aa06', 'Robomotion.SQLite.Query', 'Count What Matches', {
      optConnectionString: Message('db'),
      outResult: Message('matching'),
      func: `SELECT COUNT(*) AS n
FROM suites s
WHERE s.name LIKE '{{{filter}}}' OR s.base_url LIKE '{{{filter}}}'`,
    })
    .then('590a9b', 'Core.Programming.Function', 'Hand The Page Over', {
      func: `msg.result = { rows: msg.page.rows, total: Number(msg.matching.rows[0].n) };
return msg;`,
    })
    .then('199a7d', 'Robomotion.Apps.Respond', 'Send The Suites', {});

  // getSuite

  f.node('2db4c1', 'Robomotion.Apps.Action', 'Get Suite', { optActionName: 'getSuite' })
    .then('6687d3', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('b33861', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('0748f1', 'Core.Programming.Function', 'Check The Suite', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.suite_id = String(p.id || '');
msg.refused = '';
if (!msg.suite_id || !/^[A-Za-z0-9-]+$/.test(msg.suite_id)) {
  msg.refused = 'That suite could not be found.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('0748f1', 1, '3f811d', 0);

  f.edge('0748f1', 0, 'da0e10', 0);
  f.node('da0e10', 'Robomotion.SQLite.Query', 'Read The Suite', {
    optConnectionString: Message('db'),
    outResult: Message('suiterows'),
    func: `SELECT id, name, base_url
FROM suites
WHERE id = '{{{suite_id}}}'`,
  })
    .then('b426c5', 'Robomotion.SQLite.Query', 'Read Its Cases', {
      optConnectionString: Message('db'),
      outResult: Message('caserows'),
      func: `SELECT id, suite_id, title, position
FROM cases
WHERE suite_id = '{{{suite_id}}}'
ORDER BY position ASC, title COLLATE NOCASE ASC`,
    })
    .then('127710', 'Robomotion.SQLite.Query', 'Read Its Steps', {
      optConnectionString: Message('db'),
      outResult: Message('steprows'),
      func: `SELECT st.id, st.case_id, st.position, st.action, st.expected
FROM steps st
JOIN cases c ON c.id = st.case_id
WHERE c.suite_id = '{{{suite_id}}}'
ORDER BY st.case_id, st.position ASC`,
    })
    .then('98c656', 'Core.Programming.Function', 'Shape The Suite', {
      outputs: 2,
      func: `var found = msg.suiterows.rows[0];
if (!found) {
  msg.refused = 'That suite is no longer there.';
  return [null, msg];
}
var cases = [];
var byId = {};
var rows = msg.caserows.rows;
var i;
for (i = 0; i < rows.length; i++) {
  var one = { id: rows[i].id, suite_id: rows[i].suite_id, title: rows[i].title, steps: [] };
  byId[one.id] = one;
  cases.push(one);
}
var stepRows = msg.steprows.rows;
for (i = 0; i < stepRows.length; i++) {
  var owner = byId[stepRows[i].case_id];
  if (owner) {
    owner.steps.push({
      id: stepRows[i].id,
      position: Number(stepRows[i].position),
      action: stepRows[i].action,
      expected: stepRows[i].expected,
    });
  }
}
msg.result = {
  suite: {
    id: found.id,
    name: found.name,
    base_url: found.base_url,
    case_count: cases.length,
    step_count: stepRows.length,
  },
  cases: cases,
};
return msg;`,
    });

  f.edge('98c656', 1, '3f811d', 0);
  f.edge('98c656', 0, 'efc9d6', 0);
  f.node('efc9d6', 'Robomotion.Apps.Respond', 'Send The Suite', {});

  // saveSuite

  f.node('0f8c1c', 'Robomotion.Apps.Action', 'Save Suite', { optActionName: 'saveSuite' })
    .then('dd2a5e', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('540a7e', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('1d7d70', 'Core.Programming.Function', 'Check What Was Sent', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.name = String(p.name || '').trim();
msg.base_url = String(p.base_url || '').trim();
msg.suite_id = p.id ? String(p.id) : '';
msg.refused = '';
if (!msg.name) {
  msg.refused = 'Give the suite a name.';
} else if (!msg.base_url) {
  msg.refused = 'Give the staging address this suite tests.';
} else if (msg.suite_id && !/^[A-Za-z0-9-]+$/.test(msg.suite_id)) {
  msg.refused = 'That suite could not be found.';
}
if (msg.refused) {
  return [null, msg];
}
msg.was_created = false;
if (!msg.suite_id) {
  msg.suite_id = 's' + msg.now.toString(36) + Math.floor(Math.random() * 100000).toString(36);
  msg.was_created = true;
}
return [msg, null];`,
    });

  f.edge('1d7d70', 1, '3f811d', 0);
  f.edge('1d7d70', 0, '04aefa', 0);
  f.node('04aefa', 'Robomotion.SQLite.NonQuery', 'Store The Suite', {
    optConnectionString: Message('db'),
    func: `INSERT INTO suites (id, name, base_url, created_at, updated_at)
VALUES ('{{{suite_id}}}', '{{{name}}}', '{{{base_url}}}', {{{now}}}, {{{now}}})
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  base_url = excluded.base_url,
  updated_at = excluded.updated_at`,
  })
    .then('e72e42', 'Robomotion.SQLite.Query', 'Read It Back', {
      optConnectionString: Message('db'),
      outResult: Message('rows'),
      func: `SELECT s.id, s.name, s.base_url,
       (SELECT COUNT(*) FROM cases c WHERE c.suite_id = s.id) AS case_count,
       (SELECT COUNT(*) FROM steps st JOIN cases c2 ON c2.id = st.case_id WHERE c2.suite_id = s.id) AS step_count
FROM suites s
WHERE s.id = '{{{suite_id}}}'`,
    })
    .then('293734', 'Core.Programming.Function', 'Answer With The Suite', {
      func: `var suite = msg.rows.rows[0];
suite.created = msg.was_created === true;
msg.result = suite;
return msg;`,
    })
    .then('fbddf2', 'Robomotion.Apps.Respond', 'Send The Suite', {});

  // removeSuite

  f.node('fe86a0', 'Robomotion.Apps.Action', 'Remove Suite', { optActionName: 'removeSuite' })
    .then('3fd3dd', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('eee6f5', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('f381b0', 'Core.Programming.Function', 'Check The Suite', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.suite_id = String(p.id || '');
msg.refused = '';
if (!msg.suite_id || !/^[A-Za-z0-9-]+$/.test(msg.suite_id)) {
  msg.refused = 'That suite could not be found.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('f381b0', 1, '3f811d', 0);
  f.edge('f381b0', 0, '061055', 0);
  f.node('061055', 'Robomotion.SQLite.NonQuery', 'Delete It And Its Cases', {
    optConnectionString: Message('db'),
    func: `DELETE FROM steps WHERE case_id IN (SELECT id FROM cases WHERE suite_id = '{{{suite_id}}}');
DELETE FROM cases WHERE suite_id = '{{{suite_id}}}';
DELETE FROM suites WHERE id = '{{{suite_id}}}';`,
  })
    .then('36acb6', 'Core.Programming.Function', 'Note What Went', {
      func: `msg.result = { id: msg.suite_id };
return msg;`,
    })
    .then('e69e59', 'Robomotion.Apps.Respond', 'Send It', {});

  // listCases

  f.node('5abec2', 'Robomotion.Apps.Action', 'List Cases', { optActionName: 'listCases' })
    .then('0c1f70', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('209667', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('fa9d7a', 'Core.Programming.Function', 'Check The Suite', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.suite_id = String(p.suite_id || '');
msg.refused = '';
if (!msg.suite_id || !/^[A-Za-z0-9-]+$/.test(msg.suite_id)) {
  msg.refused = 'That suite could not be found.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('fa9d7a', 1, '3f811d', 0);
  f.edge('fa9d7a', 0, '07c4d0', 0);
  f.node('07c4d0', 'Robomotion.SQLite.Query', 'Read The Cases', {
    optConnectionString: Message('db'),
    outResult: Message('caserows'),
    func: `SELECT id, suite_id, title, position
FROM cases
WHERE suite_id = '{{{suite_id}}}'
ORDER BY position ASC, title COLLATE NOCASE ASC`,
  })
    .then('4c8910', 'Robomotion.SQLite.Query', 'Read The Steps', {
      optConnectionString: Message('db'),
      outResult: Message('steprows'),
      func: `SELECT st.id, st.case_id, st.position, st.action, st.expected
FROM steps st
JOIN cases c ON c.id = st.case_id
WHERE c.suite_id = '{{{suite_id}}}'
ORDER BY st.case_id, st.position ASC`,
    })
    .then('125a6c', 'Core.Programming.Function', 'Shape The Cases', {
      func: `var cases = [];
var byId = {};
var i;
for (i = 0; i < msg.caserows.rows.length; i++) {
  var row = msg.caserows.rows[i];
  var one = { id: row.id, suite_id: row.suite_id, title: row.title, steps: [] };
  byId[one.id] = one;
  cases.push(one);
}
for (i = 0; i < msg.steprows.rows.length; i++) {
  var step = msg.steprows.rows[i];
  var owner = byId[step.case_id];
  if (owner) {
    owner.steps.push({
      id: step.id,
      position: Number(step.position),
      action: step.action,
      expected: step.expected,
    });
  }
}
msg.result = { rows: cases, total: cases.length };
return msg;`,
    })
    .then('fe6b98', 'Robomotion.Apps.Respond', 'Send The Cases', {});

  // saveCase

  f.node('7ee9e9', 'Robomotion.Apps.Action', 'Save Case', { optActionName: 'saveCase' })
    .then('63f4fd', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('3a41e5', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('2b66aa', 'Core.Programming.Function', 'Check The Case', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.case_id = p.id ? String(p.id) : '';
msg.suite_id = String(p.suite_id || '');
msg.title = String(p.title || '').trim();
msg.refused = '';
msg.clean_steps = [];
var steps = p.steps || [];
var i;
for (i = 0; i < steps.length; i++) {
  var action = String(steps[i].action || '').trim();
  var expected = String(steps[i].expected || '').trim();
  if (!action && !expected) {
    continue;
  }
  msg.clean_steps.push({ action: action, expected: expected });
}
if (!msg.title) {
  msg.refused = 'Give the test case a title.';
} else if (!msg.suite_id || !/^[A-Za-z0-9-]+$/.test(msg.suite_id)) {
  msg.refused = 'That suite could not be found.';
} else if (msg.clean_steps.length === 0) {
  msg.refused = 'Add at least one step to the test case.';
} else if (msg.case_id && !/^[A-Za-z0-9-]+$/.test(msg.case_id)) {
  msg.refused = 'That test case could not be found.';
}
if (msg.refused) {
  return [null, msg];
}
msg.was_created = false;
if (!msg.case_id) {
  msg.case_id = 'c' + msg.now.toString(36) + Math.floor(Math.random() * 100000).toString(36);
  msg.was_created = true;
}
return [msg, null];`,
    });

  f.edge('2b66aa', 1, '3f811d', 0);
  f.edge('2b66aa', 0, '81908b', 0);
  f.node('81908b', 'Robomotion.SQLite.NonQuery', 'Store The Case', {
    optConnectionString: Message('db'),
    func: `INSERT INTO cases (id, suite_id, title, position)
VALUES ('{{{case_id}}}', '{{{suite_id}}}', '{{{title}}}',
  COALESCE((SELECT MAX(position) FROM cases WHERE suite_id = '{{{suite_id}}}'), 0) + 1)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  suite_id = excluded.suite_id`,
  })
    .then('5a13b7', 'Robomotion.SQLite.NonQuery', 'Clear Its Old Steps', {
      optConnectionString: Message('db'),
      func: `DELETE FROM steps WHERE case_id = '{{{case_id}}}'`,
    })
    .then('8e383b', 'Core.Programming.Function', 'Lay Out The Steps', {
      func: `var rows = [];
var i;
for (i = 0; i < msg.clean_steps.length; i++) {
  rows.push({
    id: msg.case_id + '-s' + (i + 1),
    case_id: msg.case_id,
    position: i + 1,
    action: msg.clean_steps[i].action,
    expected: msg.clean_steps[i].expected,
  });
}
msg.step_table = {
  columns: ['id', 'case_id', 'position', 'action', 'expected'],
  rows: rows,
};
return msg;`,
    })
    .then('a955f7', 'Robomotion.SQLite.Insert', 'Store The Steps', {
      optConnectionString: Message('db'),
      inDatabaseTable: Custom('steps'),
      inTable: Message('step_table'),
      optReplace: true,
    })
    .then('8b9d4b', 'Robomotion.SQLite.Query', 'Read The Case Back', {
      optConnectionString: Message('db'),
      outResult: Message('caserows'),
      func: `SELECT id, suite_id, title
FROM cases
WHERE id = '{{{case_id}}}'`,
    })
    .then('d1e3bd', 'Robomotion.SQLite.Query', 'Read Its Steps Back', {
      optConnectionString: Message('db'),
      outResult: Message('steprows'),
      func: `SELECT id, case_id, position, action, expected
FROM steps
WHERE case_id = '{{{case_id}}}'
ORDER BY position ASC`,
    })
    .then('e496b8', 'Core.Programming.Function', 'Shape The Case', {
      outputs: 2,
      func: `var found = msg.caserows.rows[0];
if (!found) {
  msg.refused = 'That test case is no longer there.';
  return [null, msg];
}
var steps = [];
var i;
for (i = 0; i < msg.steprows.rows.length; i++) {
  var step = msg.steprows.rows[i];
  steps.push({
    id: step.id,
    position: Number(step.position),
    action: step.action,
    expected: step.expected,
  });
}
msg.result = {
  id: found.id,
  suite_id: found.suite_id,
  title: found.title,
  steps: steps,
  created: msg.was_created === true,
};
return msg;`,
    });

  f.edge('e496b8', 1, '3f811d', 0);
  f.edge('e496b8', 0, 'bfe8fd', 0);
  f.node('bfe8fd', 'Robomotion.Apps.Respond', 'Send The Case', {});

  // removeCase

  f.node('d89cb7', 'Robomotion.Apps.Action', 'Remove Case', { optActionName: 'removeCase' })
    .then('928626', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('b34b3f', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('0de343', 'Core.Programming.Function', 'Check The Case', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.case_id = String(p.id || '');
msg.refused = '';
if (!msg.case_id || !/^[A-Za-z0-9-]+$/.test(msg.case_id)) {
  msg.refused = 'That test case could not be found.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('0de343', 1, '3f811d', 0);
  f.edge('0de343', 0, '5d6004', 0);
  f.node('5d6004', 'Robomotion.SQLite.NonQuery', 'Delete The Case', {
    optConnectionString: Message('db'),
    func: `DELETE FROM steps WHERE case_id = '{{{case_id}}}';
DELETE FROM cases WHERE id = '{{{case_id}}}';`,
  })
    .then('2c150b', 'Core.Programming.Function', 'Note What Went', {
      func: `msg.result = { id: msg.case_id };
return msg;`,
    })
    .then('04ee9e', 'Robomotion.Apps.Respond', 'Send It', {});

  // importCases

  f.node('a09aaf', 'Robomotion.Apps.Action', 'Import Cases', { optActionName: 'importCases' })
    .then('1401f2', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('3cc3c3', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
      optConnectionString: Message('db'),
      func: `CREATE TABLE IF NOT EXISTS suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position INTEGER,
  action TEXT NOT NULL,
  expected TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
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
    .then('a20178', 'Core.Programming.Function', 'Check The Import', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.suite_id = String(p.suite_id || '');
msg.csv = String(p.csv || '');
msg.refused = '';
if (!msg.suite_id || !/^[A-Za-z0-9-]+$/.test(msg.suite_id)) {
  msg.refused = 'That suite could not be found.';
} else if (!msg.csv && (!p.file || !p.file.artifact_id)) {
  msg.refused = 'Choose a CSV file, or paste the rows in.';
}
if (msg.refused) {
  return [null, msg];
}
msg.file = p.file || null;
return [msg, null];`,
    });

  f.edge('a20178', 1, '3f811d', 0);
  f.edge('a20178', 0, 'b3ea50', 0);

  f.node('b3ea50', 'Core.Programming.Switch', 'How It Arrived', {
    optUseBreak: true,
    optConditions: [Custom('!!msg.csv'), Custom('true')],
  });
  f.edge('b3ea50', 0, 'b3ea51', 0);
  f.edge('b3ea50', 1, 'd9075a', 0);

  f.node('b3ea51', 'Core.Flow.GoTo', 'Read The Rows', {
    optNodes: { ids: ['b3ea52'], type: 'goto', all: false },
  });

  f.node('b3ea52', 'Core.Flow.Label', 'Rows To Read', {});
  f.edge('b3ea52', 0, '671290', 0);

  f.node('d9075a', 'Robomotion.Apps.GetFile', 'Fetch The File', {
    inFileRef: Message('file'),
    optDownloadDir: Custom(''),
    outPath: Message('path'),
  })
    .then('b3ea30', 'Core.FileSystem.PathExists', 'Is The File There', {
      inPath: Message('path'),
      outResult: Message('exists'),
    })
    .then('b3ea31', 'Core.Programming.Function', 'Read It Or Say Why', {
      outputs: 2,
      func: `if (!msg.exists) {
  msg.refused = 'That file could not be opened. Try choosing it again.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('b3ea31', 1, '3f811d', 0);
  f.edge('b3ea31', 0, '06bb74', 0);
  f.edge('06bb74', 0, 'b3ea51', 0);
  f.node('06bb74', 'Core.FileSystem.ReadFile', 'Read The File', {
    inPath: Message('path'),
    outContent: Message('text'),
  });

  f.node('671290', 'Core.Programming.Function', 'Read The Rows', {
      outputs: 2,
      func: `var text = String(msg.text || msg.csv || '');
if (text.charAt(0) === '\\ufeff') {
  text = text.slice(1);
}
var rows = [];
var row = [];
var field = '';
var quoted = false;
var i;
for (i = 0; i < text.length; i++) {
  var ch = text.charAt(i);
  if (quoted) {
    if (ch === '"') {
      if (text.charAt(i + 1) === '"') {
        field += '"';
        i++;
      } else {
        quoted = false;
      }
    } else {
      field += ch;
    }
  } else if (ch === '"') {
    quoted = true;
  } else if (ch === ',') {
    row.push(field);
    field = '';
  } else if (ch === '\\n' || ch === '\\r') {
    if (ch === '\\r' && text.charAt(i + 1) === '\\n') {
      i++;
    }
    row.push(field);
    field = '';
    rows.push(row);
    row = [];
  } else {
    field += ch;
  }
}
if (field !== '' || row.length > 0) {
  row.push(field);
  rows.push(row);
}
var groups = [];
var byTitle = {};
var skipped = 0;
for (i = 0; i < rows.length; i++) {
  var cells = rows[i];
  if (!cells.length) {
    continue;
  }
  var title = String(cells[0] || '').trim();
  var stepNo = parseInt(cells[1], 10);
  var action = String(cells[2] || '').trim();
  var expected = String(cells[3] || '').trim();
  if (title.toLowerCase() === 'case' && expected.toLowerCase() === 'expected') {
    continue;
  }
  if (!title && !action && !expected) {
    continue;
  }
  if (!title) {
    skipped++;
    continue;
  }
  var group = byTitle[title];
  if (!group) {
    group = { title: title, steps: [] };
    byTitle[title] = group;
    groups.push(group);
  }
  if (!action && !expected) {
    skipped++;
    continue;
  }
  group.steps.push({
    no: isNaN(stepNo) ? group.steps.length + 1 : stepNo,
    action: action,
    expected: expected,
  });
}
if (groups.length === 0) {
  msg.refused = 'That file had no test cases in it. Use the columns case, step, action, expected.';
  return [null, msg];
}
var caseRows = [];
var stepRows = [];
for (i = 0; i < groups.length; i++) {
  var one = groups[i];
  var caseId = 'c' + (msg.now + i).toString(36) + Math.floor(Math.random() * 100000).toString(36);
  caseRows.push({ id: caseId, suite_id: msg.suite_id, title: one.title, position: msg.now + i });
  one.steps.sort(function (a, b) {
    return a.no - b.no;
  });
  for (var j = 0; j < one.steps.length; j++) {
    stepRows.push({
      id: caseId + '-s' + (j + 1),
      case_id: caseId,
      position: j + 1,
      action: one.steps[j].action,
      expected: one.steps[j].expected,
    });
  }
}
msg.case_ids = [];
for (i = 0; i < caseRows.length; i++) {
  msg.case_ids.push(caseRows[i].id);
}
msg.case_table = {
  columns: ['id', 'suite_id', 'title', 'position'],
  rows: caseRows,
};
msg.step_table = {
  columns: ['id', 'case_id', 'position', 'action', 'expected'],
  rows: stepRows,
};
msg.imported_cases = caseRows.length;
msg.imported_steps = stepRows.length;
msg.skipped = skipped;
return [msg, null];`,
  });

  f.edge('671290', 1, '3f811d', 0);
  f.edge('671290', 0, 'e01a1e', 0);
  f.node('e01a1e', 'Robomotion.SQLite.Insert', 'Store The Cases', {
    optConnectionString: Message('db'),
    inDatabaseTable: Custom('cases'),
    inTable: Message('case_table'),
  })
    .then('bd2deb', 'Robomotion.SQLite.Insert', 'Store The Steps', {
      optConnectionString: Message('db'),
      inDatabaseTable: Custom('steps'),
      inTable: Message('step_table'),
    })
    .then('055c70', 'Core.Programming.Function', 'Say What Arrived', {
      func: `var caseWord = msg.imported_cases === 1 ? ' test case' : ' test cases';
var stepWord = msg.imported_steps === 1 ? ' step' : ' steps';
msg.result = {
  cases: msg.imported_cases,
  steps: msg.imported_steps,
  skipped: msg.skipped,
  case_ids: msg.case_ids,
  message: 'Added ' + msg.imported_cases + caseWord + ' with ' + msg.imported_steps + stepWord + '.',
};
return msg;`,
    })
    .then('60aacb', 'Robomotion.Apps.Respond', 'Send The Count', {});
});
