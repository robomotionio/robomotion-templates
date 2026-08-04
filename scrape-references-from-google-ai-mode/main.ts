import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('c60a17b4-9d28-4f35-b1e6-73f0c5a2d891', 'Scrape AI Mode References', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('b409e2', 'Core.Flow.Comment', 'About', {
    optText: '### Scrape references from Google AI Mode\n' +
      'Polls the Google AI Mode answer for a brand keyword every 15 minutes and appends every cited source to a ' +
      'Google Sheet. Use it to watch, in near real time, which sites AI Mode pulls from when it answers questions ' +
      'about your brand.\n\n' +
      'AI Mode has no dedicated node in the DataForSEO package yet, so the call goes through **Raw Request**.'
  });

  f.node('8d15c7', 'Core.Flow.Comment', 'Configure', {
    optText: '#### Configure\nThe brand keyword to watch and the sheet the sources are logged to.'
  });

  f.node('4f2ab8', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('e73d0a', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1XCjkjyVxrtpTUQenHeR3B07xfEZ489mhuVidjhGOO7I/edit#gid=0';

msg.ai_mode_task = {
  keyword: 'dataforseo',
  location_name: 'United States',
  language_name: 'English',
  device: 'desktop'
};
return msg;`
    })
    .then('16bd4a', 'Robomotion.DataForSEO.Account.RawRequest', 'Get AI Mode SERP', {
      inPath: Custom('/serp/google/ai_mode/live/advanced'),
      inBody: Message('ai_mode_task'),
      optMethod: 'POST',
      optTimeout: Custom('180'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('a2e690', 'Core.Programming.Function', 'Collect References', {
      func: `// One row per source the AI Mode answer cites, de-duplicated by url.
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
    .then('57c3f1', 'Core.Flow.Log', 'Log Count', {
      inText: JS('"AI Mode references found: " + msg.reference_count')
    });

  f.node('d81b05', 'Core.Flow.Comment', 'Store', {
    optText: '#### Store\nAppend the cited sources to the tracking sheet.'
  });

  f.node('93fe7c', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheet_url'),
    outSpreadsheetId: Message('spreadsheet_id'),
    optCredentials: { vaultId: '_', itemId: '_' }
  })
    .then('0ca649', 'Robomotion.GoogleSheets.AppendRange', 'Append References', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    })
    .then('bf2d38', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a2e690', 0, '93fe7c', 0);
}).start();
