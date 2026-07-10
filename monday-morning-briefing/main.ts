import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('f17c0de', 'Monday Morning Briefing', function (f) {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Monday Morning Briefing\n\nOne robot, every system, the whole week\'s work on a single page before anyone has had coffee. It signs in to the CRM, the mailbox, the ERP, the carrier and the help desk in turn, reads the one number that matters from each, and writes a consolidated briefing.\n\nWrites monday-briefing.csv. The story is reach: the five back-office queues a team would open one browser tab at a time, gathered into one report - what needs attention, where, and how much of it.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. CRM · duplicates to merge\n\nSign in to the CRM and open its duplicates view. The count of duplicate pairs is the first line of the briefing: how many contact records are waiting to be merged.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Mailbox · invoices to post\n\nSign in to the mailbox and count the vendor-invoice e-mails sitting in the inbox - the bills that still have to be keyed into the ledger this week.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. ERP · ledger exceptions\n\nSign in to the ERP and filter the vendor bills to exceptions only. The count is how many bills are flagged for review - duplicates, mismatches and payment problems.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Carrier · shipment exceptions\n\nSign in to the carrier portal and open the exception worklist - customs holds, failed deliveries and delays. The count is how many shipments are stuck.'
  });

  f.node('c00006', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 5. Help desk · refunds & report\n\nSign in to the help desk and filter to refund tickets awaiting a decision. Then write the briefing: one line per system, a total across all five, and where each queue lives.'
  });

  // ---------------------------------------------------------------------- setup
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.zap_login = 'https://zapspot.robomotion.online/login';
msg.lookout_login = 'https://lookout.robomotion.online/login';
msg.rap_login = 'https://rapone.robomotion.online/login';
msg.slug_login = 'https://slugexpress.robomotion.online/portal/login';
msg.gd_url = 'https://grumpdesk.robomotion.online';
msg.gd_login = msg.gd_url + '/login';
msg.gd_tickets = msg.gd_url + '/tickets?view=all';
// Published training credentials for five fictional systems (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.zap_email = 'jonas.weber@globex.example';
msg.zap_pw = 'ZapTraining2026!';
msg.lookout_email = 'hiroshi.tanaka@globex.example';
msg.lookout_pw = 'LookoutTraining2026!';
msg.rap_user = 'HTANAKA';
msg.rap_pw = 'RapTraining2026!';
msg.rap_client = '100';
msg.slug_email = 'svc.rpa@slugexpress.example';
msg.slug_pw = 'SlugTraining2026!';
msg.gd_email = 'svc.rpa@grumpdesk.example';
msg.gd_pw = 'GrumpTraining2026!';
msg.csv = global.get('$Home$') + '/monday-briefing.csv';
msg.t0 = Date.now();
msg.briefing = [];
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'headlesschrome', outBrowserId: Message('browser')
    })
    // ---------------------------------------------------- 1. CRM duplicates (Zapspot)
    .then('a10004', 'Core.Browser.OpenLink', 'Open CRM Login', {
      inBrowserId: Message('browser'), inUrl: Message('zap_login'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait CRM Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'CRM Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('zap_email'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'CRM Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('zap_pw'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'CRM Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Duplicates Tab', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="view-duplicates"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.ClickElement', 'Open Duplicates', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="view-duplicates"]')
    })
    .then('a1000b', 'Core.Browser.WaitElement', 'Wait Duplicates', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="duplicates-list"]'), optTimeout: Custom('20')
    })
    .then('a1000c', 'Core.Browser.RunScript', 'Count Duplicates', {
      inPageId: Message('page'),
      func: `return String(document.querySelectorAll('[data-testid="duplicate-pair"]').length);`,
      outResult: Message('crm_count')
    })
    .then('a1000d', 'Core.Programming.Function', 'Record CRM', {
      func: `msg.briefing.push({ area: 'Duplicate contacts to merge', count: parseInt(msg.crm_count, 10) || 0, system: 'Zapspot CRM' });
return msg;`
    })
    // ------------------------------------------------- 2. invoices to post (Lookout)
    .then('a1000e', 'Core.Browser.OpenLink', 'Open Mailbox Login', {
      inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('lookout_login'), optSameTab: true
    })
    .then('a1000f', 'Core.Browser.WaitElement', 'Wait Mailbox Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a10010', 'Core.Browser.TypeText', 'Mailbox Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('lookout_email'), optClearText: true
    })
    .then('a10011', 'Core.Browser.TypeText', 'Mailbox Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('lookout_pw'), optClearText: true
    })
    .then('a10012', 'Core.Browser.ClickElement', 'Mailbox Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10013', 'Core.Browser.WaitElement', 'Wait Inbox', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="message-list"]'), optTimeout: Custom('20')
    })
    .then('a10014', 'Core.Browser.RunScript', 'Count Invoices', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="msg-row"]');
