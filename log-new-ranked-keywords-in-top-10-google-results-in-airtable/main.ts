import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('9b4de668-c7af-431b-a5e9-f286ab273140', 'New Top-10 Keywords to Airtable', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');
  f.addDependency('Robomotion.Airtable', '0.7.0');
  f.addDependency('Robomotion.Slack', '0.7.0');

  f.node('a1f307', 'Core.Flow.Comment', 'About', {
    optText: '### Log new ranked keywords in the top 10 to Airtable\n' +
      'Each week, find the keywords where your domains have broken into Google\'s first page, write them to an Airtable base, and post a summary to Slack.\n' +
      'Page one is where the traffic is - a keyword moving from 14 to 9 is worth more than ten new keywords ranking at 60, and this is the alert that catches it.'
  });

  f.node('58b2ce', 'Core.Flow.Comment', 'Snapshot the past', {
    optText: '#### Snapshot the past\n' +
      'Read the Keywords sheet, index it by target + keyword, then clear it. The index is what the diff runs against.'
  });

  f.node('0d69e4', 'Core.Trigger.Inject', 'Weekly', {
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

// Page one only - positions 1 to 10.
msg.filters = [['ranked_serp_element.serp_item.rank_group', '<=', 10]];
msg.slack_channel = '#seo-alerts';
msg.airtable_base_id = 'appXXXXXXXXXXXXXX';
msg.airtable_table = 'Keywords';

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
      'One pass per target domain, filtered to rank_group 10 or better, paging 1000 at a time.'
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
      'Every current top-10 keyword is written back to the sheet. The new ones go to Airtable in batches of ten - the bulk endpoint\'s limit - and then to Slack.'
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

msg.announcement = 'New top-10 keywords for ' + msg.target_row.target + ': ' +
  msg.new_keywords.join(', ');

// Airtable's bulk endpoint takes at most 10 records per call, so the loop below
// walks the new rows in batches of ten.
msg.batches = [];
for (var b = 0; b < msg.new_rows.length; b += 10) {
  var batch = [];
  var slice = msg.new_rows.slice(b, b + 10);
  for (var s = 0; s < slice.length; s++) batch.push({ fields: slice[s] });
  msg.batches.push(batch);
}
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

  // Inner loop over the Airtable batches: its own Label/GoTo pair.
  f.node('72b8e5', 'Core.Flow.Label', 'Next Batch', {});

  f.node('3ba960', 'Core.Programming.ForEach', 'For Each Batch', {
    optInput: Message('batches'),
    optOutput: Message('records')
  });
  f.edge('72b8e5', 0, '3ba960', 0);

  f.node('e6142c', 'Robomotion.Airtable.BulkCreateRecords', 'Create Airtable Records', {
    inBaseId: Message('airtable_base_id'),
    inTableName: Message('airtable_table'),
    inRecords: Message('records'),
    optTypecast: true,
    optApiKey: { vaultId: '_', itemId: '_' }
  })
    .then('cd0a17', 'Core.Flow.GoTo', 'Next Batch', {
      optNodes: { ids: ['72b8e5'], type: 'goto', all: false }
    });
  f.edge('3ba960', 0, 'e6142c', 0);

  f.node('7c04e9', 'Robomotion.Slack.SendMessage', 'Post To Slack', {
    inChannelName: Message('slack_channel'),
    inMessage: Message('announcement'),
    optToken: { vaultId: '_', itemId: '_' }
  });
  f.edge('3ba960', 1, '7c04e9', 0);
  f.edge('b8f631', 0, '3ba960', 0);

  f.node('1ac54d', 'Core.Flow.GoTo', 'Go To Next Target', {
    optNodes: { ids: ['7b204e'], type: 'goto', all: false }
  });
  f.edge('7c04e9', 0, '1ac54d', 0);

  f.node('30fe82', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c0836a', 1, '30fe82', 0);
}).start();
