import { flow, Message, Custom, Credential } from '@robomotion/sdk';

const PORTAL_LOGIN = {
  vaultId: '9196d0c6-9495-410c-aa93-679c616cbc98',
  itemId: '6c8af1f0-ea7e-459c-a71c-c6c087fd4da5'
};

const LOGIN_URL = 'https://slugexpress.robomotion.online/portal/login';

const COLUMNS = "['tracking', 'reference', 'consignee', 'destination', 'service', 'weight', 'status', 'booked', 'billed']";

// Reads every row of the current page plus the pager state, so the flow knows
// whether another page is waiting. The Tracking cell can carry a trailing
// exception glyph, so it is split out before the value is stored.
const EXTRACT_PAGE = `
var COLS = ${COLUMNS};
var FLAG = String.fromCharCode(9873);
var rows = [];
var trs = document.querySelectorAll('main table tbody tr');
for (var i = 0; i < trs.length; i++) {
  var tds = trs[i].querySelectorAll('td');
  if (tds.length < COLS.length) continue;
  var row = {};
  for (var c = 0; c < COLS.length; c++) {
    row[COLS[c]] = tds[c].innerText.split(FLAG).join('').trim();
  }
  rows.push(row);
}
var page = 0;
var total = 0;
var ind = document.querySelector('span[data-testid="shipments-page"]');
if (ind) {
  var m = ind.innerText.match(/Page\\s+(\\d+)\\s+of\\s+(\\d+)/);
  if (m) { page = parseInt(m[1], 10); total = parseInt(m[2], 10); }
}
var next = document.querySelector('button[data-testid="shipments-next"]');
return JSON.stringify({
  rows: rows,
  page: page,
  total_pages: total,
  next_disabled: next ? !!next.disabled : true
});
`;

// A scripted click bypasses hit-testing, so the fixed demo-controls widget that
// overlaps the pager cannot swallow it.
const CLICK_NEXT = `
var next = document.querySelector('button[data-testid="shipments-next"]');
if (!next || next.disabled) { return 'no-next'; }
next.click();
return 'clicked';
`;

// Narrows the swept rows to the three statuses a manager chases, oldest booking
// first, with the billed euro string turned back into a number so the column can
// be summed or sorted in a spreadsheet.
const BUILD_EXCEPTIONS = `
var WATCHED = { 'Customs Hold': true, 'Failed Delivery': true, 'Delayed': true };

function amount(v) {
  var n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function pad(v) {
  v = String(v);
  return v.length < 2 ? '0' + v : v;
}

// Booked dates render as dd/mm/yyyy; key them as yyyy-mm-dd so a plain string
// compare puts the oldest booking first.
function bookedKey(v) {
  var p = String(v).split('/');
  if (p.length !== 3) { return ''; }
  return p[2] + '-' + pad(p[1]) + '-' + pad(p[0]);
}

function money(n) {
  var s = Math.abs(n).toFixed(2).split('.');
  var i = s[0].length - 3;
  while (i > 0) {
    s[0] = s[0].slice(0, i) + ',' + s[0].slice(i);
    i = i - 3;
  }
  return (n < 0 ? '-' : '') + s[0] + '.' + s[1];
}

var swept = msg.report.rows;
var rows = [];
var total = 0;
for (var i = 0; i < swept.length; i++) {
  var r = swept[i];
  if (!WATCHED[r.status]) { continue; }
  var billed = amount(r.billed);
  total = total + billed;
  rows.push({
    tracking: r.tracking,
    reference: r.reference,
    consignee: r.consignee,
    destination: r.destination,
    service: r.service,
    weight: r.weight,
    status: r.status,
    booked: r.booked,
    billed: billed
  });
}

rows.sort(function (a, b) {
  var ka = bookedKey(a.booked);
  var kb = bookedKey(b.booked);
  if (ka < kb) { return -1; }
  if (ka > kb) { return 1; }
  return 0;
});

msg.exceptions = { columns: msg.report.columns, rows: rows };
msg.exception_count = rows.length;
msg.exception_billed = Math.round(total * 100) / 100;
msg.summary = 'Swept ' + msg.row_count + ' shipments; ' + rows.length +
  ' exceptions (Customs Hold, Failed Delivery, Delayed) holding \\u20AC' +
  money(msg.exception_billed) + ' in billed charges.';
return msg;
`;

