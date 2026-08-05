import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('3f7a04e8-b269-4d51-9c83-a05e17b2d6c4', 'Add Backlinks to Google Sheets', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('e18a35', 'Core.Flow.Comment', 'About', {
    optText: '### Add backlinks to Google Sheets\nPulls the live backlinks pointing at a domain every 15 minutes and appends them to a Google Sheet, one row per link, with the source page, anchor text, follow status, ranks and first/last seen dates.\n\nIndirect links (redirects and canonicals that pass equity) and subdomain links are included, so the sheet shows the full picture rather than just direct root-domain links.'
  });

  f.node('5b90c2', 'Core.Flow.Comment', 'Fetch', {
    optText: '#### Fetch\nOne page of up to 100 live backlinks. Raise Limit, or walk Offset on a Label/GoTo loop, to pull a bigger profile.'
  });

  f.node('a4c761', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('72e0b4', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.target = 'dataforseo.com';
msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/17e_xcmsMDzSdDU72S_QTxuxzOYIl3s5-aS8fOcgGOok/edit';
msg.sheet_name = 'Sheet';

// include_indirect_links surfaces links that reach the target through a redirect
// or canonical; include_subdomains counts links to blog.example.com as well.
msg.extra_params = {
  include_subdomains: true,
  include_indirect_links: true
};
return msg;`
    })
    .then('c93df6', 'Robomotion.DataForSEO.Backlinks.Backlinks', 'Get Backlinks', {
      inTarget: Message('target'),
      inExtraParams: Message('extra_params'),
      optMode: 'as_is',
      optStatusType: 'live',
      optLimit: Custom('100'),
      optOffset: Custom('0'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('0d6528', 'Core.Programming.Function', 'Build Rows', {
      func: `// One row per backlink, in the column order of the source spreadsheet.
var columns = ['url_from', 'domain_from', 'domain_to', 'url_to', 'page_from_rank',
  'domain_from_rank', 'rank', 'item_type', 'dofollow', 'first_seen', 'last_seen',
  'alt', 'anchor', 'is_broken', 'is_indirect_link', 'indirect_link_path'];

var items = msg.items || [];
var rows = [];

for (var i = 0; i < items.length; i++) {
  var it = items[i];
  var row = {};
  for (var c = 0; c < columns.length; c++) {
    var v = it[columns[c]];
    // indirect_link_path is an array of hops - flatten it so the cell is readable.
    row[columns[c]] = (v && typeof v === 'object') ? JSON.stringify(v) : (v === undefined ? '' : v);
  }
  rows.push(row);
}

msg.table = { columns: columns, rows: rows };
msg.backlink_count = rows.length;
return msg;`
    })
    .then('81fb47', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('26ce09', 'Robomotion.GoogleSheets.SwitchSheet', 'Switch Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('sheet_name')
    })
    .then('bd5312', 'Robomotion.GoogleSheets.AppendRange', 'Append Backlinks', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    })
    .then('f47ae1', 'Core.Flow.Stop', 'Stop', {});

  f.node('9c2680', 'Core.Flow.Log', 'Log Count', {
    inText: JS('"Backlinks fetched: " + msg.backlink_count + " for $" + msg.cost')
  });
  f.edge('0d6528', 0, '9c2680', 0);
}).start();
