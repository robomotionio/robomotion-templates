import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('2e405cad-513a-4ca5-bf27-8d936ae0421b', 'Keyword Position Dynamics by URL', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('c93147', 'Core.Flow.Comment', 'About', {
    optText: '### Track keyword position dynamics by URL\nEvery two weeks, check where each tracked URL ranks for its keyword, compare against the last recorded position, and append a dated row carrying the new position, the delta and a status - **up**, **down**, **same**, **new** or **lost**.\n\nBecause every run appends rather than overwrites, the sheet becomes a position history you can chart. The delta column is what makes it readable at a glance: you are looking for runs of negative numbers, not absolute values.\n\nOne tab per URL keeps each page\'s story separate.'
  });

  f.node('05b8e2', 'Core.Flow.Comment', 'Read what to track', {
    optText: '#### Read what to track\nThe input sheet needs `Keyword`, `Target`, `Active` and optionally `Location` and `Language`. Only rows marked active are checked.'
  });

  f.node('7f2a49', 'Core.Trigger.Inject', 'Every Two Weeks', {
    optOnce: false,
    optRepeat: 1209600,
    optOnceDelay: 15
  })
    .then('a608d3', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.input_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1eyGnMu910kaEPfRGj2mHLVsrRb57CXKhFCmbf9tCBHw/edit';
msg.output_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1a0stVebKWNIEkjf-R8yoVOByjqLDNASkILarnq4meLM/edit';
msg.input_sheet = 'Sheet1';

msg.default_location = 'United States';
msg.default_language = 'English';
msg.depth = 100;
return msg;`
    })
    .then('16d7c0', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Input Spreadsheet', {
      inUrl: Message('input_spreadsheet_url'),
      outSpreadsheetId: Message('input_spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('be5209', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Input Sheet', {
      inSpreadSheetId: Message('input_spreadsheet_id'),
      inSheetName: Message('input_sheet')
    })
    .then('4a01fe', 'Robomotion.GoogleSheets.GetRange', 'Get Keywords And URLs', {
      inSpreadSheetId: Message('input_spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('input_table')
    })
    .then('d284b7', 'Core.Programming.Function', 'Collect Active Rows', {
      func: `// Anything falsy in the Active column - blank, FALSE, 0, "no" - parks that row
// without deleting it.
var rows = (msg.input_table && msg.input_table.rows) || [];
var tracked = [];

for (var i = 0; i < rows.length; i++) {
  var keyword = (rows[i].Keyword || '').toString().trim();
  var target = (rows[i].Target || '').toString().trim();
  if (!keyword || !target) continue;

  var active = rows[i].Active;
  var flag = (active === undefined || active === '') ? 'true' : String(active).toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'no') continue;

  tracked.push({
    keyword: keyword,
    target: target,
    location: (rows[i].Location || msg.default_location).toString().trim(),
    language: (rows[i].Language || msg.default_language).toString().trim()
  });
}

msg.tracked = tracked;
return msg;`
    })
    .then('30fa6c', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Output Spreadsheet', {
      inUrl: Message('output_spreadsheet_url'),
      outSpreadsheetId: Message('output_spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    });

  f.node('e71d05', 'Core.Flow.Comment', 'Check, compare, append', {
    optText: '#### Check, compare, append\nOne live SERP call per row. The previous position is read from the last line already in that URL\'s tab, so the history is both the record and the memory.'
  });

  // Label is a jump target only - the first pass enters through the ForEach.
  f.node('8c02be', 'Core.Flow.Label', 'Next Keyword', {});

  f.node('b4e638', 'Core.Programming.ForEach', 'For Each Keyword', {
    optInput: Message('tracked'),
    optOutput: Message('row')
  });
  f.edge('30fa6c', 0, 'b4e638', 0);
  f.edge('8c02be', 0, 'b4e638', 0);

  f.node('19cd74', 'Core.Programming.Function', 'Sheet Name For URL', {
    func: `// A Google Sheets tab name cannot contain : \\\\ / ? * [ ] and caps at 100 chars.
var name = msg.row.target.replace(/^https?:\\/\\//i, '');
var illegal = [':', '\\\\', '/', '?', '*', '[', ']'];

for (var i = 0; i < illegal.length; i++) {
  name = name.split(illegal[i]).join('_');
}

msg.sheet_name = name.slice(0, 99);
return msg;`
  });
  f.edge('b4e638', 0, '19cd74', 0);

  f.node('7ab5f2', 'Robomotion.GoogleSheets.AddSheet', 'Add Tab For URL', {
    inSpreadsheetId: Message('output_spreadsheet_id'),
    inSheetName: Message('sheet_name'),
    continueOnError: true
  })
    .then('c1608d', 'Robomotion.GoogleSheets.SwitchSheet', 'Switch To URL Tab', {
      inSpreadSheetId: Message('output_spreadsheet_id'),
      inSheetName: Message('sheet_name')
    })
    .then('0e493a', 'Robomotion.GoogleSheets.GetRange', 'Read Position History', {
      inSpreadSheetId: Message('output_spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('history'),
      continueOnError: true
    })
    .then('f26b81', 'Core.Programming.Function', 'Find Last Position', {
      func: `// The most recent row for this keyword is the baseline for the delta.
var rows = (msg.history && msg.history.rows) || [];
var previous = 0;

for (var i = 0; i < rows.length; i++) {
  if ((rows[i].Keyword || '').toString().trim() !== msg.row.keyword) continue;
  var p = parseInt(rows[i].Position, 10);
  if (!isNaN(p)) previous = p;
}

msg.previous_position = previous;
msg.history_rows = rows.length;
return msg;`
    })
    .then('5d0782', 'Robomotion.DataForSEO.Serp.GoogleOrganic', 'Get SERP', {
      inKeyword: Message('row.keyword'),
      inLocation: Message('row.location'),
      inLanguage: Message('row.language'),
      optDepth: Message('depth'),
      optDevice: 'desktop',
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' },
      continueOnError: true
    })
    .then('9be350', 'Core.Programming.Function', 'Calculate Delta And Status', {
      func: `var target = msg.row.target
  .replace(/^https?:\\/\\//i, '')
  .replace(/^www\\./i, '')
  .split('/')[0]
  .toLowerCase();

var items = msg.items || [];
var position = 0;
var url = '';

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  if (item.type !== 'organic') continue;
  var domain = (item.domain || '').toLowerCase().replace(/^www\\./i, '');
  if (domain !== target) continue;
  position = item.rank_absolute;
  url = item.url || '';
  break;
}

// Lower is better, so a positive delta means the page moved up the page.
var previous = msg.previous_position;
var delta = 0;
var status = 'same';

if (previous === 0 && position > 0) {
  status = 'new';
} else if (previous > 0 && position === 0) {
  status = 'lost';
} else if (previous > 0 && position > 0) {
  delta = previous - position;
  status = delta > 0 ? 'up' : (delta < 0 ? 'down' : 'same');
}

msg.table = {
  columns: ['Keyword', 'Run Date', 'Position', 'Previous Position', 'Delta', 'Status', 'URL',
    'Location', 'Language'],
  rows: [{
    'Keyword': msg.row.keyword,
    'Run Date': new Date().toISOString().slice(0, 10),
    'Position': position,
    'Previous Position': previous,
    'Delta': delta,
    'Status': status,
    'URL': url,
    'Location': msg.row.location,
    'Language': msg.row.language
  }]
};
return msg;`
    })
    .then('47e12c', 'Robomotion.GoogleSheets.AppendRange', 'Append Position Row', {
      inSpreadsheetId: Message('output_spreadsheet_id'),
      inTable: Message('table')
    })
    .then('a0d6f9', 'Core.Flow.GoTo', 'Next', {
      optNodes: { ids: ['8c02be'], type: 'goto', all: false }
    });
  f.edge('19cd74', 0, '7ab5f2', 0);

  f.node('6f38b0', 'Core.Flow.Stop', 'Stop', {});
  f.edge('b4e638', 1, '6f38b0', 0);
}).start();
