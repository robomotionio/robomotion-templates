import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('24d6b9f1-5038-4ca4-9e72-8b1f3ac50647', 'Track New Ranked Keywords with Slack Alerts', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');
  f.addDependency('Robomotion.Slack', '0.7.0');

  f.node('a1f307', 'Core.Flow.Comment', 'About', {
    optText: '### Track new ranked keywords, alert on Slack\n' +
      'Once a week, fetch every keyword your domains rank for on Google, save the current picture to Google Sheets, and send a Slack summary of what is newly ranking.\n' +
      'The Keywords sheet is cleared and rewritten on every run, and the diff is taken against what was in it beforehand - so the sheet is always the present, and Slack is always the change.'
  });

  f.node('58b2ce', 'Core.Flow.Comment', 'Snapshot the past', {
    optText: '#### Snapshot the past\n' +
      'Read the Keywords sheet, index it by target + keyword, then clear it. The index is what the diff runs against.'
  });

  f.node('0d69e4', 'Core.Trigger.Inject', 'Every Monday', {
    optOnce: false,
    optRepeat: 604800,
    optOnceDelay: 15
  })
    .then('7e35b1', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1FO9Btg5y5TmE56La4O-QzJbEjGAZLe3zG0phB7eXnqs/edit';
msg.keywords_sheet = 'Keywords';
msg.targets_sheet = 'Targets';
msg.default_location = 'United States';
msg.default_language = 'English';

// No filter - every keyword the domain ranks for is tracked.
msg.filters = [];
msg.slack_channel = '#seo-alerts';

// Clearing A2 down wipes the previous snapshot once it has been indexed.
msg.clear_to_cell = 'G100000';
return msg;`
    })
    .then('c4a80f', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('92de07', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Keywords Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('keywords_sheet')
    })
    .then('16caf8', 'Robomotion.GoogleSheets.GetRange', 'Get Previous Keywords', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('previous')
    })
    .then('bf5013', 'Core.Programming.Function', 'Index Previous Keywords', {
      func: `// The diff key is target + keyword, so two domains ranking for the same phrase
// are tracked independently.
var seen = {};
var rows = (msg.previous && msg.previous.rows) || [];

for (var i = 0; i < rows.length; i++) {
  seen[(rows[i].Target || '') + '|' + (rows[i].Keyword || '')] = true;
}

msg.previous_keys = seen;
msg.previous_count = rows.length;
return msg;`
    })
    .then('3f7a26', 'Robomotion.GoogleSheets.ClearRange', 'Clear Keywords Sheet', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A2'),
      inEndCell: Message('clear_to_cell')
    })
    .then('d5b91c', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Targets Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('targets_sheet')
    })
    .then('84e0d3', 'Robomotion.GoogleSheets.GetRange', 'Get Targets', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('targets_table')
    })
    .then('6c1b47', 'Core.Programming.Function', 'Collect Targets', {
      func: `// One entry per row of the Targets sheet: the domain plus the market it is
// tracked in. Rows with no domain are dropped.
var rows = (msg.targets_table && msg.targets_table.rows) || [];
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

  f.node('e91daf', 'Core.Flow.Comment', 'Pull current rankings', {
    optText: '#### Pull current rankings\n' +
      'One pass per target domain, paging 1000 keywords at a time until DataForSEO\'s total_count is exhausted.'
  });

  // Both Labels are jump targets only - the first pass enters each loop body
  // directly and the matching GoTo comes back through the Label.
  f.node('7b204e', 'Core.Flow.Label', 'Next Target', {});

  f.node('c0836a', 'Core.Programming.ForEach', 'For Each Target', {
    optInput: Message('targets'),
    optOutput: Message('target_row')
  });
  f.edge('6c1b47', 0, 'c0836a', 0);
  f.edge('7b204e', 0, 'c0836a', 0);

  f.node('f42c15', 'Core.Programming.Function', 'Start Paging', {
    func: `msg.offset = 0;
msg.page_size = 1000;
msg.collected = [];
return msg;`
  });
  f.edge('c0836a', 0, 'f42c15', 0);

  f.node('20e7bd', 'Core.Flow.Label', 'Next Page', {});

  f.node('ab3506', 'Robomotion.DataForSEO.Labs.RankedKeywords', 'Get Ranked Keywords', {
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
  f.edge('f42c15', 0, 'ab3506', 0);
  f.edge('20e7bd', 0, 'ab3506', 0);

  f.node('5da9e2', 'Core.Programming.Function', 'Accumulate Page', {
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
  f.edge('ab3506', 0, '5da9e2', 0);

  f.node('9e04b7', 'Core.Flow.GoTo', 'Go To Next Page', {
    optNodes: { ids: ['20e7bd'], type: 'goto', all: false }
  });
  f.edge('5da9e2', 0, '9e04b7', 0);

  f.node('cf1826', 'Core.Flow.Comment', 'Diff and announce', {
    optText: '#### Diff and announce\n' +
      'Every current keyword is written back to the sheet. Only the ones missing from the previous snapshot reach Slack.'
  });

  f.node('62b7fa', 'Core.Programming.Function', 'Find New Keywords', {
    outputs: 2,
    func: `// Every keyword this target ranks for right now becomes a row; the ones whose
// target|keyword key was not in the previous snapshot are what gets announced.
var today = new Date().toISOString().slice(0, 10);
var rows = [];
var newRows = [];
var newKeywords = [];

for (var i = 0; i < msg.collected.length; i++) {
  var item = msg.collected[i];
  var kd = item.keyword_data || {};
  var serp = (item.ranked_serp_element && item.ranked_serp_element.serp_item) || {};
  var types = (item.ranked_serp_element && item.ranked_serp_element.serp_item_types) || [];

  var row = {
    'Target': msg.target_row.target,
    'Keyword': kd.keyword || '',
    'Date': today,
    'Rank': serp.rank_absolute,
    'Search Volume': (kd.keyword_info && kd.keyword_info.search_volume) || 0,
    'URL': serp.url || '',
    'SERP Item Types': types.join(', ')
  };
  rows.push(row);

  if (!msg.previous_keys[msg.target_row.target + '|' + row.Keyword]) {
    newRows.push(row);
    newKeywords.push(row.Keyword);
  }
}

msg.today = today;
msg.table = { columns: ['Target', 'Keyword', 'Date', 'Rank', 'Search Volume', 'URL', 'SERP Item Types'], rows: rows };
msg.new_rows = newRows;
msg.new_keywords = newKeywords;

if (newRows.length === 0) return [null, msg];

msg.announcement = 'New ranked keywords for ' + msg.target_row.target + ': ' +
  msg.new_keywords.join(', ');
return [msg, null];`
  });
  f.edge('5da9e2', 1, '62b7fa', 0);

  f.node('47da0e', 'Robomotion.GoogleSheets.SwitchSheet', 'Back To Keywords Sheet', {
    inSpreadSheetId: Message('spreadsheet_id'),
    inSheetName: Message('keywords_sheet')
  })
    .then('b8f631', 'Robomotion.GoogleSheets.AppendRange', 'Append Current Snapshot', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    });
  f.edge('62b7fa', 0, '47da0e', 0);
  f.edge('62b7fa', 1, '47da0e', 0);

  f.node('7c04e9', 'Robomotion.Slack.SendMessage', 'Post To Slack', {
    inChannelName: Message('slack_channel'),
    inMessage: Message('announcement'),
    optToken: { vaultId: '_', itemId: '_' }
  });
  f.edge('b8f631', 0, '7c04e9', 0);

  f.node('1ac54d', 'Core.Flow.GoTo', 'Go To Next Target', {
    optNodes: { ids: ['7b204e'], type: 'goto', all: false }
  });
  f.edge('7c04e9', 0, '1ac54d', 0);

  f.node('30fe82', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c0836a', 1, '30fe82', 0);
}).start();
