import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('e093cb1d-1cf4-4861-da4e-4731bf07c695', 'Keyword Cluster by URL', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('c28a04', 'Core.Flow.Comment', 'About', {
    optText: '### Collect keyword cluster by URL\n' +
      'Every two weeks, take a list of URLs from an input sheet and, for each one, pull the full set of keywords ' +
      'that URL ranks for into its own tab of an output spreadsheet - keyword, position, volume, difficulty, ' +
      'CPC, competition, intent, SERP feature type and estimated traffic.\n\n' +
      'The set of keywords one URL ranks for *is* the cluster. Reading it back tells you what Google thinks the ' +
      'page is about, which is usually more useful than what you intended it to be about.\n\n' +
      'One tab per URL keeps each cluster readable and lets you diff a tab against its own history.'
  });

  f.node('7b1f65', 'Core.Flow.Comment', 'Read the URL list', {
    optText: '#### Read the URL list\nThe input sheet needs a `Target` column with the URL, and an `Active` ' +
      'column - only rows marked active are processed, so you can park a URL without deleting it.'
  });

  f.node('4e70da', 'Core.Trigger.Inject', 'Every Two Weeks', {
    optOnce: false,
    optRepeat: 1209600,
    optOnceDelay: 15
  })
    .then('90c3ab', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.input_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1eyGnMu910kaEPfRGj2mHLVsrRb57CXKhFCmbf9tCBHw/edit';
msg.output_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1a0stVebKWNIEkjf-R8yoVOByjqLDNASkILarnq4meLM/edit';
msg.input_sheet = 'Sheet1';

msg.location_name = 'United States';
msg.language_name = 'English';
msg.limit = 1000;
return msg;`
    })
    .then('1d84fc', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Input Spreadsheet', {
      inUrl: Message('input_spreadsheet_url'),
      outSpreadsheetId: Message('input_spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('a5629e', 'Robomotion.GoogleSheets.SwitchSheet', 'Open URL Sheet', {
      inSpreadSheetId: Message('input_spreadsheet_id'),
      inSheetName: Message('input_sheet')
    })
    .then('63b0d7', 'Robomotion.GoogleSheets.GetRange', 'Get URLs', {
      inSpreadSheetId: Message('input_spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('url_table')
    })
    .then('f8e214', 'Core.Programming.Function', 'Collect Active URLs', {
      func: `// Only rows flagged active are processed. Anything falsy in the Active column -
// blank, FALSE, 0, "no" - parks that URL without deleting the row.
var rows = (msg.url_table && msg.url_table.rows) || [];
var urls = [];

for (var i = 0; i < rows.length; i++) {
  var url = (rows[i].Target || '').toString().trim();
  if (!url) continue;

  var active = rows[i].Active;
  var flag = (active === undefined || active === '') ? true
    : String(active).toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'no') continue;

  urls.push(url);
}

msg.urls = urls;
return msg;`
    })
    .then('2c7be9', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Output Spreadsheet', {
      inUrl: Message('output_spreadsheet_url'),
      outSpreadsheetId: Message('output_spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    });

  f.node('b40592', 'Core.Flow.Comment', 'One cluster per URL', {
    optText: '#### One cluster per URL\nA tab is added per URL - `AddSheet` is set to continue on error so a ' +
      'tab that already exists from a previous run is reused rather than failing the whole run. The rows are ' +
      'then appended with the header row on top.'
  });

  // Label is a jump target only - the first pass enters through the ForEach.
  f.node('56de08', 'Core.Flow.Label', 'Next URL', {});

  f.node('e17a3c', 'Core.Programming.ForEach', 'For Each URL', {
    optInput: Message('urls'),
    optOutput: Message('url')
  });
  f.edge('2c7be9', 0, 'e17a3c', 0);
  f.edge('56de08', 0, 'e17a3c', 0);

  f.node('cb2f96', 'Core.Programming.Function', 'Sheet Name For URL', {
    func: `// A Google Sheets tab name cannot contain : \\\\ / ? * [ ] and caps at 100 chars,
// so the URL is flattened into something that survives as a tab title.
var name = msg.url.replace(/^https?:\\/\\//i, '');
var illegal = [':', '\\\\', '/', '?', '*', '[', ']'];

for (var i = 0; i < illegal.length; i++) {
  name = name.split(illegal[i]).join('_');
}

msg.sheet_name = name.slice(0, 99);
return msg;`
  });
  f.edge('e17a3c', 0, 'cb2f96', 0);

  f.node('0a6e51', 'Robomotion.GoogleSheets.AddSheet', 'Add Tab For URL', {
    inSpreadsheetId: Message('output_spreadsheet_id'),
    inSheetName: Message('sheet_name'),
    continueOnError: true
  })
    .then('8f3d27', 'Robomotion.DataForSEO.Labs.RankedKeywords', 'Get Ranked Keywords', {
      inTarget: Message('url'),
      inLocation: Message('location_name'),
      inLanguage: Message('language_name'),
      optLimit: Message('limit'),
      optOffset: Custom('0'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' },
      continueOnError: true
    })
    .then('d6b038', 'Core.Programming.Function', 'Build Cluster Table', {
      func: `var today = new Date().toISOString().slice(0, 10);
var items = msg.items || [];
var rows = [];

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var kd = item.keyword_data || {};
  var info = kd.keyword_info || {};
  var props = kd.keyword_properties || {};
  var intent = kd.search_intent_info || {};
  var serp = (item.ranked_serp_element && item.ranked_serp_element.serp_item) || {};

  rows.push({
    'Keyword': kd.keyword || '',
    'Run Date': today,
    'Location': msg.location_name,
    'Language': msg.language_name,
    'Rank Group': serp.rank_group || 0,
    'Rank Absolute': serp.rank_absolute || 0,
    'Search Volume': info.search_volume || 0,
    'Keyword Difficulty': props.keyword_difficulty || 0,
    'CPC': info.cpc || 0,
    'Competition': info.competition_level || '',
    'Search Intent': intent.main_intent || '',
    'Result Type': serp.type || '',
    'ETV': serp.etv || 0,
    'SE Type': info.se_type || '',
    'Data Source': 'dataforseo_labs_google_ranked_keywords_live'
  });
}

msg.table = {
  columns: ['Keyword', 'Run Date', 'Location', 'Language', 'Rank Group', 'Rank Absolute',
    'Search Volume', 'Keyword Difficulty', 'CPC', 'Competition', 'Search Intent',
    'Result Type', 'ETV', 'SE Type', 'Data Source'],
  rows: rows
};
msg.cluster_size = rows.length;
return msg;`
    })
    .then('7ea915', 'Robomotion.GoogleSheets.SwitchSheet', 'Switch To URL Tab', {
      inSpreadSheetId: Message('output_spreadsheet_id'),
      inSheetName: Message('sheet_name')
    })
    .then('35c8b2', 'Robomotion.GoogleSheets.SetRange', 'Write Cluster', {
      inSpreadsheetId: Message('output_spreadsheet_id'),
      inStartCell: Custom('A1'),
      inTable: Message('table'),
      headers: true
    })
    .then('49f1e6', 'Core.Flow.GoTo', 'Next', {
      optNodes: { ids: ['56de08'], type: 'goto', all: false }
    });
  f.edge('cb2f96', 0, '0a6e51', 0);

  f.node('a80c73', 'Core.Flow.Stop', 'Stop', {});
  f.edge('e17a3c', 1, 'a80c73', 0);
}).start();
