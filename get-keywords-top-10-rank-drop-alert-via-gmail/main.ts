import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('40627ecf-735c-4ec7-d149-0fb58ca26431', 'Top-10 Rank Drop Alert via Gmail', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');
  f.addDependency('Robomotion.Gmail', '1.1.0');

  f.node('d05a72', 'Core.Flow.Comment', 'About', {
    optText: '### Get Gmail alerts for dropped top-10 keyword rankings\n' +
      'Every day, pull the keywords each target domain currently holds a top-10 position for, compare against ' +
      'yesterday\'s snapshot, and email a digest of everything that slipped - keywords that moved down inside ' +
      'the top 10, and keywords that fell out of it entirely.\n\n' +
      'Losing page one is the most expensive ranking event there is, and it is usually silent. This is the ' +
      'alert that makes it loud.\n\n' +
      'The Keywords sheet holds the current picture and is rewritten every run; the diff is taken against what ' +
      'was in it beforehand, so the first run establishes the baseline and alerts on nothing.'
  });

  f.node('91e6b3', 'Core.Flow.Comment', 'Snapshot yesterday', {
    optText: '#### Snapshot yesterday\nRead the Keywords sheet and index it by target + keyword, keeping the ' +
      'position. That index is what today\'s positions are compared against.'
  });

  f.node('72c0da', 'Core.Trigger.Inject', 'Daily', {
    optOnce: false,
    optRepeat: 86400,
    optOnceDelay: 15
  })
    .then('4b81ce', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1FO9Btg5y5TmE56La4O-QzJbEjGAZLe3zG0phB7eXnqs/edit';
msg.keywords_sheet = 'Keywords';
msg.targets_sheet = 'Targets';
msg.notify_email = 'user@example.com';

msg.default_location = 'United States';
msg.default_language = 'English';

// Only page-one placements are tracked - a move from 40 to 60 is noise.
msg.filters = [['ranked_serp_element.serp_item.rank_group', '<=', 10]];
msg.clear_to_cell = 'F100000';
return msg;`
    })
    .then('0a37f5', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('e64137', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Keywords Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('keywords_sheet')
    })
    .then('c5d902', 'Robomotion.GoogleSheets.GetRange', 'Get Yesterday Positions', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('previous')
    })
    .then('8b2f60', 'Core.Programming.Function', 'Index Yesterday Positions', {
      func: `// Key on target + keyword so two domains ranking for the same phrase are
// tracked independently; the value is the position we are comparing against.
var previous = {};
var rows = (msg.previous && msg.previous.rows) || [];

for (var i = 0; i < rows.length; i++) {
  var key = (rows[i].Target || '') + '|' + (rows[i].Keyword || '');
  var rank = parseInt(rows[i].Rank, 10);
  if (!isNaN(rank)) previous[key] = rank;
}

msg.previous_ranks = previous;
return msg;`
    })
    .then('1c7e48', 'Robomotion.GoogleSheets.ClearRange', 'Clear Keywords Sheet', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A2'),
      inEndCell: Message('clear_to_cell')
    })
    .then('a9403b', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Targets Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('targets_sheet')
    })
    .then('56db1f', 'Robomotion.GoogleSheets.GetRange', 'Get Targets', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('targets_table')
    })
    .then('f30ea7', 'Core.Programming.Function', 'Collect Targets', {
      func: `var rows = (msg.targets_table && msg.targets_table.rows) || [];
var targets = [];

for (var i = 0; i < rows.length; i++) {
  var t = (rows[i].Target || '').toString().trim();
  if (!t) continue;
  targets.push({
    target: t,
    location: (rows[i].Location || msg.default_location).toString().trim(),
    language: (rows[i].Language || msg.default_language).toString().trim()
  });
}

msg.targets = targets;
return msg;`
    });

  f.node('27bc95', 'Core.Flow.Comment', "Today's top 10", {
    optText: '#### Today\'s top 10\nOne pass per target, filtered server-side to `rank_group <= 10`, paging ' +
      '1000 keywords at a time until DataForSEO\'s total_count is exhausted.'
  });

  // Both Labels are jump targets only - the first pass enters each loop body
  // directly and the matching GoTo comes back through the Label.
  f.node('6ea310', 'Core.Flow.Label', 'Next Target', {});

  f.node('bd7524', 'Core.Programming.ForEach', 'For Each Target', {
    optInput: Message('targets'),
    optOutput: Message('target_row')
  });
  f.edge('f30ea7', 0, 'bd7524', 0);
  f.edge('6ea310', 0, 'bd7524', 0);

  f.node('0f9d81', 'Core.Programming.Function', 'Start Paging', {
    func: `msg.offset = 0;
msg.page_size = 1000;
msg.collected = [];
return msg;`
  });
  f.edge('bd7524', 0, '0f9d81', 0);

  f.node('e4507c', 'Core.Flow.Label', 'Next Page', {});

  f.node('3ab629', 'Robomotion.DataForSEO.Labs.RankedKeywords', 'Get Top 10 Keywords', {
    inTarget: Message('target_row.target'),
    inLocation: Message('target_row.location'),
    inLanguage: Message('target_row.language'),
    inFilters: Message('filters'),
    optLimit: Message('page_size'),
    optOffset: Message('offset'),
    outItems: Message('items'),
    outResult: Message('result'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('0f9d81', 0, '3ab629', 0);
  f.edge('e4507c', 0, '3ab629', 0);

  f.node('cb0184', 'Core.Programming.Function', 'Accumulate Page', {
    outputs: 2,
    func: `// Port 0: another page. Port 1: this target is fully collected.
var result = (msg.result && msg.result[0]) || {};
var total = result.total_count || 0;
var items = msg.items || [];

for (var i = 0; i < items.length; i++) msg.collected.push(items[i]);
msg.offset = msg.offset + msg.page_size;

if (msg.offset < total && items.length > 0) return [msg, null];
return [null, msg];`
  });
  f.edge('3ab629', 0, 'cb0184', 0);

  f.node('7d2ea6', 'Core.Flow.GoTo', 'Go To Next Page', {
    optNodes: { ids: ['e4507c'], type: 'goto', all: false }
  });
  f.edge('cb0184', 0, '7d2ea6', 0);

  f.node('a1fb70', 'Core.Flow.Comment', 'Find the drops', {
    optText: '#### Find the drops\nTwo kinds of loss are reported: a keyword still on page one but at a worse ' +
      'position, and a keyword that was on page one yesterday and is not in today\'s set at all.'
  });

  f.node('58e0c3', 'Core.Programming.Function', 'Find Rank Drops', {
    outputs: 2,
    func: `// Port 0: something dropped, send the digest. Port 1: nothing lost today.
var today = new Date().toISOString().slice(0, 10);
var rows = [];
var current = {};
var drops = [];

for (var i = 0; i < msg.collected.length; i++) {
  var item = msg.collected[i];
  var kd = item.keyword_data || {};
  var serp = (item.ranked_serp_element && item.ranked_serp_element.serp_item) || {};
  var keyword = kd.keyword || '';
  if (!keyword) continue;

  var rank = serp.rank_group || 0;
  current[keyword] = true;

  rows.push({
    'Target': msg.target_row.target,
    'Keyword': keyword,
    'Date': today,
    'Rank': rank,
    'Search Volume': (kd.keyword_info && kd.keyword_info.search_volume) || 0,
    'URL': serp.url || ''
  });

  var was = msg.previous_ranks[msg.target_row.target + '|' + keyword];
  if (was !== undefined && rank > was) {
    drops.push({ keyword: keyword, from: was, to: rank, lost: false, url: serp.url || '' });
  }
}

// A keyword that was in the top 10 yesterday and is absent today has fallen out
// of page one entirely - the loss that matters most.
var prefix = msg.target_row.target + '|';
for (var key in msg.previous_ranks) {
  if (key.indexOf(prefix) !== 0) continue;
  var kw = key.slice(prefix.length);
  if (current[kw]) continue;
  drops.push({ keyword: kw, from: msg.previous_ranks[key], to: 0, lost: true, url: '' });
}

msg.table = {
  columns: ['Target', 'Keyword', 'Date', 'Rank', 'Search Volume', 'URL'],
  rows: rows
};
msg.drops = drops;

if (drops.length === 0) return [null, msg];

msg.mail_subject = drops.length + ' top-10 rank drops for ' + msg.target_row.target + ' - ' + today;
msg.mail_body = '<html><body><p>These keywords lost ground on ' + msg.target_row.target +
  ' since the last check:</p><ul>';
for (var d = 0; d < drops.length; d++) {
  var drop = drops[d];
  msg.mail_body += drop.lost
    ? '<li><b>' + drop.keyword + '</b> - was position ' + drop.from + ', now out of the top 10</li>'
    : '<li><b>' + drop.keyword + '</b> - ' + drop.from + ' to ' + drop.to +
      ' - <a href="' + drop.url + '">' + drop.url + '</a></li>';
}
msg.mail_body += '</ul></body></html>';
return [msg, null];`
  });
  f.edge('cb0184', 1, '58e0c3', 0);

  f.node('93a4d0', 'Robomotion.GoogleSheets.SwitchSheet', 'Back To Keywords Sheet', {
    inSpreadSheetId: Message('spreadsheet_id'),
    inSheetName: Message('keywords_sheet')
  })
    .then('20cf68', 'Robomotion.GoogleSheets.AppendRange', 'Append Today Positions', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    });
  f.edge('58e0c3', 0, '93a4d0', 0);
  f.edge('58e0c3', 1, '93a4d0', 0);

  f.node('ca7315', 'Core.Programming.Function', 'Should We Email', {
    outputs: 2,
    func: `// The snapshot is written for every target; only the ones with drops get mail.
if (msg.drops.length > 0) return [msg, null];
return [null, msg];`
  });
  f.edge('20cf68', 0, 'ca7315', 0);

  f.node('e83b19', 'Robomotion.Gmail.Messages.Send', 'Email The Drops', {
    inTo: Message('notify_email'),
    inSubject: Message('mail_subject'),
    inBody: Message('mail_body'),
    optIsHTML: true,
    optCredentials: { vaultId: '_', itemId: '_' }
  });
  f.edge('ca7315', 0, 'e83b19', 0);

  f.node('7409ba', 'Core.Flow.GoTo', 'Go To Next Target', {
    optNodes: { ids: ['6ea310'], type: 'goto', all: false }
  });
  f.edge('e83b19', 0, '7409ba', 0);
  f.edge('ca7315', 1, '7409ba', 0);

  f.node('b6027e', 'Core.Flow.Stop', 'Stop', {});
  f.edge('bd7524', 1, 'b6027e', 0);
}).start();
