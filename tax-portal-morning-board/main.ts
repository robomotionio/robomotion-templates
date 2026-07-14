import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e08a7c0', 'Tax Portal Morning Board', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Tax Portal Morning Board\n\nChecks every client mandate on the tax portal and builds one status board: for each company, its unread notices, open penalties and upcoming deadlines. The clients that need attention rise to the top.\n\nWrites tax-status-board.csv to your home folder. Built for accountants and agencies watching many companies at once.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Sign in as the representative\n\nLog in as the authorised representative (tax id, password, one-time code). A representative acting for many companies lands on the mandate picker instead of a single dashboard.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. List the mandates\n\nRead every mandate the representative holds - the client name and tax id for each. These become the work queue: one pass per company.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Check each client\n\nFor every mandate the robot switches the active company and reads that company\'s dashboard: unread official notices, open penalties, and the deadline count. A company with penalties, an audit request, or a late filing is flagged for attention.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Build the board\n\nOne row per client, worst first: attention before clear. The morning board a human would have spent an hour assembling, ready before the coffee is.'
  });

  // ------------------------------------------------ 1. sign in as the representative
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://frs.robomotion.online';
// Each mandate switch raises a "now acting for X" toast; over a dozen clients those
// overlays pile up over the menu. toast-kill turns them off for the session (chaos
// flags are parsed once at load and persist through client-side navigation).
msg.login_url = msg.base_url + '/login?chaos=toast-kill';
// Published training credentials for a fictional tax portal (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.tax_id = 'FD-772103944';
msg.password = 'FrsTraining2026!';
msg.otp = '550619';
msg.csv = global.get('$Home$') + '/tax-status-board.csv';
msg.board = [];
msg.t0 = Date.now();
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Login', {
      inBrowserId: Message('browser'), inUrl: Message('login_url'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait Login Form', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-taxid"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Tax Id', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-taxid"]'), inText: Message('tax_id'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait OTP', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="otp-input"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.TypeText', 'Type One Time Code', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="otp-input"]'), inText: Message('otp'), optClearText: true
    })
    .then('a1000b', 'Core.Browser.ClickElement', 'Submit Code', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="otp-submit"]')
    })
    // --------------------------------------------------------- 2. list the mandates
    .then('a1000c', 'Core.Browser.WaitElement', 'Wait Mandate Picker', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="mandate-select"]'), optTimeout: Custom('20')
    })
    .then('a1000d', 'Core.Browser.RunScript', 'Read Mandates', {
      inPageId: Message('page'),
      func: `var opts = document.querySelectorAll('[data-testid="mandate-option"]');
var out = [];
for (var i = 0; i < opts.length; i++) {
  out.push({ taxId: opts[i].getAttribute('data-id'), name: (opts[i].innerText.split('\\n')[0] || '').trim() });
}
return JSON.stringify(out);`,
      outResult: Message('mandates_json')
    })
    .then('a1000e', 'Core.Programming.Function', 'Queue Mandates', {
      func: `msg.mandates = JSON.parse(msg.mandates_json);
if (msg.mandates.length === 0) { throw new Error('no mandates found - did the representative log in?'); }
msg.meta = {};
msg.mandate_ids = [];
for (var i = 0; i < msg.mandates.length; i++) { msg.meta[msg.mandates[i].taxId] = msg.mandates[i]; msg.mandate_ids.push(msg.mandates[i].taxId); }
console.log('Mandates to check: ' + msg.mandate_ids.length);
return msg;`
    })
    // Enter the shell by picking the first mandate; the loop re-picks each in turn.
    .then('a1000f', 'Core.Browser.ClickElement', 'Enter First Mandate', {
      inPageId: Message('page'), inSelector: Custom('(//*[@data-testid="mandate-option"])[1]')
    })
    .then('a10010', 'Core.Browser.WaitElement', 'Wait Dashboard', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="notice-count"]'), optTimeout: Custom('20')
    })
    .then('a10011', 'Robomotion.MemoryQueue.Create', 'Create Mandate Queue', {
      optElements: Message('mandate_ids'), outQueueID: Message('mandate_qid')
    });

  // ------------------------------------------------------------- 3. check each client
  f.node('b20000', 'Core.Flow.Label', 'Next Mandate', {});

  f.node('b20001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Mandate', {
    inQueueID: Message('mandate_qid'), outElement: Message('taxid')
  });
  f.edge('a10011', 0, 'b20001', 0);
  f.edge('b20000', 0, 'b20001', 0);

  f.node('b20002', 'Core.Programming.Function', 'Build Mandate Selector', {
    func: `msg.mandate_xpath = '//*[@data-testid="mandate-option" and @data-id="' + msg.taxid + '"]';
msg.client_name = (msg.meta[msg.taxid] || {}).name || msg.taxid;
return msg;`
  });
  f.edge('b20001', 0, 'b20002', 0);

  f.node('b20003', 'Core.Browser.ClickElement', 'Open Mandate Switcher', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-mandates"]')
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Browser.WaitElement', 'Wait Switcher', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="mandate-select"]'), optTimeout: Custom('20')
  });
  f.edge('b20003', 0, 'b20004', 0);

  f.node('b20005', 'Core.Browser.ClickElement', 'Activate Mandate', {
    inPageId: Message('page'), inSelector: Message('mandate_xpath')
  });
  f.edge('b20004', 0, 'b20005', 0);

  // Activating a mandate sets the active company but stays on the switcher; open
  // that company's dashboard to read its status.
  f.node('b2000b', 'Core.Browser.ClickElement', 'Open Dashboard', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-dashboard"]')
  });
  f.edge('b20005', 0, 'b2000b', 0);

  f.node('b20006', 'Core.Browser.WaitElement', 'Wait Client Dashboard', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="notice-count"]'), optTimeout: Custom('20')
  });
  f.edge('b2000b', 0, 'b20006', 0);

  f.node('b20007', 'Core.Programming.Sleep', 'Let Dashboard Render', { optDuration: Custom('1') });
  f.edge('b20006', 0, 'b20007', 0);

  f.node('b20008', 'Core.Browser.RunScript', 'Read Client Status', {
    inPageId: Message('page'),
    func: `function num(sel) { var el = document.querySelector(sel); if (!el) { return 0; } var m = el.innerText.match(/\\d+/); return m ? parseInt(m[0], 10) : 0; }
var unread = num('[data-testid="notice-count"]');
var penalties = num('[data-testid="tile-penalties"]');
var deadlines = document.querySelectorAll('[data-testid="deadline-row"]').length;
// An audit request is a notice carrying a hard deadline - detect it by the deadline
// rows themselves, not loose body text (which contains the word elsewhere).
var audit = false;
var drows = document.querySelectorAll('[data-testid="deadline-row"]');
for (var i = 0; i < drows.length; i++) { if (/audit/i.test(drows[i].innerText)) { audit = true; } }
return JSON.stringify({ unread: unread, penalties: penalties, deadlines: deadlines, audit: audit });`,
    outResult: Message('status_json')
  });
  f.edge('b20007', 0, 'b20008', 0);

  f.node('b20009', 'Core.Programming.Function', 'Record Client', {
    func: `var s = JSON.parse(msg.status_json);
// A client needs attention if the portal is charging penalties (which follow a late
// filing) or has raised an audit request with a deadline.
var attention = s.penalties > 0 || s.audit;
var flags = [];
if (s.penalties > 0) { flags.push((s.penalties === 1 ? '1 penalty' : s.penalties + ' penalties') + ' (late filing)'); }
if (s.audit) { flags.push('audit request with deadline'); }
msg.board.push({
  status: attention ? 'ATTENTION' : 'Clear',
  client: msg.client_name,
  tax_id: msg.taxid,
  unread_notices: s.unread,
  penalties: s.penalties,
  deadlines: s.deadlines,
  flags: flags.join('; ')
});
return msg;`
  });
  f.edge('b20008', 0, 'b20009', 0);

  f.node('b2000a', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['b20000'], type: 'goto', all: false }
  });
  f.edge('b20009', 0, 'b2000a', 0);

  // ------------------------------------------------------------------- 4. build the board
  f.node('c30001', 'Core.Trigger.Catch', 'Queue Empty', {
    optNodes: { type: 'catch', ids: ['b20001'], all: false }
  });

  f.node('c30002', 'Core.Programming.Function', 'Build Board', {
    func: `var rows = msg.board;
// Attention first, then by client name.
rows.sort(function (a, b) {
  if (a.status !== b.status) { return a.status === 'ATTENTION' ? -1 : 1; }
  return a.client < b.client ? -1 : a.client > b.client ? 1 : 0;
});
var attention = 0;
for (var i = 0; i < rows.length; i++) { if (rows[i].status === 'ATTENTION') { attention++; } }
msg.board_table = { columns: ['status', 'client', 'tax_id', 'unread_notices', 'penalties', 'deadlines', 'flags'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Checked ' + rows.length + ' client mandates in ' + elapsed + 's: ' + attention + ' need attention');
for (var k = 0; k < rows.length; k++) { if (rows[k].status === 'ATTENTION') { console.log('  ATTENTION ' + rows[k].client + ' - ' + rows[k].flags); } }
return msg;`
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.CSV.WriteCSV', 'Write Status Board CSV', {
    inFilePath: Message('csv'), inTable: Message('board_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30003', 0, 'c30004', 0);

  f.node('c30005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30004', 0, 'c30005', 0);
}).start();
