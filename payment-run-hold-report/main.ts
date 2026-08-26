import { flow, Message, Custom, Credential } from '@robomotion/sdk';

const RAP_ONE_CREDENTIALS = {
  vaultId: '9196d0c6-9495-410c-aa93-679c616cbc98',
  itemId: '2b3c5213-a0e6-4a12-9c57-db13ce53327d'
};

flow.create('c56050d7-2952-4623-a63a-ed16294f98ff', 'Payment Run with Hold Report', (f) => {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Payment Run with Hold Report\n\nPrepares the weekly vendor payment run in a SAP-style ERP, confirms it, and then accounts for every bill it refused to pay.\n\nCredentials come from the Robomotion Vault, never from the flow. Writes payment-run.csv to the Reports folder in your home directory.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Sign in from the Vault\n\nThe RAP One logon takes a username, a password and a client number. The username and password are read from a Vault item, so no credential is ever stored in the flow.\n\nThe session lives in memory only, so after signing in the robot moves around by clicking the menu, never by reloading a URL.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Propose and confirm\n\nThe robot narrows the payment run to bills due within seven days, selects them and creates a proposal. Blocked bills never reach this screen, so the proposal is clean by construction.\n\nConfirming posts a journal entry per bill and flips it to Paid. The verify step re-reads the posted summary and fails the run if the document count or the total does not match what was proposed.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Account for what was left out\n\nThe first question a manager asks is why a bill was not paid. The robot opens the bills list, filters to **Blocked**, and reads each held bill with the reason it is on hold: a goods receipt not yet confirmed, a quantity or price mismatch against the purchase order, or a missing PO reference.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Report\n\nWrites payment-run.csv in two sections, creating the Reports folder only if it is missing: what was paid with the run total, then what was held back with a reason on every row.\n\nA final Log line carries the counts, the run total and the total value held back.'
  });

  f.node('a10f01', 'Core.Trigger.Inject', 'Start', {})
    .then('a10f02', 'Core.Vault.GetItem', 'Get RAP One Credentials', {
      optCredentials: Credential(RAP_ONE_CREDENTIALS),
      outItem: Message('credentials')
    })
    .then('a10f03', 'Core.Browser.Open', 'Open Visible Chrome', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('a10f04', 'Core.Browser.OpenLink', 'Open RAP One', {
      inBrowserId: Message('browser_id'),
      inUrl: Custom('https://rapone.robomotion.online'),
      outPageId: Message('page_id'),
      optTimeout: 30
    })
    .then('a10f05', 'Core.Browser.TypeText', 'Enter Username', {
      inPageId: Message('page_id'),
      inSelector: Custom("//*[@data-testid='login-username']"),
      inText: Message('credentials.username'),
      optClearText: true,
      optSimulateHuman: false
    })
    .then('a10f06', 'Core.Browser.TypeText', 'Enter Password', {
      inPageId: Message('page_id'),
      inSelector: Custom("//*[@data-testid='login-password']"),
      inText: Message('credentials.password'),
      optClearText: true,
      optSimulateHuman: false
    })
    .then('a10f07', 'Core.Browser.TypeText', 'Enter Client', {
      inPageId: Message('page_id'),
      inSelector: Custom("//*[@data-testid='login-client']"),
      inText: Custom('100'),
      optClearText: true,
      optSimulateHuman: false
    })
    .then('a10f08', 'Core.Browser.ClickElement', 'Log On', {
      inPageId: Message('page_id'),
      inSelector: Custom("//*[@data-testid='login-submit']")
    })
    .then('a10f09', 'Core.Browser.ClickElement', 'Open Payments Menu', {
      inPageId: Message('page_id'),
      inSelector: Custom("//nav//a[normalize-space()='Payments']")
    })
    .then('a10f0a', 'Core.Browser.Select', 'Choose Bills Due Within Seven Days', {
      inPageId: Message('page_id'),
      inSelector: Custom("//*[@data-testid='payment-due-window']"),
      inValue: Custom('Due ≤ 7 days')
    })
    .then('a20f0b', 'Core.Browser.ClickElement', 'Select Due Bills', {
      inPageId: Message('page_id'),
      inSelector: Custom("//*[@data-testid='payment-select-all']")
    })
    .then('a20f0c', 'Core.Browser.ClickElement', 'Create Proposal', {
      inPageId: Message('page_id'),
      inSelector: Custom("//*[@data-testid='payment-run-start']")
    })
    .then('a20f0d', 'Core.Browser.RunScript', 'Read Proposal Table and Total', {
      inPageId: Message('page_id'),
      func: `
        var table = document.querySelector('[data-testid="proposal-table"]');
        if (!table) {
          throw new Error('Payment proposal table was not found');
        }
        var columns = ['document', 'vendor', 'iban', 'due_date', 'gross'];
        var rows = [];
        var trs = table.querySelectorAll('tbody tr[data-testid="proposal-row"]');
        Array.prototype.forEach.call(trs, function(tr) {
          var cells = tr.querySelectorAll('td');
          rows.push({
            document: cells[0] ? cells[0].innerText.trim() : '',
            vendor: cells[1] ? cells[1].innerText.trim() : '',
            iban: cells[2] ? cells[2].innerText.trim() : '',
            due_date: cells[3] ? cells[3].innerText.trim() : '',
            gross: cells[4] ? cells[4].innerText.trim() : ''
          });
        });
        var totalCell = table.querySelector('tfoot td:last-child');
        var runTotal = totalCell ? totalCell.innerText.trim() : '';
        if (!runTotal) {
          throw new Error('Payment proposal total was not found');
        }
        return JSON.stringify({
          table: { columns: columns, rows: rows },
          run_total: runTotal
        });
      `,
      outResult: Message('proposal_json')
    })
    .then('a20f0e', 'Core.Programming.Function', 'Prepare Proposal Debug Data', {
      func: `
        msg.proposal = JSON.parse(msg.proposal_json);
        return msg;
      `
    });

  f.node('a20f14', 'Core.Programming.Debug', 'Show Proposed Run', {
    optDebugData: Message('proposal')
  });
  f.edge('a20f0e', 0, 'a20f14', 0);

  f.node('a20f0f', 'Core.Browser.ClickElement', 'Confirm Payment Run', {
    inPageId: Message('page_id'),
    inSelector: Custom("//*[@data-testid='proposal-confirm']"),
    delayBefore: 1
  });
  f.edge('a20f0e', 0, 'a20f0f', 0);

  f.node('a20f10', 'Core.Browser.WaitElement', 'Wait for Posted Run Summary', {
    inPageId: Message('page_id'),
    inSelector: Custom("//*[@data-testid='payment-run-summary']"),
    optTimeout: Custom('10')
  });
  f.edge('a20f0f', 0, 'a20f10', 0);

  f.node('a20f11', 'Core.Browser.RunScript', 'Verify Posted Payments', {
    inPageId: Message('page_id'),
    func: `
      var summary = document.querySelector('[data-testid="payment-run-summary"]');
      if (!summary) {
        throw new Error('Payment run completion summary was not found');
      }
      var text = summary.innerText.trim();
      var documentCount = msg.proposal.table.rows.length;
      if (text.indexOf(documentCount + ' documents paid') === -1) {
        throw new Error('Paid document count did not match the proposal');
      }
      if (text.indexOf('total ' + msg.proposal.run_total) === -1) {
        throw new Error('Posted total did not match the proposal total');
      }
      if (text.indexOf('one journal entry posted per document') === -1) {
        throw new Error('Journal posting confirmation was not found');
      }
      return text;
    `,
    outResult: Message('payment_run_summary')
  });
  f.edge('a20f10', 0, 'a20f11', 0);

  f.node('a30f01', 'Core.Browser.ClickElement', 'Open AP Bills Menu', {
    inPageId: Message('page_id'),
    inSelector: Custom("//nav//a[normalize-space()='AP Bills']")
  });
  f.edge('a20f11', 0, 'a30f01', 0);

  f.node('a30f02', 'Core.Browser.Select', 'Filter Blocked Bills', {
    inPageId: Message('page_id'),
    inSelector: Custom("//*[@data-testid='bills-filter-status']"),
    inValue: Custom('Blocked')
  });
  f.edge('a30f01', 0, 'a30f02', 0);

  f.node('a30f0c', 'Core.Browser.WaitElement', 'Wait for Filtered Blocked Bills', {
    inPageId: Message('page_id'),
    inSelector: Custom("//*[@data-testid='bills-table'][.//tbody/tr][not(.//tbody/tr[not(.//*[normalize-space()='Blocked'])])]"),
    optTimeout: Custom('10')
  });
  f.edge('a30f02', 0, 'a30f0c', 0);

  f.node('a30f03', 'Core.Browser.RunScript', 'Read Held Bills and Reasons', {
    inPageId: Message('page_id'),
    func: `
      var table = document.querySelector('[data-testid="bills-table"] table');
      if (!table) {
        throw new Error('Blocked bills table was not found');
      }
      var nextButton = document.querySelector('[data-testid="bills-next"]');
      if (nextButton && !nextButton.disabled) {
        throw new Error('Blocked bills span more than one page');
      }

      var columns = [
        'document', 'vendor', 'vendor_ref', 'invoice_date',
        'due_date', 'gross', 'currency', 'reason'
      ];
      var rows = [];
      var trs = table.querySelectorAll('tbody tr[data-testid="bill-row"]');
      Array.prototype.forEach.call(trs, function(tr) {
        var cells = tr.querySelectorAll('td');
        var matchStatus = cells[10] ? cells[10].innerText.trim() : '';
        var detailNode = cells[0] ? cells[0].querySelector('[title]') : null;
        var detail = detailNode ? detailNode.getAttribute('title') : '';
        var reason = '';

        if (matchStatus === '3-way OK') {
          reason = 'Goods receipt not yet confirmed';
        } else if (matchStatus === 'Qty mismatch') {
          reason = 'Quantity mismatch against the purchase order';
        } else if (matchStatus === 'Price mismatch') {
          reason = 'Price mismatch against the purchase order';
        } else if (matchStatus === 'No PO') {
          reason = 'Missing PO reference';
        } else {
          throw new Error('Unknown blocked-bill reason: ' + matchStatus);
        }
        if (detail && matchStatus !== '3-way OK') {
          reason = reason + ' (' + detail + ')';
        }

        rows.push({
          document: tr.getAttribute('data-id') || '',
          vendor: cells[1] ? cells[1].innerText.trim() : '',
          vendor_ref: cells[2] ? cells[2].innerText.trim() : '',
          invoice_date: cells[3] ? cells[3].innerText.trim() : '',
          due_date: cells[4] ? cells[4].innerText.trim() : '',
          gross: cells[7] ? cells[7].innerText.trim() : '',
          currency: cells[8] ? cells[8].innerText.trim() : '',
          reason: reason
        });
      });
      return JSON.stringify({ columns: columns, rows: rows });
    `,
    outResult: Message('held_bills_json')
  });
  f.edge('a30f0c', 0, 'a30f03', 0);

  f.node('a30f04', 'Core.Programming.Function', 'Build Payment Run Report', {
    func: `
      msg.held_bills = JSON.parse(msg.held_bills_json);

      function euroToNumber(value) {
        var clean = String(value).replace(/[^0-9,.-]/g, '').split(',').join('');
        return Number(clean) || 0;
      }
      function formatEuro(amount) {
        var parts = amount.toFixed(2).split('.');
        var whole = parts[0];
        var grouped = '';
        while (whole.length > 3) {
          grouped = ',' + whole.slice(-3) + grouped;
          whole = whole.slice(0, -3);
        }
        return '€' + whole + grouped + '.' + parts[1];
      }
      function csv(value) {
        return '"' + String(value == null ? '' : value).split('"').join('""') + '"';
      }

      var heldValue = 0;
      msg.held_bills.rows.forEach(function(row) {
        heldValue += euroToNumber(row.gross);
      });
      msg.held_total = formatEuro(heldValue);

      var lines = [];
      lines.push(csv('Bills proposed for payment'));
      lines.push(['Document', 'Vendor', 'IBAN', 'Due date', 'Gross'].map(csv).join(','));
      msg.proposal.table.rows.forEach(function(row) {
        lines.push([row.document, row.vendor, row.iban, row.due_date, row.gross].map(csv).join(','));
      });
      lines.push(['Run total', '', '', '', msg.proposal.run_total].map(csv).join(','));
      lines.push('');
      lines.push(csv('Bills excluded from payment'));
      lines.push([
        'Document', 'Vendor', 'Vendor ref', 'Invoice date',
        'Due date', 'Gross', 'Currency', 'Reason'
      ].map(csv).join(','));
      msg.held_bills.rows.forEach(function(row) {
        lines.push([
          row.document, row.vendor, row.vendor_ref, row.invoice_date,
          row.due_date, row.gross, row.currency, row.reason
        ].map(csv).join(','));
      });
      lines.push(['Held total', '', '', '', '', msg.held_total, '', ''].map(csv).join(','));

      msg.csv_text = lines.join('\\n') + '\\n';
      msg.report_dir = global.get('$Home$') + '/Reports';
      msg.report_path = msg.report_dir + '/payment-run.csv';
      msg.summary = msg.proposal.table.rows.length + ' bills proposed; run total ' +
        msg.proposal.run_total + '; ' + msg.held_bills.rows.length +
        ' bills held back; total value held back ' + msg.held_total;
      return msg;
    `
  });
  f.edge('a30f03', 0, 'a30f04', 0);

  f.node('a30f05', 'Core.Browser.Close', 'Close Browser', {
    inBrowserId: Message('browser_id')
  });
  f.edge('a30f04', 0, 'a30f05', 0);

  f.node('a30f06', 'Core.FileSystem.PathExists', 'Check Reports Folder', {
    inPath: Message('report_dir'),
    outResult: Message('reports_exists')
  });
  f.edge('a30f05', 0, 'a30f06', 0);

  f.node('a30f07', 'Core.Programming.Function', 'Create Folder Only If Missing', {
    outputs: 2,
    func: `
      if (msg.reports_exists) {
        return [msg, null];
      }
      return [null, msg];
    `
  });
  f.edge('a30f06', 0, 'a30f07', 0);

  f.node('a30f08', 'Core.FileSystem.Create', 'Create Reports Folder', {
    inPath: Message('report_dir'),
    optType: 'directory',
    outPath: Message('report_dir')
  });
  f.edge('a30f07', 1, 'a30f08', 0);

  f.node('a30f09', 'Core.FileSystem.WriteFile', 'Write Payment Run CSV', {
    inPath: Message('report_path'),
    inText: Message('csv_text'),
    optMode: 'truncate'
  });
  f.edge('a30f07', 0, 'a30f09', 0);
  f.edge('a30f08', 0, 'a30f09', 0);

  f.node('a30f0a', 'Core.Flow.Log', 'Log Payment Run Summary', {
    inText: Message('summary'),
    optLevel: 'info'
  });
  f.edge('a30f09', 0, 'a30f0a', 0);

  f.node('a30f0b', 'Core.Flow.Stop', 'Stop', {
    delayBefore: 0.5
  });
  f.edge('a30f09', 0, 'a30f0b', 0);
}).start();
