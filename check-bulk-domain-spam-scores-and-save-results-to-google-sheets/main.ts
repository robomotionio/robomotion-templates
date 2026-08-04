import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a91c6e33-47b8-4d02-95fa-1e7b0c8d43f6', 'Bulk Domain Spam Score Checker', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('d13f8a', 'Core.Flow.Comment', 'About', {
    optText: '### Check bulk domain spam scores\n' +
      'Reads a column of domains from a Google Sheet, scores all of them in **one** DataForSEO Bulk Spam Score ' +
      'call, and writes each 0-100 score back next to its domain with the date it was measured.\n\n' +
      'One call covers up to 1000 targets. Run it over a prospect list before you buy links, or over your own ' +
      'referring domains to spot a toxic neighbourhood early.'
  });

  f.node('6c04b7', 'Core.Flow.Comment', 'Read targets', {
    optText: '#### Read targets\nThe sheet needs a `Target` column; `Date` and `Spam Score` are filled in by this flow.\n\n' +
      'Example sheet: https://docs.google.com/spreadsheets/d/1VZfCa4w8YgGtHRQpGYDT6rq6UhwVOZxLhKzAHx5QyzY/edit'
  });

  f.node('91be2d', 'Core.Trigger.Inject', 'Run', { optOnce: true, optOnceDelay: 1 })
    .then('4a8e30', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1VZfCa4w8YgGtHRQpGYDT6rq6UhwVOZxLhKzAHx5QyzY/edit';
msg.sheet_name = 'Sheet1';
return msg;`
    })
    .then('72d5c1', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('0f6a49', 'Robomotion.GoogleSheets.SwitchSheet', 'Switch Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('sheet_name')
    })
    .then('b8730e', 'Robomotion.GoogleSheets.GetRange', 'Get Targets', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('table')
    })
    .then('35c9f2', 'Core.Programming.Function', 'Collect Targets', {
      func: `// One request carries the whole column - Bulk Spam Score accepts up to 1000 targets.
var rows = (msg.table && msg.table.rows) || [];
var targets = [];

for (var i = 0; i < rows.length; i++) {
  var t = (rows[i].Target || '').toString().trim();
  if (t) targets.push(t);
}

msg.targets = targets;
msg.target_count = targets.length;
return msg;`
    })
    .then('e7104b', 'Robomotion.DataForSEO.Backlinks.BulkSpamScore', 'Get Spam Scores', {
      inTargets: Message('targets'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('ca62d8', 'Core.Programming.Function', 'Merge Scores Into Rows', {
      func: `// Index the response by target, then rewrite the table in place so every row
// keeps its original position in the sheet.
var byTarget = {};
var items = msg.items || [];
for (var i = 0; i < items.length; i++) {
  byTarget[items[i].target] = items[i];
}

var today = new Date().toISOString().slice(0, 10);
var rows = (msg.table && msg.table.rows) || [];
var updated = 0;

for (var r = 0; r < rows.length; r++) {
  var hit = byTarget[(rows[r].Target || '').toString().trim()];
  if (!hit) continue;
  rows[r].Date = today;
  rows[r]['Spam Score'] = hit.spam_score;
  updated++;
}

msg.table = { columns: ['Target', 'Date', 'Spam Score'], rows: rows };
msg.updated_count = updated;
return msg;`
    })
    .then('58f3ad', 'Robomotion.GoogleSheets.SetRange', 'Write Scores Back', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A1'),
      inTable: Message('table'),
      headers: true
    })
    .then('a4c517', 'Core.Flow.Stop', 'Stop', {});

  f.node('1d90c6', 'Core.Flow.Log', 'Log Result', {
    inText: JS('"Scored " + msg.updated_count + " of " + msg.target_count + " targets for $" + msg.cost')
  });
  f.edge('ca62d8', 0, '1d90c6', 0);
}).start();
