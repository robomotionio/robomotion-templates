import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e03a7c0', 'Friday Payment Run', function (f) {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Friday Payment Run\n\nPrepares this week\'s vendor payment run in the ERP: proposes every bill due within seven days, and separately lists the blocked bills it left out and why.\n\nWrites payment-run.csv to your home folder. No bill is paid without the human-approval gate in a real deployment; this training version confirms the run so you can see the whole cycle.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Sign in\n\nRAP One uses a SAP-style login: username, password and a client number. The session lives in memory only, so after signing in the robot moves around by clicking the menu, never by reloading a URL.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Build the proposal\n\nOn the payment run screen the robot narrows to bills due within seven days, selects them, and creates a proposal. Blocked bills never reach this screen - the ERP only offers payable ones - so the proposal is clean by construction.\n\nConfirming the run posts a payment journal entry for each bill and flips it to Paid.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Account for what was left out\n\nThe boss will ask why a bill was not paid. The robot opens the bills list, filters to **Blocked**, and reads each one with the reason it is on hold - a goods-receipt still pending, a quantity or price mismatch against the PO, or a missing PO reference.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Report\n\nWrites two things a treasurer needs: what will be paid (with the run total) and what will not, each with its reason. The proposal is the week\'s payment run; the blocked list is the exceptions to chase.'
  });

  // ---------------------------------------------------------------- 1. sign in
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://rapone.robomotion.online';
msg.login_url = msg.base_url + '/login';
// Published training credentials for a fictional ERP (synthetic data). Real system
// credentials belong in the Robomotion Vault, never in a flow.
msg.username = 'HTANAKA';
msg.password = 'RapTraining2026!';
msg.client = '100';
msg.csv = global.get('$Home$') + '/payment-run.csv';
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
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Username', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), inText: Message('username'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.TypeText', 'Type Client', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-client"]'), inText: Message('client'), optClearText: true
    })
    .then('a10009', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a1000a', 'Core.Browser.WaitElement', 'Wait Launchpad', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="launchpad"]'), optTimeout: Custom('20')
    })
    // ------------------------------------------------------ 2. build the proposal
    .then('a1000b', 'Core.Browser.ClickElement', 'Open Payment Run', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-payments"]')
    })
    .then('a1000c', 'Core.Browser.WaitElement', 'Wait Payment Table', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="payment-select-table"]'), optTimeout: Custom('20')
    })
    // The due window defaults to "Due <= 7 days", which is exactly the run we want.
    .then('a1000e', 'Core.Programming.Sleep', 'Let Bills Render', { optDuration: Custom('1') })
    .then('a1000f', 'Core.Browser.RunScript', 'Read Due Bills', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="payment-bill-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  var tds = r.querySelectorAll('td');
  // First cell is the select checkbox: document, vendor, due, gross follow.
  out.push({
    document: r.getAttribute('data-id'),
    vendor: tds[2] ? tds[2].innerText.trim() : '',
    due: tds[3] ? tds[3].innerText.trim() : '',
    gross: tds[tds.length - 1] ? tds[tds.length - 1].innerText.trim() : ''
  });
}
return JSON.stringify(out);`,
      outResult: Message('due_json')
    })
    .then('a10010', 'Core.Programming.Function', 'Record Proposal', {
      func: `msg.proposed = JSON.parse(msg.due_json);
