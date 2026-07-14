import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('e12a7c0', 'Quote-to-Cash Gap Audit', function (f) {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Quote-to-Cash Gap Audit\n\nFinds the money the business already won but never billed: deals marked Won in the CRM that were never turned into an invoice.\n\nReads the deal board, spots the won deals with no invoice behind them, and reports each one with the amount to recover. Writes billing-gaps.csv to your home folder. The "robot that finds money" demo.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Open the deal board\n\nSign in to the CRM and open the deals kanban. Every deal card shows its value, and the CRM chips a card when the deal is won but has no invoice against it - the billing gap.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Find the unbilled wins\n\nRead every card on the board and keep the ones flagged **unbilled**: a closed-won deal that finance never invoiced. Each is revenue the company earned and never asked for.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Total the recovery\n\nAdd up the unbilled deals and write the list finance needs: which customer, which deal, how much - and the grand total nobody billed. Hand that to finance and the invoices get drafted.'
  });

  // ---------------------------------------------------------- 1. open the deal board
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://zapspot.robomotion.online';
msg.login_url = msg.base_url + '/login';
// Published training credentials for a fictional CRM (synthetic data). Real system
// credentials belong in the Robomotion Vault, never in a flow.
msg.email = 'jonas.weber@globex.example';
msg.password = 'ZapTraining2026!';
msg.csv = global.get('$Home$') + '/billing-gaps.csv';
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
    .then('a10009', 'Core.Browser.WaitElement', 'Wait CRM', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-deals"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.ClickElement', 'Open Deals', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-deals"]')
    })
    .then('a1000b', 'Core.Browser.WaitElement', 'Wait Deal Board', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="deal-board"]'), optTimeout: Custom('20')
    })
    .then('a1000c', 'Core.Programming.Sleep', 'Let Board Render', { optDuration: Custom('1') })
    // ------------------------------------------------------- 2. find the unbilled wins
    .then('a1000d', 'Core.Browser.RunScript', 'Read Unbilled Deals', {
      inPageId: Message('page'),
      func: `var cards = document.querySelectorAll('[data-testid="deal-card"]');
var out = [];
for (var i = 0; i < cards.length; i++) {
  var chip = cards[i].querySelector('[data-testid="exception-chip"]');
  if (!chip || !/unbilled/i.test(chip.innerText)) { continue; }
  var amtEl = cards[i].querySelector('[data-testid="deal-card-amount"]');
  var nameEl = cards[i].querySelector('.font-medium');
  // The company sits in a span.truncate next to the avatar (the deal name is a div).
  var coEl = cards[i].querySelector('span.truncate');
  out.push({
    id: cards[i].getAttribute('data-id'),
    deal: nameEl ? nameEl.innerText.trim() : '',
    customer: coEl ? coEl.innerText.trim() : '',
    amount_text: amtEl ? amtEl.innerText.trim() : ''
  });
}
return JSON.stringify(out);`,
      outResult: Message('unbilled_json')
    })
    .then('a1000e', 'Core.Programming.Function', 'Total The Recovery', {
      func: `var deals = JSON.parse(msg.unbilled_json);
if (deals.length === 0) { throw new Error('no unbilled won deals found on the board'); }
var rows = [];
var total = 0;
for (var i = 0; i < deals.length; i++) {
  var d = deals[i];
  // The card text is "<deal name> <company> EUR<amount> unbilled"; the deal name holds
  // the lane, the line before the amount is the customer.
  // "12,800.00" -> strip thousands separators before parsing.
  var amount = Math.round(parseFloat(d.amount_text.replace(/[^0-9,.]/g, '').replace(/,/g, '')) * 100) / 100;
  total += amount;
  rows.push({ deal_id: d.id, deal: d.deal, customer: d.customer, amount: d.amount_text });
}
rows.sort(function (a, b) { return a.deal_id < b.deal_id ? -1 : a.deal_id > b.deal_id ? 1 : 0; });
rows.push({ deal_id: '', deal: 'TOTAL UNBILLED', customer: '', amount: 'EUR ' + total.toLocaleString('en-US', { minimumFractionDigits: 2 }) });
msg.gaps_table = { columns: ['deal_id', 'deal', 'customer', 'amount'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Quote-to-cash audit in ' + elapsed + 's: ' + deals.length + ' won deals never invoiced, EUR ' + total.toLocaleString('en-US') + ' to recover');
return msg;`
    });

  // ------------------------------------------------------------------- 3. report
  f.node('c30001', 'Core.CSV.WriteCSV', 'Write Billing Gaps CSV', {
    inFilePath: Message('csv'), inTable: Message('gaps_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('a1000e', 0, 'c30001', 0);

  f.node('c30002', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30002', 0, 'c30003', 0);
}).start();