flow.create('2ac9d5c7-5213-4880-abe6-445de6851260', 'Shipment Status Report', (f) => {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Shipment Status Report\n\nSigns in to a carrier portal, sweeps every page of the shipments list, and writes two CSVs: the full book, and the exceptions somebody has to chase.\n\nCredentials come from the Robomotion Vault, never from the flow.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Sign in\n\nThe portal login is a plain email and password form. Both are read from a Vault item, so no credential is stored in the flow.\n\nAfter signing in the robot opens the Shipments list from the portal navigation and waits for the first row to render before it reads anything.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Sweep every page\n\nA Label and a GoTo make the page loop. Each turn extracts the rows of the current page along with the pager state, appends them to the report, and asks whether another page is waiting.\n\nWhen the Next control is disabled the loop leaves through the second output and the sweep is done. The click is scripted rather than hit-tested, because the demo-controls widget overlaps the pager.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. The exceptions\n\nThe full sweep is written first, then narrowed to the three statuses worth chasing: Customs Hold, Failed Delivery and Delayed.\n\nThe billed amount is turned back into a number so the column can be summed or sorted, and the rows are ordered oldest booking first.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Close out\n\nA Log line carries the totals: how many shipments were swept, how many need a human, and how much billed value is sitting in them. Then the browser closes.'
  });

  f.node('a1c001', 'Core.Trigger.Inject', 'Start', {})
    .then('b2d102', 'Core.Vault.GetItem', 'Get Portal Credentials', {
      optCredentials: Credential(PORTAL_LOGIN)
    })
    .then('c3e203', 'Core.Browser.Open', 'Open Browser', {})
    .then('d4f304', 'Core.Browser.OpenLink', 'Open Login Page', {
      inUrl: Custom(LOGIN_URL)
    })
    .then('e5a405', 'Core.Browser.TypeText', 'Enter Username', {
      inSelector: Custom("//form//input[@type='email']"),
      inText: Message('credentials.username')
    })
    .then('f6b506', 'Core.Browser.TypeText', 'Enter Password', {
      inSelector: Custom("//form//input[@type='password']"),
      inText: Message('credentials.password')
    })
    .then('07c607', 'Core.Browser.ClickElement', 'Sign In', {
      inSelector: Custom("//form//button[normalize-space()='Sign in']")
    })
    .then('18d708', 'Core.Browser.ClickElement', 'Open Shipments List', {
      inSelector: Custom("//nav[@aria-label='Portal']//a[normalize-space()='Shipments']"),
      optWaitTimeout: Custom('30')
    })
    .then('29e809', 'Core.Browser.WaitElement', 'Wait for Shipment Rows', {
      inSelector: Custom('(//main//table/tbody/tr)[1]')
    })
    .then('3a1b10', 'Core.Programming.Function', 'Init Report', {
      func: `
msg.report = { columns: ${COLUMNS}, rows: [] };
msg.pages_read = 0;
msg.row_count = 0;
return msg;
`
    })
    .then('4b2c11', 'Core.Flow.GoTo', 'Enter Page Loop', {
      optNodes: { ids: ['5c3d12'], type: 'goto', all: false }
    });

  f.node('5c3d12', 'Core.Flow.Label', 'Next Page', {})
    .then('3af90a', 'Core.Browser.RunScript', 'Extract Current Page', {
      func: EXTRACT_PAGE,
      outResult: Message('page_json')
    })
    .then('4b0a0b', 'Core.Programming.Function', 'Collect Page', {
      outputs: 2,
      func: `
var d = msg.page_json;
if (typeof d === 'string') { d = JSON.parse(d); }
delete msg.page_json;

msg.report.rows = msg.report.rows.concat(d.rows);
msg.pages_read = msg.pages_read + 1;
msg.total_pages = d.total_pages;
msg.row_count = msg.report.rows.length;

var cap = d.total_pages > 0 ? d.total_pages : 200;
if (d.next_disabled || msg.pages_read >= cap) {
  return [null, msg];
}

msg.next_page_xpath = "//span[@data-testid='shipments-page' and normalize-space()='Page " + (d.page + 1) + " of " + d.total_pages + "']";
return [msg, null];
`
    })
    .then('6e4f13', 'Core.Browser.RunScript', 'Click Next Page', {
      func: CLICK_NEXT,
      outResult: Message('next_click')
    })
    .then('7f5014', 'Core.Browser.WaitElement', 'Wait for Page Change', {
      inSelector: Message('next_page_xpath')
    })
    .then('806115', 'Core.Flow.GoTo', 'Continue Page Loop', {
      optNodes: { ids: ['5c3d12'], type: 'goto', all: false }
    });

  f.node('917216', 'Core.Programming.Function', 'Build Report Paths', {
    func: `
msg.report_dir = global.get('$Home$') + '/Reports';
msg.report_path = msg.report_dir + '/shipment-report.csv';
msg.exceptions_path = msg.report_dir + '/shipment-exceptions.csv';
return msg;
`
  })
    .then('a28317', 'Core.FileSystem.Create', 'Create Reports Folder', {
      inPath: Message('report_dir'),
      outPath: Message('report_dir_created'),
      optType: 'directory',
      continueOnError: true
    })
    .then('b39418', 'Core.CSV.WriteCSV', 'Write Shipment Report', {
      inTable: Message('report'),
      inFilePath: Message('report_path'),
      optHeaders: true
    })
    .then('c4a519', 'Core.Programming.Function', 'Build Exception Report', {
      func: BUILD_EXCEPTIONS
    })
    .then('d5b61a', 'Core.CSV.WriteCSV', 'Write Exception Report', {
      inTable: Message('exceptions'),
      inFilePath: Message('exceptions_path'),
      optHeaders: true
    });

  f.node('5c1b0c', 'Core.Programming.Debug', 'Show Row Count', {
    optDebugData: Message('row_count')
  });
  f.node('e6c71b', 'Core.Flow.Log', 'Log Summary', {
    inText: Message('summary')
  });
  f.node('6d2c0d', 'Core.Browser.Close', 'Close Browser', {});
  f.node('7e3d0e', 'Core.Flow.Stop', 'Stop', {});

  f.edge('4b0a0b', 1, '917216', 0);
  f.edge('b39418', 0, '5c1b0c', 0);
  f.edge('d5b61a', 0, 'e6c71b', 0);
  f.edge('d5b61a', 0, '6d2c0d', 0);
  f.edge('6d2c0d', 0, '7e3d0e', 0);
}).start();
