import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('d16a7c0', 'Denial Worklist Triage', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Denial Worklist Triage\n\nWorks a clinic\'s denied insurance claims, choosing a different action for each denial code: fix and resubmit, write off, void the duplicate, or escalate to a human.\n\nWrites denial-actions.csv to your home folder, with the action taken and the outcome for every claim.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Sign in and read the worklist\n\n**Denied only** narrows the claims table to the open denials. The robot reads the claim id, patient and denial code from each row.\n\nEpoch keeps its state in memory with no persistence, so a page reload would throw away every action. This is the last full page load: from here on the robot navigates by clicking, never by URL.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Open one claim\n\nSearching by claim id narrows the table to a single row, so the robot never has to paginate to find a claim. Clicking the row opens it.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Branch on the denial code\n\nThis is the whole point of the flow. Four denial codes, four different jobs:\n\n**D-01** missing information - the payer wants a field the chart already has, so fix and resubmit.\n**D-07** not covered - nothing to argue, write it off with a reason.\n**D-12** duplicate - the original was already paid, void this one.\n**D-19** prior authorization - a human has to call the payer. The robot does not guess; it escalates.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Back to the list\n\n**Go Back** returns to the claims table through the browser\'s history, which the app handles client-side. The actions taken so far survive; an OpenLink here would reset them.'
  });

  f.node('c00006', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 5. Wait for the payer, then verify\n\nResubmitted D-01 claims are re-adjudicated after about a minute. Rather than trust that, the robot waits and then re-reads each resubmitted claim\'s status off the table.\n\nThe report records what each claim actually ended up as, not what the flow intended.'
  });

  // ---------------------------------------------- 1. sign in and read the worklist
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://epoch.robomotion.online';
msg.login_url = msg.base_url + '/login';
// Every action raises a toast: a fixed, centred overlay, alive for 5 seconds, painted
// over the claims table. Worse, resubmitted D-01 claims re-adjudicate about a minute
// later and toast again - asynchronously, in the middle of a later claim. A real mouse
// click that lands on a toast is swallowed silently: the node reports success and
// nothing happens. The toast-kill flag turns them off for the whole session; chaos
// flags are parsed once when the page loads and survive client-side navigation.
msg.claims_url = msg.base_url + '/claims?chaos=toast-kill';
// Published training credentials for a fictional clinic system serving entirely
// synthetic data -- Epoch prints this password on its own login screen. Credentials
// for a real system belong in the Robomotion Vault, never in a flow.
msg.email = 'diego.ramirez@harborview.example';
msg.password = 'EpochTraining2026!';
msg.writeoff_reason = 'Service not covered by the payer contract - write-off approved';
msg.actions_csv = global.get('$Home$') + '/denial-actions.csv';
// Resubmitted D-01 claims re-adjudicate after ~60s. Wait a little longer than that.
msg.adjudication_wait = '75';
msg.t0 = Date.now();
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Login Page', {
      inBrowserId: Message('browser'),
      inUrl: Message('login_url'),
      outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait For Login Form', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-email"]'),
      optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Email', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-email"]'),
      inText: Message('email'),
      optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-password"]'),
      inText: Message('password'),
      optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    // The last full page load. Epoch's store has no persistence: reloading after this
    // point would discard every action the robot has taken.
    .then('a10009', 'Core.Browser.OpenLink', 'Open Claims', {
      inBrowserId: Message('browser'),
      inPageId: Message('page'),
      inUrl: Message('claims_url'),
      optSameTab: true
    })
    .then('a1000a', 'Core.Browser.WaitElement', 'Wait For Claims Table', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="claims-table"]'),
      optTimeout: Custom('20')
    })
    .then('a1000b', 'Core.Browser.ClickElement', 'Denied Only', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="claims-filter-denied"]')
    })
    // The click sets React state; give the table a tick to re-render before scraping.
    .then('a1000c', 'Core.Programming.Sleep', 'Let Filter Render', {
      optDuration: Custom('2')
    })
    .then('a1000d', 'Core.Browser.RunScript', 'Read Denials', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="claim-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  var chip = r.querySelector('[data-testid="denial-code"]');
  var tds = r.querySelectorAll('td');
  out.push({
    claim: r.getAttribute('data-id'),
    patient: tds[1] ? tds[1].innerText.trim().split('\\n')[0] : '',
    payer: tds[2] ? tds[2].innerText.trim() : '',
    amount: tds[4] ? tds[4].innerText.trim() : '',
    code: chip ? chip.innerText.trim() : ''
  });
}
var paid = document.querySelector('[data-testid="stat-paid"]');
return JSON.stringify({ paidBefore: paid ? paid.innerText.replace(/[^0-9]/g, '') : '', rows: out });`,
      outResult: Message('denials_json')
    })
    .then('a1000e', 'Core.Programming.Function', 'Queue Denials', {
      func: `var data = JSON.parse(msg.denials_json);
