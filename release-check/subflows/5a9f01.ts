import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Runs', (f) => {
  f.node('5a9f02', 'Core.Flow.Begin', 'Begin', {});
  f.node('5a9f03', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.node('249b79', 'Core.Flow.Label', 'Say Why', {});
  f.node('db0e43', 'Robomotion.Apps.RespondError', 'Say Why', {
    inMessage: Message('refused'),
    optRetryable: false,
    continueOnError: true,
  });
  f.edge('249b79', 0, 'db0e43', 0);

  f.node('d267c6', 'Core.Flow.GoTo', 'Say Why', {
    optNodes: { ids: ['249b79'], type: 'goto', all: false },
  });

  // listRuns

  f.node('e85041', 'Robomotion.Apps.Action', 'List Runs', { optActionName: 'listRuns' })
    .then('5db99d', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('59a133', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
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
);
CREATE TABLE IF NOT EXISTS run_steps (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  case_title TEXT,
  attempt INTEGER,
  position INTEGER,
  action TEXT,
  expected TEXT,
  said TEXT,
  screenshot TEXT,
  ok INTEGER,
  url TEXT
);`,
    })
    .then('e50fc2', 'Core.Programming.Function', 'What Was Asked For', {
      func: `var p = msg.params || {};
msg.filter = '%' + String(p.filter || '') + '%';
msg.offset = Number(p.offset) || 0;
msg.limit = Number(p.limit) || 25;
if (p.limit === 0) {
  msg.limit = -1;
}
var key = p.sort && p.sort.key ? String(p.sort.key) : 'started_at';
var dir = p.sort && p.sort.dir === 'asc' ? 'ASC' : 'DESC';
msg.order = 'r.started_at ' + dir;
if (key === 'build') {
  msg.order = 'r.build COLLATE NOCASE ' + dir + ', r.started_at DESC';
}
if (key === 'suite_name') {
  msg.order = 'r.suite_name COLLATE NOCASE ' + dir + ', r.started_at DESC';
}
if (key === 'passed') {
  msg.order = 'r.passed ' + dir + ', r.started_at DESC';
}
if (key === 'failed') {
  msg.order = 'r.failed ' + dir + ', r.started_at DESC';
}
return msg;`,
    })
    .then('72f76e', 'Robomotion.SQLite.Query', 'Read The Page', {
      optConnectionString: Message('db'),
      outResult: Message('page'),
      func: `SELECT r.id, r.suite_id, r.suite_name, r.build, r.started_at, r.finished_at,
       r.total, r.passed, r.failed, r.flaky, r.note, 'done' AS status
FROM runs r
WHERE r.build LIKE '{{{filter}}}' OR r.suite_name LIKE '{{{filter}}}'
ORDER BY {{{order}}}
LIMIT {{{limit}}} OFFSET {{{offset}}}`,
    })
    .then('f65835', 'Robomotion.SQLite.Query', 'Count What Matches', {
      optConnectionString: Message('db'),
      outResult: Message('matching'),
      func: `SELECT COUNT(*) AS n
FROM runs r
WHERE r.build LIKE '{{{filter}}}' OR r.suite_name LIKE '{{{filter}}}'`,
    })
    .then('da39a4', 'Core.Programming.Function', 'Hand The Page Over', {
      func: `msg.result = { rows: msg.page.rows, total: Number(msg.matching.rows[0].n) };
return msg;`,
    })
    .then('dd0d7b', 'Robomotion.Apps.Respond', 'Send The Runs', {});

  // getRun

  f.node('1f4c60', 'Robomotion.Apps.Action', 'Get Run', { optActionName: 'getRun' })
    .then('2a7f31', 'Core.Programming.Function', 'Check The Run', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.run_id = String(p.id || '');
msg.refused = '';
if (!msg.run_id || !/^[A-Za-z0-9-]+$/.test(msg.run_id)) {
  msg.refused = 'That run could not be found.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('2a7f31', 1, 'd267c6', 0);
  f.edge('2a7f31', 0, '3b8e52', 0);

  f.node('3b8e52', 'Robomotion.SQLite.Query', 'Read The Run', {
    optConnectionString: Message('db'),
    outResult: Message('runrows'),
    func: `SELECT id, suite_id, suite_name, build, started_at, finished_at,
       total, passed, failed, flaky, note
FROM runs
WHERE id = '{{{run_id}}}'`,
  })
    .then('4c9d73', 'Robomotion.SQLite.Query', 'Read Every Step', {
      optConnectionString: Message('db'),
      outResult: Message('steprows'),
      func: `SELECT id, run_id, case_title, attempt, position, action, expected, said, screenshot, ok, url
FROM run_steps
WHERE run_id = '{{{run_id}}}'
ORDER BY attempt ASC, case_title COLLATE NOCASE ASC, position ASC`,
    })
    .then('5da084', 'Core.Programming.Function', 'Shape The Run', {
      outputs: 2,
      func: `var found = msg.runrows.rows[0];
if (!found) {
  msg.refused = 'That run is no longer there.';
  return [null, msg];
}
var steps = [];
var i;
for (i = 0; i < msg.steprows.rows.length; i++) {
  var row = msg.steprows.rows[i];
  steps.push({
    id: row.id,
    case_title: row.case_title,
    attempt: Number(row.attempt),
    position: Number(row.position),
    action: row.action,
    expected: row.expected,
    said: row.said,
    screenshot: row.screenshot,
    ok: Number(row.ok) === 1,
    url: row.url,
  });
}
msg.result = {
  run: {
    id: found.id,
    suite_id: found.suite_id,
    suite_name: found.suite_name,
    build: found.build,
    started_at: Number(found.started_at),
    finished_at: Number(found.finished_at),
    total: Number(found.total),
    passed: Number(found.passed),
    failed: Number(found.failed),
    flaky: Number(found.flaky),
    note: found.note || '',
    status: 'done',
  },
  steps: steps,
};
return msg;`,
    });

  f.edge('5da084', 1, 'd267c6', 0);
  f.edge('5da084', 0, '6eb195', 0);
  f.node('6eb195', 'Robomotion.Apps.Respond', 'Send The Run Detail', {});

  // runSuite

  f.node('c6126c', 'Robomotion.Apps.Action', 'Run Suite', { optActionName: 'runSuite' })
    .then('aa59dd', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('7fba92', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
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
);
CREATE TABLE IF NOT EXISTS run_steps (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  case_title TEXT,
  attempt INTEGER,
  position INTEGER,
  action TEXT,
  expected TEXT,
  said TEXT,
  screenshot TEXT,
  ok INTEGER,
  url TEXT
);`,
    })
    .then('98fb48', 'Core.Programming.Function', 'What Was Asked For', {
      func: `var p = msg.params || {};
msg.build_asked = String(p.build || '').trim();
msg.suite_id = String(p.suite_id || '');
msg.refused = '';
if (!msg.suite_id || !/^[A-Za-z0-9-]+$/.test(msg.suite_id)) {
  msg.refused = 'Pick a suite to run.';
}
return msg;`,
    })
    .then('c93d0f', 'Robomotion.SQLite.Query', 'Read The Suite', {
      optConnectionString: Message('db'),
      outResult: Message('suiterows'),
      func: `SELECT id, name, base_url
FROM suites
WHERE id = '{{{suite_id}}}'`,
    })
    .then('f83d57', 'Robomotion.SQLite.Query', 'Read Its Cases', {
      optConnectionString: Message('db'),
      outResult: Message('caserows'),
      func: `SELECT id, title, position
FROM cases
WHERE suite_id = '{{{suite_id}}}'
ORDER BY position ASC, title COLLATE NOCASE ASC`,
    })
    .then('ec81e7', 'Robomotion.SQLite.Query', 'Read Its Steps', {
      optConnectionString: Message('db'),
      outResult: Message('steprows'),
      func: `SELECT st.case_id, st.position, st.action, st.expected
FROM steps st
JOIN cases c ON c.id = st.case_id
WHERE c.suite_id = '{{{suite_id}}}'
ORDER BY st.case_id, st.position ASC`,
    })
    .then('0fc502', 'Core.Programming.Function', 'Get Ready To Run', {
      outputs: 2,
      func: `if (msg.refused) {
  return [null, msg];
}
var suite = msg.suiterows.rows[0];
if (!suite) {
  msg.refused = 'That suite could not be found.';
  return [null, msg];
}
if (!msg.caserows.rows.length) {
  msg.refused = 'That suite has no test cases yet. Add some on the Suites screen first.';
  return [null, msg];
}
var address = String(suite.base_url || '').trim();
if (!address) {
  msg.refused = 'That suite has no staging address yet. Add one on the Suites screen.';
  return [null, msg];
}
if (!/^https?:\\/\\//i.test(address)) {
  address = 'https://' + address;
}
msg.base_url = address;
msg.reset_url = address.replace(/\\/+$/, '') + '/reset';
var cases = [];
var byId = {};
var i;
for (i = 0; i < msg.caserows.rows.length; i++) {
  var row = msg.caserows.rows[i];
  var one = { id: row.id, title: row.title, steps: [] };
  byId[one.id] = one;
  cases.push(one);
}
for (i = 0; i < msg.steprows.rows.length; i++) {
  var step = msg.steprows.rows[i];
  var owner = byId[step.case_id];
  if (owner) {
    owner.steps.push({
      no: owner.steps.length + 1,
      action: step.action,
      expected: step.expected,
    });
  }
}
msg.cases = cases;
msg.suite_name = suite.name;
msg.run_id = 'r' + msg.now.toString(36) + Math.floor(Math.random() * 100000).toString(36);
msg.started_at = msg.now;
msg.passed = 0;
msg.failed = 0;
msg.flaky = 0;
msg.note = '';
msg.build_from_page = '';
msg.step_rows = [];
msg.case_pos = 0;
msg.attempts_made = 0;
msg.attempt_budget = cases.length * 2 + 2;
msg.signed_in = false;
msg.shot_root = global.get('$Home$') + '/ReleaseCheck-shots/' + msg.run_id;
return [msg, null];`,
    });

  f.edge('0fc502', 1, 'd267c6', 0);
  f.edge('0fc502', 0, '8d3f51', 0);

  f.node('8d3f51', 'Core.Vault.GetItem', 'The QA Login', {
    optCredentials: Credential({
      vaultId: '_',
      itemId: '_',
    }),
    outItem: Message('login'),
  })
    .then('9e4a62', 'Core.FileSystem.Create', 'Make The Screenshot Folder', {
      inPath: Message('shot_root'),
      optType: 'directory',
    });

  f.node('d10e24', 'Core.Flow.GoTo', 'Each Case', {
    optNodes: { ids: ['a05b73'], type: 'goto', all: false },
  });
  f.edge('9e4a62', 0, 'd10e24', 0);

  f.node('a05b73', 'Core.Flow.Label', 'Each Case', {});

  f.node('d10e02', 'Core.Programming.Function', 'The Next Case', {
    outputs: 2,
    func: `var all = msg.cases || [];
if (msg.case_pos >= all.length) {
  return [null, msg];
}
msg.case_index = msg.case_pos;
msg.case = all[msg.case_pos];
msg.case_pos = msg.case_pos + 1;
msg.attempt = 0;
msg.case_failed = '';
msg.first_failure = '';
msg.steps_for_case = msg.case.steps || [];
msg.progress_message = 'Checking ' + (msg.case.title || 'a case') + ' (' + (msg.case_index + 1) + ' of ' + all.length + ')';
msg.progress_percent = Math.round((msg.case_index / Math.max(all.length, 1)) * 100);
return [msg, null];`,
  });
  f.edge('a05b73', 0, 'd10e02', 0);

  f.node('d10e03', 'Robomotion.Apps.Progress', 'Say Which Case', {
    inMessage: Message('progress_message'),
    optPercent: Message('progress_percent'),
    continueOnError: true,
  });
  f.edge('d10e02', 0, 'd10e03', 0);

  f.node('d10e04', 'Core.Flow.Label', 'Attempt', {});
  f.node('d10e21', 'Core.Flow.GoTo', 'Attempt', {
    optNodes: { ids: ['d10e04'], type: 'goto', all: false },
  });
  f.edge('d10e03', 0, 'd10e21', 0);

  // At most two attempts per case, and a hard budget for the whole run.
  f.node('d10e05', 'Core.Programming.Function', 'Should We Try', {
    outputs: 2,
    func: `if (msg.attempt >= 2) {
  return [null, msg];
}
if (msg.attempt >= 1 && !msg.case_failed) {
  return [null, msg];
}
if (msg.attempts_made >= msg.attempt_budget) {
  if (!msg.case_failed) {
    msg.case_failed = 'the run reached its limit of attempts before this case could be tried';
  }
  return [null, msg];
}
if (msg.case_failed && !msg.first_failure) {
  msg.first_failure = msg.case_failed;
}
msg.attempt = msg.attempt + 1;
msg.attempts_made = msg.attempts_made + 1;
msg.case_failed = '';
msg.step_pos = 0;
msg.signed_in = false;
msg.page_id = '';
msg.act = null;
msg.check_out = null;
msg.signin_out = null;
msg.footer_out = null;
return [msg, null];`,
  });
  f.edge('d10e04', 0, 'd10e05', 0);

  f.node('d10e06', 'Core.Browser.Open', 'Open A Fresh Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true,
  });
  f.edge('d10e05', 0, 'd10e06', 0);

  f.node('d10e07', 'Core.Browser.OpenLink', 'Open The Reset Page', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('reset_url'),
    outPageId: Message('page_id'),
    optSameTab: true,
    optTimeout: 45,
  });
  f.edge('d10e06', 0, 'd10e07', 0);

  f.node('d10e08', 'Core.Browser.TypeText', 'Type The Login', {
    inPageId: Message('page_id'),
    inSelector: Custom('//input[@type="email" or @name="email" or @id="email" or @name="username" or @id="username" or @autocomplete="username"]'),
    inText: Message('login.username'),
    optWaitTimeout: Custom('20'),
    optClearText: true,
  });
  f.edge('d10e07', 0, 'd10e08', 0);

  f.node('d10e09', 'Core.Browser.TypeText', 'Type The Password', {
    inPageId: Message('page_id'),
    inSelector: Custom('//input[@type="password"]'),
    inText: Message('login.password'),
    optWaitTimeout: Custom('20'),
    optClearText: true,
  });
  f.edge('d10e08', 0, 'd10e09', 0);

  f.node('d10e0a', 'Core.Browser.ClickElement', 'Press Sign In', {
    inPageId: Message('page_id'),
    inSelector: Custom('//button[@type="submit"] | //input[@type="submit"]'),
    optWaitTimeout: Custom('20'),
  });
  f.edge('d10e09', 0, 'd10e0a', 0);

  f.node('d10e0b', 'Core.Browser.WaitElement', 'Wait For Welcome Back', {
    inPageId: Message('page_id'),
    inSelector: Custom('//*[contains(text(), "Welcome back")]'),
    optCondition: 'to-appear',
    optTimeout: Custom('45'),
    continueOnError: true,
  });
  f.edge('d10e0a', 0, 'd10e0b', 0);

  f.node('d10e0c', 'Core.Browser.RunScript', 'Read The Page We Landed On', {
    inPageId: Message('page_id'),
    outResult: Message('signin_out'),
    func: `var text = String(document.body ? document.body.innerText : '').replace(/\\s+/g, ' ').trim();
var foot = document.querySelector('footer');
var footText = String((foot && foot.innerText) || '').replace(/\\s+/g, ' ').trim();
var build = footText.match(/build[^0-9a-z]*([0-9][0-9A-Za-z._-]*)/i);
if (!build) {
  build = text.match(/build[^0-9a-z]*([0-9][0-9A-Za-z._-]*)/i);
}
return JSON.stringify({
  signed_in: text.toLowerCase().indexOf('welcome back') !== -1,
  build: build ? build[1] : '',
  said: text.slice(0, 200),
});`,
  });
  f.edge('d10e0b', 0, 'd10e0c', 0);

  f.node('d10e0f', 'Core.Programming.Function', 'Remember Where We Are', {
    func: `var seen = {};
try {
  seen = JSON.parse(msg.signin_out || '{}');
} catch (e) {
  seen = { signed_in: false, build: '', said: '' };
}
msg.signed_in = !!seen.signed_in;
msg.signin_said = String(seen.said || '');
if (!msg.build_from_page && seen.build) {
  msg.build_from_page = seen.build;
}
if (!msg.signed_in && !msg.case_failed) {
  msg.case_failed = 'I could not sign in to the staging page - "Welcome back" never appeared. The page showed: ' + msg.signin_said.slice(0, 120);
}
return msg;`,
  });
  f.edge('d10e0c', 0, 'd10e0f', 0);

  f.node('d10e10', 'Core.Flow.Label', 'Step Loop', {});
  f.node('d10e22', 'Core.Flow.GoTo', 'Step Loop', {
    optNodes: { ids: ['d10e10'], type: 'goto', all: false },
  });
  f.edge('d10e0f', 0, 'd10e22', 0);

  f.node('d10e11', 'Core.Programming.Function', 'The Next Step', {
    outputs: 2,
    func: `var steps = msg.steps_for_case || [];
if (msg.case_failed || msg.step_pos >= steps.length) {
  return [null, msg];
}
msg.step = steps[msg.step_pos];
msg.step_index = msg.step_pos;
msg.step_pos = msg.step_pos + 1;
return [msg, null];`,
  });
  f.edge('d10e10', 0, 'd10e11', 0);

  f.node('d10e12', 'Core.Programming.Function', 'Prepare The Step', {
    outputs: 2,
    func: `var words = String(msg.step.action || '').trim();
msg.step_goal = words;
msg.step_values = {};
var quoted = words.match(/"[^"]*"/g) || [];
var i;
for (i = 0; i < quoted.length; i++) {
  var inner = quoted[i].slice(1, quoted[i].length - 1);
  msg.step_values['the exact text "' + inner + '"'] = inner;
}
msg.shot_path = msg.shot_root + '/' + (msg.case_index + 1) + '-' + (msg.step_index + 1) + '-try' + msg.attempt + '.png';
if (!words) {
  return [null, msg];
}
return [msg, null];`,
  });
  f.edge('d10e11', 0, 'd10e12', 0);

  f.node('d10e13', 'Core.Browser.Act', 'Do The Step', {
    inPageId: Message('page_id'),
    inGoal: Message('step_goal'),
    inValues: Message('step_values'),
    optProvider: 'openrouter',
    optDecisionModel: 'typesafe/jev-1.14',
    optTextModel: 'deepseek/deepseek-v4.1-flash-1017',
    optMode: 'run',
    optMaxSteps: Custom('25'),
    optMinConfidence: Custom('0.4'),
    optCredentials: Credential({
      vaultId: '_',
      itemId: '_',
    }),
    outResult: Message('act'),
    delayAfter: 0.5,
  });
  f.edge('d10e12', 0, 'd10e13', 0);

  f.node('d10e14', 'Core.Browser.Screenshot', 'Take A Screenshot', {
    inPageId: Message('page_id'),
    inSaveFilePath: Message('shot_path'),
    outPath: Message('shot_saved'),
    continueOnError: true,
  });
  f.edge('d10e13', 0, 'd10e14', 0);
  f.edge('d10e13', 1, 'd10e14', 0);
  f.edge('d10e12', 1, 'd10e14', 0);

  f.node('d10e15', 'Core.Browser.RunScript', 'Check The Expected Text', {
    inPageId: Message('page_id'),
    outResult: Message('check_out'),
    delayBefore: 1,
    func: `var expected = String(msg.step.expected || '').trim().replace(/^["']|["']$/g, '');
var raw = String(document.body ? document.body.innerText : '');
var flat = raw.replace(/\\s+/g, ' ').trim();
var wanted = expected.replace(/\\s+/g, ' ').toLowerCase();
var found = !wanted || flat.toLowerCase().indexOf(wanted) !== -1;
var said = flat.slice(0, 600);
if (found && wanted) {
  var at = flat.toLowerCase().indexOf(wanted);
  said = flat.slice(Math.max(0, at - 120), at + expected.length + 180);
}
return JSON.stringify({ ok: found, said: said, url: window.location.href });`,
    continueOnError: true,
  });
  f.edge('d10e14', 0, 'd10e15', 0);

  f.node('d10e16', 'Core.Programming.Function', 'Record The Step', {
    func: `var page = {};
try {
  page = JSON.parse(msg.check_out || '{}');
} catch (e) {
  page = { ok: false, said: 'The page could not be read.', url: '' };
}
var step = msg.step || {};
var done = msg.act || {};
var actSaid = '';
if (String(step.action || '').trim()) {
  if (!done.status) {
    actSaid = 'the step model did not act on this step - the robot may not be able to open the vault that holds the OpenRouter key';
  } else if (done.status !== 'done' && done.status !== 'acted') {
    actSaid = String(done.reason || 'the step model could not finish this step');
  }
}
var ok = !!page.ok;
var said = String(page.said || '');
if (actSaid) {
  said = said + ' (what the robot tried: ' + actSaid + ')';
}
msg.step_rows.push({
  id: msg.run_id + '-' + (msg.case_index + 1) + '-' + msg.attempt + '-' + (msg.step_index + 1),
  run_id: msg.run_id,
  case_title: msg.case && msg.case.title ? msg.case.title : '',
  attempt: msg.attempt,
  position: msg.step_index + 1,
  action: String(step.action || ''),
  expected: String(step.expected || ''),
  said: said,
  screenshot: msg.shot_path,
  ok: ok ? 1 : 0,
  url: String(page.url || ''),
});
if (!ok && !msg.case_failed) {
  var missing = 'the page did not show "' + String(step.expected || '').trim() + '"';
  if (actSaid) {
    msg.case_failed = 'step ' + (msg.step_index + 1) + ': ' + actSaid;
  } else {
    msg.case_failed = 'step ' + (msg.step_index + 1) + ': ' + missing;
  }
}
msg.one_step_table = {
  columns: ['id', 'run_id', 'case_title', 'attempt', 'position', 'action', 'expected', 'said', 'screenshot', 'ok', 'url'],
  rows: [msg.step_rows[msg.step_rows.length - 1]],
};
msg.act = null;
msg.check_out = null;
return msg;`,
  });
  f.edge('d10e15', 0, 'd10e16', 0);

  f.node('d10e25', 'Robomotion.SQLite.Insert', 'Write The Step Down', {
    optConnectionString: Message('db'),
    inDatabaseTable: Custom('run_steps'),
    inTable: Message('one_step_table'),
    optReplace: true,
  });
  f.edge('d10e16', 0, 'd10e25', 0);

  f.node('d10e17', 'Core.Flow.GoTo', 'Step Loop', {
    optNodes: { ids: ['d10e10'], type: 'goto', all: false },
  });
  f.edge('d10e25', 0, 'd10e17', 0);
  f.edge('d10e11', 1, 'd10e18', 0);


  // Anything that goes wrong inside an attempt lands here, is written down,
  // and leaves the attempt by the one door that closes the browser.
  f.node('d10e30', 'Core.Trigger.Catch', 'If The Page Goes Wrong', {
    optNodes: {
      all: false,
      ids: ['d10e06', 'd10e07', 'd10e08', 'd10e09', 'd10e0a', 'd10e0c', 'd10e13', 'd10e15'],
      type: 'catch',
    },
  })
    .then('d10e31', 'Core.Programming.Function', 'Say What Stopped It', {
      func: `var why = '';
if (msg.error && msg.error.message) {
  why = String(msg.error.message);
}
if (!why) {
  why = 'the robot could not finish this step';
}
if (!msg.shot_path) {
  msg.shot_path = msg.shot_root + '/stop-' + (msg.case_index + 1) + '-try' + msg.attempt + '.png';
}
var which = msg.step ? 'step ' + (msg.step_index + 1) + ': ' : '';

// Check if this is the specific "goal is done but confidence is low" error from Browser.Act
var isSoftAct = false;
if (msg.error && msg.error.type === 'Core.Browser.Act.ErrStuck' && why.indexOf('the model thinks the goal is done but only with confidence') !== -1) {
  isSoftAct = true;
}

if (isSoftAct) {
  // Do not fail the step here. The expected-text check will decide.
  msg.soft_act = true;
} else {
  msg.soft_act = false;
  if (!msg.case_failed) {
    msg.case_failed = which + why;
  }
  if (msg.step) {
    msg.step_rows.push({
      id: msg.run_id + '-' + (msg.case_index + 1) + '-' + msg.attempt + '-' + (msg.step_index + 1),
      run_id: msg.run_id,
      case_title: msg.case && msg.case.title ? msg.case.title : '',
      attempt: msg.attempt,
      position: msg.step_index + 1,
      action: String(msg.step.action || ''),
      expected: String(msg.step.expected || ''),
      said: 'The robot stopped here: ' + why,
      screenshot: msg.shot_path,
      ok: 0,
      url: '',
    });
  }
}
return msg;`, 
    })
    .then('d10e14', 'Core.Browser.Screenshot', 'Take A Screenshot', {
      inPageId: Message('page_id'),
      inSaveFilePath: Message('shot_path'),
      outPath: Message('shot_saved'),
      continueOnError: true,
    });

  f.node('d10e34', 'Core.Flow.Label', 'Close The Browser', {});
  f.edge('d10e34', 0, 'd10e18', 0);

  // Every attempt leaves by this one door, so its browser is always closed.
  f.node('d10e18', 'Core.Browser.Close', 'Close The Browser', {
    inBrowserId: Message('browser_id'),
    continueOnError: true,
  });

  f.node('d10e19', 'Core.Programming.Function', 'Note The Attempt', {
    func: `if (!msg.case_failed && msg.step_pos < (msg.steps_for_case || []).length && msg.signed_in) {
  msg.case_failed = 'the run stopped part way through this case';
}
msg.browser_id = '';
msg.page_id = '';
return msg;`,
  });
  f.edge('d10e18', 0, 'd10e19', 0);

  f.node('d10e1a', 'Core.Flow.GoTo', 'Attempt', {
    optNodes: { ids: ['d10e04'], type: 'goto', all: false },
  });
  f.edge('d10e19', 0, 'd10e1a', 0);

  f.node('d10e1b', 'Core.Flow.Label', 'Finish The Attempt', {});
  f.node('d10e23', 'Core.Flow.GoTo', 'Finish The Attempt', {
    optNodes: { ids: ['d10e1b'], type: 'goto', all: false },
  });
  f.edge('d10e05', 1, 'd10e23', 0);

  f.node('d10e1c', 'Core.Programming.Function', 'Count The Result', {
    func: `if (msg.attempt === 0) {
  msg.case_failed = msg.case_failed || 'this case could not be tried';
}
if (!msg.case_failed) {
  if (msg.attempt >= 2) {
    msg.flaky++;
    if (!msg.note) {
      msg.note = (msg.case.title || 'A case') + ' was flaky - it passed on a second try, after: ' + msg.first_failure;
    }
  } else {
    msg.passed++;
  }
} else {
  msg.failed++;
  if (msg.attempt >= 2) {
    if (!msg.note) {
      msg.note = (msg.case.title || 'A case') + ' failed twice - ' + msg.case_failed;
    }
  } else if (!msg.note) {
    msg.note = (msg.case.title || 'A case') + ' - ' + msg.case_failed;
  }
}
if (msg.case_failed && !msg.first_failure) {
  msg.first_failure = msg.case_failed;
}
return msg;`,
  });
  f.edge('d10e1b', 0, 'd10e1c', 0);

  f.node('d10e1d', 'Core.Flow.GoTo', 'Each Case', {
    optNodes: { ids: ['a05b73'], type: 'goto', all: false },
  });
  f.edge('d10e1c', 0, 'd10e1d', 0);

  f.edge('d10e02', 1, 'b69370', 0);

  f.node('b69370', 'Core.Programming.Function', 'Add It Up', {
    func: `msg.finished_at = Date.now();
msg.total = msg.passed + msg.failed + msg.flaky;
msg.build = msg.build_from_page || msg.build_asked || 'unknown';
msg.result = {
  id: msg.run_id,
  suite_id: msg.suite_id,
  suite_name: msg.suite_name,
  build: msg.build,
  started_at: msg.started_at,
  finished_at: msg.finished_at,
  total: msg.total,
  passed: msg.passed,
  failed: msg.failed,
  flaky: msg.flaky,
  status: 'done',
  note: msg.note,
};
return msg;`,
  });

  f.node('c7a481', 'Core.Programming.Function', 'Lay Out The Run', {
    func: `msg.run_table = {
  columns: ['id', 'suite_id', 'suite_name', 'build', 'started_at', 'finished_at', 'total', 'passed', 'failed', 'flaky', 'note'],
  rows: [{
    id: msg.run_id,
    suite_id: msg.suite_id,
    suite_name: msg.suite_name,
    build: msg.build,
    started_at: msg.started_at,
    finished_at: msg.finished_at,
    total: msg.total,
    passed: msg.passed,
    failed: msg.failed,
    flaky: msg.flaky,
    note: msg.note,
  }],
};
msg.step_table = {
  columns: ['id', 'run_id', 'case_title', 'attempt', 'position', 'action', 'expected', 'said', 'screenshot', 'ok', 'url'],
  rows: msg.step_rows,
};
return msg;`,
  });
  f.edge('b69370', 0, 'c7a481', 0);

  f.node('d8b592', 'Robomotion.SQLite.Insert', 'Store The Run', {
    optConnectionString: Message('db'),
    inDatabaseTable: Custom('runs'),
    inTable: Message('run_table'),
  });
  f.edge('c7a481', 0, 'd8b592', 0);

  f.node('e9c6a3', 'Core.Programming.Function', 'Were Any Steps Run', {
    outputs: 2,
    func: `if (msg.step_rows.length === 0) {
  return [null, msg];
}
return [msg, null];`,
  });
  f.edge('d8b592', 0, 'e9c6a3', 0);

  f.node('fac7b4', 'Robomotion.SQLite.Insert', 'Store Every Step', {
    optConnectionString: Message('db'),
    inDatabaseTable: Custom('run_steps'),
    inTable: Message('step_table'),
    optReplace: true,
  });

  f.node('abe8c5', 'Robomotion.Apps.Respond', 'Send The Run', {});
  f.edge('e9c6a3', 0, 'fac7b4', 0);
  f.edge('e9c6a3', 1, 'abe8c5', 0);
  f.edge('fac7b4', 0, 'abe8c5', 0);

  // removeRun

  f.node('b3ea40', 'Robomotion.Apps.Action', 'Remove Run', { optActionName: 'removeRun' })
    .then('b3ea41', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.now = Date.now();
return msg;`,
    })
    .then('b3ea42', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
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
);
CREATE TABLE IF NOT EXISTS run_steps (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  case_title TEXT,
  attempt INTEGER,
  position INTEGER,
  action TEXT,
  expected TEXT,
  said TEXT,
  screenshot TEXT,
  ok INTEGER,
  url TEXT
);`,
    })
    .then('b3ea43', 'Core.Programming.Function', 'Check The Run', {
      outputs: 2,
      func: `var p = msg.params || {};
msg.run_id = String(p.id || '');
msg.refused = '';
if (!msg.run_id || !/^[A-Za-z0-9-]+$/.test(msg.run_id)) {
  msg.refused = 'That run could not be found.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('b3ea43', 1, 'd267c6', 0);
  f.edge('b3ea43', 0, 'b3ea44', 0);
  f.node('b3ea44', 'Robomotion.SQLite.NonQuery', 'Delete The Run', {
    optConnectionString: Message('db'),
    func: `DELETE FROM run_steps WHERE run_id = '{{{run_id}}}';
DELETE FROM runs WHERE id = '{{{run_id}}}';`,
  })
    .then('b3ea45', 'Core.Programming.Function', 'Note What Went', {
      func: `msg.result = { id: msg.run_id };
return msg;`,
    })
    .then('b3ea46', 'Robomotion.Apps.Respond', 'Send It', {});
});
