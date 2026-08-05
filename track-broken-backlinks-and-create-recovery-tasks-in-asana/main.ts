import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('8f4c26a3-7b05-4e91-b3d8-05f172e6ca94', 'Broken Backlink Recovery Tasks', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');
  f.addDependency('Robomotion.Asana', '1.1.0');

  f.node('b02f8e', 'Core.Flow.Comment', 'About', {
    optText: '### Track broken backlinks, open an Asana recovery task\nPulls every backlink pointing at a URL on your domain that now returns an error, logs them to a dated Google Sheet, and opens one Asana task pointing at that sheet.\n\nBroken backlinks are the cheapest link building there is: the other site already decided to link to you, so recovering the link is a redirect or a corrected URL rather than an outreach campaign.\n\nA run that finds nothing broken creates no sheet and no task.'
  });

  f.node('6a1d47', 'Core.Flow.Comment', 'Collect', {
    optText: '#### Collect\n1000 backlinks per pass with `is_broken = true` applied server-side. The Label/GoTo pair walks Offset until `total_count` is exhausted.'
  });

  f.node('c3702b', 'Core.Trigger.Inject', 'Daily', {
    optOnce: false,
    optRepeat: 86400,
    optOnceDelay: 10
  })
    .then('9e5814', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.target = 'dataforseo.com';

// Asana routing - the workspace is only needed when no project is given.
msg.asana_project_id = '';
msg.asana_workspace_id = '';
msg.asana_assignee_id = '';

msg.filters = [['is_broken', '=', true]];
msg.offset = 0;
msg.page_size = 1000;
msg.collected = [];
return msg;`
    });

  // Label is a jump target only - it has no input port, so the first pass enters
  // the loop body directly and the GoTo at the end comes back through the Label.
  f.node('df6023', 'Core.Flow.Label', 'Next Page', {});

  f.node('40b9ca', 'Robomotion.DataForSEO.Backlinks.Backlinks', 'Get Broken Backlinks', {
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
  f.edge('9e5814', 0, '40b9ca', 0);
  f.edge('df6023', 0, '40b9ca', 0);

  f.node('157e3f', 'Core.Programming.Function', 'Accumulate Page', {
    outputs: 3,
    func: `// Port 0: another page to fetch.
// Port 1: finished, and there is something to recover.
// Port 2: finished with nothing broken - no sheet, no task.
var result = (msg.result && msg.result[0]) || {};
var total = result.total_count || 0;
var items = msg.items || [];

for (var i = 0; i < items.length; i++) msg.collected.push(items[i]);

msg.broken_count = msg.collected.length;
msg.offset = msg.offset + msg.page_size;

if (msg.offset < total && items.length > 0) return [msg, null, null];
if (msg.broken_count > 0) return [null, msg, null];
return [null, null, msg];`
  });
  f.edge('40b9ca', 0, '157e3f', 0);

  f.node('e8420d', 'Core.Flow.GoTo', 'Go To Next Page', {
    optNodes: { ids: ['df6023'], type: 'goto', all: false }
  });
  f.edge('157e3f', 0, 'e8420d', 0);

  f.node('2fb069', 'Core.Flow.Comment', 'Log & assign', {
    optText: '#### Log & assign\nOne dated sheet holds the evidence; one Asana task points at it so the work lands in someone\'s queue instead of an inbox.'
  });

  f.node('74c1a8', 'Core.Programming.Function', 'Build Report Table', {
    func: `var today = new Date().toISOString().slice(0, 10);
var rows = [];

for (var i = 0; i < msg.collected.length; i++) {
  var b = msg.collected[i];
  rows.push({
    'Date': today,
    'Target': msg.target,
    'Broken URL': b.url_to,
    'Status Code': b.url_to_status_code,
    'Backlink Rank': b.rank,
    'Domain from': b.domain_from,
    'Domain from Rank': b.domain_from_rank,
    'URL from': b.url_from,
    'URL from Rank': b.page_from_rank,
    'Anchor': b.anchor,
    'Is Dofollow': b.dofollow,
    'First seen': (b.first_seen || '').toString().slice(0, 10)
  });
}

msg.table = {
  columns: ['Date', 'Target', 'Broken URL', 'Status Code', 'Backlink Rank', 'Domain from',
    'Domain from Rank', 'URL from', 'URL from Rank', 'Anchor', 'Is Dofollow', 'First seen'],
  rows: rows
};
msg.title = 'Broken Backlinks to ' + msg.target + ' - ' + today;
return msg;`
  })
    .then('05ae93', 'Robomotion.GoogleSheets.CreateSpreadSheet', 'Create Spreadsheet', {
      inTitle: Message('title'),
      outSpreadSheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('a6d310', 'Robomotion.GoogleSheets.SetRange', 'Write Broken Links', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A1'),
      inTable: Message('table'),
      headers: true
    })
    .then('cb8f25', 'Core.Programming.Function', 'Compose Task', {
      func: `var url = 'https://docs.google.com/spreadsheets/d/' + msg.spreadsheet_id;
msg.task_name = 'Recover ' + msg.broken_count + ' broken backlinks to ' + msg.target;
msg.task_notes = 'DataForSEO found ' + msg.broken_count + ' backlinks pointing at URLs on ' +
  msg.target + ' that now return an error.\\n\\n' +
  'Full list: ' + url + '\\n\\n' +
  'For each one, either restore the URL, redirect it to the closest live page, or ask the ' +
  'linking site to update the target.';
return msg;`
    })
    .then('3d70e6', 'Robomotion.Asana.Tasks.Create', 'Create Recovery Task', {
      inName: Message('task_name'),
      optNotes: Message('task_notes'),
      optProjectID: Message('asana_project_id'),
      optWorkspaceID: Message('asana_workspace_id'),
      optAssignee: Message('asana_assignee_id'),
      outTaskID: Message('task_gid'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('9142bd', 'Core.Flow.Stop', 'Stop', {});
  f.edge('157e3f', 1, '74c1a8', 0);

  f.node('e50c74', 'Core.Flow.Log', 'Nothing Broken', {
    inText: Custom('No broken backlinks found - nothing to recover.')
  });
  f.edge('157e3f', 2, 'e50c74', 0);
}).start();