var rows = data.rows;
if (rows.length === 0) { throw new Error('No open denials found - did the login succeed?'); }

msg.paid_before = parseInt(data.paidBefore, 10) || 0;
msg.claims = [];
msg.meta = {};
msg.by_code = {};
for (var i = 0; i < rows.length; i++) {
  // The chip stacks the code over its label, so match the code out rather than split.
  var m = rows[i].code.match(/D-\\d+/);
  rows[i].code = m ? m[0] : '';
  msg.claims.push(rows[i].claim);
  msg.meta[rows[i].claim] = rows[i];
  msg.by_code[rows[i].code] = (msg.by_code[rows[i].code] || 0) + 1;
}
msg.actions = [];
msg.resubmitted = [];
console.log('Open denials: ' + rows.length + ' ' + JSON.stringify(msg.by_code));
return msg;`
    })
    .then('a1000f', 'Robomotion.MemoryQueue.Create', 'Create Claim Queue', {
      optElements: Message('claims'),
      outQueueID: Message('claim_qid')
    });

  // ---------------------------------------------------------- 2. open one claim
  f.node('b20000', 'Core.Flow.Label', 'Next Claim', {});

  f.node('b20001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Claim', {
    inQueueID: Message('claim_qid'),
    outElement: Message('claim')
  });
  f.edge('a1000f', 0, 'b20001', 0); // first pass enters the body directly
  f.edge('b20000', 0, 'b20001', 0); // later passes arrive via the label

  f.node('b20002', 'Core.Programming.Function', 'Build Row Selector', {
    func: `var m = msg.meta[msg.claim] || {};
msg.code = m.code || '';
msg.patient = m.patient || '';
msg.payer = m.payer || '';
msg.amount = m.amount || '';
msg.row_xpath = '//tr[@data-testid="claim-row" and @data-id="' + msg.claim + '"]';
return msg;`
  });
  f.edge('b20001', 0, 'b20002', 0);

  // Searching by id narrows the table to one row, so the robot never paginates.
  f.node('b20003', 'Core.Browser.TypeText', 'Search Claim', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="claims-search"]'),
    inText: Message('claim'),
    optClearText: true
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Browser.WaitElement', 'Wait For Row', {
    inPageId: Message('page'),
    inSelector: Message('row_xpath'),
    optTimeout: Custom('20')
  });
  f.edge('b20003', 0, 'b20004', 0);

  // Click the row from inside the page rather than with the mouse: a dispatched click
  // reaches the element whatever is painted on top of it. The script also returns which
  // row it opened, so the next node can prove the search narrowed to the right claim
  // instead of assuming it. Search has left exactly one row, so no dynamic selector.
  f.node('b20005', 'Core.Browser.RunScript', 'Open Claim', {
    inPageId: Message('page'),
    func: `var rows = document.querySelectorAll('[data-testid="claim-row"]');
if (rows.length !== 1) { return 'expected 1 row, found ' + rows.length; }
rows[0].click();
return rows[0].getAttribute('data-id');`,
    outResult: Message('opened_claim')
  });
  f.edge('b20004', 0, 'b20005', 0);

  f.node('b20008', 'Core.Programming.Function', 'Check Opened', {
    func: `if (msg.opened_claim !== msg.claim) {
  throw new Error('Opened ' + msg.opened_claim + ' but expected ' + msg.claim);
}
return msg;`
  });
  f.edge('b20005', 0, 'b20008', 0);

  f.node('b20006', 'Core.Browser.WaitElement', 'Wait For Denial Actions', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="denial-actions"]'),
    optTimeout: Custom('20')
  });
  f.edge('b20008', 0, 'b20006', 0);

  // ------------------------------------------------- 3. branch on the denial code
  // "Stop at first match", so the last condition is a fallback. Without it an
  // unrecognised code would route nowhere and the loop would stall silently.
  f.node('b20007', 'Core.Programming.Switch', 'Which Denial Code', {
    optUseBreak: true,
    optConditions: [
      "msg.code === 'D-01'",
      "msg.code === 'D-07'",
      "msg.code === 'D-12'",
      "msg.code === 'D-19'",
      'true'
    ]
  });
  f.edge('b20006', 0, 'b20007', 0);

  // --- D-01: the missing field is already in Demographics. Fix and resubmit.
  f.node('b20010', 'Core.Browser.ClickElement', 'Fix And Resubmit', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="resubmit-button"]')
  });
  f.edge('b20007', 0, 'b20010', 0);

  f.node('b20011', 'Core.Browser.WaitElement', 'Wait Resubmit Dialog', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="resubmit-dialog"]'),
    optTimeout: Custom('20')
  });
  f.edge('b20010', 0, 'b20011', 0);

  f.node('b20012', 'Core.Browser.ClickElement', 'Confirm Resubmit', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="resubmit-confirm"]')
  });
  f.edge('b20011', 0, 'b20012', 0);

  f.node('b20013', 'Core.Programming.Function', 'Tag Resubmitted', {
    func: `msg.action = 'Fixed and resubmitted';
