import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e06a7c0', 'E-Invoice Portal Harvest', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### E-Invoice Portal Harvest\n\nDownloads every e-invoice for a tax period from a government portal — the XML and the PDF for each one — and builds an index spreadsheet of what was collected.\n\nThe portal is built for a human: two-factor login, a paged result list, a confirmation dialog and an "I am not a robot" checkbox on every single download.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Two-factor sign in\n\nTax number and password, then a one-time code on a second screen. The company account lands straight on the dashboard; a representative account would have to pick a client first.\n\nThe browser is opened with a download directory, so every file the portal hands over lands somewhere the robot can find it.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Walk the result pages\n\nThe register pages ten records at a time. The robot scrapes a page, reads the pager to learn whether another one exists, clicks **Next** and goes round again.\n\nIt stops when the Next button reports itself disabled, rather than counting to a number somebody typed into the flow.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Harvest each invoice\n\nNothing here changes the portal, so the robot can jump straight to each document by URL instead of clicking back and forth.\n\nThe ETTN — the government\'s unique id for the document — is only shown on the detail page, which is the reason every invoice has to be opened at all.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Two downloads, four clicks each\n\nEvery download is gated: click the button, wait for the dialog, tick **I am not a robot**, then accept. The accept button stays disabled until the box is ticked.\n\nThe robot does this 192 times without complaining. The portal never notices.'
  });

  f.node('c00006', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 5. Index what was collected\n\nThe index CSV joins what the register listed (counterparty, date, gross) with what only the detail page knows (the ETTN).\n\nThe row count is checked against the number of records the portal itself reported, so a page silently missed is an error rather than a shorter spreadsheet.'
  });

  // ---------------------------------------------------------- 1. two-factor sign in
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://frs.robomotion.online';
// Downloads raise a toast: a fixed overlay that can swallow the next click. toast-kill
// turns them off for the session; chaos flags are parsed from the query string on load.
msg.chaos = '?chaos=toast-kill';
msg.login_url = msg.base_url + '/login' + msg.chaos;
msg.register_url = msg.base_url + '/einvoices' + msg.chaos;
// Published training credentials for a fictional government portal serving entirely
// synthetic data, including its static one-time code. Credentials for a real portal
// belong in the Robomotion Vault, never in a flow.
msg.tax_id = 'FD-380417225';
msg.password = 'FrsTraining2026!';
msg.otp = '550612';
msg.t0 = Date.now();
msg.download_dir = global.get('$TempDir$') + '/frs-einvoices-' + msg.t0;
msg.index_csv = global.get('$Home$') + '/einvoice-index.csv';
// 0 = every invoice in the register. Set a small number to smoke-test the mechanics.
msg.limit = 0;
msg.pages = [];
msg.harvested = [];
return msg;`
    })
    // Core.Browser.Open does not create optDownloadDir either. Make it first.
    .then('a10003', 'Core.FileSystem.Create', 'Make Download Dir', {
      inPath: Message('download_dir'),
      optType: 'directory',
      outPath: Message('download_dir_created')
    })
    .then('a10004', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'headlesschrome',
      optDownloadDir: Message('download_dir'),
      outBrowserId: Message('browser')
    })
    .then('a10005', 'Core.Browser.OpenLink', 'Open Login Page', {
      inBrowserId: Message('browser'),
      inUrl: Message('login_url'),
      outPageId: Message('page')
    })
    .then('a10006', 'Core.Browser.WaitElement', 'Wait For Login Form', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-taxid"]'),
      optTimeout: Custom('20')
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Tax Number', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-taxid"]'),
      inText: Message('tax_id'),
      optClearText: true
    })
    .then('a10008', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-password"]'),
      inText: Message('password'),
      optClearText: true
    })
    .then('a10009', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a1000a', 'Core.Browser.WaitElement', 'Wait For OTP Screen', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="otp-input"]'),
      optTimeout: Custom('20')
    })
    .then('a1000b', 'Core.Browser.TypeText', 'Type One Time Code', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="otp-input"]'),
      inText: Message('otp'),
      optClearText: true
    })
    .then('a1000c', 'Core.Browser.ClickElement', 'Submit Code', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="otp-submit"]')
    })
    // Land on the dashboard before navigating away. The session and the active company
    // are written to localStorage as the redirect happens; reload before that and the
    // portal bounces the robot back to the login screen.
    .then('a10011', 'Core.Browser.WaitElement', 'Wait For Dashboard', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="tile-einvoices"]'),
      optTimeout: Custom('20')
    })
    .then('a1000d', 'Core.Browser.OpenLink', 'Open Register', {
      inBrowserId: Message('browser'),
      inPageId: Message('page'),
      inUrl: Message('register_url'),
      optSameTab: true
    })
    .then('a1000e', 'Core.Browser.WaitElement', 'Wait For Register', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="einvoice-table"]'),
      optTimeout: Custom('20')
    })
    .then('a1000f', 'Core.Browser.ClickElement', 'Search All Periods', {
      inPageId: Message('page'),
      inSelector: Custom('//*[@data-testid="einvoice-search-submit"]')
    })
    .then('a10010', 'Core.Programming.Sleep', 'Let Results Render', {
      optDuration: Custom('1')
    });

  // -------------------------------------------------------- 2. walk the result pages
  f.node('b20000', 'Core.Flow.Label', 'Next Page', {});

  f.node('b20001', 'Core.Browser.RunScript', 'Scrape Page', {
    inPageId: Message('page'),
    func: `var rows = document.querySelectorAll('[data-testid="einvoice-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var r = rows[i];
  var tds = r.querySelectorAll('td');
  // The counterparty cell stacks the trading name over its tax id, and the status
  // cell stacks an exception chip under the status. Split, never let a newline into
  // a CSV field.
  var who = tds[2] ? tds[2].innerText.trim().split('\\n') : ['', ''];
  var st = tds[5] ? tds[5].innerText.trim().split('\\n') : ['', ''];
  out.push({
    document_id: r.getAttribute('data-id'),
    direction: tds[1] ? tds[1].innerText.trim() : '',
    counterparty: (who[0] || '').trim(),
    counterparty_tax_id: (who[1] || '').trim(),
    issue_date: tds[3] ? tds[3].innerText.trim() : '',
    gross: tds[4] ? tds[4].innerText.trim() : '',
    // The status cell stacks a seeded exception chip under the status on some rows.
    status: (st[0] || '').trim(),
    exception: (st[1] || '').replace(/^[^A-Za-z]+/, '').trim()
  });
}
var info = document.querySelector('[data-testid="pager-info"]');
var next = document.querySelector('[data-testid="pager-next"]');
return JSON.stringify({
  rows: out,
  info: info ? info.innerText.trim() : '',
  hasNext: next ? !next.disabled : false
});`,
    outResult: Message('page_json')
  });
  f.edge('a10010', 0, 'b20001', 0); // first pass enters the body directly
  f.edge('b20000', 0, 'b20001', 0); // later passes arrive via the label

  f.node('b20002', 'Core.Programming.Function', 'Collect Page', {
    func: `var data = JSON.parse(msg.page_json);
