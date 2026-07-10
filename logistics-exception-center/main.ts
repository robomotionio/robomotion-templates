import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('f10e5a6', 'Logistics Exception Center', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Logistics Exception Center\n\nBuilds one worklist of every active delivery exception from the carrier, then dedupes it against the systems that may already be handling it: the mailbox that was notified, and the help desk where a ticket may already exist. The output is the gap - the exceptions nobody has picked up yet.\n\nWrites logistics-exceptions.csv. The story is consolidation: three systems each hold part of the picture, and the robot joins them so a stuck shipment is neither missed nor double-worked.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. The carrier\'s exception worklist\n\nSign in to the carrier portal and open the exception worklist - every shipment on customs hold, failed delivery or delay. Read the tracking number, consignee, destination and status for each. This is the master list everything else is checked against.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Who already knows\n\nTwo more systems hold part of the story. The mailbox received delivery-exception notifications - read which tracking numbers were mailed. The help desk may already have a ticket - filter to delivery tickets and read the tracking number each is linked to. Each is an independent source.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Dedupe & report\n\nJoin the three sets on the tracking number. For every exception the robot marks whether it was mailed and whether a ticket already exists. The ones with no ticket are the real work - flagged as NEEDS TICKET - while the ones already in the help desk are left alone. All of it lands in one CSV.'
  });

  // ------------------------------------------------ 1. the carrier's exception worklist
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.slug_login = 'https://slugexpress.robomotion.online/portal/login';
msg.lookout_login = 'https://lookout.robomotion.online/login';
msg.gd_url = 'https://grumpdesk.robomotion.online';
msg.gd_login = msg.gd_url + '/login';
msg.gd_tickets = msg.gd_url + '/tickets?view=all';
// Published training credentials for three fictional systems (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.slug_email = 'svc.rpa@slugexpress.example';
msg.slug_pw = 'SlugTraining2026!';
msg.lookout_email = 'hiroshi.tanaka@globex.example';
msg.lookout_pw = 'LookoutTraining2026!';
msg.gd_email = 'svc.rpa@grumpdesk.example';
msg.gd_pw = 'GrumpTraining2026!';
msg.csv = global.get('$Home$') + '/logistics-exceptions.csv';
msg.t0 = Date.now();
msg.ticketed = [];
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'headlesschrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Carrier Login', {
      inBrowserId: Message('browser'), inUrl: Message('slug_login'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait Carrier Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="portal-login-email"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Carrier Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="portal-login-email"]'), inText: Message('slug_email'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Carrier Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="portal-login-password"]'), inText: Message('slug_pw'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Carrier Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Portal', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="exceptions-tab"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.ClickElement', 'Open Exceptions', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="exceptions-tab"]')
    })
    .then('a1000b', 'Core.Browser.WaitElement', 'Wait Worklist', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="exceptions-table"]'), optTimeout: Custom('20')
    })
    .then('a1000c', 'Core.Programming.Sleep', 'Let Worklist Render', { optDuration: Custom('1') })
    .then('a1000d', 'Core.Browser.RunScript', 'Read Exceptions', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="exception-row"]');
var out = [];
for (var i = 0; i < rows.length; i++) {
  var tds = rows[i].querySelectorAll('td');
  out.push({
    id: rows[i].getAttribute('data-id'),
    consignee: tds[1] ? tds[1].innerText.trim() : '',
    dest: tds[2] ? tds[2].innerText.trim() : '',
    status: tds[3] ? tds[3].innerText.trim() : ''
  });
}
return JSON.stringify(out);`,
      outResult: Message('exc_json')
    })
    .then('a1000e', 'Core.Programming.Function', 'Collect Exceptions', {
      func: `msg.exceptions = JSON.parse(msg.exc_json);