msg.resubmitted.push(msg.claim);
return msg;`
  });
  f.edge('b20012', 0, 'b20013', 0);

  // --- D-07: not covered. Write it off, with a reason on the record.
  f.node('b20020', 'Core.Browser.ClickElement', 'Write Off', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="writeoff-button"]')
  });
  f.edge('b20007', 1, 'b20020', 0);

  f.node('b20021', 'Core.Browser.WaitElement', 'Wait Writeoff Dialog', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="writeoff-dialog"]'),
    optTimeout: Custom('20')
  });
  f.edge('b20020', 0, 'b20021', 0);

  f.node('b20022', 'Core.Browser.TypeText', 'Type Reason', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="writeoff-reason"]'),
    inText: Message('writeoff_reason'),
    optClearText: true
  });
  f.edge('b20021', 0, 'b20022', 0);

  f.node('b20023', 'Core.Browser.ClickElement', 'Confirm Writeoff', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="writeoff-confirm"]')
  });
  f.edge('b20022', 0, 'b20023', 0);

  f.node('b20024', 'Core.Programming.Function', 'Tag Written Off', {
    func: `msg.action = 'Written off';
return msg;`
  });
  f.edge('b20023', 0, 'b20024', 0);

  // --- D-12: the original was already paid. Void this one.
  f.node('b20030', 'Core.Browser.ClickElement', 'Void Duplicate', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="void-button"]')
  });
  f.edge('b20007', 2, 'b20030', 0);

  f.node('b20031', 'Core.Programming.Function', 'Tag Voided', {
    func: `msg.action = 'Voided as duplicate';
return msg;`
  });
  f.edge('b20030', 0, 'b20031', 0);

  // --- D-19: prior authorization. A human has to call the payer.
  f.node('b20040', 'Core.Browser.ClickElement', 'Escalate To Human', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="escalate-button"]')
  });
  f.edge('b20007', 3, 'b20040', 0);

  f.node('b20041', 'Core.Programming.Function', 'Tag Escalated', {
    func: `msg.action = 'Escalated to human';
return msg;`
  });
  f.edge('b20040', 0, 'b20041', 0);

  // --- Any other code: touch nothing, leave it for a human.
  f.node('b20045', 'Core.Programming.Function', 'Tag Unrecognised', {
    func: `msg.action = 'Left for review (unrecognised code ' + msg.code + ')';
return msg;`
  });
  f.edge('b20007', 4, 'b20045', 0);

  // ------------------------------------------------------------ 4. back to the list
  f.node('b20050', 'Core.Programming.Function', 'Record Action', {
    func: `msg.actions.push({
  claim: msg.claim,
  patient: msg.patient,
  payer: msg.payer,
  amount: msg.amount,
  denial_code: msg.code,
  action: msg.action,
  outcome: ''
});
return msg;`
  });
  f.edge('b20013', 0, 'b20050', 0);
  f.edge('b20024', 0, 'b20050', 0);
  f.edge('b20031', 0, 'b20050', 0);
  f.edge('b20041', 0, 'b20050', 0);
  f.edge('b20045', 0, 'b20050', 0);

  // History-based navigation: React Router handles it client-side, so the actions
  // taken so far survive. An OpenLink here would reset the whole store.
  f.node('b20051', 'Core.Browser.GoBack', 'Back To Claims', {
    inPageId: Message('page')
  });
  f.edge('b20050', 0, 'b20051', 0);

  f.node('b20052', 'Core.Browser.WaitElement', 'Wait For Claims Table', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="claims-table"]'),
    optTimeout: Custom('20')
  });
  f.edge('b20051', 0, 'b20052', 0);

  f.node('b20053', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['b20000'], type: 'goto', all: false }
  });
  f.edge('b20052', 0, 'b20053', 0);

  // -------------------------------------- 5. wait for the payer, then verify + report
  f.node('c30001', 'Core.Trigger.Catch', 'Worklist Empty', {
    optNodes: { type: 'catch', ids: ['b20001'], all: false }
  });

  f.node('c30002', 'Core.Programming.Sleep', 'Wait For Adjudication', {
    optDuration: Message('adjudication_wait')
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Robomotion.MemoryQueue.Create', 'Create Verify Queue', {
    optElements: Message('resubmitted'),
    outQueueID: Message('verify_qid')
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.Label', 'Next Verify', {});

  f.node('c30005', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Resubmitted', {
    inQueueID: Message('verify_qid'),
    outElement: Message('vclaim')
  });
  f.edge('c30003', 0, 'c30005', 0);
  f.edge('c30004', 0, 'c30005', 0);

  f.node('c30006', 'Core.Programming.Function', 'Build Verify Selector', {
    func: `msg.vrow_xpath = '//tr[@data-testid="claim-row" and @data-id="' + msg.vclaim + '"]';