if (data.rows.length === 0) { throw new Error('Register page is empty - did the login succeed?'); }
for (var i = 0; i < data.rows.length; i++) { msg.pages.push(data.rows[i]); }

// "Page 1 of 10 - 96 records": the portal tells us how many there should be, so the
// final count can be checked against it rather than against a number we invented.
var mTotal = data.info.match(/(\\d+)\\s+record/);
if (mTotal) { msg.expected_total = parseInt(mTotal[1], 10); }
var mPage = data.info.match(/Page\\s+(\\d+)\\s+of\\s+(\\d+)/);
msg.page_no = mPage ? parseInt(mPage[1], 10) : 0;
msg.page_count = mPage ? parseInt(mPage[2], 10) : 0;

msg.more = data.hasNext === true;
console.log('Register page ' + msg.page_no + '/' + msg.page_count + ' - ' + msg.pages.length + ' rows so far');
return msg;`
  });
  f.edge('b20001', 0, 'b20002', 0);

  // Stop when the portal says there is no next page, not after a hardcoded 10.
  f.node('b20003', 'Core.Programming.Switch', 'Another Page?', {
    optUseBreak: true,
    optConditions: ['msg.more === true', 'true']
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Browser.ClickElement', 'Next Page', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="pager-next"]')
  });
  f.edge('b20003', 0, 'b20004', 0);

  f.node('b20005', 'Core.Programming.Sleep', 'Let Page Render', {
    optDuration: Custom('1')
  });
  f.edge('b20004', 0, 'b20005', 0);

  f.node('b20006', 'Core.Flow.GoTo', 'Scrape Next Page', {
    optNodes: { ids: ['b20000'], type: 'goto', all: false }
  });
  f.edge('b20005', 0, 'b20006', 0);

  // ------------------------------------------------------------ 3. queue the invoices
  f.node('c30001', 'Core.Programming.Function', 'Queue Invoices', {
    func: `var rows = msg.pages;
