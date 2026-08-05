import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('1d3f5b9c-4027-4b94-ae16-7c8259df310a', 'SERP Position for Airtable Records', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.Airtable', '0.7.0');

  f.node('b8203e', 'Core.Flow.Comment', 'About', {
    optText: '### Get Google SERP position for new Airtable records\nWatches an Airtable table for keyword/domain pairs that have not been checked yet, looks up where the domain ranks for that keyword on Google, and writes the position back onto the record.\n\nThe lookup uses the SERP API\'s `target` parameter, so DataForSEO filters the results to the domain server-side and returns its position directly - no scanning a hundred results client-side.\n\nThe `Processed` checkbox is what turns a poll into a trigger: without it a 15-minute schedule would re-check every row on every pass.'
  });

  f.node('7e4c16', 'Core.Flow.Comment', 'Find work', {
    optText: '#### Find work\nRecords where `Processed` is unticked, ten at a time. Each carries a `Keyword` and a `Target`, and optionally a `Location` and `Language`.'
  });

  f.node('c0f92b', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('3a76d8', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.airtable_base_id = 'appZWQrfNksZ6S36L';
msg.keywords_table = 'Keywords';

msg.default_location = 'United States';
msg.default_language = 'English';

// Only pick up records that have not been checked yet.
msg.records_query = 'filterByFormula=NOT({Processed})&maxRecords=10';
return msg;`
    })
    .then('58e1af', 'Robomotion.Airtable.ListRecords', 'List Unchecked Records', {
      inBaseId: Message('airtable_base_id'),
      inTableName: Message('keywords_table'),
      optQuery: Message('records_query'),
      outResult: Message('records'),
      optApiKey: { vaultId: '_', itemId: '_' }
    })
    .then('92db54', 'Core.Programming.Function', 'Collect Records', {
      func: `var records = msg.records || [];
var pending = [];

for (var i = 0; i < records.length; i++) {
  var fields = records[i].fields || {};
  var keyword = (fields.Keyword || '').toString().trim();
  var target = (fields.Target || '').toString().trim();
  if (!keyword || !target) continue;

  pending.push({
    record_id: records[i].id,
    keyword: keyword,
    target: target,
    location: (fields.Location || msg.default_location).toString().trim(),
    language: (fields.Language || msg.default_language).toString().trim()
  });
}

msg.pending = pending;
return msg;`
    });

  f.node('60ac83', 'Core.Flow.Comment', 'Look up the position', {
    optText: '#### Look up the position\nOne live Google SERP call per record. `target` in Extra Parameters narrows the response to the tracked domain, so the first item is the position.'
  });

  // Label is a jump target only - the first pass enters through the ForEach.
  f.node('45bf07', 'Core.Flow.Label', 'Next Record', {});

  f.node('e921ca', 'Core.Programming.ForEach', 'For Each Record', {
    optInput: Message('pending'),
    optOutput: Message('row')
  });
  f.edge('92db54', 0, 'e921ca', 0);
  f.edge('45bf07', 0, 'e921ca', 0);

  f.node('d7830f', 'Core.Programming.Function', 'Build SERP Request', {
    func: `// The SERP API filters to one domain when target is supplied, which is why the
// depth can stay at 1: whatever comes back IS the domain's best position.
msg.extra_params = { target: msg.row.target };
return msg;`
  });
  f.edge('e921ca', 0, 'd7830f', 0);

  f.node('2c6e40', 'Robomotion.DataForSEO.Serp.GoogleOrganic', 'Get SERP Position', {
    inKeyword: Message('row.keyword'),
    inLocation: Message('row.location'),
    inLanguage: Message('row.language'),
    inExtraParams: Message('extra_params'),
    optDepth: Custom('1'),
    optDevice: 'desktop',
    outItems: Message('items'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('d7830f', 0, '2c6e40', 0);

  f.node('af14b6', 'Core.Programming.Function', 'Build Record Update', {
    func: `var first = (msg.items || [])[0] || {};
var today = new Date().toISOString().slice(0, 10);

// No item means the domain is not ranking for this keyword at all.
msg.rank = first.rank_group || 0;

msg.record_update = {
  records: [{
    id: msg.row.record_id,
    fields: {
      Position: msg.rank,
      URL: first.url || '',
      Checked: today,
      Processed: true
    }
  }]
};
return msg;`
  })
    .then('e5c078', 'Robomotion.Airtable.UpdateRecord', 'Write Position Back', {
      inBaseId: Message('airtable_base_id'),
      inTableName: Message('keywords_table'),
      inRecord: Message('record_update'),
      optApiKey: { vaultId: '_', itemId: '_' }
    })
    .then('30719d', 'Core.Flow.GoTo', 'Next', {
      optNodes: { ids: ['45bf07'], type: 'goto', all: false }
    });
  f.edge('2c6e40', 0, 'af14b6', 0);

  f.node('7b60e2', 'Core.Flow.Stop', 'Stop', {});
  f.edge('e921ca', 1, '7b60e2', 0);
}).start();
