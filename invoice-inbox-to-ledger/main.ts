import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('f01d9e3', 'Invoice Inbox to Ledger', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Invoice Inbox to Ledger\n\nReads vendor-invoice e-mails out of the mailbox and posts each one as a bill in the ERP. It handles the two things that go wrong in the middle of a batch: an invoice that has already been booked (a duplicate, skipped rather than paid twice) and one whose amount does not match its purchase order (blocked by the ERP\'s 3-way match).\n\nWrites invoice-posting.csv. The story is straight-through processing with judgment: the clean invoices post themselves, and the two that should not go through are caught and reported.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Read the invoices\n\nSign in to the mailbox and find the vendor-invoice e-mails in the inbox. Open each one and read the vendor, the reference, the gross amount and any purchase-order number straight out of the message. The net is derived from the gross at the standard 19% rate - the figure the ERP wants keyed in.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Post each bill\n\nSign in to the ERP and, for every invoice, open a new bill: pick the vendor from the typeahead, key the reference, net and purchase-order link, and save. The ERP runs a live 3-way match against the PO and a duplicate check against the reference - the two controls the robot has to answer for.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Handle the controls & report\n\nWhen the ERP raises the duplicate dialog, the robot cancels rather than posting a second copy. When the 3-way match blocks a bill on a price mismatch, it posts but is flagged. Everything else posts clean. The outcome of all twelve - posted, blocked or skipped - lands in one CSV.'
  });

  // -------------------------------------------------------------- 1. read the invoices
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.lookout_url = 'https://lookout.robomotion.online/login';
msg.rap_login = 'https://rapone.robomotion.online/login';
// Published training credentials for two fictional systems (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.lookout_email = 'hiroshi.tanaka@globex.example';
msg.lookout_password = 'LookoutTraining2026!';
msg.rap_user = 'HTANAKA';
msg.rap_password = 'RapTraining2026!';
msg.rap_client = '100';
msg.csv = global.get('$Home$') + '/invoice-posting.csv';
msg.t0 = Date.now();
msg.invoices = [];
msg.results = [];
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'headlesschrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Mailbox', {
      inBrowserId: Message('browser'), inUrl: Message('lookout_url'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait Login Form', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('lookout_email'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('lookout_password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Inbox', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="message-list"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.RunScript', 'Find Invoice Mails', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="msg-row"]');
var ids = [];
for (var i = 0; i < rows.length; i++) {
  var subj = rows[i].querySelector('[data-testid="msg-subject"]');
  var t = subj ? subj.innerText.trim() : '';
  if (t.indexOf('Invoice ') === 0 && t.indexOf(' from ') > 0) { ids.push(rows[i].getAttribute('data-id')); }
}
return JSON.stringify(ids);`,
      outResult: Message('inv_ids_json')
    })
    .then('a1000b', 'Core.Programming.Function', 'Parse Ids', {
      func: `msg.inv_ids = JSON.parse(msg.inv_ids_json);
if (msg.inv_ids.length === 0) { throw new Error('no invoice e-mails found in the inbox'); }
console.log('Found ' + msg.inv_ids.length + ' invoice e-mails');
return msg;`
    })
    .then('a1000c', 'Robomotion.MemoryQueue.Create', 'Create Scan Queue', {
      optElements: Message('inv_ids'), outQueueID: Message('scan_qid')
    });

  // scrape loop: open each invoice mail, read vendor / ref / gross / po
  f.node('b20000', 'Core.Flow.Label', 'Next Mail', {});

  f.node('b20001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Mail', {
    inQueueID: Message('scan_qid'), outElement: Message('mail_id')
  });
  f.edge('a1000c', 0, 'b20001', 0);
  f.edge('b20000', 0, 'b20001', 0);

  f.node('b20002', 'Core.Programming.Function', 'Build Row Selector', {
    func: `msg.row_xpath = '//*[@data-testid="msg-row" and @data-id="' + msg.mail_id + '"]';
return msg;`
  });
  f.edge('b20001', 0, 'b20002', 0);

  f.node('b20003', 'Core.Browser.ClickElement', 'Open Mail', {
    inPageId: Message('page'), inSelector: Message('row_xpath')
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Browser.WaitElement', 'Wait Reading Pane', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="reading-body"]'), optTimeout: Custom('20')
  });
  f.edge('b20003', 0, 'b20004', 0);

  f.node('b20005', 'Core.Programming.Sleep', 'Let Mail Render', { optDuration: Custom('1') });
  f.edge('b20004', 0, 'b20005', 0);

  f.node('b20006', 'Core.Browser.RunScript', 'Read Invoice', {
    inPageId: Message('page'),
    func: `var el = document.querySelector('[data-testid="reading-body"]');
var body = el ? el.innerText : '';
function between(a, b) { var i = body.indexOf(a); if (i < 0) return ''; i += a.length; var j = b ? body.indexOf(b, i) : -1; return (j < 0 ? body.slice(i) : body.slice(i, j)).trim(); }
var ref = between('invoice ', ' for the amount');
var gross = between('amount of ', ' EUR');
var po = body.indexOf('purchase order ') >= 0 ? between('purchase order ', '.') : '';
var fromEl = document.querySelector('[data-testid="reading-from-name"]');
var vendor = fromEl ? fromEl.innerText.trim() : '';
return JSON.stringify({ ref: ref, gross: gross, po: po, vendor: vendor });`,
    outResult: Message('inv_json')
  });
  f.edge('b20005', 0, 'b20006', 0);

  f.node('b20007', 'Core.Programming.Function', 'Record Invoice', {
    func: `var v = JSON.parse(msg.inv_json);
var gross = parseFloat(String(v.gross).replace(/,/g, ''));
if (!v.ref || !(gross > 0)) { throw new Error('could not read the invoice (ref/amount) from ' + msg.mail_id); }
var net = Math.round((gross / 1.19) * 100) / 100;
msg.invoices.push({ vendor: v.vendor, ref: v.ref, gross: gross, net: String(net), po: v.po || '' });
console.log('  read ' + v.ref + ' ' + v.vendor + ' gross ' + gross + (v.po ? (' PO ' + v.po) : ''));
return msg;`
  });
  f.edge('b20006', 0, 'b20007', 0);

  f.node('b20008', 'Core.Flow.GoTo', 'Scan Next', {
    optNodes: { ids: ['b20000'], type: 'goto', all: false }
  });
  f.edge('b20007', 0, 'b20008', 0);

  // -------------------------------------------------------------- 2. post each bill
  f.node('c30001', 'Core.Trigger.Catch', 'Scan Done', {
    optNodes: { type: 'catch', ids: ['b20001'], all: false }
  });

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

  f.node('c30009', 'Robomotion.MemoryQueue.Create', 'Create Post Queue', {
    optElements: Message('invoices'), outQueueID: Message('post_qid')
  });
  f.edge('c30008', 0, 'c30009', 0);

  // post loop
  f.node('d40000', 'Core.Flow.Label', 'Next Post', {});

  f.node('d40001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Invoice', {
    inQueueID: Message('post_qid'), outElement: Message('inv')
  });
  f.edge('c30009', 0, 'd40001', 0);
  f.edge('d40000', 0, 'd40001', 0);

  f.node('d40002', 'Core.Browser.ClickElement', 'Open AP Bills', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-ap-bills"]')
  });
  f.edge('d40001', 0, 'd40002', 0);

  f.node('d40003', 'Core.Browser.WaitElement', 'Wait Worklist', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bill-new"]'), optTimeout: Custom('20')
  });
  f.edge('d40002', 0, 'd40003', 0);

  f.node('d40004', 'Core.Browser.ClickElement', 'New Bill', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bill-new"]')
  });
  f.edge('d40003', 0, 'd40004', 0);

  f.node('d40005', 'Core.Browser.WaitElement', 'Wait Form', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-typeahead"]'), optTimeout: Custom('20')
  });
  f.edge('d40004', 0, 'd40005', 0);

  f.node('d40006', 'Core.Programming.Function', 'Set Fields', {
    func: `msg.vendor = msg.inv.vendor;
msg.ref = msg.inv.ref;
msg.net = msg.inv.net;
msg.po = msg.inv.po;
msg.has_po = msg.inv.po ? '1' : '0';
return msg;`
  });
  f.edge('d40005', 0, 'd40006', 0);

  f.node('d40007', 'Core.Browser.TypeText', 'Type Vendor', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-typeahead"]'), inText: Message('vendor'), optClearText: true
  });
  f.edge('d40006', 0, 'd40007', 0);

  f.node('d40008', 'Core.Programming.Sleep', 'Let Options Render', { optDuration: Custom('1') });
  f.edge('d40007', 0, 'd40008', 0);

  f.node('d40009', 'Core.Browser.ClickElement', 'Pick Vendor', {
    inPageId: Message('page'), inSelector: Custom('(//*[@data-testid="vendor-option"])[1]')
  });
  f.edge('d40008', 0, 'd40009', 0);

  f.node('d4000a', 'Core.Browser.TypeText', 'Type Reference', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendorref-input"]'), inText: Message('ref'), optClearText: true
  });
  f.edge('d40009', 0, 'd4000a', 0);

  f.node('d4000b', 'Core.Browser.TypeText', 'Type Net', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="net-input"]'), inText: Message('net'), optClearText: true
  });
  f.edge('d4000a', 0, 'd4000b', 0);

  f.node('d4000c', 'Core.Programming.Switch', 'Has PO?', {
    optUseBreak: true,
    optConditions: ['msg.has_po === "1"', 'true']
  });
  f.edge('d4000b', 0, 'd4000c', 0);

  f.node('d4000d', 'Core.Browser.TypeText', 'Type PO Link', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="po-link-input"]'), inText: Message('po'), optClearText: true
  });
  f.edge('d4000c', 0, 'd4000d', 0);

  f.node('d4000e', 'Core.Browser.ClickElement', 'Save Bill', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="save-button"]')
  });
  f.edge('d4000d', 0, 'd4000e', 0);
  f.edge('d4000c', 1, 'd4000e', 0);

  f.node('d4000f', 'Core.Programming.Sleep', 'Let Save Settle', { optDuration: Custom('1') });
  f.edge('d4000e', 0, 'd4000f', 0);

  f.node('d40010', 'Core.Browser.RunScript', 'Check Result', {
    inPageId: Message('page'),
    func: `var dup = document.querySelector('[data-testid="dup-modal"]');
if (dup) { return JSON.stringify({ result: 'dup', bill_id: '', status: '' }); }
var sb = document.querySelector('[data-testid="statusbar-message"]');
var full = sb ? sb.innerText : '';
var i = full.indexOf('Document ');
var id = '';
if (i >= 0) { var rest = full.slice(i + 9); id = rest.split(' ')[0]; }
var status = document.body.innerText.indexOf('Blocked') >= 0 ? 'Blocked' : 'Posted';
return JSON.stringify({ result: 'posted', bill_id: id, status: status });`,
    outResult: Message('check_json')
  });
  f.edge('d4000f', 0, 'd40010', 0);

  f.node('d40011', 'Core.Programming.Function', 'Classify', {
    func: `var c = JSON.parse(msg.check_json);
msg.post_result = c.result;
msg.bill_id = c.bill_id;
msg.bill_status = c.status;
return msg;`
  });
  f.edge('d40010', 0, 'd40011', 0);

  f.node('d40012', 'Core.Programming.Switch', 'Duplicate?', {
    optUseBreak: true,
    optConditions: ['msg.post_result === "dup"', 'true']
  });
  f.edge('d40011', 0, 'd40012', 0);

  f.node('d40013', 'Core.Browser.ClickElement', 'Cancel Duplicate', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="dup-cancel"]')
  });
  f.edge('d40012', 0, 'd40013', 0);

  f.node('d40014', 'Core.Programming.Function', 'Record Skipped', {
    func: `msg.results.push({ ref: msg.inv.ref, vendor: msg.inv.vendor, gross: String(msg.inv.gross), outcome: 'DUPLICATE - skipped', bill: '' });
console.log('  ' + msg.inv.ref + ' is a duplicate - skipped');
return msg;`
  });
  f.edge('d40013', 0, 'd40014', 0);

  f.node('d40015', 'Core.Programming.Function', 'Record Posted', {
    func: `var out = msg.bill_status === 'Blocked' ? 'BLOCKED - 3-way match failed' : 'posted';
msg.results.push({ ref: msg.inv.ref, vendor: msg.inv.vendor, gross: String(msg.inv.gross), outcome: out, bill: msg.bill_id });
console.log('  ' + msg.inv.ref + ' -> ' + msg.bill_id + ' (' + out + ')');
return msg;`
  });
  f.edge('d40012', 1, 'd40015', 0);

  f.node('d40016', 'Core.Flow.GoTo', 'Post Next', {
    optNodes: { ids: ['d40000'], type: 'goto', all: false }
  });
  f.edge('d40014', 0, 'd40016', 0);
  f.edge('d40015', 0, 'd40016', 0);

  // -------------------------------------------------------------- 3. report
  f.node('e50001', 'Core.Trigger.Catch', 'Posts Done', {
    optNodes: { type: 'catch', ids: ['d40001'], all: false }
  });

  f.node('e50002', 'Core.Programming.Function', 'Build Report', {
    func: `var rows = msg.results;
var posted = 0, blocked = 0, skipped = 0;
for (var i = 0; i < rows.length; i++) {
  if (rows[i].outcome.indexOf('DUPLICATE') === 0) { skipped++; }
  else if (rows[i].outcome.indexOf('BLOCKED') === 0) { blocked++; }
  else { posted++; }
}
var table = [{ ref: 'SUMMARY', vendor: rows.length + ' invoices', gross: '', outcome: posted + ' posted, ' + blocked + ' blocked, ' + skipped + ' skipped', bill: '' }];
for (var j = 0; j < rows.length; j++) { table.push(rows[j]); }
msg.report_table = { columns: ['ref', 'vendor', 'gross', 'outcome', 'bill'], rows: table };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Posted ' + posted + ' of ' + rows.length + ' invoices in ' + elapsed + 's (' + blocked + ' blocked, ' + skipped + ' skipped)');
return msg;`
  });
  f.edge('e50001', 0, 'e50002', 0);

  f.node('e50003', 'Core.CSV.WriteCSV', 'Write Posting CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('e50002', 0, 'e50003', 0);

  f.node('e50004', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('e50003', 0, 'e50004', 0);

  f.node('e50005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('e50004', 0, 'e50005', 0);
}).start();
