import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('0c2e4a8b-3f16-4a83-9d05-6b7148ce20f9', 'Slack Alert on Keyword Rank Drop', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');
  f.addDependency('Robomotion.Slack', '0.7.0');

  f.node('a71e05', 'Core.Flow.Comment', 'About', {
    optText: '### Send a Slack message when a keyword rank drops\nEvery morning, check where each tracked URL ranks for its keyword, compare against the position recorded on the last run, and post to Slack only when a keyword has moved *down*.\n\nThe sheet is the memory: the previous rank sits in a column and is overwritten each run, so the flow needs no database. That also means the first run establishes the baseline and alerts on nothing.\n\nA keyword that falls out of the top 100 entirely is reported as lost rather than silently skipped - which is the drop you most want to hear about.'
  });

  f.node('5d3fb2', 'Core.Flow.Comment', 'Read what to track', {
    optText: '#### Read what to track\nThe sheet needs `Keyword`, `Target`, `Location`, `Language`, `Rank` and `Checked` columns. The last two are written back by this flow.'
  });

  f.node('e6087c', 'Core.Trigger.Inject', 'Daily', {
    optOnce: false,
    optRepeat: 86400,
    optOnceDelay: 10
  })
    .then('294bd1', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1SUmLmZU-j9ifENMK3uHJ_gGENdnPaF7ft4OFMKnYrQk/edit';
msg.sheet_name = 'Sheet1';
msg.slack_channel = '#seo-alerts';

msg.default_location = 'United States';
msg.default_language = 'English';

// How deep to look. 100 results is one paid SERP page and covers the first ten
// pages of Google, which is far enough to still call a position a position.
msg.depth = 100;
return msg;`
    })
    .then('83af6e', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('c50912', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('sheet_name')
    })
    .then('1fb7e4', 'Robomotion.GoogleSheets.GetRange', 'Get Tracked Keywords', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('table')
    })
    .then('7ac306', 'Core.Programming.Function', 'Collect Tracked Rows', {
      func: `// Keep the row index so the position can be written back to the right line.
var rows = (msg.table && msg.table.rows) || [];
var tracked = [];

for (var i = 0; i < rows.length; i++) {
  var keyword = (rows[i].Keyword || '').toString().trim();
  var target = (rows[i].Target || '').toString().trim();
  if (!keyword || !target) continue;

  tracked.push({
    index: i,
    keyword: keyword,
    target: target,
    location: (rows[i].Location || msg.default_location).toString().trim(),
    language: (rows[i].Language || msg.default_language).toString().trim(),
    previous_rank: parseInt(rows[i].Rank, 10) || 0
  });
}

msg.tracked = tracked;
return msg;`
    });

  f.node('0b95d7', 'Core.Flow.Comment', 'Check and compare', {
    optText: '#### Check and compare\nOne live Google SERP call per tracked keyword. The organic result whose URL sits on the tracked domain gives the current position.'
  });

  // Label is a jump target only - the first pass enters through the ForEach.
  f.node('42d8ea', 'Core.Flow.Label', 'Next Keyword', {});

  f.node('96c410', 'Core.Programming.ForEach', 'For Each Keyword', {
    optInput: Message('tracked'),
    optOutput: Message('row')
  });
  f.edge('7ac306', 0, '96c410', 0);
  f.edge('42d8ea', 0, '96c410', 0);

  f.node('d17b23', 'Robomotion.DataForSEO.Serp.GoogleOrganic', 'Get SERP', {
    inKeyword: Message('row.keyword'),
    inLocation: Message('row.location'),
    inLanguage: Message('row.language'),
    optDepth: Message('depth'),
    optDevice: 'desktop',
    outItems: Message('items'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('96c410', 0, 'd17b23', 0);

  f.node('be2f95', 'Core.Programming.Function', 'Find Position And Compare', {
    outputs: 2,
    func: `// Port 0: the rank dropped and Slack should hear about it. Port 1: it held,
// improved, or this is the first run - write the sheet and move on quietly.
var target = msg.row.target.replace(/^https?:\\/\\//i, '').replace(/^www\\./i, '').split('/')[0].toLowerCase();
var items = msg.items || [];
var rank = 0;

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  if (item.type !== 'organic') continue;
  var domain = (item.domain || '').toLowerCase().replace(/^www\\./i, '');
  var url = (item.url || '').toLowerCase();
  if (domain === target || url.indexOf('//' + target) !== -1 || url.indexOf('//www.' + target) !== -1) {
    rank = item.rank_absolute;
    break;
  }
}

var today = new Date().toISOString().slice(0, 10);
msg.current_rank = rank;
msg.table.rows[msg.row.index].Rank = rank;
msg.table.rows[msg.row.index].Checked = today;

// rank 0 means "not found in the first \` + msg.depth + \` results".
var lost = rank === 0 && msg.row.previous_rank > 0;
var dropped = rank > 0 && msg.row.previous_rank > 0 && rank > msg.row.previous_rank;

if (!lost && !dropped) return [null, msg];

msg.alert_text = lost
  ? 'Rank lost for "' + msg.row.keyword + '" on ' + msg.row.target +
    ' - was position ' + msg.row.previous_rank + ', now outside the top ' + msg.depth
  : 'Search rank dropped for "' + msg.row.keyword + '" on ' + msg.row.target +
    ' - ' + msg.row.previous_rank + ' to ' + rank;
return [msg, null];`
  });
  f.edge('d17b23', 0, 'be2f95', 0);

  f.node('3e0c6b', 'Robomotion.Slack.SendMessage', 'Post Drop To Slack', {
    inChannelName: Message('slack_channel'),
    inMessage: Message('alert_text'),
    optToken: { vaultId: '_', itemId: '_' }
  });
  f.edge('be2f95', 0, '3e0c6b', 0);

  f.node('8f4102', 'Core.Programming.Function', 'Build Row Update', {
    func: `// Write the two changed cells back onto the row this pass is on.
msg.row_table = {
  columns: ['Rank', 'Checked'],
  rows: [{
    Rank: msg.table.rows[msg.row.index].Rank,
    Checked: msg.table.rows[msg.row.index].Checked
  }]
};
// +2 because the sheet has a header row and rows are 1-based.
msg.row_cell = 'E' + (msg.row.index + 2);
return msg;`
  })
    .then('cd6a70', 'Robomotion.GoogleSheets.SetRange', 'Write Rank Back', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Message('row_cell'),
      inTable: Message('row_table'),
      headers: false
    })
    .then('72be18', 'Core.Flow.GoTo', 'Next', {
      optNodes: { ids: ['42d8ea'], type: 'goto', all: false }
    });
  f.edge('be2f95', 1, '8f4102', 0);
  f.edge('3e0c6b', 0, '8f4102', 0);

  f.node('19a5fc', 'Core.Flow.Stop', 'Stop', {});
  f.edge('96c410', 1, '19a5fc', 0);
}).start();
