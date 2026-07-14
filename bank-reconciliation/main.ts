import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('f02b8c4', 'Bank Reconciliation', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Bank Reconciliation\n\nTakes the payments and receipts the ERP could not reconcile and confirms each one against the real bank statement. It quantifies the four ways money and ledger drift apart: a payment settled at the wrong amount, a bill marked paid that never left the bank, a bill paid twice, and cash that arrived but was never applied to its invoice.\n\nWrites bank-reconciliation.csv. The story is evidence: the ledger raises the question, the bank statement answers it, and every discrepancy comes out with a number attached.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Pull the ledger\'s open questions\n\nSign in to the ERP. Its exceptions worklist already flags the payments it could not tie out - open the paid bills carrying an exception, and the customer invoices where cash is expected but the item is still open. Read the reference and amount for each; these are the items to prove against the bank.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Prove each against the bank\n\nSign in to the bank through two-factor and open the operating account. For every flagged item, search the statement by its reference and read what actually settled - no debit, a debit at the wrong amount, two debits, or a credit that arrived. The bank statement is the independent record; the count and amount decide the verdict.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Classify & report\n\nZero debits is a missing payment; one debit at the wrong amount is a transposition; two debits is a double payment; a credit against a still-open invoice is unapplied cash. Each verdict carries the exact figures from both sides, written to a CSV a finance team can action.'
  });

  // ----------------------------------------------------- 1. pull the ledger's questions
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.rap_login = 'https://rapone.robomotion.online/login';
msg.ab_url = 'https://acmebank.robomotion.online';
// Published training credentials for a fictional ERP and bank (synthetic data,
// incl. the static one-time code). Real system credentials belong in the
// Robomotion Vault, never in a flow.
msg.rap_user = 'HTANAKA';
msg.rap_password = 'RapTraining2026!';
msg.rap_client = '100';
msg.ab_email = 'hiroshi.tanaka@globex.example';
msg.ab_pw = 'BankTraining2026!';
msg.ab_otp = '768581';
msg.csv = global.get('$Home$') + '/bank-reconciliation.csv';
msg.t0 = Date.now();
msg.findings = [];
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open ERP Login', {
      inBrowserId: Message('browser'), inUrl: Message('rap_login'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait ERP Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Username', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), inText: Message('rap_user'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type ERP Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('rap_password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.TypeText', 'Type Client', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-client"]'), inText: Message('rap_client'), optClearText: true
    })
    .then('a10009', 'Core.Browser.ClickElement', 'Sign In ERP', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a1000a', 'Core.Browser.WaitElement', 'Wait Launchpad', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="launchpad"]'), optTimeout: Custom('20')
    })
    .then('a1000b', 'Core.Browser.ClickElement', 'Open AP Bills', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-ap-bills"]')
    })
    .then('a1000c', 'Core.Browser.WaitElement', 'Wait Bills', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-exceptions"]'), optTimeout: Custom('20')
    })
    .then('a1000d', 'Core.Browser.ClickElement', 'Exceptions Only', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-exceptions"]')
    })
    .then('a1000e', 'Core.Browser.Select', 'Filter Paid', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-status"]'), inValue: Custom('Paid')
    })
    .then('a1000f', 'Core.Programming.Sleep', 'Let Filter Render', { optDuration: Custom('1') })
    .then('a10010', 'Core.Browser.RunScript', 'Read Flagged Bills', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="bill-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var tds = rows[i].querySelectorAll('td');
  out.push({
    id: rows[i].getAttribute('data-id'),
    name: tds[1] ? tds[1].innerText.trim() : '',
    ref: tds[2] ? tds[2].innerText.trim() : '',
    gross: tds[7] ? tds[7].innerText.trim() : ''
  });
}
return JSON.stringify(out);`,
      outResult: Message('bill_json')
    })
    .then('a10011', 'Core.Programming.Function', 'Collect Bills', {
      func: `var raw = JSON.parse(msg.bill_json);