if (msg.exceptions.length === 0) { throw new Error('no active exceptions found in the carrier worklist'); }
console.log('Carrier worklist: ' + msg.exceptions.length + ' active exceptions');
return msg;`
    })
    // ------------------------------------------------------- 2a. who was mailed (Lookout)
    .then('a1000f', 'Core.Browser.OpenLink', 'Open Mailbox Login', {
      inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('lookout_login'), optSameTab: true
    })
    .then('a10010', 'Core.Browser.WaitElement', 'Wait Mailbox Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a10011', 'Core.Browser.TypeText', 'Mailbox Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('lookout_email'), optClearText: true
    })
    .then('a10012', 'Core.Browser.TypeText', 'Mailbox Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('lookout_pw'), optClearText: true
    })
    .then('a10013', 'Core.Browser.ClickElement', 'Mailbox Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10014', 'Core.Browser.WaitElement', 'Wait Inbox', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="message-list"]'), optTimeout: Custom('20')
    })
    .then('a10015', 'Core.Programming.Sleep', 'Let Inbox Render', { optDuration: Custom('1') })
    .then('a10016', 'Core.Browser.RunScript', 'Read Notified', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="msg-row"]');
var ids = [];
for (var i = 0; i < rows.length; i++) {
  var subj = rows[i].querySelector('[data-testid="msg-subject"]');
  var t = subj ? subj.innerText : '';
  var m = t.match(/SLUG-\\d+-[A-Z]{2}/);
  if (t.indexOf('Delivery exception') >= 0 && m) { ids.push(m[0]); }
}
return JSON.stringify(ids);`,
      outResult: Message('mailed_json')
    })
    .then('a10017', 'Core.Programming.Function', 'Collect Notified', {
      func: `msg.mailed = JSON.parse(msg.mailed_json);
console.log('Mailbox notified for ' + msg.mailed.length + ' tracking numbers');
return msg;`
    });

  // --------------------------------------------------- 2b. who is ticketed (Grumpdesk)
  f.node('c30001', 'Core.Browser.OpenLink', 'Open Helpdesk Login', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('gd_login'), optSameTab: true
  });
  f.edge('a10017', 0, 'c30001', 0);

  f.node('c30002', 'Core.Browser.WaitElement', 'Wait Helpdesk Login', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.TypeText', 'Helpdesk Email', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('gd_email'), optClearText: true
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Browser.TypeText', 'Helpdesk Password', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('gd_pw'), optClearText: true
  });
  f.edge('c30003', 0, 'c30004', 0);

  f.node('c30005', 'Core.Browser.ClickElement', 'Helpdesk Sign In', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
  });
  f.edge('c30004', 0, 'c30005', 0);

  f.node('c30006', 'Core.Browser.OpenLink', 'Open Tickets', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('gd_tickets'), optSameTab: true
  });
  f.edge('c30005', 0, 'c30006', 0);

  f.node('c30007', 'Core.Browser.WaitElement', 'Wait Tickets', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ticket-table"]'), optTimeout: Custom('20')
  });
  f.edge('c30006', 0, 'c30007', 0);

  f.node('c30008', 'Core.Browser.TypeText', 'Filter Escalations', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ticket-filter"]'), inText: Custom('customs'), optClearText: true
  });
  f.edge('c30007', 0, 'c30008', 0);

  f.node('c30009', 'Core.Programming.Sleep', 'Let Filter Render', { optDuration: Custom('1') });
  f.edge('c30008', 0, 'c30009', 0);

  f.node('c3000a', 'Core.Browser.RunScript', 'Read Delivery Tickets', {
    inPageId: Message('page'),
    func: `var rows = document.querySelectorAll('[data-testid="ticket-row"]');
var ids = [];
for (var i = 0; i < rows.length; i++) { ids.push(rows[i].getAttribute('data-id')); }
return JSON.stringify(ids);`,
    outResult: Message('tickets_json')
  });
  f.edge('c30009', 0, 'c3000a', 0);

  f.node('c3000b', 'Core.Programming.Function', 'Collect Tickets', {
    func: `msg.gd_ticket_ids = JSON.parse(msg.tickets_json);
console.log('Delivery tickets to inspect: ' + msg.gd_ticket_ids.length);
return msg;`
  });
  f.edge('c3000a', 0, 'c3000b', 0);

  f.node('c3000c', 'Robomotion.MemoryQueue.Create', 'Create Ticket Queue', {
    optElements: Message('gd_ticket_ids'), outQueueID: Message('tk_qid')
  });
  f.edge('c3000b', 0, 'c3000c', 0);

  // open each delivery ticket, read the tracking number it is linked to
  f.node('d40000', 'Core.Flow.Label', 'Next Ticket', {});

  f.node('d40001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Ticket', {
    inQueueID: Message('tk_qid'), outElement: Message('tkid')
  });
  f.edge('c3000c', 0, 'd40001', 0);
  f.edge('d40000', 0, 'd40001', 0);

  f.node('d40002', 'Core.Programming.Function', 'Build Ticket URL', {
    func: `msg.tk_url = msg.gd_url + '/tickets/' + msg.tkid;
return msg;`
  });
  f.edge('d40001', 0, 'd40002', 0);

  f.node('d40003', 'Core.Browser.OpenLink', 'Open Ticket', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('tk_url'), optSameTab: true
  });
  f.edge('d40002', 0, 'd40003', 0);

  f.node('d40004', 'Core.Browser.WaitElement', 'Wait Ticket', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ref-tracking"]'), optTimeout: Custom('20')
  });
  f.edge('d40003', 0, 'd40004', 0);

  f.node('d40005', 'Core.Programming.Sleep', 'Let Ticket Render', { optDuration: Custom('1') });
  f.edge('d40004', 0, 'd40005', 0);

  f.node('d40006', 'Core.Browser.GetValue', 'Read Linked Tracking', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ref-tracking"]'), outValue: Message('tk_track')
  });
  f.edge('d40005', 0, 'd40006', 0);

  f.node('d40007', 'Core.Programming.Function', 'Record Ticketed', {
    func: `var t = String(msg.tk_track || '').trim();
if (/SLUG-\\d+-[A-Z]{2}/.test(t)) { msg.ticketed.push(t); console.log('  ticket ' + msg.tkid + ' -> ' + t); }
return msg;`
  });
  f.edge('d40006', 0, 'd40007', 0);

  f.node('d40008', 'Core.Flow.GoTo', 'Ticket Next', {
    optNodes: { ids: ['d40000'], type: 'goto', all: false }
  });
  f.edge('d40007', 0, 'd40008', 0);

  // ------------------------------------------------------------------- 3. dedupe & report
  f.node('e50001', 'Core.Trigger.Catch', 'Tickets Done', {
    optNodes: { type: 'catch', ids: ['d40001'], all: false }
  });

  f.node('e50002', 'Core.Programming.Function', 'Reconcile', {
    func: `function clean(s) { return String(s == null ? '' : s).replace(/,/g, ' ').replace(/[^A-Za-z0-9 .:_\\/-]/g, '').replace(/\\s+/g, ' ').trim(); }
var mailed = {};
for (var i = 0; i < msg.mailed.length; i++) { mailed[msg.mailed[i]] = true; }
var ticketed = {};
for (var j = 0; j < msg.ticketed.length; j++) { ticketed[msg.ticketed[j]] = true; }
var rows = [];
var nMailed = 0, nTicketed = 0, nNeed = 0;
for (var k = 0; k < msg.exceptions.length; k++) {
  var e = msg.exceptions[k];
  var m = mailed[e.id] ? 'yes' : '';
  var tk = ticketed[e.id] ? 'yes' : '';
  if (m) { nMailed++; }
  if (tk) { nTicketed++; } else { nNeed++; }
  rows.push({ tracking: clean(e.id), status: clean(e.status), mailed: m, ticketed: tk, action: tk ? 'has ticket' : 'NEEDS TICKET' });
}
var summary = { tracking: 'SUMMARY', status: String(msg.exceptions.length) + ' active exceptions', mailed: String(nMailed) + ' mailed', ticketed: String(nTicketed) + ' ticketed', action: nNeed + ' need a ticket' };
var table = [summary];
for (var z = 0; z < rows.length; z++) { table.push(rows[z]); }
msg.report_table = { columns: ['tracking', 'status', 'mailed', 'ticketed', 'action'], rows: table };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Exception center in ' + elapsed + 's: ' + msg.exceptions.length + ' exceptions, ' + nMailed + ' mailed, ' + nTicketed + ' ticketed, ' + nNeed + ' need a ticket');
// The raw scrape strings carry non-ASCII (accented consignee/city names) that can
// break the message on serialize; drop them now that the report is built and clean.
delete msg.exc_json; delete msg.mailed_json; delete msg.tickets_json;
delete msg.exceptions; delete msg.mailed; delete msg.ticketed; delete msg.gd_ticket_ids;
delete msg.tk_track; delete msg.tk_url; delete msg.tkid;
delete msg.slug_login; delete msg.lookout_login; delete msg.gd_login; delete msg.gd_tickets; delete msg.gd_url;
delete msg.slug_email; delete msg.slug_pw; delete msg.lookout_email; delete msg.lookout_pw; delete msg.gd_email; delete msg.gd_pw;
delete msg.t0;
return msg;`
  });
  f.edge('e50001', 0, 'e50002', 0);

  f.node('e50003', 'Core.CSV.WriteCSV', 'Write Exception CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('e50002', 0, 'e50003', 0);

  f.node('e50004', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('e50003', 0, 'e50004', 0);

  f.node('e50005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('e50004', 0, 'e50005', 0);
}).start();
