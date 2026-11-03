import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Report', (f) => {
  f.node('2211e0', 'Core.Flow.Begin', 'Begin', {});
  f.node('8b0de0', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.node('1681be', 'Core.Flow.Label', 'Say Why', {});
  f.node('54778f', 'Robomotion.Apps.RespondError', 'Say Why', {
    inMessage: Message('refused'),
    optRetryable: false,
    continueOnError: true,
  });
  f.edge('1681be', 0, '54778f', 0);

  f.node('cd2d59', 'Core.Flow.GoTo', 'Say Why', {
    optNodes: { ids: ['1681be'], type: 'goto', all: false },
  });

  f.node('161024', 'Robomotion.Apps.Action', 'Get Report', { optActionName: 'getReport' })
    .then('607290', 'Core.Programming.Function', 'Open The Database', {
      func: `var p = msg.params || {};
msg.db = 'Data Source=' + global.get('$Home$') + '/ReleaseCheck.db;Version=3;';
msg.run_id = String(p.run_id || '');
msg.now = Date.now();
return msg;`,
    })
    .then('f0471f', 'Robomotion.SQLite.NonQuery', 'Make Sure The Tables Are There', {
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
    .then('7a0e6f', 'Core.Programming.Function', 'Is The Id Sane', {
      outputs: 2,
      func: `if (msg.run_id && !/^[A-Za-z0-9-]+$/.test(msg.run_id)) {
  msg.refused = 'That run could not be found.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('7a0e6f', 1, 'cd2d59', 0);
  f.edge('7a0e6f', 0, 'e81248', 0);

  f.node('e81248', 'Robomotion.SQLite.Query', 'The Newest Run', {
    optConnectionString: Message('db'),
    outResult: Message('newest'),
    func: `SELECT id
FROM runs
ORDER BY started_at DESC
LIMIT 1`,
  })
    .then('26253e', 'Core.Programming.Function', 'Which Run', {
      outputs: 2,
      func: `if (!msg.run_id) {
  var newest = msg.newest.rows[0];
  if (!newest) {
    msg.refused = 'No suite has been run yet, so there is no report. Run a suite from the Runs screen first.';
    return [null, msg];
  }
  msg.run_id = newest.id;
}
return [msg, null];`,
    });

  f.edge('26253e', 1, 'cd2d59', 0);
  f.edge('26253e', 0, 'f7815b', 0);

  f.node('f7815b', 'Robomotion.SQLite.Query', 'Read The Run', {
    optConnectionString: Message('db'),
    outResult: Message('runrows'),
    func: `SELECT id, suite_id, suite_name, build, started_at, finished_at, total, passed, failed, flaky, note
FROM runs
WHERE id = '{{{run_id}}}'`,
  })
    .then('b341d9', 'Core.Programming.Function', 'Is There A Run', {
      outputs: 2,
      func: `if (!msg.runrows.rows[0]) {
  msg.refused = 'That run is no longer there.';
  return [null, msg];
}
return [msg, null];`,
    });

  f.edge('b341d9', 1, 'cd2d59', 0);
  f.edge('b341d9', 0, '649d23', 0);

  f.node('649d23', 'Robomotion.SQLite.Query', 'Read The Suite', {
    optConnectionString: Message('db'),
    outResult: Message('suiterows'),
    func: `SELECT base_url
FROM suites
WHERE id = (SELECT suite_id FROM runs WHERE id = '{{{run_id}}}')`,
  })
    .then('ee84b5', 'Robomotion.SQLite.Query', 'Read Every Step', {
      optConnectionString: Message('db'),
      outResult: Message('steprows'),
      func: `SELECT id, case_title, attempt, position, action, expected, said, screenshot, ok, url
FROM run_steps
WHERE run_id = '{{{run_id}}}'
ORDER BY case_title COLLATE NOCASE ASC, attempt ASC, position ASC`,
    })
    .then('d8ca62', 'Robomotion.SQLite.Query', 'Every Build Tested', {
      optConnectionString: Message('db'),
      outResult: Message('historyrows'),
      func: `SELECT r.build AS build,
       r.id AS run_id,
       r.passed AS passed,
       r.failed AS failed,
       r.flaky AS flaky,
       r.total AS total,
       r.started_at AS started_at
FROM runs r
JOIN (SELECT build, MAX(started_at) AS newest FROM runs GROUP BY build) b
  ON b.build = r.build AND b.newest = r.started_at
ORDER BY r.started_at ASC`,
    })
    .then('bb66cc', 'Core.Programming.Function', 'Name The Run', {
      func: `var run = msg.runrows.rows[0];
msg.build = String(run.build || '');
msg.started_at = Number(run.started_at) || 0;
msg.previous_build = '';
msg.previous_run_id = '';
return msg;`,
    })
    .then('8fd2dd', 'Robomotion.SQLite.Query', 'The Build Before', {
      optConnectionString: Message('db'),
      outResult: Message('prevrows'),
      func: `SELECT id, build
FROM runs
WHERE build <> '{{{build}}}' AND started_at < {{{started_at}}}
ORDER BY started_at DESC
LIMIT 1`,
    })
    .then('33d095', 'Core.Programming.Function', 'Remember The Build Before', {
      func: `var prev = msg.prevrows.rows[0];
if (prev) {
  msg.previous_run_id = String(prev.id);
  msg.previous_build = String(prev.build || '');
}
return msg;`,
    })
    .then('877f27', 'Robomotion.SQLite.Query', 'What Failed There', {
      optConnectionString: Message('db'),
      outResult: Message('prevsteprows'),
      func: `SELECT case_title, attempt, ok
FROM run_steps
WHERE run_id = '{{{previous_run_id}}}'
ORDER BY case_title COLLATE NOCASE ASC, attempt ASC`,
    });

  f.edge('877f27', 0, '96852c', 0);

  f.node('96852c', 'Core.Programming.Function', 'Build The Report', {
      func: `function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function verdicts(rows) {
  var order = [];
  var byCase = {};
  var i;
  for (i = 0; i < rows.length; i++) {
    var row = rows[i];
    var title = String(row.case_title || '');
    if (!byCase[title]) {
      byCase[title] = { title: title, last: 0, lastFailed: false, rows: [] };
      order.push(title);
    }
    var one = byCase[title];
    var attempt = Number(row.attempt) || 1;
    one.rows.push(row);
    if (attempt > one.last) {
      one.last = attempt;
      one.lastFailed = false;
    }
    if (attempt === one.last && Number(row.ok) === 0) {
      one.lastFailed = true;
    }
  }
  var out = [];
  for (i = 0; i < order.length; i++) {
    var done = byCase[order[i]];
    var state = 'passed';
    if (done.lastFailed) {
      state = 'failed';
    } else if (done.last > 1) {
      state = 'flaky';
    }
    out.push({ title: done.title, state: state, last: done.last, rows: done.rows });
  }
  return out;
}

function failedTitles(rows) {
  var all = verdicts(rows);
  var out = [];
  var i;
  for (i = 0; i < all.length; i++) {
    if (all[i].state === 'failed') {
      out.push(all[i].title);
    }
  }
  return out;
}

var run = msg.runrows.rows[0];
var suite = msg.suiterows.rows[0];
var cases = verdicts(msg.steprows.rows);

var passed = 0;
var failed = 0;
var flaky = 0;
var i;

for (i = 0; i < cases.length; i++) {
  if (cases[i].state === 'passed') {
    passed++;
  } else if (cases[i].state === 'flaky') {
    flaky++;
  } else {
    failed++;
  }
}

var total = cases.length;
var passRate = total > 0 ? Math.round(((passed + flaky) / total) * 1000) / 10 : 0;
var build = String(run.build || '');
var baseUrl = suite ? String(suite.base_url || '') : '';

var failures = [];
for (i = 0; i < cases.length; i++) {
  var one = cases[i];
  if (one.state !== 'failed') {
    continue;
  }
  var lastRows = [];
  var j;
  for (j = 0; j < one.rows.length; j++) {
    if (Number(one.rows[j].attempt) === one.last) {
      lastRows.push(one.rows[j]);
    }
  }
  lastRows.sort(function (a, b) {
    return Number(a.position) - Number(b.position);
  });
  var broke = null;
  var k;
  for (k = 0; k < lastRows.length; k++) {
    if (Number(lastRows[k].ok) === 0) {
      broke = lastRows[k];
      break;
    }
  }
  if (!broke) {
    broke = lastRows[lastRows.length - 1];
  }
  var lines = [];
  lines.push('Test: ' + one.title);
  lines.push('Build: ' + build);
  lines.push('Run: ' + msg.run_id);
  lines.push('Tested at: ' + (run.finished_at ? new Date(Number(run.finished_at)).toISOString() : ''));
  lines.push('Address: ' + baseUrl);
  lines.push('');
  lines.push('Steps to reproduce:');
  var n = 1;
  for (k = 0; k < lastRows.length; k++) {
    var step = lastRows[k];
    var words = String(step.action || '').trim();
    lines.push(n + '. ' + (words || 'Open the address and look at the page'));
    n++;
  }
  lines.push('');
  lines.push('Expected: ' + String(broke.expected || ''));
  lines.push('Found: ' + String(broke.said || ''));
  if (broke.url) {
    lines.push('The page was at: ' + String(broke.url || ''));
  }
  if (broke.screenshot) {
    lines.push('Screenshot: ' + String(broke.screenshot || ''));
  }

  failures.push({
    id: String(broke.id || ''),
    case_title: one.title,
    position: Number(broke.position) || 0,
    action: String(broke.action || ''),
    expected: String(broke.expected || ''),
    said: String(broke.said || ''),
    url: String(broke.url || ''),
    attempt: Number(broke.attempt) || 1,
    shot_path: String(broke.screenshot || ''),
    bug_report: lines.join('\\n'),
  });
}

var history = [];
var historyRows = msg.historyrows.rows;
for (i = 0; i < historyRows.length; i++) {
  var point = historyRows[i];
  var pTotal = Number(point.total) || 0;
  history.push({
    build: String(point.build || ''),
    run_id: String(point.run_id || ''),
    passed: Number(point.passed) || 0,
    failed: Number(point.failed) || 0,
    flaky: Number(point.flaky) || 0,
    total: pTotal,
    pass_rate: pTotal > 0 ? Math.round(((Number(point.passed) + Number(point.flaky)) / pTotal) * 1000) / 10 : 0,
    at: Number(point.started_at) || 0,
  });
}

var previousRate = -1;
for (i = 0; i < history.length; i++) {
  if (history[i].build === build && i > 0) {
    previousRate = history[i - 1].pass_rate;
  }
}

var changes = { previous_build: msg.previous_build, new_failures: [], still_failing: [], fixed: [] };
if (msg.previous_run_id) {
  var before = failedTitles(msg.prevsteprows.rows);
  var nowFailed = failedTitles(msg.steprows.rows);
  for (i = 0; i < nowFailed.length; i++) {
    if (before.indexOf(nowFailed[i]) === -1) {
      changes.new_failures.push(nowFailed[i]);
    } else {
      changes.still_failing.push(nowFailed[i]);
    }
  }
  for (i = 0; i < before.length; i++) {
    if (nowFailed.indexOf(before[i]) === -1) {
      changes.fixed.push(before[i]);
    }
  }
}

var seconds = 0;
if (run.started_at && run.finished_at) {
  seconds = Math.round((Number(run.finished_at) - Number(run.started_at)) / 100) / 10;
}
var stamp = run.finished_at ? new Date(Number(run.finished_at)).toISOString() : '';

var xml = [];
xml.push('<?xml version="1.0" encoding="UTF-8"?>');
xml.push('<testsuites name="' + esc('Release Check - ' + build) + '" tests="' + total + '" failures="' + failed + '" errors="0" time="' + seconds + '">');
xml.push('  <testsuite name="' + esc(String(run.suite_name || '')) + '" tests="' + total + '" failures="' + failed + '" errors="0" skipped="0" time="' + seconds + '" timestamp="' + esc(stamp) + '">');
for (i = 0; i < cases.length; i++) {
  var kase = cases[i];
  if (kase.state === 'failed') {
    var body = '';
    var f;
    for (f = 0; f < failures.length; f++) {
      if (failures[f].case_title === kase.title) {
        body = failures[f].bug_report;
        break;
      }
    }
    xml.push('    <testcase classname="' + esc(String(run.suite_name || '')) + '" name="' + esc(kase.title) + '" time="0">');
    xml.push('      <failure type="AssertionFailure" message="' + esc('Expected text was not on the page') + '">' + esc(body) + '</failure>');
    xml.push('    </testcase>');
  } else {
    xml.push('    <testcase classname="' + esc(String(run.suite_name || '')) + '" name="' + esc(kase.title) + '" time="0"/>');
  }
}
xml.push('  </testsuite>');
xml.push('</testsuites>');

msg.failures = failures;
msg.fail_pos = 0;
msg.shot_path = '';
msg.shot_ref = null;
msg.result = {
  run: {
    id: String(run.id),
    suite_id: String(run.suite_id || ''),
    suite_name: String(run.suite_name || ''),
    build: build,
    started_at: Number(run.started_at) || 0,
    finished_at: Number(run.finished_at) || 0,
    total: total,
    passed: passed,
    failed: failed,
    flaky: flaky,
    status: 'done',
    note: String(run.note || ''),
  },
  build: build,
  suite_name: String(run.suite_name || ''),
  base_url: baseUrl,
  finished_at: Number(run.finished_at) || 0,
  ship: failed === 0,
  pass_rate: passRate,
  previous_pass_rate: previousRate,
  history: history,
  changes: changes,
  failures: [],
  junit: xml.join('\\n'),
};
return msg;`,
    });

  f.node('2211d6', 'Core.Flow.GoTo', 'Each Failure', {
    optNodes: { ids: ['f495c6'], type: 'goto', all: false },
  });
  f.edge('96852c', 0, '2211d6', 0);

  f.node('f495c6', 'Core.Flow.Label', 'Each Failure', {});

  f.node('43783a', 'Core.Programming.Function', 'The Next Failure', {
    outputs: 3,
    func: `msg.shot_ref = null;
msg.shot_path = '';
if (msg.fail_pos >= msg.failures.length) {
  return [null, null, msg];
}
var failure = msg.failures[msg.fail_pos];
msg.shot_path = String(failure.shot_path || '');
if (!msg.shot_path) {
  msg.fail_pos = msg.fail_pos + 1;
  return [null, msg, null];
}
return [msg, null, null];`,
  });
  f.edge('f495c6', 0, '43783a', 0);

  f.node('2211cd', 'Core.FileSystem.PathExists', 'Is The Screenshot There', {
    inPath: Message('shot_path'),
    outResult: Message('shot_there'),
  });
  f.edge('43783a', 0, '2211cd', 0);

  f.node('2211ce', 'Core.Programming.Function', 'Only Save What Is There', {
    outputs: 2,
    func: `if (!msg.shot_there) {
  msg.fail_pos = msg.fail_pos + 1;
  return [null, msg];
}
return [msg, null];`,
  });
  f.edge('2211cd', 0, '2211ce', 0);

  f.node('2211d0', 'Robomotion.Apps.SaveFile', 'Save The Screenshot', {
    inPath: Message('shot_path'),
    inFileName: Custom('screenshot.png'),
    outFileRef: Message('shot_ref'),
    continueOnError: true,
  });
  f.edge('2211ce', 0, '2211d0', 0);

  f.node('2211d1', 'Core.Programming.Function', 'Attach The Screenshot', {
    func: `if (msg.shot_ref) {
  msg.failures[msg.fail_pos].screenshot = msg.shot_ref;
}
msg.fail_pos = msg.fail_pos + 1;
return msg;`,
  });
  f.edge('2211d0', 0, '2211d1', 0);

  f.node('2211cf', 'Core.Flow.GoTo', 'Each Failure', {
    optNodes: { ids: ['f495c6'], type: 'goto', all: false },
  });
  f.edge('2211d1', 0, '2211cf', 0);
  f.edge('2211ce', 1, '2211cf', 0);
  f.edge('43783a', 1, '2211cf', 0);

  f.node('2211d7', 'Core.Flow.GoTo', 'Hand It Over', {
    optNodes: { ids: ['2211cc'], type: 'goto', all: false },
  });
  f.edge('43783a', 2, '2211d7', 0);

  f.node('2211cc', 'Core.Flow.Label', 'Hand It Over', {});

  f.node('2211d2', 'Core.Programming.Function', 'Put The Failures In', {
    func: `msg.result.failures = msg.failures;
return msg;`,
  });
  f.edge('2211cc', 0, '2211d2', 0);

  f.node('2211d3', 'Robomotion.Apps.Respond', 'Send The Report', {});
  f.edge('2211d2', 0, '2211d3', 0);
});