if (msg.expected_total && rows.length !== msg.expected_total) {
  throw new Error('Scraped ' + rows.length + ' rows but the portal reported ' + msg.expected_total);
}
msg.meta = {};
msg.invoices = [];
for (var i = 0; i < rows.length; i++) {
  msg.meta[rows[i].document_id] = rows[i];
  msg.invoices.push(rows[i].document_id);
}
if (msg.limit > 0) { msg.invoices = msg.invoices.slice(0, msg.limit); }
console.log('Harvesting ' + msg.invoices.length + ' of ' + rows.length + ' invoices across ' + msg.page_count + ' pages');
return msg;`
  });
  f.edge('b20003', 1, 'c30001', 0);

  f.node('c30002', 'Robomotion.MemoryQueue.Create', 'Create Invoice Queue', {
    optElements: Message('invoices'),
    outQueueID: Message('invoice_qid')
  });
  f.edge('c30001', 0, 'c30002', 0);

  // ----------------------------------------------------------- 4. harvest each invoice
  f.node('d40000', 'Core.Flow.Label', 'Next Invoice', {});

  f.node('d40001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Invoice', {
    inQueueID: Message('invoice_qid'),
    outElement: Message('doc')
  });
  f.edge('c30002', 0, 'd40001', 0);
  f.edge('d40000', 0, 'd40001', 0);

  f.node('d40002', 'Core.Programming.Function', 'Build Detail URL', {
    func: `msg.detail_url = msg.base_url + '/einvoices/' + msg.doc + msg.chaos;
return msg;`
  });
  f.edge('d40001', 0, 'd40002', 0);

  // The harvest only reads, so jumping straight to the document is safe. A flow that
  // changed portal state would have to click its way there instead.
  f.node('d40003', 'Core.Browser.OpenLink', 'Open Invoice', {
    inBrowserId: Message('browser'),
    inPageId: Message('page'),
    inUrl: Message('detail_url'),
    optSameTab: true
  });
  f.edge('d40002', 0, 'd40003', 0);

  f.node('d40004', 'Core.Browser.WaitElement', 'Wait For Invoice', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="download-xml"]'),
    optTimeout: Custom('20')
  });
  f.edge('d40003', 0, 'd40004', 0);

  // The ETTN is the government's unique id for the document. It exists only here.
  f.node('d40005', 'Core.Browser.RunScript', 'Read ETTN', {
    inPageId: Message('page'),
    func: `var m = document.body.innerText.match(/ETTN\\s+([0-9a-fA-F-]{36})/);
