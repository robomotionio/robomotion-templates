import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('f39b1d47-2e60-4c85-a713-98d02f6b5ea1', 'Bulk Domain Rank Checker', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('d13f8a', 'Core.Flow.Comment', 'About', {
    optText: '### Check bulk domain ranks\n' +
      'Reads a column of target domains from a Google Sheet, scores all of them in **one** DataForSEO Bulk Ranks ' +
      'call, and writes each rank back next to its domain along with the date it was measured.\n\n' +
      'One call covers up to 1000 targets, which is what makes this far cheaper than looping a per-domain endpoint.\n\n' +
      'Bulk Ranks has no dedicated node in the DataForSEO package yet, so the call goes through **Raw Request**.'
  });

  f.node('6c04b7', 'Core.Flow.Comment', 'Read targets', {
    optText: '#### Read targets\nThe sheet needs a `Target` column; `Date` and `Rank` are filled in by this flow.\n\n' +
      'Example sheet: https://docs.google.com/spreadsheets/d/1VZfCa4w8YgGtHRQpGYDT6rq6UhwVOZxLhKzAHx5QyzY/edit'
  });

  f.node('91be2d', 'Core.Trigger.Inject', 'Run', { optOnce: true, optOnceDelay: 1 })
    .then('4a8e30', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/189GEF2UkVFE-KMvp3xGusCp-r7uz3U84qnb07OzwUvo/edit';
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
      func: `// One request carries the whole column - Bulk Ranks accepts up to 1000 targets.
var rows = (msg.table && msg.table.rows) || [];
var targets = [];

for (var i = 0; i < rows.length; i++) {
  var t = (rows[i].Target || '').toString().trim();
  if (t) targets.push(t);
}

msg.bulk_task = { targets: targets, rank_scale: 'one_thousand' };
msg.target_count = targets.length;
return msg;`
    })
    .then('e7104b', 'Robomotion.DataForSEO.Account.RawRequest', 'Get Bulk Ranks', {
      inPath: Custom('/backlinks/bulk_ranks/live'),
      inBody: Message('bulk_task'),
      optMethod: 'POST',
      optTimeout: Custom('180'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('ca62d8', 'Core.Programming.Function', 'Merge Ranks Into Rows', {
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
  rows[r].Rank = hit.rank;
  updated++;
}

msg.table = { columns: ['Target', 'Date', 'Rank'], rows: rows };
msg.updated_count = updated;
return msg;`
    })
    .then('58f3ad', 'Robomotion.GoogleSheets.SetRange', 'Write Ranks Back', {
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
