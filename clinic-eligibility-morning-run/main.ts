import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e15a7c0', 'Clinic Eligibility Morning Run', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Clinic Eligibility Morning Run\n\nVerifies insurance for every appointment on tomorrow\'s eligibility worklist, running the checks on parallel browsers instead of one at a time.\n\nWrites eligibility-status.csv (every appointment) and coverage-problems.csv (the ones the front desk has to act on) to your home folder.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Read the worklist\n\nOne browser logs in and reads the eligibility worklist: the appointments whose insurance is still **Unverified**.\n\nThe appointment ids go into a Memory Queue and a second queue collects results. The row details (patient, MRN, payer) travel with the message, so every worker and the final report share one copy.\n\n**Fork Branch** then starts the workers.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Parallel eligibility checks\n\nEach worker gets its own Chrome profile directory and its own login session.\n\nA worker dequeues an appointment, clicks **Run check** on that row, waits for the payer to answer, and reads the coverage pill. The selector is built from the dequeued appointment id, so each worker only ever touches its own row.\n\nEpoch has a "Run all" button, but real payer portals do not. Here the robot supplies the concurrency.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. When the queue runs dry\n\nWith no appointments left, **Dequeue** throws. The Catch node closes the worker\'s browser and calls **WG Done**, so Fork Branch can count the branch as finished.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Drain the results queue\n\nOnce every worker has signalled WG Done, Fork Branch continues on its second port and the results queue is drained one row at a time.'
  });

  f.node('c00006', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 5. Sort and report\n\nResults are split into Active and the coverage problems (Lapsed, Not covered) the front desk must chase.\n\nThe robot also adds up the individual check times, so the report can compare what this run cost against doing the same checks one after another.'
  });

  // ------------------------------------------------------------ 1. read the worklist
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://epoch.robomotion.online';
msg.login_url = msg.base_url + '/login';
// The chaos flag is parsed from the query string on every page load, so it has to
// stay on the URL. Drop '?chaos=eligibility-slow' and each check takes 3-8s instead
// of 10-25s; the flow is identical either way.
msg.worklist_url = msg.base_url + '/eligibility?chaos=eligibility-slow';
// Published training credentials for a fictional clinic system serving entirely
// synthetic data -- Epoch prints this password on its own login screen. Credentials
// for a real system belong in the Robomotion Vault, never in a flow.
msg.email = 'diego.ramirez@harborview.example';
msg.password = 'EpochTraining2026!';
msg.home = global.get('$Home$');
msg.status_csv = msg.home + '/eligibility-status.csv';
msg.problems_csv = msg.home + '/coverage-problems.csv';
msg.t0 = Date.now();
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Reader Browser', {
      optBrowser: 'chrome',
      outBrowserId: Message('reader_browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Login Page', {
      inBrowserId: Message('reader_browser'),
      inUrl: Message('login_url'),
      outPageId: Message('reader_page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait For Login Form', {
      inPageId: Message('reader_page'),
      inSelector: Custom('//*[@data-testid="login-email"]'),
      optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Email', {
      inPageId: Message('reader_page'),
      inSelector: Custom('//*[@data-testid="login-email"]'),
      inText: Message('email'),
      optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('reader_page'),
      inSelector: Custom('//*[@data-testid="login-password"]'),
      inText: Message('password'),
      optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('reader_page'),
      inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.OpenLink', 'Open Worklist', {
      inBrowserId: Message('reader_browser'),
      inPageId: Message('reader_page'),
      inUrl: Message('worklist_url'),
      optSameTab: true
    })
    .then('a1000a', 'Core.Browser.WaitElement', 'Wait For Worklist', {
      inPageId: Message('reader_page'),
      inSelector: Custom('//*[@data-testid="worklist-table"]'),
      optTimeout: Custom('20')
    })
    .then('a1000b', 'Core.Browser.RunScript', 'Read Worklist', {
      inPageId: Message('reader_page'),
      func: `var rows = document.querySelectorAll('[data-testid="worklist-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  var tds = r.querySelectorAll('td');
  // The patient cell stacks the name over the MRN.
  var who = tds[2] ? tds[2].innerText.trim().split('\\n') : ['', ''];
  out.push({
    appointment: r.getAttribute('data-id'),
    date_time: tds[1] ? tds[1].innerText.trim().replace(/\\s+/g, ' ') : '',
    patient: (who[0] || '').trim(),
    mrn: (who[1] || '').trim(),
    payer: tds[3] ? tds[3].innerText.trim() : ''
  });
}
return JSON.stringify(out);`,
      outResult: Message('worklist_json')
    })
    .then('a1000c', 'Core.Browser.Close', 'Close Reader Browser', {
      inBrowserId: Message('reader_browser')
    })
    .then('a1000d', 'Core.Programming.Function', 'Queue Appointments', {
      func: `var rows = JSON.parse(msg.worklist_json);
if (rows.length === 0) { throw new Error('Eligibility worklist is empty - did the login succeed?'); }
msg.appointments = [];
msg.meta = {};
for (var i = 0; i < rows.length; i++) {
  msg.appointments.push(rows[i].appointment);
  msg.meta[rows[i].appointment] = rows[i];
}
console.log('Eligibility checks queued: ' + msg.appointments.length);
return msg;`
    })
    .then('a1000e', 'Robomotion.MemoryQueue.Create', 'Create Work Queue', {
      optElements: Message('appointments'),
      outQueueID: Message('work_qid')
    })
    .then('a1000f', 'Robomotion.MemoryQueue.Create', 'Create Results Queue', {
      outQueueID: Message('results_qid')
    })
    .then('a10010', 'Core.Flow.ForkBranch', 'Fork 9 Workers', {
      optNofBranches: Custom('9'),
      outBranchID: Message('branch_id'),
      outWaitGroupID: Message('wg_id')
    });

  // ------------------------------------------------------- Port 0: the parallel workers
  // Each parallel browser needs its OWN user-data dir, or Chrome refuses to start.
  f.node('b20000', 'Core.Programming.Function', 'Worker Profile Dir', {
    func: `var id = String(msg.branch_id).replace(/[^0-9a-zA-Z]/g, '-');
msg.user_data_dir = global.get('$TempDir$') + '/epoch-eligibility-' + msg.t0 + '-' + id;
return msg;`
  });
  f.edge('a10010', 0, 'b20000', 0);

  // Core.Browser.Open does NOT create optUserDataDir; it fails with "The specified User
  // Data Dir '...' does not exist". Make it first, or every worker dies on launch.
  f.node('b20001', 'Core.FileSystem.Create', 'Make Profile Dir', {
    inPath: Message('user_data_dir'),
    optType: 'directory',
    outPath: Message('user_data_dir_created')
  });
  f.edge('b20000', 0, 'b20001', 0);

  f.node('b20002', 'Core.Browser.Open', 'Worker Browser', {
    optBrowser: 'chrome',
    optUserDataDir: Message('user_data_dir'),
    outBrowserId: Message('worker_browser')
  });
  f.edge('b20001', 0, 'b20002', 0);

  f.node('b20003', 'Core.Browser.OpenLink', 'Worker Login Page', {
    inBrowserId: Message('worker_browser'),
    inUrl: Message('login_url'),
    outPageId: Message('worker_page')
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Browser.WaitElement', 'Wait For Login Form', {
    inPageId: Message('worker_page'),
    inSelector: Custom('//*[@data-testid="login-email"]'),
    optTimeout: Custom('30')
  });
  f.edge('b20003', 0, 'b20004', 0);

  f.node('b20005', 'Core.Browser.TypeText', 'Type Email', {
    inPageId: Message('worker_page'),
    inSelector: Custom('//*[@data-testid="login-email"]'),
    inText: Message('email'),
    optClearText: true
  });
  f.edge('b20004', 0, 'b20005', 0);

  f.node('b20006', 'Core.Browser.TypeText', 'Type Password', {
    inPageId: Message('worker_page'),
    inSelector: Custom('//*[@data-testid="login-password"]'),
    inText: Message('password'),
    optClearText: true
  });
  f.edge('b20005', 0, 'b20006', 0);

  f.node('b20007', 'Core.Browser.ClickElement', 'Sign In', {
    inPageId: Message('worker_page'),
    inSelector: Custom('//*[@data-testid="login-submit"]')
  });
  f.edge('b20006', 0, 'b20007', 0);

  // The session lives in localStorage, so this full reload keeps the worker signed in.
  // The chaos flag does NOT live in storage - it must stay on the URL.
  f.node('b20008', 'Core.Browser.OpenLink', 'Worker Worklist', {
    inBrowserId: Message('worker_browser'),
    inPageId: Message('worker_page'),
    inUrl: Message('worklist_url'),
    optSameTab: true
  });
  f.edge('b20007', 0, 'b20008', 0);

  f.node('b20009', 'Core.Browser.WaitElement', 'Wait For Worklist', {
    inPageId: Message('worker_page'),
    inSelector: Custom('//*[@data-testid="worklist-table"]'),
    optTimeout: Custom('30')
  });
  f.edge('b20008', 0, 'b20009', 0);

  // Label has no input port - it is purely a jump target for GoTo.
  f.node('b2000a', 'Core.Flow.Label', 'Next Appointment', {});

  f.node('b2000b', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Appointment', {
    inQueueID: Message('work_qid'),
    outElement: Message('appt')
  });
  f.edge('b20009', 0, 'b2000b', 0); // first pass enters the body directly
  f.edge('b2000a', 0, 'b2000b', 0); // later passes arrive via the label

  // Core.Browser.RunScript's `func` is a static string, so it cannot be told which
  // appointment this worker drew. inSelector *is* a variable field, so the row is
  // targeted through the selector instead.
  f.node('b2000c', 'Core.Programming.Function', 'Build Row Selectors', {
    func: `var row = '//tr[@data-testid="worklist-row" and @data-id="' + msg.appt + '"]';
msg.run_xpath = row + '//button[@data-testid="run-eligibility"]';
msg.result_xpath = row + '//*[@data-testid="eligibility-result"]';
msg.check_started = Date.now();
return msg;`
  });
  f.edge('b2000b', 0, 'b2000c', 0);

  f.node('b2000d', 'Core.Browser.ClickElement', 'Run Check', {
    inPageId: Message('worker_page'),
    inSelector: Message('run_xpath')
  });
  f.edge('b2000c', 0, 'b2000d', 0);

  // Under `eligibility-slow` the payer answers in 10-25s. 120s leaves room for a
  // slow round of nine simultaneous checks without masking a genuine hang.
  f.node('b2000e', 'Core.Browser.WaitElement', 'Wait For Payer', {
    inPageId: Message('worker_page'),
    inSelector: Message('result_xpath'),
    optTimeout: Custom('120')
  });
  f.edge('b2000d', 0, 'b2000e', 0);

  f.node('b2000f', 'Core.Browser.GetValue', 'Read Coverage', {
    inPageId: Message('worker_page'),
    inSelector: Message('result_xpath'),
    outValue: Message('coverage')
  });
  f.edge('b2000e', 0, 'b2000f', 0);

  f.node('b20010', 'Core.Programming.Function', 'Tag Result', {
    func: `var m = msg.meta[msg.appt] || {};
var secs = (Date.now() - msg.check_started) / 1000;
msg.result_row = {
  appointment: msg.appt,
  date_time: m.date_time || '',
  patient: m.patient || '',
  mrn: m.mrn || '',
  payer: m.payer || '',
  coverage: String(msg.coverage).trim(),
  check_seconds: Math.round(secs * 10) / 10
};
return msg;`
  });
  f.edge('b2000f', 0, 'b20010', 0);

  f.node('b20011', 'Robomotion.MemoryQueue.Enqueue', 'Enqueue Result', {
    inQueueID: Message('results_qid'),
    inElement: Message('result_row')
  });
  f.edge('b20010', 0, 'b20011', 0);

  f.node('b20012', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['b2000a'], type: 'goto', all: false }
  });
  f.edge('b20011', 0, 'b20012', 0);

  // -------------------------------------------------- Worker exception: queue drained
  f.node('b20013', 'Core.Trigger.Catch', 'Work Queue Empty', {
    optNodes: { type: 'catch', ids: ['b2000b'], all: false }
  });

  f.node('b20014', 'Core.Browser.Close', 'Close Worker Browser', {
    inBrowserId: Message('worker_browser')
  });
  f.edge('b20013', 0, 'b20014', 0);

  f.node('b20015', 'Core.WaitGroup.Done', 'Worker Done', {
    inWaitGroupID: Message('wg_id')
  });
  f.edge('b20014', 0, 'b20015', 0);

  // ------------------------------------------------- Port 1: drain the results queue
  f.node('c30001', 'Core.Flow.Label', 'Drain Results', {});

  f.node('c30002', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Result', {
    inQueueID: Message('results_qid'),
    outElement: Message('result_row')
  });
  f.edge('a10010', 1, 'c30002', 0); // all workers finished -> start draining
  f.edge('c30001', 0, 'c30002', 0); // later passes arrive via the label

  f.node('c30003', 'Core.Programming.Function', 'Collect Row', {
    func: `msg.collected = msg.collected || [];
msg.collected.push(msg.result_row);
return msg;`
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.GoTo', 'Next Result', {
    optNodes: { ids: ['c30001'], type: 'goto', all: false }
  });
  f.edge('c30003', 0, 'c30004', 0);

  // ------------------------------------------------------ Results drained: sort + report
  f.node('c30005', 'Core.Trigger.Catch', 'Results Drained', {
    optNodes: { type: 'catch', ids: ['c30002'], all: false }
  });

  f.node('c30006', 'Core.Programming.Function', 'Sort Coverage', {
    func: `var rows = msg.collected || [];
// Deterministic order, so two runs of the same seed produce identical CSVs.
rows.sort(function (a, b) { return a.appointment < b.appointment ? -1 : a.appointment > b.appointment ? 1 : 0; });

var ACTIONS = {
  'Lapsed': 'Policy lapsed - verify cover with the patient at check-in',
  'Not covered': 'Not covered - collect self-pay consent before the visit'
};

var problems = [];
var active = 0;
var checkSeconds = 0;
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  checkSeconds += r.check_seconds;
  if (r.coverage === 'Active') {
    active++;
  } else {
    problems.push({
      appointment: r.appointment,
      date_time: r.date_time,
      patient: r.patient,
      mrn: r.mrn,
      payer: r.payer,
      coverage: r.coverage,
      action: ACTIONS[r.coverage] || 'Review coverage before the visit'
    });
  }
}

var elapsed = Math.round((Date.now() - msg.t0) / 1000);
// Sequential cost is measured, not guessed: it is the sum of the checks we just ran.
var sequential = Math.round(checkSeconds);

msg.status_table = {
  columns: ['appointment', 'date_time', 'patient', 'mrn', 'payer', 'coverage', 'check_seconds'],
  rows: rows
};
msg.problems_table = {
  columns: ['appointment', 'date_time', 'patient', 'mrn', 'payer', 'coverage', 'action'],
  rows: problems
};

console.log('Checked ' + rows.length + ' appointments: ' + active + ' Active, ' + problems.length + ' need attention');
for (var j = 0; j < problems.length; j++) {
  console.log('  FLAG ' + problems[j].appointment + ' ' + problems[j].patient + ' -> ' + problems[j].coverage);
}
console.log('Wall clock ' + elapsed + 's; the same checks run one after another would have taken ' + sequential + 's');
return msg;`
  });
  f.edge('c30005', 0, 'c30006', 0);

  f.node('c30007', 'Core.CSV.WriteCSV', 'Write Status CSV', {
    inFilePath: Message('status_csv'),
    inTable: Message('status_table'),
    optEncoding: 'utf8',
    optSeparator: 'comma',
    optHeaders: true
  });
  f.edge('c30006', 0, 'c30007', 0);

  f.node('c30008', 'Core.CSV.WriteCSV', 'Write Problems CSV', {
    inFilePath: Message('problems_csv'),
    inTable: Message('problems_table'),
    optEncoding: 'utf8',
    optSeparator: 'comma',
    optHeaders: true
  });
  f.edge('c30007', 0, 'c30008', 0);

  f.node('c30009', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30008', 0, 'c30009', 0);
}).start();