return m ? m[1] : '';`,
    outResult: Message('ettn')
  });
  f.edge('d40004', 0, 'd40005', 0);

  // --- XML: click, dialog, tick the box, accept.
  f.node('d40006', 'Core.Browser.ClickElement', 'Download XML', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="download-xml"]')
  });
  f.edge('d40005', 0, 'd40006', 0);

  f.node('d40007', 'Core.Browser.WaitElement', 'Wait For XML Dialog', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="confirm-dialog"]'),
    optTimeout: Custom('20')
  });
  f.edge('d40006', 0, 'd40007', 0);

  f.node('d40008', 'Core.Browser.ClickElement', 'I Am Not A Robot', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="not-a-robot-checkbox"]')
  });
  f.edge('d40007', 0, 'd40008', 0);

  // Accept stays disabled until the box is ticked, so this click proves the tick landed.
  f.node('d40009', 'Core.Browser.ClickElement', 'Accept XML Download', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="confirm-accept"]')
  });
  f.edge('d40008', 0, 'd40009', 0);

  // --- PDF: the same four clicks again.
  f.node('d4000a', 'Core.Browser.ClickElement', 'Download PDF', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="download-pdf"]')
  });
  f.edge('d40009', 0, 'd4000a', 0);

  f.node('d4000b', 'Core.Browser.WaitElement', 'Wait For PDF Dialog', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="confirm-dialog"]'),
    optTimeout: Custom('20')
  });
  f.edge('d4000a', 0, 'd4000b', 0);

  f.node('d4000c', 'Core.Browser.ClickElement', 'I Am Not A Robot Again', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="not-a-robot-checkbox"]')
  });
  f.edge('d4000b', 0, 'd4000c', 0);

  f.node('d4000d', 'Core.Browser.ClickElement', 'Accept PDF Download', {
    inPageId: Message('page'),
    inSelector: Custom('//*[@data-testid="confirm-accept"]')
  });
  f.edge('d4000c', 0, 'd4000d', 0);

  f.node('d4000e', 'Core.Programming.Function', 'Record Invoice', {
    func: `var m = msg.meta[msg.doc] || {};
var ettn = String(msg.ettn).trim();
if (!ettn) { throw new Error('No ETTN found on the detail page for ' + msg.doc); }
msg.harvested.push({
  document_id: msg.doc,
  direction: m.direction || '',
  counterparty: m.counterparty || '',
  counterparty_tax_id: m.counterparty_tax_id || '',
  issue_date: m.issue_date || '',
  gross: m.gross || '',
  status: m.status || '',
  exception: m.exception || '',
  ettn: ettn
});
return msg;`
  });
  f.edge('d4000d', 0, 'd4000e', 0);

  f.node('d4000f', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['d40000'], type: 'goto', all: false }
  });
  f.edge('d4000e', 0, 'd4000f', 0);

  // ------------------------------------------------------------ 5. index what we got
  f.node('e50001', 'Core.Trigger.Catch', 'Queue Empty', {
    optNodes: { type: 'catch', ids: ['d40001'], all: false }
  });

  f.node('e50002', 'Core.Programming.Function', 'Build Index', {
    func: `var rows = msg.harvested;
rows.sort(function (a, b) { return a.document_id < b.document_id ? -1 : a.document_id > b.document_id ? 1 : 0; });

var seen = {};
for (var i = 0; i < rows.length; i++) {
  if (seen[rows[i].ettn]) { throw new Error('Duplicate ETTN ' + rows[i].ettn); }
  seen[rows[i].ettn] = true;
}

var inbound = 0;
var outbound = 0;
for (var j = 0; j < rows.length; j++) {
  if (rows[j].direction.toLowerCase().indexOf('receiv') >= 0) { inbound++; } else { outbound++; }
}

msg.index_table = {
  columns: ['document_id', 'direction', 'counterparty', 'counterparty_tax_id', 'issue_date', 'gross', 'status', 'exception', 'ettn'],
  rows: rows
};

var elapsed = Math.round((Date.now() - msg.t0) / 1000);
var flagged = [];
for (var k = 0; k < rows.length; k++) { if (rows[k].exception) { flagged.push(rows[k].document_id + ' ' + rows[k].exception); } }
console.log('Harvested ' + rows.length + ' invoices (' + inbound + ' received, ' + outbound + ' issued) in ' + elapsed + 's');
console.log('The portal flagged ' + flagged.length + ': ' + flagged.join('; '));
console.log('Downloaded ' + (rows.length * 2) + ' files to ' + msg.download_dir);
return msg;`
  });
  f.edge('e50001', 0, 'e50002', 0);

  f.node('e50003', 'Core.CSV.WriteCSV', 'Write Index CSV', {
    inFilePath: Message('index_csv'),
    inTable: Message('index_table'),
    optEncoding: 'utf8',
    optSeparator: 'comma',
    optHeaders: true
  });
  f.edge('e50002', 0, 'e50003', 0);

  f.node('e50004', 'Core.Browser.Close', 'Close Browser', {
    inBrowserId: Message('browser')
  });
  f.edge('e50003', 0, 'e50004', 0);

  f.node('e50005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('e50004', 0, 'e50005', 0);
}).start();