// 6th cell is the status pill: id, patient, payer, service date, amount, status.
msg.vstatus_xpath = msg.vrow_xpath + '/td[6]';
return msg;`
  });
  f.edge('c30005', 0, 'c30006', 0);

  f.node('c30007', 'Core.Browser.TypeText', 'Search Resubmitted', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="claims-search"]'),
    inText: Message('vclaim'),
    optClearText: true
  });
  f.edge('c30006', 0, 'c30007', 0);

  f.node('c30008', 'Core.Browser.WaitElement', 'Wait For Verify Row', {
    inPageId: Message('page'),
    inSelector: Message('vrow_xpath'),
    optTimeout: Custom('20')
  });
  f.edge('c30007', 0, 'c30008', 0);

  f.node('c30009', 'Core.Browser.GetValue', 'Read Claim Status', {
    inPageId: Message('page'),
    inSelector: Message('vstatus_xpath'),
    outValue: Message('vstatus')
  });
  f.edge('c30008', 0, 'c30009', 0);

  f.node('c3000a', 'Core.Programming.Function', 'Record Outcome', {
    func: `var status = String(msg.vstatus).trim();
for (var i = 0; i < msg.actions.length; i++) {
  if (msg.actions[i].claim === msg.vclaim) { msg.actions[i].outcome = status; }
}
return msg;`
  });
  f.edge('c30009', 0, 'c3000a', 0);

  f.node('c3000b', 'Core.Flow.GoTo', 'Next Verify Claim', {
    optNodes: { ids: ['c30004'], type: 'goto', all: false }
  });
  f.edge('c3000a', 0, 'c3000b', 0);

  f.node('c3000c', 'Core.Trigger.Catch', 'Verify Queue Empty', {
    optNodes: { type: 'catch', ids: ['c30005'], all: false }
  });

  f.node('c3000d', 'Core.Programming.Function', 'Build Report', {
    func: `var rows = msg.actions;
// The non-resubmitted claims have a known terminal state; only D-01 had to be checked.
var OUTCOME = {
  'Written off': 'Written off',
  'Voided as duplicate': 'Voided',
  'Escalated to human': 'Awaiting human'
};
for (var i = 0; i < rows.length; i++) {
  if (!rows[i].outcome) { rows[i].outcome = OUTCOME[rows[i].action] || ''; }
}
rows.sort(function (a, b) { return a.claim < b.claim ? -1 : a.claim > b.claim ? 1 : 0; });

var paidNow = 0;
for (var j = 0; j < rows.length; j++) { if (rows[j].outcome === 'Paid') { paidNow++; } }

msg.actions_table = {
  columns: ['claim', 'patient', 'payer', 'amount', 'denial_code', 'action', 'outcome'],
  rows: rows
};

var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Worked ' + rows.length + ' denied claims in ' + elapsed + 's');
console.log('  by code: ' + JSON.stringify(msg.by_code));
console.log('  ' + paidNow + ' of ' + msg.resubmitted.length + ' resubmitted claims came back Paid');
for (var k = 0; k < rows.length; k++) {
  if (rows[k].action === 'Escalated to human') { console.log('  ESCALATED ' + rows[k].claim + ' ' + rows[k].patient); }
}
return msg;`
  });
  f.edge('c3000c', 0, 'c3000d', 0);

  f.node('c3000e', 'Core.CSV.WriteCSV', 'Write Actions CSV', {
    inFilePath: Message('actions_csv'),
    inTable: Message('actions_table'),
    optEncoding: 'utf8',
    optSeparator: 'comma',
    optHeaders: true
  });
  f.edge('c3000d', 0, 'c3000e', 0);

  f.node('c3000f', 'Core.Browser.Close', 'Close Browser', {
    inBrowserId: Message('browser')
  });
  f.edge('c3000e', 0, 'c3000f', 0);

  f.node('c30010', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c3000f', 0, 'c30010', 0);
}).start();
