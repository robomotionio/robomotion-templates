import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e13a7c0', 'Payroll Validation Gate', function (f) {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Payroll Validation Gate\n\nChecks a month\'s payroll before it is posted. Reads the draft register, refuses to finalize when a row is missing its cost centre, and confirms the net total matches the salary debit in the bank.\n\nWrites payroll-check.csv to your home folder. The story is judgment: the robot stops on bad data instead of posting it, and proves the number agrees across systems.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Open the draft run\n\nSign in to the HR system and open the payroll runs. The month still being worked is a Draft; the completed ones are locked. Open the draft run to inspect its register.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Validate the register\n\nRead every row of the register and find any missing its cost centre. Payroll cannot be posted to the ledger with an unclassified row - that is the validation gate, and the robot honours it rather than pushing bad data through.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Confirm the bank agrees\n\nRead the reconciliation panel: the register\'s net total against the salary debit in the operating account. When one number matches across the HR system and the bank, the payroll is real. The robot records that agreement, and whether the run is safe to finalize.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Report\n\nWrites the check: the net total, the bank debit, whether they reconcile, and every row the gate stopped for. Hand it back and the missing cost centre gets fixed before anyone posts.'
  });

  // ------------------------------------------------------------- 1. open the draft run
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://workmonth.robomotion.online';
msg.login_url = msg.base_url + '/login';
// Published training credentials for a fictional HR system (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.email = 'priya.sharma@globex.example';
msg.password = 'WorkTraining2026!';
msg.csv = global.get('$Home$') + '/payroll-check.csv';
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
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Home', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-payroll"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.ClickElement', 'Open Payroll', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-payroll"]')
    })
    .then('a1000b', 'Core.Browser.WaitElement', 'Wait Runs', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="payroll-run-row"]'), optTimeout: Custom('20')
    })
    .then('a1000c', 'Core.Browser.RunScript', 'Find Draft Run', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="payroll-run-row"]');
var draft = '';
for (var i = 0; i < rows.length; i++) {
  if (/draft/i.test(rows[i].innerText)) { draft = rows[i].getAttribute('data-id'); break; }
}
return draft;`,
      outResult: Message('draft_id')
    })
    .then('a1000d', 'Core.Programming.Function', 'Build Run Selector', {
      func: `if (!msg.draft_id) { throw new Error('no Draft payroll run found - is one still open?'); }
msg.run_xpath = '//*[@data-testid="payroll-run-row" and @data-id="' + msg.draft_id + '"]';
return msg;`
    })
    .then('a1000e', 'Core.Browser.ClickElement', 'Open Draft Run', {
      inPageId: Message('page'), inSelector: Message('run_xpath')
    })
    .then('a1000f', 'Core.Browser.WaitElement', 'Wait Register', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="register-table"]'), optTimeout: Custom('20')
    })
    .then('a10010', 'Core.Programming.Sleep', 'Let Detail Render', { optDuration: Custom('1') })
    // --------------------------------------------------------- 2. validate the register
    .then('a10011', 'Core.Browser.RunScript', 'Validate Register', {
      inPageId: Message('page'),
      func: `var rows = document.querySelectorAll('[data-testid="register-row"]');
var invalid = [];
for (var i = 0; i < rows.length; i++) {
  var cc = rows[i].querySelector('[data-testid="costcenter-cell"]');
  if (cc && cc.getAttribute('data-invalid') === 'true') {
    invalid.push(rows[i].getAttribute('data-id'));
  }
}
// -------------------------------------------- 3. confirm the bank agrees (same page)
var body = document.body.innerText;
var reconciles = body.indexOf('Reconciles to the bank') >= 0;
function pick(label) {
  var dts = document.querySelectorAll('dt');
  for (var j = 0; j < dts.length; j++) {
    if (dts[j].innerText.trim() === label && dts[j].nextElementSibling) { return dts[j].nextElementSibling.innerText.trim(); }
  }
  return '';
}
var finBtn = document.querySelector('[data-testid="finalize-run"]');
return JSON.stringify({
  total_rows: rows.length,
  invalid: invalid,
  reconciles: reconciles,
  bank_ref: pick('Bank ref'),
  bank_debit: pick('Bank debit'),
  register_net: pick('Register net'),
  finalize_blocked: finBtn ? !!finBtn.disabled : true
});`,
      outResult: Message('check_json')
    });

  // ------------------------------------------------------------------- 4. report
  f.node('c30001', 'Core.Programming.Function', 'Build Report', {
    func: `var c = JSON.parse(msg.check_json);
var rows = [
  { check: 'Register rows', result: String(c.total_rows) },
  { check: 'Rows missing cost centre (gate)', result: String(c.invalid.length) + (c.invalid.length ? ' (' + c.invalid.join(', ') + ')' : '') },
  { check: 'Safe to finalize', result: c.finalize_blocked ? 'NO - blocked by the validation gate' : 'yes' },
  { check: 'Register net', result: c.register_net },
  { check: 'Bank debit (' + c.bank_ref + ')', result: c.bank_debit },
  { check: 'Net reconciles to bank', result: c.reconciles ? 'YES' : 'no' }
];
msg.report_table = { columns: ['check', 'result'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Payroll check in ' + elapsed + 's');
console.log('  ' + c.invalid.length + ' row(s) missing a cost centre; finalize ' + (c.finalize_blocked ? 'BLOCKED by the gate' : 'allowed'));
console.log('  register net ' + c.register_net + ' vs bank ' + c.bank_debit + ' -> ' + (c.reconciles ? 'reconciles' : 'does NOT reconcile'));
return msg;`
  });
  f.edge('a10011', 0, 'c30001', 0);

  f.node('c30002', 'Core.CSV.WriteCSV', 'Write Payroll Check CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30003', 0, 'c30004', 0);
}).start();
