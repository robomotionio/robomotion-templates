import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a4f1c9d2-6b83-4e17-9c05-2fd8a1e7b430', 'AI Overview Citations to Sheets', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('c1a204', 'Core.Flow.Comment', 'About', {
    optText: '### Extract citation sources from Google AI Overview\nEvery 7 days, pull the Google SERP for a keyword with the AI Overview block loaded, collect every source the AI Overview cites, and append them to a Google Sheet with the Source, Domain, URL, Title and Text columns.\n\nPorted from the DataForSEO + n8n template of the same name.'
  });

  f.node('b71f38', 'Core.Flow.Comment', 'Configure', {
    optText: '#### Configure\nKeyword, location and language to track, plus the target spreadsheet URL.'
  });

  f.node('4e9d1a', 'Core.Trigger.Inject', 'Every 7 Days', {
    optOnce: false,
    optRepeat: 604800,
    optOnceDelay: 5
  })
    .then('7c3b56', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.keyword = 'why sky is blue';
msg.location_name = 'United States';
msg.language_name = 'English';
msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1XCjkjyVxrtpTUQenHeR3B07xfEZ489mhuVidjhGOO7I/edit#gid=0';

// load_async_ai_overview makes DataForSEO fetch the AI Overview block, which
// Google renders asynchronously and would otherwise be missing from the SERP.
msg.extra_params = { load_async_ai_overview: true };
return msg;`
    })
    .then('2d8ea7', 'Robomotion.DataForSEO.Serp.GoogleOrganic', 'Get AI Overview SERP', {
      inKeyword: Message('keyword'),
      inLocation: Message('location_name'),
      inLanguage: Message('language_name'),
      inExtraParams: Message('extra_params'),
      optDepth: Custom('10'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('9a51c4', 'Core.Programming.Function', 'Collect References', {
      func: `// The AI Overview arrives as one SERP element of type "ai_overview". Its sources
// sit in a top level references array and, for expanded answers, in a references
// array on each nested block - collect both and de-duplicate by url.
var rows = [];
var seen = {};

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

var items = msg.items || [];
for (var i = 0; i < items.length; i++) {
  var item = items[i];
  if (item.type !== 'ai_overview') continue;

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
    .then('6f2c83', 'Core.Flow.Log', 'Log Count', {
      inText: JS('"AI Overview references found: " + msg.reference_count')
    });

  f.node('e5b719', 'Core.Flow.Comment', 'Store', {
    optText: '#### Store\nAppend one row per cited source to the tracking sheet.'
  });

  f.node('8d40f2', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheet_url'),
    outSpreadsheetId: Message('spreadsheet_id'),
    optCredentials: { vaultId: '_', itemId: '_' }
  })
    .then('3ac86b', 'Robomotion.GoogleSheets.AppendRange', 'Append References', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    })
    .then('f0d925', 'Core.Flow.Stop', 'Stop', {});

  f.edge('9a51c4', 0, '8d40f2', 0);
}).start();
