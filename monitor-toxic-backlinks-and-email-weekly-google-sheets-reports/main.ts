import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('2d67b3f0-8e14-4c95-a70b-51fd928c6ea3', 'Weekly Toxic Backlink Report', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');
  f.addDependency('Robomotion.Gmail', '1.1.0');

  f.node('c9084a', 'Core.Flow.Comment', 'About', {
    optText: '### Monitor toxic backlinks, email a weekly report\nEvery week, pull every backlink first seen in the last seven days whose spam score is above the threshold, drop them into a fresh Google Sheet named after the domain and the date, and email you the link.\n\nThe `first_seen` filter is what makes this a *weekly* report rather than a full audit: you only ever see links that appeared since the last run, so the report stays short enough to actually read.\n\nA week with no new toxic links sends no email at all.'
  });

  f.node('35e7b1', 'Core.Flow.Comment', 'Collect', {
    optText: '#### Collect\n1000 backlinks per pass, filtered server-side on spam score **and** first-seen date. The Label/GoTo pair walks Offset until `total_count` is exhausted.'
  });

  f.node('7f1ad6', 'Core.Trigger.Inject', 'Weekly', {
    optOnce: false,
    optRepeat: 604800,
    optOnceDelay: 10
  })
    .then('4b0c92', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.target = 'dataforseo.com';
msg.notify_email = 'user@example.com';
msg.spam_threshold = 50;

var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
msg.since = weekAgo;
msg.filters = [
  ['backlink_spam_score', '>', msg.spam_threshold],
  'and',
  ['first_seen', '>', weekAgo]
];

msg.offset = 0;
msg.page_size = 1000;
msg.collected = [];
return msg;`
    });

  // Label is a jump target only - it has no input port, so the first pass enters
  // the loop body directly and the GoTo at the end comes back through the Label.
  f.node('e2d803', 'Core.Flow.Label', 'Next Page', {});

  f.node('a86f47', 'Robomotion.DataForSEO.Backlinks.Backlinks', 'Get Spam Backlinks', {
    inTarget: Message('target'),
    inFilters: Message('filters'),
    optMode: 'as_is',
    optStatusType: 'live',
    optLimit: Message('page_size'),
    optOffset: Message('offset'),
    outItems: Message('items'),
    outResult: Message('result'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' }
  });
  f.edge('4b0c92', 0, 'a86f47', 0);
  f.edge('e2d803', 0, 'a86f47', 0);

  f.node('903b5e', 'Core.Programming.Function', 'Accumulate Page', {
    outputs: 3,
    func: `// Port 0: another page to fetch.
// Port 1: finished, and there is something to report.
// Port 2: finished with nothing toxic this week - no report, no email.
var result = (msg.result && msg.result[0]) || {};
var total = result.total_count || 0;
var items = msg.items || [];

for (var i = 0; i < items.length; i++) msg.collected.push(items[i]);

msg.toxic_count = msg.collected.length;
msg.offset = msg.offset + msg.page_size;

if (msg.offset < total && items.length > 0) return [msg, null, null];
if (msg.toxic_count > 0) return [null, msg, null];
return [null, null, msg];`
  });
  f.edge('a86f47', 0, '903b5e', 0);

  f.node('5c31ea', 'Core.Flow.GoTo', 'Go To Next Page', {
    optNodes: { ids: ['e2d803'], type: 'goto', all: false }
  });
  f.edge('903b5e', 0, '5c31ea', 0);

  f.node('b74e08', 'Core.Flow.Comment', 'Report', {
    optText: '#### Report\nA new spreadsheet per week keeps each report self-contained and shareable on its own.'
  });

  f.node('16fd52', 'Core.Programming.Function', 'Build Report Table', {
    func: `var today = new Date().toISOString().slice(0, 10);
var rows = [];

for (var i = 0; i < msg.collected.length; i++) {
  var b = msg.collected[i];
  rows.push({
    'Date': today,
    'Target': msg.target,
    'Backlink': b.url_to,
    'Spam Score': b.backlink_spam_score,
    'Backlink Rank': b.rank,
    'Domain from': b.domain_from,
    'Domain from Rank': b.domain_from_rank,
    'URL from': b.url_from,
    'URL from Rank': b.page_from_rank,
    'Backlink Is Broken': b.is_broken,
    'Backlinks Is Dofollow': b.dofollow
  });
}

msg.table = {
  columns: ['Date', 'Target', 'Backlink', 'Spam Score', 'Backlink Rank', 'Domain from',
    'Domain from Rank', 'URL from', 'URL from Rank', 'Backlink Is Broken', 'Backlinks Is Dofollow'],
  rows: rows
};
msg.title = 'Spam Backlinks to ' + msg.target + ' - ' + today;
return msg;`
  })
    .then('d40b96', 'Robomotion.GoogleSheets.CreateSpreadSheet', 'Create Spreadsheet', {
      inTitle: Message('title'),
      outSpreadSheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('81af35', 'Robomotion.GoogleSheets.SetRange', 'Write Report', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A1'),
      inTable: Message('table'),
      headers: true
    })
    .then('6e09c7', 'Core.Programming.Function', 'Compose Mail', {
      func: `var url = 'https://docs.google.com/spreadsheets/d/' + msg.spreadsheet_id;
msg.mail_subject = msg.title;
msg.mail_body = '<html><body>' +
  '<p>Here is your weekly spam backlinks report for ' + msg.target + '.</p>' +
  '<p>During the past week we identified ' + msg.toxic_count + ' potentially harmful backlinks ' +
  'with a spam score above ' + msg.spam_threshold + '.</p>' +
  '<p>You can review the full list here: <a href="' + url + '">' + msg.title + '</a></p>' +
  '</body></html>';
return msg;`
    })
    .then('a51e74', 'Robomotion.Gmail.Messages.Send', 'Send Report', {
      inTo: Message('notify_email'),
      inSubject: Message('mail_subject'),
      inBody: Message('mail_body'),
      optIsHTML: true,
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('0fc7d3', 'Core.Flow.Stop', 'Stop', {});
  f.edge('903b5e', 1, '16fd52', 0);

  f.node('72e5b8', 'Core.Flow.Log', 'Nothing To Report', {
    inText: Custom('No new toxic backlinks above the spam threshold this week.')
  });
  f.edge('903b5e', 2, '72e5b8', 0);
}).start();