var n = 0;
for (var i = 0; i < rows.length; i++) {
  var subj = rows[i].querySelector('[data-testid="msg-subject"]');
  var t = subj ? subj.innerText.trim() : '';
  if (t.indexOf('Invoice ') === 0 && t.indexOf(' from ') > 0) { n++; }
}
return String(n);`,
      outResult: Message('inv_count')
    })
    .then('a10015', 'Core.Programming.Function', 'Record Invoices', {
      func: `msg.briefing.push({ area: 'Invoices to post', count: parseInt(msg.inv_count, 10) || 0, system: 'Lookout Mailbox' });
return msg;`
    })
    // ---------------------------------------------- 3. ledger exceptions (RAP One)
    .then('a10016', 'Core.Browser.OpenLink', 'Open ERP Login', {
      inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('rap_login'), optSameTab: true
    })
    .then('a10017', 'Core.Browser.WaitElement', 'Wait ERP Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), optTimeout: Custom('20')
    })
    .then('a10018', 'Core.Browser.TypeText', 'ERP Username', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), inText: Message('rap_user'), optClearText: true
    })
    .then('a10019', 'Core.Browser.TypeText', 'ERP Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('rap_pw'), optClearText: true
    })
    .then('a1001a', 'Core.Browser.TypeText', 'ERP Client', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-client"]'), inText: Message('rap_client'), optClearText: true
    })
    .then('a1001b', 'Core.Browser.ClickElement', 'ERP Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a1001c', 'Core.Browser.WaitElement', 'Wait Launchpad', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="launchpad"]'), optTimeout: Custom('20')
    })
    .then('a1001d', 'Core.Browser.ClickElement', 'Open AP Bills', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-ap-bills"]')
    })
    .then('a1001e', 'Core.Browser.WaitElement', 'Wait Bills', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-exceptions"]'), optTimeout: Custom('20')
    })
    .then('a1001f', 'Core.Browser.ClickElement', 'Exceptions Only', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="bills-filter-exceptions"]')
    })
    .then('a10020', 'Core.Programming.Sleep', 'Let Filter Render', { optDuration: Custom('1') })
    .then('a10021', 'Core.Browser.RunScript', 'Count Ledger Exceptions', {
      inPageId: Message('page'),
      func: `var el = document.querySelector('[data-testid="bills-count"]');
var m = (el ? el.innerText : '').match(/(\\d+)/);
return m ? m[1] : '0';`,
      outResult: Message('rap_count')
    })
    .then('a10022', 'Core.Programming.Function', 'Record Ledger', {
      func: `msg.briefing.push({ area: 'Ledger exceptions to review', count: parseInt(msg.rap_count, 10) || 0, system: 'RAP One ERP' });
