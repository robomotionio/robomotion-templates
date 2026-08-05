import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('f1a4dc2e-2d05-4972-eb5f-5842ca180da6', 'Low-Competition Keyword Finder', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('d3906b', 'Core.Flow.Comment', 'About', {
    optText: '### Find low-competition keyword opportunities\nFor each seed domain in an input sheet, pull every keyword the domain is relevant for, score all of them for ranking difficulty in one bulk call, and write the combined picture - volume, trend, difficulty, intent and average backlinks - to an opportunities sheet.\n\nThe point is the join. Search volume alone tells you what people want; difficulty alone tells you what is hard. Only together do they identify a keyword worth writing for, which is why this flow always fetches both rather than filtering on either one.\n\nSort the output sheet by difficulty ascending and volume descending and the opportunities are at the top.'
  });

  f.node('82e5f4', 'Core.Flow.Comment', 'Read the seeds', {
    optText: '#### Read the seeds\nThe input sheet carries one row per domain: `seed`, `location_name`, `language_name` and `limit`. The last three fall back to the defaults when blank.'
  });

  f.node('571cba', 'Core.Trigger.Inject', 'Monthly', {
    optOnce: false,
    optRepeat: 2592000,
    optOnceDelay: 15
  })
    .then('4b7013', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/13ioeuFckLX4qEesbJwQ4C04I0-TPppdMoJVKEAPXCSI/edit';
msg.seeds_sheet = 'Sheet1';
msg.output_sheet = 'keywords_opportunities';

msg.default_location = 'United States';
msg.default_language = 'English';
msg.default_limit = 1000;
return msg;`
    })
    .then('9f60d8', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('c05e13', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Seeds Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('seeds_sheet')
    })
    .then('e64a29', 'Robomotion.GoogleSheets.GetRange', 'Read Seeds', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('seeds_table')
    })
    .then('30ba86', 'Core.Programming.Function', 'Collect Seeds', {
      func: `var rows = (msg.seeds_table && msg.seeds_table.rows) || [];
var seeds = [];

for (var i = 0; i < rows.length; i++) {
  var seed = (rows[i].seed || '').toString().trim();
  if (!seed) continue;
  seeds.push({
    seed: seed,
    location: (rows[i].location_name || msg.default_location).toString().trim(),
    language: (rows[i].language_name || msg.default_language).toString().trim(),
    limit: parseInt(rows[i].limit, 10) || msg.default_limit
  });
}

msg.seeds = seeds;
return msg;`
    });

  f.node('a17df5', 'Core.Flow.Comment', 'Keywords, then difficulty', {
    optText: '#### Keywords, then difficulty\nTwo calls per seed. `keywords_for_site` returns everything the domain is relevant for; `bulk_keyword_difficulty` scores up to 1000 of those keywords in a single request, which is far cheaper than asking for difficulty per keyword.\n\nNeither endpoint has a dedicated node in the DataForSEO package yet, so both go through **Raw Request**.'
  });

  // Label is a jump target only - the first pass enters through the ForEach.
  f.node('6cf208', 'Core.Flow.Label', 'Next Seed', {});

  f.node('b25e7a', 'Core.Programming.ForEach', 'For Each Seed', {
    optInput: Message('seeds'),
    optOutput: Message('seed_row')
  });
  f.edge('30ba86', 0, 'b25e7a', 0);
  f.edge('6cf208', 0, 'b25e7a', 0);

  f.node('18c94e', 'Core.Programming.Function', 'Build Keywords Request', {
    func: `msg.keywords_task = {
  target: msg.seed_row.seed,
  location_name: msg.seed_row.location,
  language_name: msg.seed_row.language,
  limit: msg.seed_row.limit
};
return msg;`
  });
  f.edge('b25e7a', 0, '18c94e', 0);

  f.node('7d3062', 'Robomotion.DataForSEO.Account.RawRequest', 'Get Keywords For Site', {
    inPath: Custom('/dataforseo_labs/google/keywords_for_site/live'),
    inBody: Message('keywords_task'),
    optMethod: 'POST',
    optTimeout: Custom('180'),
    outItems: Message('keyword_items'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  })
    .then('ce4801', 'Core.Programming.Function', 'Build Difficulty Request', {
      outputs: 2,
      func: `// Port 0: we have keywords to score. Port 1: this seed returned nothing.
var items = msg.keyword_items || [];
var keywords = [];

for (var i = 0; i < items.length; i++) {
  if (items[i].keyword) keywords.push(items[i].keyword);
}

if (keywords.length === 0) return [null, msg];

// bulk_keyword_difficulty caps at 1000 keywords per call.
msg.difficulty_task = {
  keywords: keywords.slice(0, 1000),
  location_name: msg.seed_row.location,
  language_name: msg.seed_row.language
};
return [msg, null];`
    });
  f.edge('18c94e', 0, '7d3062', 0);

  f.node('05fb71', 'Robomotion.DataForSEO.Account.RawRequest', 'Get Keyword Difficulty', {
    inPath: Custom('/dataforseo_labs/google/bulk_keyword_difficulty/live'),
    inBody: Message('difficulty_task'),
    optMethod: 'POST',
    optTimeout: Custom('180'),
    outItems: Message('difficulty_items'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('ce4801', 0, '05fb71', 0);

  f.node('93e2a0', 'Core.Programming.Function', 'Combine Keywords And Difficulty', {
    func: `// Index the difficulty response by keyword, then decorate each keyword row with it.
var difficulty = {};
var scored = msg.difficulty_items || [];
for (var d = 0; d < scored.length; d++) {
  difficulty[scored[d].keyword] = scored[d].keyword_difficulty;
}

var items = msg.keyword_items || [];
var rows = [];

for (var i = 0; i < items.length; i++) {
  var kw = items[i];
  var info = kw.keyword_info || {};
  var trend = info.search_volume_trend || {};
  var intent = kw.search_intent_info || {};
  var backlinks = kw.avg_backlinks_info || {};
  var foreign = intent.foreign_intent || [];

  rows.push({
    'seed': msg.seed_row.seed,
    'keywords': kw.keyword || '',
    'Search Volume': info.search_volume || 0,
    'Trend Monthly': trend.monthly === undefined ? '' : trend.monthly,
    'Trend Quarterly': trend.quarterly === undefined ? '' : trend.quarterly,
    'Trend Yearly': trend.yearly === undefined ? '' : trend.yearly,
    'SE Type': kw.se_type || '',
    'Main Intent': intent.main_intent || '',
    'Foreign Intent': foreign.join(', '),
    'Last Updated Time': info.last_updated_time || '',
    'Backlinks': backlinks.backlinks || 0,
    'Keyword Difficulty': difficulty[kw.keyword] === undefined ? '' : difficulty[kw.keyword]
  });
}

msg.table = {
  columns: ['seed', 'keywords', 'Search Volume', 'Trend Monthly', 'Trend Quarterly', 'Trend Yearly',
    'SE Type', 'Main Intent', 'Foreign Intent', 'Last Updated Time', 'Backlinks', 'Keyword Difficulty'],
  rows: rows
};
msg.opportunity_count = rows.length;
return msg;`
  })
    .then('bc4719', 'Robomotion.GoogleSheets.SwitchSheet', 'Open Output Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('output_sheet')
    })
    .then('2a80e5', 'Robomotion.GoogleSheets.AppendRange', 'Append Opportunities', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inTable: Message('table')
    })
    .then('47c6d9', 'Core.Flow.GoTo', 'Next', {
      optNodes: { ids: ['6cf208'], type: 'goto', all: false }
    });
  f.edge('05fb71', 0, '93e2a0', 0);

  f.node('e8071f', 'Core.Flow.GoTo', 'Skip Empty Seed', {
    optNodes: { ids: ['6cf208'], type: 'goto', all: false }
  });
  f.edge('ce4801', 1, 'e8071f', 0);

  f.node('5b30ca', 'Core.Flow.Stop', 'Stop', {});
  f.edge('b25e7a', 1, '5b30ca', 0);
}).start();
