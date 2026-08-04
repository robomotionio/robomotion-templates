import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a6c8e421-d9b2-4420-d70f-65b1e208a977', 'Google Ads Metrics to Sheets', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('b5721e', 'Core.Flow.Comment', 'About', {
    optText: '### Pull Google Ads metrics into Google Sheets\n' +
      'Reads a column of keywords from a Google Sheet and fills in the Google Ads planner numbers for all of ' +
      'them in **one** call: monthly search volume, competition and cost per click.\n' +
      'One call covers up to 1000 keywords, so a full keyword list costs the same as a single lookup. Run it on ' +
      'a schedule and the sheet stays current without anyone opening Keyword Planner.'
  });

  f.node('0d3fa9', 'Core.Flow.Comment', 'Read the keywords', {
    optText: '#### Read the keywords\nThe sheet needs a `Keyword` column, and optionally `Location` and ' +
      '`Language` on the first row to set the market. The metric columns are filled in by this flow.'
  });

  f.node('e40c17', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('72ba58', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1JguGVDC0KsplJmSI2eUHBlUf65xRAXB01MGx6BziyFc/edit';
msg.sheet_name = 'Sheet1';
msg.default_location = 'United States';
msg.default_language = 'English';
return msg;`
    })
    .then('c9e206', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('318be0', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('sheet_name')
    })
    .then('5a70d3', 'Robomotion.GoogleSheets.GetRange', 'Get Keywords', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('table')
    })
    .then('8f16c4', 'Core.Programming.Function', 'Collect Keywords', {
      func: `// Search Volume takes up to 1000 keywords in one request, and the market comes
// from the first row that names one.
var rows = (msg.table && msg.table.rows) || [];
var keywords = [];
var location = msg.default_location;
var language = msg.default_language;

for (var i = 0; i < rows.length; i++) {
  var kw = (rows[i].Keyword || '').toString().trim();
  if (!kw) continue;
  keywords.push(kw);

  if (rows[i].Location) location = rows[i].Location.toString().trim();
  if (rows[i].Language) language = rows[i].Language.toString().trim();
}

msg.keywords = keywords.slice(0, 1000);
msg.location_name = location;
msg.language_name = language;
msg.keyword_count = msg.keywords.length;
return msg;`
    })
    .then('d2094b', 'Robomotion.DataForSEO.KeywordData.SearchVolume', 'Get Ads Metrics', {
      inKeywords: Message('keywords'),
      inLocation: Message('location_name'),
      inLanguage: Message('language_name'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('6b3e70', 'Core.Programming.Function', 'Merge Metrics Into Rows', {
      func: `// Index the response by keyword, then rewrite the table in place so every row
// keeps its original position in the sheet.
var byKeyword = {};
var items = msg.items || [];
for (var i = 0; i < items.length; i++) {
  byKeyword[items[i].keyword] = items[i];
}

var rows = (msg.table && msg.table.rows) || [];
var updated = 0;

for (var r = 0; r < rows.length; r++) {
  var hit = byKeyword[(rows[r].Keyword || '').toString().trim().toLowerCase()] ||
    byKeyword[(rows[r].Keyword || '').toString().trim()];
  if (!hit) continue;

  rows[r].Location = msg.location_name;
  rows[r].Language = msg.language_name;
  rows[r]['Search Volume'] = hit.search_volume === null ? 0 : hit.search_volume;
  rows[r].Competition = hit.competition === null ? '' : hit.competition;
  rows[r].CPC = hit.cpc === null ? 0 : hit.cpc;
  updated++;
}

msg.table = {
  columns: ['Keyword', 'Location', 'Language', 'Search Volume', 'Competition', 'CPC'],
  rows: rows
};
msg.updated_count = updated;
return msg;`
    })
    .then('a0715f', 'Robomotion.GoogleSheets.SetRange', 'Write Metrics Back', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A1'),
      inTable: Message('table'),
      headers: true
    })
    .then('47c9d8', 'Core.Flow.Stop', 'Stop', {});

  f.node('bd5310', 'Core.Flow.Log', 'Log Result', {
    inText: JS('"Filled metrics for " + msg.updated_count + " of " + msg.keyword_count + " keywords for $" + msg.cost')
  });
  f.edge('6b3e70', 0, 'bd5310', 0);
}).start();