return msg;`
    })
    // ------------------------------------------ 4. shipment exceptions (SlugExpress)
    .then('a10023', 'Core.Browser.OpenLink', 'Open Carrier Login', {
      inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('slug_login'), optSameTab: true
    })
    .then('a10024', 'Core.Browser.WaitElement', 'Wait Carrier Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="portal-login-email"]'), optTimeout: Custom('20')
    })
    .then('a10025', 'Core.Browser.TypeText', 'Carrier Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="portal-login-email"]'), inText: Message('slug_email'), optClearText: true
    })
    .then('a10026', 'Core.Browser.TypeText', 'Carrier Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="portal-login-password"]'), inText: Message('slug_pw'), optClearText: true
    })
    .then('a10027', 'Core.Browser.ClickElement', 'Carrier Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10028', 'Core.Browser.WaitElement', 'Wait Portal', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="exceptions-tab"]'), optTimeout: Custom('20')
    })
    .then('a10029', 'Core.Browser.ClickElement', 'Open Exceptions', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="exceptions-tab"]')
    })
    .then('a1002a', 'Core.Browser.WaitElement', 'Wait Exception Count', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="exceptions-count"]'), optTimeout: Custom('20')
    })
    .then('a1002b', 'Core.Browser.RunScript', 'Count Shipment Exceptions', {
      inPageId: Message('page'),
      func: `var el = document.querySelector('[data-testid="exceptions-count"]');
var m = (el ? el.innerText : '').match(/(\\d+)/);
return m ? m[1] : '0';`,
      outResult: Message('slug_count')
    })
    .then('a1002c', 'Core.Programming.Function', 'Record Shipments', {
      func: `msg.briefing.push({ area: 'Shipment exceptions', count: parseInt(msg.slug_count, 10) || 0, system: 'SlugExpress Carrier' });
return msg;`
    })
    // ------------------------------------------------- 5. refunds (Grumpdesk) + report
    .then('a1002d', 'Core.Browser.OpenLink', 'Open Helpdesk Login', {
      inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('gd_login'), optSameTab: true
    })
    .then('a1002e', 'Core.Browser.WaitElement', 'Wait Helpdesk Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a1002f', 'Core.Browser.TypeText', 'Helpdesk Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('gd_email'), optClearText: true
    })
    .then('a10030', 'Core.Browser.TypeText', 'Helpdesk Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('gd_pw'), optClearText: true
    })
    .then('a10031', 'Core.Browser.ClickElement', 'Helpdesk Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10032', 'Core.Browser.OpenLink', 'Open Tickets', {
      inBrowserId: Message('browser'), inPageId: Message('page'), inUrl: Message('gd_tickets'), optSameTab: true
    })
    .then('a10033', 'Core.Browser.WaitElement', 'Wait Tickets', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ticket-table"]'), optTimeout: Custom('20')
    })
    .then('a10034', 'Core.Browser.TypeText', 'Filter Refund', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="ticket-filter"]'), inText: Custom('refund'), optClearText: true
    })
    .then('a10035', 'Core.Programming.Sleep', 'Let Filter Render', { optDuration: Custom('1') })
    .then('a10036', 'Core.Browser.RunScript', 'Count Refunds', {
      inPageId: Message('page'),
      func: `return String(document.querySelectorAll('[data-testid="ticket-row"]').length);`,
      outResult: Message('refund_count')
    })
    .then('a10037', 'Core.Programming.Function', 'Record Refunds', {
      func: `msg.briefing.push({ area: 'Refund requests to decide', count: parseInt(msg.refund_count, 10) || 0, system: 'Grumpdesk Help desk' });
return msg;`
    });

  // ------------------------------------------------------------------- report
  f.node('c30001', 'Core.Programming.Function', 'Build Briefing', {
    func: `var rows = msg.briefing;
var total = 0;
var table = [];
for (var i = 0; i < rows.length; i++) {
  total += rows[i].count;
  table.push({ area: rows[i].area, items: String(rows[i].count), system: rows[i].system });
}
table.push({ area: 'TOTAL across ' + rows.length + ' systems', items: String(total), system: '' });
msg.report_table = { columns: ['area', 'items', 'system'], rows: table };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Monday briefing in ' + elapsed + 's: ' + total + ' items across ' + rows.length + ' systems');
for (var j = 0; j < rows.length; j++) { console.log('  ' + rows[j].area + ': ' + rows[j].count + ' (' + rows[j].system + ')'); }
return msg;`
  });
  f.edge('a10037', 0, 'c30001', 0);

  f.node('c30002', 'Core.CSV.WriteCSV', 'Write Briefing CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30003', 0, 'c30004', 0);
}).start();
