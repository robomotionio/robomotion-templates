import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('df82ba0c-0be3-4750-c93d-3620aef6b584', 'Ranked Keywords for New Airtable Records', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.Airtable', '0.7.0');

  f.node('b17e2d', 'Core.Flow.Comment', 'About', {
    optText: '### Get ranked keywords for new Airtable records\nWatches an Airtable table for target domains that have not been looked up yet, pulls the keywords each one ranks for, writes them into a second table, and ticks the source record off so it is never processed twice.\n\nThe `Processed` checkbox is what turns a poll into a trigger: without it a 15-minute schedule would re-run every row on every pass.'
  });

  f.node('4c93f0', 'Core.Flow.Comment', 'Find work', {
    optText: '#### Find work\nRecords where `Processed` is unticked, ten at a time. Each carries a `Target`, and optionally a `Location` and `Language`.'
  });

  f.node('a5e106', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('72db85', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.airtable_base_id = 'appZWQrfNksZ6S36L';
msg.targets_table = 'Targets';
msg.keywords_table = 'Keywords';

msg.default_location = 'United States';
msg.default_language = 'English';
msg.limit = 100;

// Only pick up records that have not been looked up yet.
msg.targets_query = 'filterByFormula=NOT({Processed})&maxRecords=10';
return msg;`
    })
    .then('e6420a', 'Robomotion.Airtable.ListRecords', 'List Unprocessed Targets', {
      inBaseId: Message('airtable_base_id'),
      inTableName: Message('targets_table'),
      optQuery: Message('targets_query'),
      outResult: Message('records'),
      optApiKey: { vaultId: '_', itemId: '_' }
    })
    .then('30c8fe', 'Core.Programming.Function', 'Collect Targets', {
      func: `// Airtable returns { id, fields }; reduce it to what the lookup needs.
var records = msg.records || [];
var targets = [];

for (var i = 0; i < records.length; i++) {
  var fields = records[i].fields || {};
  var t = (fields.Target || '').toString().trim();
  if (!t) continue;
  targets.push({
    record_id: records[i].id,
    target: t,
    location: (fields.Location || msg.default_location).toString().trim(),
    language: (fields.Language || msg.default_language).toString().trim()
  });
}

msg.targets = targets;
return msg;`
    });

  f.node('96af31', 'Core.Flow.Comment', 'Look up and store', {
    optText: '#### Look up and store\nOne Ranked Keywords call per target, then the rows go back to Airtable in batches of ten - the bulk endpoint\'s limit.'
  });

  // Label is a jump target only - the first pass enters through the ForEach.
  f.node('5d0b74', 'Core.Flow.Label', 'Next Target', {});

  f.node('c8f5a2', 'Core.Programming.ForEach', 'For Each Target', {
    optInput: Message('targets'),
    optOutput: Message('target_row')
  });
  f.edge('30c8fe', 0, 'c8f5a2', 0);
  f.edge('5d0b74', 0, 'c8f5a2', 0);

  f.node('e2794b', 'Robomotion.DataForSEO.Labs.RankedKeywords', 'Get Ranked Keywords', {
    inTarget: Message('target_row.target'),
    inLocation: Message('target_row.location'),
    inLanguage: Message('target_row.language'),
    optLimit: Message('limit'),
    optOffset: Custom('0'),
    outItems: Message('items'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('c8f5a2', 0, 'e2794b', 0);

  f.node('1fb6c9', 'Core.Programming.Function', 'Build Airtable Batches', {
    func: `var today = new Date().toISOString().slice(0, 10);
var items = msg.items || [];
var rows = [];

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var kd = item.keyword_data || {};
  var info = kd.keyword_info || {};
  var serp = (item.ranked_serp_element && item.ranked_serp_element.serp_item) || {};

  rows.push({
    Target: msg.target_row.target,
    Keyword: kd.keyword || '',
    Date: today,
    Position: serp.rank_group || 0,
    'Search Volume': info.search_volume || 0,
    URL: serp.url || ''
  });
}

// BulkCreateRecords takes at most 10 records per call.
msg.batches = [];
for (var b = 0; b < rows.length; b += 10) {
  var batch = [];
  var slice = rows.slice(b, b + 10);
  for (var s = 0; s < slice.length; s++) batch.push({ fields: slice[s] });
  msg.batches.push(batch);
}

msg.keyword_count = rows.length;
// UpdateRecord takes a { records: [{ id, fields }] } envelope.
msg.processed_record = {
  records: [{
    id: msg.target_row.record_id,
    fields: { Processed: true, 'Keywords Found': rows.length, 'Last Run': today }
  }]
};
return msg;`
  });
  f.edge('e2794b', 0, '1fb6c9', 0);

  // Inner loop over the Airtable batches: its own Label/GoTo pair.
  f.node('c93a05', 'Core.Flow.Label', 'Next Batch', {});

  f.node('84a0d7', 'Core.Programming.ForEach', 'For Each Batch', {
    optInput: Message('batches'),
    optOutput: Message('batch_records')
  });
  f.edge('1fb6c9', 0, '84a0d7', 0);
  f.edge('c93a05', 0, '84a0d7', 0);

  f.node('b6c318', 'Robomotion.Airtable.BulkCreateRecords', 'Create Keyword Records', {
    inBaseId: Message('airtable_base_id'),
    inTableName: Message('keywords_table'),
    inRecords: Message('batch_records'),
    optTypecast: true,
    optApiKey: { vaultId: '_', itemId: '_' }
  })
    .then('7d2b41', 'Core.Flow.GoTo', 'Next Batch', {
      optNodes: { ids: ['c93a05'], type: 'goto', all: false }
    });
  f.edge('84a0d7', 0, 'b6c318', 0);

  f.node('cf05e8', 'Robomotion.Airtable.UpdateRecord', 'Mark Target Processed', {
    inBaseId: Message('airtable_base_id'),
    inTableName: Message('targets_table'),
    inRecord: Message('processed_record'),
    optApiKey: { vaultId: '_', itemId: '_' }
  })
    .then('79e4b1', 'Core.Flow.GoTo', 'Next', {
      optNodes: { ids: ['5d0b74'], type: 'goto', all: false }
    });
  f.edge('84a0d7', 1, 'cf05e8', 0);

  f.node('20d9ac', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c8f5a2', 1, '20d9ac', 0);
}).start();
