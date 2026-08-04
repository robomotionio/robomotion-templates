import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('b8d3e0f1-4a52-4c96-8e71-05c3a9d6f2b7', 'AI Mode References to Sheets', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('a72f16', 'Core.Flow.Comment', 'About', {
    optText: '### Pull references from Google AI Mode\n' +
      'Every 7 days, ask DataForSEO for the Google AI Mode answer to a keyword, collect every source the answer ' +
      'references and append them to a Google Sheet with the Source, Domain, URL, Title and Text columns.\n\n' +
      'AI Mode has no dedicated node in the DataForSEO package yet, so the call goes through **Raw Request**, ' +
      'which reaches any DataForSEO v3 endpoint by path.'
  });

  f.node('5c9b24', 'Core.Flow.Comment', 'Configure', {
    optText: '#### Configure\nKeyword, location and language to track, plus the target spreadsheet URL.'
  });

  f.node('3e81da', 'Core.Trigger.Inject', 'Every 7 Days', {
    optOnce: false,
    optRepeat: 604800,
    optOnceDelay: 5
  })
    .then('9f4c07', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1XCjkjyVxrtpTUQenHeR3B07xfEZ489mhuVidjhGOO7I/edit#gid=0';

// Raw Request wraps this object in the array DataForSEO expects.
msg.ai_mode_task = {
  keyword: 'why sky is blue',
  location_name: 'United States',
  language_name: 'English',
  device: 'desktop'
};
return msg;`
    })
    .then('6b20e5', 'Robomotion.DataForSEO.Account.RawRequest', 'Get AI Mode SERP', {
      inPath: Custom('/serp/google/ai_mode/live/advanced'),
      inBody: Message('ai_mode_task'),
      optMethod: 'POST',
      optTimeout: Custom('180'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('c14a93', 'Core.Programming.Function', 'Collect References', {
      func: `// Each AI Mode block carries its own references array. Flatten them all and
// de-duplicate by url so a source cited in several paragraphs is written once.
var rows = [];
var seen = {};
var items = msg.items || [];

for (var i = 0; i < items.length; i++) {
  var refs = items[i].references || [];
  for (var r = 0; r < refs.length; r++) {
    var ref = refs[r];
    if (!ref || !ref.url || seen[ref.url]) continue;
    seen[ref.url] = true;
    rows.push({
      Source: ref.source || '',
      Domain: ref.domain || '',
      URL: ref.url,
      Title: ref.title || '',
      Text: ref.text || ''
    });
  }
}

msg.table = { columns: ['Source', 'Domain', 'URL', 'Title', 'Text'], rows: rows };
msg.reference_count = rows.length;
return msg;`
    })
    .then('d5730c', 'Core.Flow.Log', 'Log Count', {
      inText: JS('"AI Mode references found: " + msg.reference_count')
    });

  f.node('e9c418', 'Core.Flow.Comment', 'Store', {
    optText: '#### Store\nAppend one row per cited source to the tracking sheet.'
  });

  f.node('20fa6d', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheet_url'),
    outSpreadsheetId: Message('spreadsheet_id'),
    optCredentials: { vaultId: '_', itemId: '_' }
  })
    .then('7ab851', 'Robomotion.GoogleSheets.AppendRange', 'Append References', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    })
    .then('f36e2b', 'Core.Flow.Stop', 'Stop', {});

  f.edge('c14a93', 0, '20fa6d', 0);
}).start();
