import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e11a7c0', 'CRM Duplicate Cleanup', function (f) {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### CRM Duplicate Cleanup\n\nCleans up a CRM by finding duplicate contacts - the same person entered twice under name variants like Bob / Robert - and merging each pair into one record.\n\nWrites crm-cleanup.csv to your home folder, with a before-and-after count. The "your CRM cleaned itself while you slept" demo.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Open the duplicates view\n\nSign in and switch the contacts list to its duplicates view. The CRM has already grouped the likely duplicate pairs; the robot\'s job is to work through them.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Merge every pair\n\nMerging removes a pair from the list, so the robot keeps merging the first remaining pair until none are left, rather than working from a fixed list that shifts underneath it.\n\nEach merge opens the side-by-side picker and confirms, keeping the primary record and folding the variant into it.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Report\n\nWrites the before-and-after: how many contacts there were, how many duplicate pairs were merged, and how many remain. On the seeded CRM that is 12 pairs merged, 0 left.'
  });

  // ------------------------------------------------------- 1. open the duplicates view
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://zapspot.robomotion.online';
msg.login_url = msg.base_url + '/login';
// Published training credentials for a fictional CRM (synthetic data). Real system
// credentials belong in the Robomotion Vault, never in a flow.
msg.email = 'jonas.weber@globex.example';
msg.password = 'ZapTraining2026!';
msg.csv = global.get('$Home$') + '/crm-cleanup.csv';
msg.merged = 0;
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
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('email'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Contacts', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="view-duplicates"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.RunScript', 'Count Contacts Before', {
      inPageId: Message('page'),
      func: `return String(document.querySelectorAll('[data-testid="contact-row"]').length);`,
      outResult: Message('contacts_before')
    })
    .then('a1000b', 'Core.Browser.ClickElement', 'Show Duplicates', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="view-duplicates"]')
    })
    .then('a1000c', 'Core.Browser.WaitElement', 'Wait Duplicates List', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="duplicates-list"]'), optTimeout: Custom('20')
    })
    .then('a1000d', 'Core.Programming.Sleep', 'Let List Render', { optDuration: Custom('1') });

  // ------------------------------------------------------------- 2. merge every pair
  f.node('b20000', 'Core.Flow.Label', 'Next Pair', {});

  f.node('b20001', 'Core.Browser.RunScript', 'Count Remaining Pairs', {
    inPageId: Message('page'),
    func: `return String(document.querySelectorAll('[data-testid="duplicate-pair"]').length);`,
    outResult: Message('remaining')
  });
  f.edge('a1000d', 0, 'b20001', 0);
  f.edge('b20000', 0, 'b20001', 0);

  // More pairs -> port 0 (merge one); none left -> port 1 (report).
  f.node('b20002', 'Core.Programming.Switch', 'Any Left?', {
    optUseBreak: true,
    optConditions: ['parseInt(msg.remaining, 10) > 0', 'true']
  });
  f.edge('b20001', 0, 'b20002', 0);

  // --- merge the first remaining pair.
  f.node('b20010', 'Core.Browser.ClickElement', 'Merge First Pair', {
    inPageId: Message('page'), inSelector: Custom('(//*[@data-testid="merge-button"])[1]')
  });
  f.edge('b20002', 0, 'b20010', 0);

  f.node('b20011', 'Core.Browser.WaitElement', 'Wait Merge Modal', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="merge-confirm"]'), optTimeout: Custom('20')
  });
  f.edge('b20010', 0, 'b20011', 0);

  f.node('b20012', 'Core.Browser.ClickElement', 'Confirm Merge', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="merge-confirm"]')
  });
  f.edge('b20011', 0, 'b20012', 0);

  f.node('b20013', 'Core.Browser.WaitElement', 'Wait Modal Closed', {
    inPageId: Message('page'), inSelector: Custom('//*[@data-testid="merge-modal"]'), optCondition: 'to-disappear', optTimeout: Custom('20')
  });
  f.edge('b20012', 0, 'b20013', 0);

  f.node('b20014', 'Core.Programming.Function', 'Count Merge', {
    func: `msg.merged = (msg.merged || 0) + 1;
return msg;`
  });
  f.edge('b20013', 0, 'b20014', 0);

  f.node('b20015', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['b20000'], type: 'goto', all: false }
  });
  f.edge('b20014', 0, 'b20015', 0);

  // ------------------------------------------------------------------- 3. report
  f.node('c30001', 'Core.Programming.Function', 'Build Report', {
    func: `var before = parseInt(msg.contacts_before, 10) || 0;
var remaining = parseInt(msg.remaining, 10) || 0;
var rows = [
  { metric: 'Duplicate pairs merged', value: String(msg.merged) },
  { metric: 'Duplicate pairs remaining', value: String(remaining) },
  { metric: 'Contacts on the first page before', value: String(before) }
];
msg.report_table = { columns: ['metric', 'value'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('CRM cleanup in ' + elapsed + 's: ' + msg.merged + ' duplicate pairs merged, ' + remaining + ' remaining');
return msg;`
  });
  f.edge('b20002', 1, 'c30001', 0);

  f.node('c30002', 'Core.CSV.WriteCSV', 'Write Cleanup CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30003', 0, 'c30004', 0);
}).start();