msg.checks = [];
for (var i = 0; i < raw.length; i++) {
  var g = parseFloat(raw[i].gross.replace(/[^0-9.]/g, ''));
  msg.checks.push({ kind: 'bill', id: raw[i].id, ref: raw[i].ref, name: raw[i].name, amount: g });
}
if (msg.checks.length === 0) { throw new Error('no flagged payment exceptions found in the ledger'); }
console.log('Ledger flagged ' + msg.checks.length + ' paid-bill exceptions');
return msg;`
    })
    .then('a10012', 'Core.Browser.ClickElement', 'Open AR Invoices', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-ar-invoices"]')
    })
    .then('a10013', 'Core.Browser.WaitElement', 'Wait AR', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="invoices-filter-open"]'), optTimeout: Custom('20')
    })
    .then('a10014', 'Core.Browser.ClickElement', 'Open Items Only', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="invoices-filter-open"]')
    })
    .then('a10015', 'Core.Programming.Sleep', 'Let AR Render', { optDuration: Custom('1') })
    .then('a10016', 'Core.Browser.RunScript', 'Read Flagged Invoices', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="invoices-table-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  if (rows[i].innerText.indexOf('cash-app') < 0) continue;
  var tds = rows[i].querySelectorAll('td');
  out.push({
    id: rows[i].getAttribute('data-id'),
    name: tds[1] ? tds[1].innerText.trim() : '',
    amount: tds[4] ? tds[4].innerText.trim() : ''
  });
}
return JSON.stringify(out);`,
      outResult: Message('ar_json')
    })
    .then('a10017', 'Core.Programming.Function', 'Collect Invoices', {
      func: `var raw = JSON.parse(msg.ar_json);
for (var i = 0; i < raw.length; i++) {
  var a = parseFloat(raw[i].amount.replace(/[^0-9.]/g, ''));
  msg.checks.push({ kind: 'ar', id: raw[i].id, ref: raw[i].id, name: raw[i].name, amount: a });
}
console.log('Flagged for verification: ' + msg.checks.length + ' items total');
return msg;`
    });

  // ------------------------------------------------------- 2. prove each against the bank
  f.node('c30001', 'Core.Browser.OpenLink', 'Open Bank Login', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('ab_url'), optSameTab: true
  });
  f.edge('a10017', 0, 'c30001', 0);

  f.node('c30002', 'Core.Browser.WaitElement', 'Wait Bank Login', {
    inPageId: Message('page'), inSelector: Custom('//input[@name="email"]'), optTimeout: Custom('20')
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.TypeText', 'Bank Email', {
    inPageId: Message('page'), inSelector: Custom('//input[@name="email"]'), inText: Message('ab_email'), optClearText: true
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Browser.TypeText', 'Bank Password', {
    inPageId: Message('page'), inSelector: Custom('//input[@name="password"]'), inText: Message('ab_pw'), optClearText: true
  });
  f.edge('c30003', 0, 'c30004', 0);

  f.node('c30005', 'Core.Browser.ClickElement', 'Bank Sign In', {
    inPageId: Message('page'), inSelector: Custom('//button[normalize-space()="Sign In"]')
  });
  f.edge('c30004', 0, 'c30005', 0);

  f.node('c30006', 'Core.Browser.WaitElement', 'Wait 2FA', {
    inPageId: Message('page'), inSelector: Custom('//input[@name="code"]'), optTimeout: Custom('20')
  });
  f.edge('c30005', 0, 'c30006', 0);

  f.node('c30007', 'Core.Browser.TypeText', 'Type One Time Code', {
    inPageId: Message('page'), inSelector: Custom('//input[@name="code"]'), inText: Message('ab_otp'), optClearText: true
  });
  f.edge('c30006', 0, 'c30007', 0);

  f.node('c30008', 'Core.Browser.ClickElement', 'Verify', {
    inPageId: Message('page'), inSelector: Custom('//button[normalize-space()="Verify"]')
  });
  f.edge('c30007', 0, 'c30008', 0);

  f.node('c30009', 'Core.Browser.WaitElement', 'Wait Accounts', {
    inPageId: Message('page'), inSelector: Custom('//a[@href="/accounts/A-7001-OPS"]'), optTimeout: Custom('20')
  });
  f.edge('c30008', 0, 'c30009', 0);

  f.node('c3000a', 'Core.Browser.ClickElement', 'Open Operating Account', {
    inPageId: Message('page'), inSelector: Custom('//a[@href="/accounts/A-7001-OPS"]')
  });
  f.edge('c30009', 0, 'c3000a', 0);

  f.node('c3000b', 'Core.Browser.WaitElement', 'Wait Account', {
    inPageId: Message('page'), inSelector: Custom('//a[contains(@href,"/transactions")]'), optTimeout: Custom('20')
  });
  f.edge('c3000a', 0, 'c3000b', 0);

  f.node('c3000c', 'Core.Browser.ClickElement', 'Open Transactions', {
    inPageId: Message('page'), inSelector: Custom('//a[contains(@href,"/transactions")]')
  });
  f.edge('c3000b', 0, 'c3000c', 0);

  f.node('c3000d', 'Core.Browser.WaitElement', 'Wait Search', {
    inPageId: Message('page'), inSelector: Custom('//input[@id="q"]'), optTimeout: Custom('20')
  });
  f.edge('c3000c', 0, 'c3000d', 0);

  f.node('c3000e', 'Robomotion.MemoryQueue.Create', 'Create Check Queue', {
    optElements: Message('checks'), outQueueID: Message('check_qid')
  });
  f.edge('c3000d', 0, 'c3000e', 0);

  // verify loop
  f.node('d40000', 'Core.Flow.Label', 'Next Check', {});

  f.node('d40001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Check', {
    inQueueID: Message('check_qid'), outElement: Message('chk')
  });
  f.edge('c3000e', 0, 'd40001', 0);
  f.edge('d40000', 0, 'd40001', 0);

  f.node('d40002', 'Core.Programming.Function', 'Set Query', {
    func: `msg.q = msg.chk.ref;
return msg;`
  });
  f.edge('d40001', 0, 'd40002', 0);

  f.node('d40003', 'Core.Browser.TypeText', 'Search Statement', {
    inPageId: Message('page'), inSelector: Custom('//input[@id="q"]'), inText: Message('q'), optClearText: true, optEnter: true
  });
  f.edge('d40002', 0, 'd40003', 0);

  f.node('d40004', 'Core.Programming.Sleep', 'Let Results Render', { optDuration: Custom('2') });
  f.edge('d40003', 0, 'd40004', 0);

  f.node('d40005', 'Core.Browser.RunScript', 'Read Settled', {
    inPageId: Message('page'),
    func: `var rows = document.querySelectorAll('[data-testid="txn-row"]');
var amts = [];
for (var i = 0; i < rows.length; i++) {
  var tds = rows[i].querySelectorAll('td');
  var cell = tds[tds.length - 1];
  var n = parseFloat((cell ? cell.innerText : '').replace(/[^0-9.-]/g, ''));
  if (!isNaN(n)) { amts.push(n); }
}
return JSON.stringify(amts);`,
    outResult: Message('txn_json')
  });
  f.edge('d40004', 0, 'd40005', 0);

  f.node('d40006', 'Core.Programming.Function', 'Classify', {
    func: `var amts = JSON.parse(msg.txn_json);
var chk = msg.chk;
var fnd = { ref: chk.ref, name: chk.name };
if (chk.kind === 'bill') {
  var debits = amts.filter(function (a) { return a < 0; });
  var n = debits.length;
  if (n === 0) {
    fnd.verdict = 'MISSING PAYMENT';
    fnd.detail = 'bill ' + chk.id + ' is Paid in the ledger but no debit left the bank - EUR ' + chk.amount.toFixed(2) + ' outstanding';
  } else if (n === 1) {
    var paid = Math.abs(debits[0]);
    if (Math.abs(paid - chk.amount) > 0.005) {
      fnd.verdict = 'TRANSPOSITION';
      fnd.detail = 'bank settled EUR ' + paid.toFixed(2) + ' against ledger EUR ' + chk.amount.toFixed(2) + ' (delta EUR ' + (chk.amount - paid).toFixed(2) + ')';
    } else {
      fnd.verdict = 'reconciled';
      fnd.detail = 'EUR ' + paid.toFixed(2) + ' matches the ledger';
    }
  } else {
    var tot = 0; for (var i = 0; i < debits.length; i++) { tot += Math.abs(debits[i]); }
    fnd.verdict = 'DOUBLE PAYMENT';
    fnd.detail = n + ' debits totalling EUR ' + tot.toFixed(2) + ' for one bill of EUR ' + chk.amount.toFixed(2);
  }
} else {
  var credits = amts.filter(function (a) { return a > 0; });
  if (credits.length >= 1) {
    fnd.verdict = 'UNAPPLIED CASH';
    fnd.detail = 'EUR ' + credits[0].toFixed(2) + ' received in the bank but invoice ' + chk.ref + ' is still Open in the ledger';
  } else {
    fnd.verdict = 'no bank credit';
    fnd.detail = 'no matching credit found for ' + chk.ref;
  }
}
msg.findings.push(fnd);
console.log('  ' + chk.ref + ': ' + fnd.verdict + ' - ' + fnd.detail);
return msg;`
  });
  f.edge('d40005', 0, 'd40006', 0);

  f.node('d40007', 'Core.Flow.GoTo', 'Check Next', {
    optNodes: { ids: ['d40000'], type: 'goto', all: false }
  });
  f.edge('d40006', 0, 'd40007', 0);

  // ------------------------------------------------------------------- 3. report
  f.node('e50001', 'Core.Trigger.Catch', 'Checks Done', {
    optNodes: { type: 'catch', ids: ['d40001'], all: false }
  });

  f.node('e50002', 'Core.Programming.Function', 'Build Report', {
    func: `var rows = msg.findings.map(function (x) { return { reference: x.ref, party: x.name, verdict: x.verdict, detail: x.detail }; });
var flagged = msg.findings.filter(function (x) { return x.verdict === x.verdict.toUpperCase() && x.verdict !== 'RECONCILED'; }).length;
msg.report_table = { columns: ['reference', 'party', 'verdict', 'detail'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Reconciled ' + msg.findings.length + ' flagged items in ' + elapsed + 's, ' + flagged + ' confirmed discrepancies');
return msg;`
  });
  f.edge('e50001', 0, 'e50002', 0);

  f.node('e50003', 'Core.CSV.WriteCSV', 'Write Reconciliation CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('e50002', 0, 'e50003', 0);

  f.node('e50004', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('e50003', 0, 'e50004', 0);

  f.node('e50005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('e50004', 0, 'e50005', 0);
}).start();
