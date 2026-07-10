import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e14a7c0', 'Leave Request Policing', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Leave Request Policing\n\nProcesses the pending leave requests by policy: approves the ones that are clean, and denies the ones that break a rule — an insufficient balance, an overlap with a teammate already off, or a request inside the month-end blackout — each with a written reason.\n\nBrings only the edge cases to a human. Writes leave-decisions.csv to your home folder.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Open the leave desk\n\nSign in to the HR system and open the time-off queue, which defaults to the pending requests. Each request card shows the worker, the dates, and a chip when the request breaks a policy rule.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Read every pending request\n\nRead the whole pending list up front — worker, request id and whether the site has flagged a policy problem — before touching anything. Acting on a request removes it from the queue, so reading first keeps the loop stable.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Approve the clean, deny the rest\n\nA request with no policy flag is approved. A flagged one is denied with the reason written into the required comment box — insufficient balance, team overlap, or the close blackout.\n\nThe robot only ever denies when a rule is actually broken; everything clean sails through.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Report\n\nWrites one row per request: the worker, the decision, and — for the denials — the policy reason. On the seeded queue that is 11 approved and 3 denied.'
  });

  // ------------------------------------------------------------ 1. open the leave desk
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://workmonth.robomotion.online';
msg.login_url = msg.base_url + '/login';
// Published training credentials for a fictional HR system (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.email = 'priya.sharma@globex.example';
msg.password = 'WorkTraining2026!';
msg.csv = global.get('$Home$') + '/leave-decisions.csv';
msg.decisions = [];
msg.t0 = Date.now();
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'headlesschrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Login', {
      inBrowserId: Message('browser'), inUrl: Message('login_url'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait Login Form', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('email'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    // Navigate by menu after login (do not reload - the session hydrates on mount).
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Home', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-time-off"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.ClickElement', 'Open Time Off', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-time-off"]')
    })
    .then('a1000b', 'Core.Browser.WaitElement', 'Wait Requests', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="timeoff-row"]'), optTimeout: Custom('20')
    })
    // -------------------------------------------------- 2. read every pending request
    .then('a1000c', 'Core.Browser.RunScript', 'Read Pending', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="timeoff-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  var chip = r.querySelector('[data-testid="exception-chip"]');
  var nameEl = r.querySelector('a');
  out.push({
    id: r.getAttribute('data-id'),
    worker: nameEl ? nameEl.innerText.trim() : '',
    flag: chip ? chip.innerText.replace(/\\s+/g, ' ').trim() : ''
  });
}
return JSON.stringify(out);`,
      outResult: Message('pending_json')
    })
    .then('a1000d', 'Core.Programming.Function', 'Queue Requests', {
      func: `msg.requests = JSON.parse(msg.pending_json);
if (msg.requests.length === 0) { throw new Error('no pending leave requests found'); }
console.log('Pending leave requests: ' + msg.requests.length);
return msg;`
    })
    .then('a1000e', 'Robomotion.MemoryQueue.Create', 'Create Request Queue', {
      optElements: Message('requests'), outQueueID: Message('req_qid')
    });

  // -------------------------------------------- 3. approve the clean, deny the rest
  f.node('b20000', 'Core.Flow.Label', 'Next Request', {});

  f.node('b20001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Request', {
    inQueueID: Message('req_qid'), outElement: Message('req')
  });
  f.edge('a1000e', 0, 'b20001', 0);
  f.edge('b20000', 0, 'b20001', 0);

  f.node('b20002', 'Core.Programming.Function', 'Assess Policy', {
    func: `var flag = String(msg.req.flag || '').toLowerCase();
