import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('f07c3a2', 'Tax Portal ERP Reconciliation', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Tax Portal ↔ ERP Reconciliation\n\nReconciles the e-invoices a government tax portal received against the vendor bills in the ERP, and reports the three ways they can disagree: an amount that drifted, an e-invoice with no bill (arrived in the portal, never booked), and a bill with no e-invoice (booked, never filed).\n\nWrites portal-erp-reconciliation.csv. The story is a control: two systems that should hold the same set of documents, checked against each other so a gap is caught instead of discovered at audit.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Read the portal\n\nTwo-factor sign in to the tax portal as the company, filter the register to received e-invoices, and page through every result ten at a time. Each row carries the counterparty and gross; the portal itself tags an amount drift or an e-invoice it could not match to the ERP. The robot stops when the pager says there is no next page.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Count the bills in the ERP\n\nThe vendors that file e-invoices are exactly the portal counterparties that reconcile - so the robot signs in to the ERP and, for each one, filters the vendor-bill worklist to that vendor and reads how many bills it holds. One number per enrolled vendor: bills booked in the ERP.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Reconcile & report\n\nPer vendor, the ERP bill count should equal the portal e-invoice count. Where the ERP holds more, a bill was never filed - missing in the portal. The portal-flagged drifts and unmatched e-invoices round out the picture. All three exception classes land in one CSV.'
  });

  // ------------------------------------------------------------- 1. read the portal
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.frs_url = 'https://frs.robomotion.online';
// Downloads/actions raise a toast overlay that can swallow the next click; toast-kill
// turns them off for the session (chaos flags are parsed from the query string on load).
msg.chaos = '?chaos=toast-kill';
msg.frs_login = msg.frs_url + '/login' + msg.chaos;
msg.register_url = msg.frs_url + '/einvoices' + msg.chaos;
// Published training credentials for a fictional government portal and ERP, both serving
// entirely synthetic data (incl. the static one-time code). Real system credentials
// belong in the Robomotion Vault, never in a flow.
msg.tax_id = 'FD-380417225';
msg.frs_password = 'FrsTraining2026!';
msg.otp = '550612';
msg.rap_login = 'https://rapone.robomotion.online/login';
msg.rap_user = 'HTANAKA';
msg.rap_password = 'RapTraining2026!';
msg.rap_client = '100';
msg.csv = global.get('$Home$') + '/portal-erp-reconciliation.csv';
msg.t0 = Date.now();
msg.pages = [];
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Login Page', {
      inBrowserId: Message('browser'), inUrl: Message('frs_login'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait Login Form', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-taxid"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Tax Number', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-taxid"]'), inText: Message('tax_id'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('frs_password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait OTP Screen', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="otp-input"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.TypeText', 'Type One Time Code', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="otp-input"]'), inText: Message('otp'), optClearText: true
    })
    .then('a1000b', 'Core.Browser.ClickElement', 'Submit Code', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="otp-submit"]')
    })
    .then('a1000c', 'Core.Browser.WaitElement', 'Wait Dashboard', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="tile-einvoices"]'), optTimeout: Custom('20')
    })
    .then('a1000d', 'Core.Browser.OpenLink', 'Open Register', {
      inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('register_url'), optSameTab: true
    })
    .then('a1000e', 'Core.Browser.WaitElement', 'Wait Register', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="einvoice-table"]'), optTimeout: Custom('20')
    })
    .then('a1000f', 'Core.Browser.Select', 'Filter Received', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="einvoice-direction"]'), inValue: Custom('Received')
    })
    .then('a10010', 'Core.Browser.ClickElement', 'Search', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="einvoice-search-submit"]')
    })
    .then('a10011', 'Core.Programming.Sleep', 'Let Results Render', { optDuration: Custom('1') });

  // -------------------------------------------------------- walk the received pages
  f.node('b20000', 'Core.Flow.Label', 'Next Page', {});

  f.node('b20001', 'Core.Browser.RunScript', 'Scrape Page', {
    inPageId: Message('page'),
    func: `var rows = document.querySelectorAll('[data-testid="einvoice-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  var tds = r.querySelectorAll('td');
  var who = tds[2] ? tds[2].innerText.trim().split('\\n') : ['', ''];
  var st = tds[5] ? tds[5].innerText.trim().split('\\n') : ['', ''];
  out.push({
    document_id: r.getAttribute('data-id'),
    counterparty: (who[0] || '').trim(),
    gross: tds[4] ? tds[4].innerText.trim() : '',
    exception: (st[1] || '').replace(/^[^A-Za-z]+/, '').trim()
  });
}
var info = document.querySelector('[data-testid="pager-info"]');
var next = document.querySelector('[data-testid="pager-next"]');
return JSON.stringify({ rows: out, info: info ? info.innerText.trim() : '', hasNext: next ? !next.disabled : false });`,
    outResult: Message('page_json')
  });
  f.edge('a10011', 0, 'b20001', 0);
  f.edge('b20000', 0, 'b20001', 0);

  f.node('b20002', 'Core.Programming.Function', 'Collect Page', {
    func: `var data = JSON.parse(msg.page_json);
if (data.rows.length === 0) { throw new Error('Register page is empty - did the login succeed?'); }
for (var i = 0; i < data.rows.length; i++) { msg.pages.push(data.rows[i]); }
var mTotal = data.info.match(/(\\d+)\\s+record/);
if (mTotal) { msg.expected_total = parseInt(mTotal[1], 10); }
msg.more = data.hasNext === true;
console.log('Portal page - ' + msg.pages.length + ' received e-invoices so far');
return msg;`
  });
  f.edge('b20001', 0, 'b20002', 0);

  f.node('b20003', 'Core.Programming.Switch', 'Another Page?', {
    optUseBreak: true,
    optConditions: ['msg.more === true', 'true']
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Browser.ClickElement', 'Next Page', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="pager-next"]')
  });
  f.edge('b20003', 0, 'b20004', 0);

  f.node('b20005', 'Core.Programming.Sleep', 'Let Page Render', { optDuration: Custom('1') });
  f.edge('b20004', 0, 'b20005', 0);

  f.node('b20006', 'Core.Flow.GoTo', 'Scrape Next Page', {
    optNodes: { ids: ['b20000'], type: 'goto', all: false }
  });
  f.edge('b20005', 0, 'b20006', 0);

  // --------------------------------------------------- analyse portal, derive scope
  f.node('c30001', 'Core.Programming.Function', 'Analyse Portal', {
    func: `var pages = msg.pages;
if (msg.expected_total && pages.length !== msg.expected_total) {
  throw new Error('Scraped ' + pages.length + ' received e-invoices but the portal reported ' + msg.expected_total);
}
var realCounts = {};   // enrolled counterparty -> received e-invoices that DO reconcile
var drift = [];
var missingErp = [];
for (var i = 0; i < pages.length; i++) {
  var r = pages[i];
  var ex = r.exception || '';
  var isMissErp = ex.indexOf('Not found in ERP') >= 0;
  var isDrift = ex.indexOf('Amount drift') >= 0;
  if (!isMissErp) { realCounts[r.counterparty] = (realCounts[r.counterparty] || 0) + 1; }
  if (isMissErp) { missingErp.push({ id: r.document_id, counterparty: r.counterparty, gross: r.gross }); }
  if (isDrift) { drift.push({ id: r.document_id, counterparty: r.counterparty, gross: r.gross }); }
}
var enrolled = [];
for (var k in realCounts) { if (realCounts[k] > 0) { enrolled.push(k); } }
enrolled.sort();
msg.portal_counts = realCounts;
msg.enrolled = enrolled;
msg.drift = drift;
msg.missing_erp = missingErp;
msg.received_total = pages.length;
msg.erp = {};
console.log('Portal: ' + pages.length + ' received e-invoices, ' + enrolled.length + ' enrolled vendors, ' + drift.length + ' drift, ' + missingErp.length + ' not-in-ERP');
return msg;`
  });
  f.edge('b20003', 1, 'c30001', 0);

  // ---------------------------------------------------- 2. count the bills in the ERP
  f.node('c30002', 'Core.Browser.OpenLink', 'Open ERP Login', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('rap_login'), optSameTab: true
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.WaitElement', 'Wait ERP Login', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), optTimeout: Custom('20')
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Browser.TypeText', 'Type Username', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), inText: Message('rap_user'), optClearText: true
  });
  f.edge('c30003', 0, 'c30004', 0);

  f.node('c30005', 'Core.Browser.TypeText', 'Type ERP Password', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('rap_password'), optClearText: true
  });
  f.edge('c30004', 0, 'c30005', 0);

  f.node('c30006', 'Core.Browser.TypeText', 'Type Client', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-client"]'), inText: Message('rap_client'), optClearText: true
  });
  f.edge('c30005', 0, 'c30006', 0);

  f.node('c30007', 'Core.Browser.ClickElement', 'Sign In ERP', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
  });
  f.edge('c30006', 0, 'c30007', 0);

  f.node('c30008', 'Core.Browser.WaitElement', 'Wait Launchpad', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="launchpad"]'), optTimeout: Custom('20')
  });
  f.edge('c30007', 0, 'c30008', 0);

  f.node('c30009', 'Core.Browser.ClickElement', 'Open AP Bills', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-ap-bills"]')
  });
  f.edge('c30008', 0, 'c30009', 0);

  f.node('c3000a', 'Core.Browser.WaitElement', 'Wait Bills', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-vendor"]'), optTimeout: Custom('20')
  });
  f.edge('c30009', 0, 'c3000a', 0);

  f.node('c3000b', 'Robomotion.MemoryQueue.Create', 'Create Vendor Queue', {
    optElements: Message('enrolled'), outQueueID: Message('vendor_qid')
  });
  f.edge('c3000a', 0, 'c3000b', 0);

  // ------------------------------------------------------- per enrolled vendor: count
  f.node('d40000', 'Core.Flow.Label', 'Next Vendor', {});

  f.node('d40001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Vendor', {
    inQueueID: Message('vendor_qid'), outElement: Message('vendor')
  });
  f.edge('c3000b', 0, 'd40001', 0);
  f.edge('d40000', 0, 'd40001', 0);

  f.node('d40002', 'Core.Browser.Select', 'Filter To Vendor', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-vendor"]'), inValue: Message('vendor')
  });
  f.edge('d40001', 0, 'd40002', 0);

  f.node('d40003', 'Core.Programming.Sleep', 'Let Filter Render', { optDuration: Custom('1') });
  f.edge('d40002', 0, 'd40003', 0);

  f.node('d40004', 'Core.Browser.RunScript', 'Read Bill Count', {
    inPageId: Message('page'),
    func: `var el = document.querySelector('[data-testid="bills-count"]');
var txt = el ? el.innerText : '';
var m = txt.match(/(\\d+)/);
return m ? m[1] : '0';`,
    outResult: Message('bill_count')
  });
  f.edge('d40003', 0, 'd40004', 0);

  f.node('d40005', 'Core.Programming.Function', 'Record Count', {
    func: `msg.erp[msg.vendor] = parseInt(msg.bill_count, 10) || 0;
console.log('ERP ' + msg.vendor + ': ' + msg.erp[msg.vendor] + ' bills (portal ' + (msg.portal_counts[msg.vendor] || 0) + ')');
return msg;`
  });
  f.edge('d40004', 0, 'd40005', 0);

  f.node('d40006', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['d40000'], type: 'goto', all: false }
  });
  f.edge('d40005', 0, 'd40006', 0);

  // -------------------------------------------------------------- 3. reconcile & report
  f.node('e50001', 'Core.Trigger.Catch', 'Vendors Done', {
    optNodes: { type: 'catch', ids: ['d40001'], all: false }
  });

  f.node('e50002', 'Core.Programming.Function', 'Reconcile', {
    func: `var rows = [];
rows.push({ check: 'Received e-invoices reviewed', result: String(msg.received_total) });
rows.push({ check: 'Enrolled vendors reconciled', result: String(msg.enrolled.length) });
var missingPortal = [];
for (var i = 0; i < msg.enrolled.length; i++) {
  var name = msg.enrolled[i];
  var portal = msg.portal_counts[name] || 0;
  var erp = msg.erp[name] || 0;
  var gap = erp - portal;
  var note = gap > 0 ? (gap + ' MISSING IN PORTAL') : (gap < 0 ? (-gap + ' extra in portal') : 'reconciles');
  rows.push({ check: '  ' + name, result: erp + ' ERP bills vs ' + portal + ' e-invoices - ' + note });
  if (gap > 0) { missingPortal.push(name + ' (' + gap + ' bill' + (gap === 1 ? '' : 's') + ')'); }
}
var driftStr = msg.drift.map(function (d) { return d.id + ' ' + d.counterparty + ' ' + d.gross + ' (EUR0.02 over the ERP bill)'; }).join('; ');
var missErpStr = msg.missing_erp.map(function (m) { return m.id + ' ' + m.counterparty + ' ' + m.gross; }).join('; ');
rows.push({ check: 'Amount drift (portal vs ERP)', result: driftStr || 'none' });
rows.push({ check: 'Not found in ERP (portal-only e-invoice)', result: missErpStr || 'none' });
rows.push({ check: 'Missing in portal (ERP bill, no e-invoice)', result: missingPortal.join('; ') || 'none' });

if (msg.drift.length + msg.missing_erp.length + missingPortal.length === 0) {
  throw new Error('Reconciliation found no exceptions - did both systems load?');
}

msg.report_table = { columns: ['check', 'result'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Reconciled ' + msg.enrolled.length + ' vendors in ' + elapsed + 's');
console.log('  amount drift: ' + (driftStr || 'none'));
console.log('  not found in ERP: ' + (missErpStr || 'none'));
console.log('  missing in portal: ' + (missingPortal.join('; ') || 'none'));
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