if (msg.proposed.length === 0) { throw new Error('no bills due in the 7-day window'); }
console.log('Bills due within 7 days: ' + msg.proposed.length);
return msg;`
    })
    .then('a10011', 'Core.Browser.ClickElement', 'Select All', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="payment-select-all"]')
    })
    .then('a10012', 'Core.Browser.ClickElement', 'Create Proposal', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="payment-run-start"]')
    })
    .then('a10013', 'Core.Browser.WaitElement', 'Wait Proposal', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="proposal-table"]'), optTimeout: Custom('20')
    })
    .then('a10014', 'Core.Browser.RunScript', 'Read Run Total', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="proposal-row"]');
return String(rows.length);`,
      outResult: Message('proposal_count')
    })
    .then('a10015', 'Core.Browser.ClickElement', 'Confirm Run', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="proposal-confirm"]')
    })
    .then('a10016', 'Core.Programming.Sleep', 'Let Run Post', { optDuration: Custom('2') });

  // ------------------------------------------- 3. account for what was left out
  f.node('b20001', 'Core.Browser.ClickElement', 'Open Bills', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-ap-bills"]')
  });
  f.edge('a10016', 0, 'b20001', 0);

  f.node('b20002', 'Core.Browser.WaitElement', 'Wait Bills Table', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-table"]'), optTimeout: Custom('20')
  });
  f.edge('b20001', 0, 'b20002', 0);

  f.node('b20003', 'Core.Browser.Select', 'Filter Blocked', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-status"]'), inValue: Custom('Blocked')
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Programming.Sleep', 'Let Blocked Render', { optDuration: Custom('2') });
  f.edge('b20003', 0, 'b20004', 0);

  f.node('b20005', 'Core.Browser.RunScript', 'Read Blocked Bills', {
    inPageId: Message('page'),
    func: `var rows = document.querySelectorAll('[data-testid="bill-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  var tds = r.querySelectorAll('td');
  // The row text carries the vendor, ref, gross, status and any exception chip.
  var text = r.innerText.replace(/\\s+/g, ' ').trim();
  var reason = 'Blocked - goods receipt not yet confirmed';
  if (/qty|quantity/i.test(text)) { reason = 'Quantity mismatch against the purchase order'; }
  else if (/price/i.test(text)) { reason = 'Price mismatch against the purchase order'; }
  else if (/no[ -]?po|missing po/i.test(text)) { reason = 'No purchase order reference'; }
  out.push({
    document: r.getAttribute('data-id'),
    vendor: tds[1] ? tds[1].innerText.trim() : '',
    vendor_ref: tds[2] ? tds[2].innerText.trim() : '',
    gross: tds[7] ? tds[7].innerText.trim() : '',
    reason: reason
  });
}
return JSON.stringify(out);`,
    outResult: Message('blocked_json')
  });
  f.edge('b20004', 0, 'b20005', 0);

  // ------------------------------------------------------------------- 4. report
  f.node('c30001', 'Core.Programming.Function', 'Build Report', {
    func: `msg.blocked = JSON.parse(msg.blocked_json);
var proposedCount = parseInt(msg.proposal_count, 10) || msg.proposed.length;
function num(s) { return parseFloat(String(s == null ? '' : s).replace(/[^0-9.-]/g, '')) || 0; }
function money(n) { var parts = n.toFixed(2).split('.'); parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); return '€' + parts[0] + '.' + parts[1]; }
var rows = [];
var runTotal = 0;
for (var i = 0; i < msg.proposed.length; i++) {
  var p = msg.proposed[i];
  runTotal += num(p.gross);
  rows.push({ outcome: 'Proposed for payment', document: p.document, vendor: p.vendor, amount: p.gross, reason: 'Due within 7 days' });
}
for (var j = 0; j < msg.blocked.length; j++) {
  var b = msg.blocked[j];
  rows.push({ outcome: 'Excluded (blocked)', document: b.document, vendor: b.vendor, amount: b.gross, reason: b.reason });
}
rows.unshift({ outcome: 'SUMMARY', document: '', vendor: proposedCount + ' proposed, ' + msg.blocked.length + ' blocked', amount: money(runTotal), reason: 'Run total for payment' });
msg.report_table = { columns: ['outcome', 'document', 'vendor', 'amount', 'reason'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Payment run in ' + elapsed + 's: ' + proposedCount + ' bills proposed (' + money(runTotal) + '), ' + msg.blocked.length + ' blocked and excluded');
for (var k = 0; k < msg.blocked.length; k++) { console.log('  EXCLUDED ' + msg.blocked[k].document + ' ' + msg.blocked[k].vendor + ' - ' + msg.blocked[k].reason); }
return msg;`
  });
  f.edge('b20005', 0, 'c30001', 0);

  f.node('c30002', 'Core.CSV.WriteCSV', 'Write Payment Run CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30003', 0, 'c30004', 0);
}).start();
