import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('d1e94b26-5c73-4a08-9f52-6b0e83a7c4d5', 'Scrape AI Overview References', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('7c8e31', 'Core.Flow.Comment', 'About', {
    optText: "### Scrape references from Google's AI Overview\n" +
      'Polls the Google SERP for a keyword every 15 minutes with the AI Overview block loaded and appends every ' +
      'source the overview cites to a Google Sheet.\n\n' +
      'The SERP is fetched 100 results deep with organic results grouped, which is what the AI Overview block '  +
      'needs in order to resolve.'
  });

  f.node('2b60fa', 'Core.Flow.Comment', 'Configure', {
    optText: '#### Configure\nKeyword, location and language to track, plus the target spreadsheet URL.'
  });

  f.node('e04d97', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('58af13', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.keyword = 'Why Sky is Blue';
msg.location_name = 'United States';
msg.language_name = 'English';
msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1XCjkjyVxrtpTUQenHeR3B07xfEZ489mhuVidjhGOO7I/edit#gid=0';

// load_async_ai_overview pulls in the AI Overview block, which Google renders
// asynchronously; group_organic_results keeps the organic block together.
msg.extra_params = {
  load_async_ai_overview: true,
  group_organic_results: true,
  calculate_rectangles: false
};
return msg;`
    })
    .then('9d2c46', 'Robomotion.DataForSEO.Serp.GoogleOrganic', 'Get SERP With AI Overview', {
      inKeyword: Message('keyword'),
      inLocation: Message('location_name'),
      inLanguage: Message('language_name'),
      inExtraParams: Message('extra_params'),
      optDepth: Custom('100'),
      optDevice: 'desktop',
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('c53709', 'Core.Programming.Function', 'Collect References', {
      func: `// Iterate every SERP element and then every references entry
// on it, so blocks other than ai_overview that carry sources are picked up too.
var rows = [];
var seen = {};
var items = msg.items || [];

function push(ref) {
  if (!ref || !ref.url || seen[ref.url]) return;
  seen[ref.url] = true;
  rows.push({
    Source: ref.source || '',
    Domain: ref.domain || '',
    URL: ref.url,
    Title: ref.title || '',
    Text: ref.text || ''
  });
}

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var refs = item.references || [];
  for (var r = 0; r < refs.length; r++) push(refs[r]);

  var blocks = item.items || [];
  for (var b = 0; b < blocks.length; b++) {
    var blockRefs = blocks[b].references || [];
    for (var k = 0; k < blockRefs.length; k++) push(blockRefs[k]);
  }
}

msg.table = { columns: ['Source', 'Domain', 'URL', 'Title', 'Text'], rows: rows };
msg.reference_count = rows.length;
return msg;`
    })
    .then('16b8ea', 'Core.Flow.Log', 'Log Count', {
      inText: JS('"AI Overview references found: " + msg.reference_count')
    });

  f.node('a4f052', 'Core.Flow.Comment', 'Store', {
    optText: '#### Store\nAppend the cited sources to the tracking sheet.'
  });

  f.node('3ed7b9', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheet_url'),
    outSpreadsheetId: Message('spreadsheet_id'),
    optCredentials: { vaultId: '_', itemId: '_' }
  })
    .then('80c1d4', 'Robomotion.GoogleSheets.AppendRange', 'Append References', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    })
    .then('f7a263', 'Core.Flow.Stop', 'Stop', {});

  f.edge('c53709', 0, '3ed7b9', 0);
}).start();
