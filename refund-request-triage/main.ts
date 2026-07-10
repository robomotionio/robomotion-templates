import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e09a7c0', 'Refund Request Triage', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Refund Request Triage\n\nVerifies refund requests against the bank before approving them. For each refund ticket the robot checks the actual bank record: was the customer really charged twice?\n\nApproves the genuine duplicates, escalates the rest to a human with evidence. Writes refund-decisions.csv to your home folder.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Scan the bank first\n\nOne trip to AcmeBank: sign in through two-factor, open the operating account and pull every shipment charge in one search.\n\nGrouping them by reference gives a map of how many times each charge appears. Two or more under one reference is a genuine duplicate; one is a single charge.\n\nDoing this once, up front, means the robot never has to swivel back to the bank per ticket.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Read the refund queue\n\nSign in to Grumpdesk and open the **All** view (the refund tickets are assigned, so they are not in the default Unassigned view). Filtering by the `refund` tag narrows the list to the requests that need a decision.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Decide each ticket against the bank\n\nOpen each ticket, read the bank reference the customer is disputing, and look it up in the map built from AcmeBank.\n\nThe robot forms its **own** verdict from the bank record rather than trusting the helpdesk\'s display. Grumpdesk only enables **Approve** when it agrees a duplicate exists, so the robot\'s decision and the button always line up.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Approve or escalate\n\nGenuine duplicate: apply the refund-approved macro and solve the ticket. Not a duplicate: leave an internal note with the evidence and escalate to a human, priority raised.\n\nThe robot disagrees with the customer only when the bank does, and never auto-denies.'
  });

  f.node('c00006', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 5. Summary\n\nWrites one row per ticket: the reference, how many charges the bank held, the decision and the action taken. On the seeded queue that is 5 approved and 3 escalated.'
  });

  // ------------------------------------------------------------ 1. scan the bank first
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.gd_url = 'https://grumpdesk.robomotion.online';
msg.gd_login = msg.gd_url + '/login';
// Refund tickets are assigned, so they are not in the default Unassigned view.
msg.gd_tickets = msg.gd_url + '/tickets?view=all';
// Published training credentials for fictional demo sites (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.gd_email = 'svc.rpa@grumpdesk.example';
msg.gd_pw = 'GrumpTraining2026!';
msg.ab_url = 'https://acmebank.robomotion.online';
msg.ab_email = 'hiroshi.tanaka@globex.example';
msg.ab_pw = 'BankTraining2026!';
msg.ab_otp = '768581';
msg.csv = global.get('$Home$') + '/refund-decisions.csv';
msg.decisions = [];
msg.t0 = Date.now();
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'headlesschrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Bank Login', {
      inBrowserId: Message('browser'), inUrl: Message('ab_url'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait Bank Login', {
      inPageId: Message('page'), inSelector: Custom('//input[@name="email"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Bank Email', {
      inPageId: Message('page'), inSelector: Custom('//input[@name="email"]'), inText: Message('ab_email'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Bank Password', {
      inPageId: Message('page'), inSelector: Custom('//input[@name="password"]'), inText: Message('ab_pw'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Bank Sign In', {
      inPageId: Message('page'), inSelector: Custom('//button[normalize-space()="Sign In"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Two Factor', {
      inPageId: Message('page'), inSelector: Custom('//input[@name="code"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.TypeText', 'Type One Time Code', {
      inPageId: Message('page'), inSelector: Custom('//input[@name="code"]'), inText: Message('ab_otp'), optClearText: true
    })
    .then('a1000b', 'Core.Browser.ClickElement', 'Verify', {
      inPageId: Message('page'), inSelector: Custom('//button[normalize-space()="Verify"]')
    })
    // Session is not persisted, so navigate client-side after 2FA: dashboard -> operating
    // account -> its transactions. A full reload would drop the session back to the login.
    .then('a1000c', 'Core.Browser.WaitElement', 'Wait Dashboard', {
      inPageId: Message('page'), inSelector: Custom('//a[@href="/accounts/A-7001-OPS"]'), optTimeout: Custom('20')
    })
    .then('a1000d', 'Core.Browser.ClickElement', 'Open Operating Account', {
      inPageId: Message('page'), inSelector: Custom('//a[@href="/accounts/A-7001-OPS"]')
    })
    .then('a1000e', 'Core.Browser.WaitElement', 'Wait Account', {
      inPageId: Message('page'), inSelector: Custom('//a[contains(@href,"/transactions")]'), optTimeout: Custom('20')
    })
    .then('a1000f', 'Core.Browser.ClickElement', 'Open Transactions', {
      inPageId: Message('page'), inSelector: Custom('//a[contains(@href,"/transactions")]')
    })
    .then('a10010', 'Core.Browser.WaitElement', 'Wait Search Box', {
      inPageId: Message('page'), inSelector: Custom('//input[@id="q"]'), optTimeout: Custom('20')
    })
    .then('a10011', 'Core.Browser.TypeText', 'Search Charges', {
      inPageId: Message('page'), inSelector: Custom('//input[@id="q"]'), inText: Custom('shipment charge'), optClearText: true, optEnter: true
    })
    .then('a10012', 'Core.Programming.Sleep', 'Let Charges Render', { optDuration: Custom('2') })
    .then('a10013', 'Core.Browser.RunScript', 'Read Charges', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="txn-row"]');
var counts = {};
for (var i = 0; i < rows.length; i++) {
  var m = rows[i].innerText.match(/CHG-\\d{4}-\\d{4}/);
  if (m) { counts[m[0]] = (counts[m[0]] || 0) + 1; }
}
return JSON.stringify(counts);`,
      outResult: Message('charge_counts_json')
    })
    .then('a10014', 'Core.Programming.Function', 'Build Charge Map', {
      func: `msg.charge_counts = JSON.parse(msg.charge_counts_json);
var refs = Object.keys(msg.charge_counts);
if (refs.length === 0) { throw new Error('no shipment charges found in the operating account'); }
console.log('Bank charges by reference: ' + msg.charge_counts_json);
return msg;`
    });

  // ------------------------------------------------------------- 2. read the refund queue
  f.node('b20001', 'Core.Browser.OpenLink', 'Open Grumpdesk Login', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('gd_login'), optSameTab: true
  });
  f.edge('a10014', 0, 'b20001', 0);

  f.node('b20002', 'Core.Browser.WaitElement', 'Wait GD Login', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
  });
  f.edge('b20001', 0, 'b20002', 0);

  f.node('b20003', 'Core.Browser.TypeText', 'GD Email', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('gd_email'), optClearText: true
  });
  f.edge('b20002', 0, 'b20003', 0);

  f.node('b20004', 'Core.Browser.TypeText', 'GD Password', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('gd_pw'), optClearText: true
  });
  f.edge('b20003', 0, 'b20004', 0);

  f.node('b20005', 'Core.Browser.ClickElement', 'GD Sign In', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
  });
  f.edge('b20004', 0, 'b20005', 0);

  // Grumpdesk persists its session, so navigating ticket URLs directly is fine.
  f.node('b20006', 'Core.Browser.OpenLink', 'Open All Tickets', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('gd_tickets'), optSameTab: true
  });
  f.edge('b20005', 0, 'b20006', 0);

  f.node('b20007', 'Core.Browser.WaitElement', 'Wait Ticket Table', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ticket-table"]'), optTimeout: Custom('20')
  });
  f.edge('b20006', 0, 'b20007', 0);

  f.node('b20008', 'Core.Browser.TypeText', 'Filter Refund', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ticket-filter"]'), inText: Custom('refund'), optClearText: true
  });
  f.edge('b20007', 0, 'b20008', 0);

  f.node('b20009', 'Core.Programming.Sleep', 'Let Filter Render', { optDuration: Custom('2') });
  f.edge('b20008', 0, 'b20009', 0);

  f.node('b2000a', 'Core.Browser.RunScript', 'Read Refund Tickets', {
    inPageId: Message('page'),
    func: `var rows = document.querySelectorAll('[data-testid="ticket-row"]');
var ids = [];
for (var i = 0; i < rows.length; i++) { ids.push(rows[i].getAttribute('data-id')); }
return JSON.stringify(ids);`,
    outResult: Message('ticket_ids_json')
  });
  f.edge('b20009', 0, 'b2000a', 0);

  f.node('b2000b', 'Core.Programming.Function', 'Queue Tickets', {
    func: `msg.ticket_ids = JSON.parse(msg.ticket_ids_json);
if (msg.ticket_ids.length === 0) { throw new Error('no refund tickets found - is the All view selected?'); }
console.log('Refund tickets to verify: ' + msg.ticket_ids.length);
return msg;`
  });
  f.edge('b2000a', 0, 'b2000b', 0);

  f.node('b2000c', 'Robomotion.MemoryQueue.Create', 'Create Ticket Queue', {
    optElements: Message('ticket_ids'), outQueueID: Message('ticket_qid')
  });
  f.edge('b2000b', 0, 'b2000c', 0);

  // ---------------------------------------------- 3. decide each ticket against the bank
  f.node('d40000', 'Core.Flow.Label', 'Next Ticket', {});

  f.node('d40001', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Ticket', {
    inQueueID: Message('ticket_qid'), outElement: Message('ticket')
  });
  f.edge('b2000c', 0, 'd40001', 0);
  f.edge('d40000', 0, 'd40001', 0);

  f.node('d40002', 'Core.Programming.Function', 'Build Ticket URL', {
    func: `msg.ticket_url = msg.gd_url + '/tickets/' + msg.ticket;
return msg;`
  });
  f.edge('d40001', 0, 'd40002', 0);

  f.node('d40003', 'Core.Browser.OpenLink', 'Open Ticket', {
    inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('ticket_url'), optSameTab: true
  });
  f.edge('d40002', 0, 'd40003', 0);

  f.node('d40004', 'Core.Browser.WaitElement', 'Wait Refund Panel', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="refund-verdict"]'), optTimeout: Custom('20')
  });
  f.edge('d40003', 0, 'd40004', 0);

  // Read only the disputed reference - the input a human would copy - not the helpdesk's
  // own verdict. The bank record is the robot's source of truth.
  f.node('d40005', 'Core.Browser.RunScript', 'Read Bank Reference', {
    inPageId: Message('page'),
    func: `var m = document.body.innerText.match(/CHG-\\d{4}-\\d{4}/);
var subj = document.querySelector('[data-testid="ticket-subject"]');
var reqEl = document.querySelector('[data-testid="requester-link"]');
return JSON.stringify({
  bank_ref: m ? m[0] : '',
  subject: subj ? subj.innerText.trim() : '',
  requester: reqEl ? reqEl.innerText.trim() : ''
});`,
    outResult: Message('ticket_json')
  });
  f.edge('d40004', 0, 'd40005', 0);

  f.node('d40006', 'Core.Programming.Function', 'Decide From Bank', {
    func: `var t = JSON.parse(msg.ticket_json);
msg.bank_ref = t.bank_ref;
msg.subject = t.subject;
msg.requester = t.requester;
if (!msg.bank_ref) { throw new Error('no bank reference on ticket ' + msg.ticket); }
var count = msg.charge_counts[msg.bank_ref] || 0;
msg.charges_found = count;
msg.is_duplicate = count >= 2;
msg.decision = msg.is_duplicate ? 'duplicate' : 'single';
return msg;`
  });
  f.edge('d40005', 0, 'd40006', 0);

  // Duplicate -> port 0 (approve); anything else -> port 1 (escalate).
  f.node('d40007', 'Core.Programming.Switch', 'Duplicate?', {
    optUseBreak: true,
    optConditions: ['msg.is_duplicate === true', 'true']
  });
  f.edge('d40006', 0, 'd40007', 0);

  // --- genuine duplicate: approve the refund (macro + tag + solve).
  f.node('d40010', 'Core.Browser.ClickElement', 'Approve Refund', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="refund-approve"]')
  });
  f.edge('d40007', 0, 'd40010', 0);

  f.node('d40011', 'Core.Programming.Function', 'Tag Approved', {
    func: `msg.action = 'Refund approved - ' + msg.charges_found + ' charges found under ' + msg.bank_ref;
return msg;`
  });
  f.edge('d40010', 0, 'd40011', 0);

  // --- not a duplicate: escalate to a human with evidence.
  f.node('d40020', 'Core.Browser.ClickElement', 'Escalate Refund', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="refund-escalate"]')
  });
  f.edge('d40007', 1, 'd40020', 0);

  f.node('d40021', 'Core.Programming.Function', 'Tag Escalated', {
    func: `msg.action = 'Escalated - only 1 charge under ' + msg.bank_ref + ', no duplicate found';
return msg;`
  });
  f.edge('d40020', 0, 'd40021', 0);

  // ---------------------------------------------------------------- record + loop
  f.node('d40030', 'Core.Programming.Function', 'Record Decision', {
    func: `msg.decisions.push({
  ticket: msg.ticket,
  requester: msg.requester,
  bank_ref: msg.bank_ref,
  charges_found: msg.charges_found,
  decision: msg.decision,
  action: msg.action
});
return msg;`
  });
  f.edge('d40011', 0, 'd40030', 0);
  f.edge('d40021', 0, 'd40030', 0);

  // A short settle so the action commits before the next full-page navigation.
  f.node('d40031', 'Core.Programming.Sleep', 'Settle', { optDuration: Custom('1') });
  f.edge('d40030', 0, 'd40031', 0);

  f.node('d40032', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['d40000'], type: 'goto', all: false }
  });
  f.edge('d40031', 0, 'd40032', 0);

  // ------------------------------------------------------------------- 5. summary
  f.node('e50001', 'Core.Trigger.Catch', 'Queue Empty', {
    optNodes: { type: 'catch', ids: ['d40001'], all: false }
  });

  f.node('e50002', 'Core.Programming.Function', 'Build Summary', {
    func: `var rows = msg.decisions;
rows.sort(function (a, b) { return a.ticket < b.ticket ? -1 : a.ticket > b.ticket ? 1 : 0; });
var approved = 0, escalated = 0;
for (var i = 0; i < rows.length; i++) {
  if (rows[i].decision === 'duplicate') { approved++; } else { escalated++; }
}
msg.summary_table = {
  columns: ['ticket', 'requester', 'bank_ref', 'charges_found', 'decision', 'action'],
  rows: rows
};
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Verified ' + rows.length + ' refund requests in ' + elapsed + 's: ' + approved + ' approved, ' + escalated + ' escalated');
for (var k = 0; k < rows.length; k++) {
  if (rows[k].decision !== 'duplicate') { console.log('  ESCALATED ' + rows[k].ticket + ' ' + rows[k].requester + ' (' + rows[k].bank_ref + ')'); }
}
return msg;`
  });
  f.edge('e50001', 0, 'e50002', 0);

  f.node('e50003', 'Core.CSV.WriteCSV', 'Write Decisions CSV', {
    inFilePath: Message('csv'), inTable: Message('summary_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('e50002', 0, 'e50003', 0);

  f.node('e50004', 'Core.Browser.Close', 'Close Browser', {
    inBrowserId: Message('browser')
  });
  f.edge('e50003', 0, 'e50004', 0);

  f.node('e50005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('e50004', 0, 'e50005', 0);
}).start();
