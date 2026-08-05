import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('6e2d9a04-5f18-4c73-b906-8d1a37f0c2e5', 'Track New and Lost Backlinks', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('d13f8a', 'Core.Flow.Comment', 'About', {
    optText: '### Track new and lost backlinks in bulk\nReads a column of domains from a Google Sheet and pulls, in **one** DataForSEO call, how many backlinks each of them gained and lost, stamped with the date.\nRun it weekly and the sheet becomes a link velocity log: a spike in lost backlinks on one domain is the earliest warning that a placement was pulled or a partner site went down.\nBulk New/Lost Backlinks has no dedicated node in the DataForSEO package yet, so the call goes through **Raw Request**.'
  });

  f.node('6c04b7', 'Core.Flow.Comment', 'Read targets', {
    optText: '#### Read targets\nThe sheet needs a `Target` column; `Date`, `New backlinks` and `Lost backlinks` are filled in by this flow.\nExample sheet: https://docs.google.com/spreadsheets/d/1WZRTNkHfOmgyvG8bfdfYuMUNlEXFle4hXVOoWuBQvGQ/edit'
  });

  f.node('91be2d', 'Core.Trigger.Inject', 'Run', { optOnce: true, optOnceDelay: 1 })
    .then('4a8e30', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1WZRTNkHfOmgyvG8bfdfYuMUNlEXFle4hXVOoWuBQvGQ/edit';
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
      func: `// One request carries the whole column - the bulk endpoints take up to 1000 targets.
var rows = (msg.table && msg.table.rows) || [];
var targets = [];

for (var i = 0; i < rows.length; i++) {
  var t = (rows[i].Target || '').toString().trim();
  if (t) targets.push(t);
}

msg.bulk_task = { targets: targets };
msg.target_count = targets.length;
return msg;`
    })
    .then('e7104b', 'Robomotion.DataForSEO.Account.RawRequest', 'Get New and Lost Backlinks', {
      inPath: Custom('/backlinks/bulk_new_lost_backlinks/live'),
      inBody: Message('bulk_task'),
      optMethod: 'POST',
      optTimeout: Custom('180'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('ca62d8', 'Core.Programming.Function', 'Merge Results Into Rows', {
      func: `// Index the response by target, then rewrite the table in place so every
// row keeps its original position in the sheet.
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
  rows[r]['New backlinks'] = hit.new_backlinks;
  rows[r]['Lost backlinks'] = hit.lost_backlinks;
  updated++;
}

msg.table = { columns: ['Target', 'Date', 'New backlinks', 'Lost backlinks'], rows: rows };
msg.updated_count = updated;
return msg;`
    })
    .then('58f3ad', 'Robomotion.GoogleSheets.SetRange', 'Write Results Back', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A1'),
      inTable: Message('table'),
      headers: true
    })
    .then('a4c517', 'Core.Flow.Stop', 'Stop', {});

  f.node('1d90c6', 'Core.Flow.Log', 'Log Result', {
    inText: JS('"Updated " + msg.updated_count + " of " + msg.target_count + " targets for $" + msg.cost')
  });
  f.edge('ca62d8', 0, '1d90c6', 0);
}).start();
