import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('2b47f6a9-c815-4e30-9d76-a41c08e5b3f2', 'Bulk Domain Backlink Profiles', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleSheets', '1.7.0');

  f.node('d13f8a', 'Core.Flow.Comment', 'About', {
    optText: '### Pull bulk domain backlink profiles\n' +
      'Reads a column of domains from a Google Sheet and pulls the **full** backlink profile for all of them in one DataForSEO call - rank, spam score, broken links, referring domains, IPs, subnets and the TLD, type, attribute, platform, location and country breakdowns.\n' +
      'Twenty-two metrics per domain, one request, up to 1000 domains.\n' +
      'Bulk Pages Summary has no dedicated node in the DataForSEO package yet, so the call goes through **Raw Request**.'
  });

  f.node('6c04b7', 'Core.Flow.Comment', 'Read targets', {
    optText: '#### Read targets\n' +
      'The sheet needs a `Target` column; the twenty-two metric columns are filled in by this flow.\n' +
      'Example sheet: https://docs.google.com/spreadsheets/d/1SE3EZWnjSGLTxNc9pO17bOJQGUd_pFds7xOwOvc6cU8/edit'
  });

  f.node('91be2d', 'Core.Trigger.Inject', 'Run', { optOnce: true, optOnceDelay: 1 })
    .then('4a8e30', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1SE3EZWnjSGLTxNc9pO17bOJQGUd_pFds7xOwOvc6cU8/edit';
msg.sheet_name = 'Sheet1';
return msg;`
    })
    .then('72d5c1', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
      inUrl: Message('spreadsheet_url'),
      outSpreadsheetId: Message('spreadsheet_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('0f6a49', 'Robomotion.GoogleSheets.SwitchSheet', 'Switch Sheet', {
      inSpreadSheetId: Message('spreadsheet_id'),
      inSheetName: Message('sheet_name')
    })
    .then('b8730e', 'Robomotion.GoogleSheets.GetRange', 'Get Targets', {
      inSpreadSheetId: Message('spreadsheet_id'),
      optTarget: 'all-range',
      optHeaders: true,
      outRange: Message('table')
    })
    .then('35c9f2', 'Core.Programming.Function', 'Collect Targets', {
      func: `// One request carries the whole column - the bulk endpoints take up to 1000 targets.
var rows = (msg.table && msg.table.rows) || [];
var targets = [];

for (var i = 0; i < rows.length; i++) {
  var t = (rows[i].Target || '').toString().trim();
  if (t) targets.push(t);
}

msg.bulk_task = { targets: targets, rank_scale: "one_thousand", include_subdomains: true };
msg.target_count = targets.length;
return msg;`
    })
    .then('e7104b', 'Robomotion.DataForSEO.Account.RawRequest', 'Get Backlink Profiles', {
      inPath: Custom('/backlinks/bulk_pages_summary/live'),
      inBody: Message('bulk_task'),
      optMethod: 'POST',
      optTimeout: Custom('180'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('ca62d8', 'Core.Programming.Function', 'Merge Results Into Rows', {
      func: `// Index the response by url, then rewrite the table in place so every
// row keeps its original position in the sheet.
var byTarget = {};
var items = msg.items || [];
for (var i = 0; i < items.length; i++) {
  byTarget[items[i].url] = items[i];
}

var rows = (msg.table && msg.table.rows) || [];
var updated = 0;

for (var r = 0; r < rows.length; r++) {
  var hit = byTarget[(rows[r].Target || '').toString().trim()];
  if (!hit) continue;
  rows[r]['First seen'] = (hit.first_seen || '').toString().slice(0, 10);
  rows[r]['Lost date'] = (hit.lost_date || '').toString().slice(0, 10);
  rows[r].Rank = hit.rank;
  rows[r]['Main Domain Rank'] = hit.main_domain_rank;
  rows[r]['Number of Backlinks'] = hit.backlinks;
  rows[r]['Backlink Spam Score'] = hit.backlinks_spam_score;
  rows[r]['Broken backlinks'] = hit.broken_backlinks;
  rows[r]['Broken pages'] = hit.broken_pages;
  rows[r]['Referring domains'] = hit.referring_domains;
  rows[r]['Nofollow referring domains'] = hit.referring_domains_nofollow;
  rows[r]['Referring main domains'] = hit.referring_main_domains;
  rows[r]['Nofollow main referring domains'] = hit.referring_main_domains_nofollow;
  rows[r]['Referring IPs'] = hit.referring_ips;
  rows[r]['Referring subnets'] = hit.referring_subnets;
  rows[r]['Referring pages'] = hit.referring_pages;
  rows[r]['Nofollow referring pages'] = hit.referring_pages_nofollow;
  rows[r]['Referring links TLD'] = JSON.stringify(hit.referring_links_tld || {});
  rows[r]['Referring links types'] = JSON.stringify(hit.referring_links_types || {});
  rows[r]['Referring links attributes'] = JSON.stringify(hit.referring_links_attributes || {});
  rows[r]['Referring links platform types'] = JSON.stringify(hit.referring_links_platform_types || {});
  rows[r]['Referring semantic locations'] = JSON.stringify(hit.referring_links_semantic_locations || {});
  rows[r]['Referring links countries'] = JSON.stringify(hit.referring_links_countries || {});
  updated++;
}

msg.table = { columns: ['Target', 'First seen', 'Lost date', 'Rank', 'Main Domain Rank', 'Number of Backlinks', 'Backlink Spam Score', 'Broken backlinks', 'Broken pages', 'Referring domains', 'Nofollow referring domains', 'Referring main domains', 'Nofollow main referring domains', 'Referring IPs', 'Referring subnets', 'Referring pages', 'Nofollow referring pages', 'Referring links TLD', 'Referring links types', 'Referring links attributes', 'Referring links platform types', 'Referring semantic locations', 'Referring links countries'], rows: rows };
msg.updated_count = updated;
return msg;`
    })
    .then('58f3ad', 'Robomotion.GoogleSheets.SetRange', 'Write Results Back', {
      inSpreadsheetId: Message('spreadsheet_id'),
      inStartCell: Custom('A1'),
      inTable: Message('table'),
      headers: true
    })
    .then('a4c517', 'Core.Flow.Stop', 'Stop', {});

  f.node('1d90c6', 'Core.Flow.Log', 'Log Result', {
    inText: JS('"Updated " + msg.updated_count + " of " + msg.target_count + " targets for $" + msg.cost')
  });
  f.edge('ca62d8', 0, '1d90c6', 0);
}).start();