var row = '//*[@data-testid="timeoff-row" and @data-id="' + msg.req.id + '"]';
msg.deny_xpath = row + '//button[@data-testid="deny-button"]';
msg.approve_xpath = row + '//button[@data-testid="approve-button"]';
msg.violates = flag.length > 0;
// Turn the site's policy chip into a written reason.
var reason = '';
if (flag.indexOf('balance') >= 0 || flag.indexOf('insufficient') >= 0) { reason = 'Insufficient annual leave balance for the days requested'; }
else if (flag.indexOf('overlap') >= 0 || flag.indexOf('conflict') >= 0 || flag.indexOf('team') >= 0) { reason = 'Overlaps with leave already approved in the same team'; }
else if (flag.indexOf('blackout') >= 0) { reason = 'Falls inside the month-end close blackout window'; }
else if (msg.violates) { reason = 'Policy exception: ' + msg.req.flag; }
msg.reason = reason;
return msg;`
  });
  f.edge('b20001', 0, 'b20002', 0);

  // Violation -> port 0 (deny); clean -> port 1 (approve).
  f.node('b20003', 'Core.Programming.Switch', 'Breaks Policy?', {
    optUseBreak: true,
    optConditions: ['msg.violates === true', 'true']
  });
  f.edge('b20002', 0, 'b20003', 0);

  // --- deny with a written reason.
  f.node('b20010', 'Core.Browser.ClickElement', 'Deny', {
    inPageId: Message('page'), inSelector: Message('deny_xpath')
  });
  f.edge('b20003', 0, 'b20010', 0);

  f.node('b20011', 'Core.Browser.WaitElement', 'Wait Comment Box', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="deny-comment"]'), optTimeout: Custom('20')
  });
  f.edge('b20010', 0, 'b20011', 0);

  f.node('b20012', 'Core.Browser.TypeText', 'Type Reason', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="deny-comment"]'), inText: Message('reason'), optClearText: true
  });
  f.edge('b20011', 0, 'b20012', 0);

  f.node('b20013', 'Core.Browser.ClickElement', 'Confirm Denial', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="deny-confirm"]')
  });
  f.edge('b20012', 0, 'b20013', 0);

  f.node('b20014', 'Core.Programming.Function', 'Tag Denied', {
    func: `msg.decision = 'Denied';
return msg;`
  });
  f.edge('b20013', 0, 'b20014', 0);

  // --- approve.
  f.node('b20020', 'Core.Browser.ClickElement', 'Approve', {
    inPageId: Message('page'), inSelector: Message('approve_xpath')
  });
  f.edge('b20003', 1, 'b20020', 0);

  f.node('b20021', 'Core.Programming.Function', 'Tag Approved', {
    func: `msg.decision = 'Approved';
msg.reason = '';
return msg;`
  });
  f.edge('b20020', 0, 'b20021', 0);

  // --- record + loop.
  f.node('b20030', 'Core.Programming.Function', 'Record Decision', {
    func: `msg.decisions.push({
  request: msg.req.id,
  worker: msg.req.worker,
  decision: msg.decision,
  reason: msg.reason
});
return msg;`
  });
  f.edge('b20014', 0, 'b20030', 0);
  f.edge('b20021', 0, 'b20030', 0);

  f.node('b20031', 'Core.Programming.Sleep', 'Settle', { optDuration: Custom('1') });
  f.edge('b20030', 0, 'b20031', 0);

  f.node('b20032', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['b20000'], type: 'goto', all: false }
  });
  f.edge('b20031', 0, 'b20032', 0);

  // ------------------------------------------------------------------- 4. report
  f.node('c30001', 'Core.Trigger.Catch', 'Queue Empty', {
    optNodes: { type: 'catch', ids: ['b20001'], all: false }
  });

  f.node('c30002', 'Core.Programming.Function', 'Build Report', {
    func: `var rows = msg.decisions;
rows.sort(function (a, b) { return a.request < b.request ? -1 : a.request > b.request ? 1 : 0; });
var approved = 0, denied = 0;
for (var i = 0; i < rows.length; i++) { if (rows[i].decision === 'Approved') { approved++; } else { denied++; } }
msg.report_table = { columns: ['request', 'worker', 'decision', 'reason'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Processed ' + rows.length + ' leave requests in ' + elapsed + 's: ' + approved + ' approved, ' + denied + ' denied');
for (var k = 0; k < rows.length; k++) { if (rows[k].decision === 'Denied') { console.log('  DENIED ' + rows[k].request + ' ' + rows[k].worker + ' - ' + rows[k].reason); } }
return msg;`
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.CSV.WriteCSV', 'Write Decisions CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30003', 0, 'c30004', 0);

  f.node('c30005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30004', 0, 'c30005', 0);
}).start();
