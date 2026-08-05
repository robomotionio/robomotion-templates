import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('bd60f88a-e9c1-453d-a71b-14082cd49362', 'Competitor Keyword Gaps to Notion', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');

  f.node('e04b7c', 'Core.Flow.Comment', 'About', {
    optText: '### Find competitor keyword gaps, log them to Notion\nPulls every keyword your site ranks for, pulls every keyword a competitor ranks for, and writes the difference - the keywords they own and you do not - into a Notion database with search volume, their position, their URL and the keyword competition score.\n\nThat difference is a content brief you did not have to write. Each row is a phrase with proven demand that someone in your market is already being found for.\n\nBoth lookups use the same location and language, so the comparison is like for like.'
  });

  f.node('3a91d5', 'Core.Flow.Comment', 'Both sides', {
    optText: '#### Both sides\nOne Ranked Keywords call per domain. Raise Limit on both to widen the comparison - the gap is only as complete as the two lists behind it.'
  });

  f.node('c2680b', 'Core.Trigger.Inject', 'Run', { optOnce: true, optOnceDelay: 1 })
    .then('7f14ae', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.my_target = 'dataforseo.com';
msg.competitor_target = 'serpapi.com';
msg.location_name = 'United States';
msg.language_name = 'English';
msg.limit = 100;

// Notion database that receives one page per gap keyword. The property names
// below must match the database's columns exactly.
msg.notion_database_id = 'REPLACE_WITH_DATABASE_ID';
msg.notion_props = {
  keyword: 'Competitor\\u2019s Ranked Keyword',
  search_volume: 'Keyword\\u2019s Search Volume',
  position: 'Competitor\\u2019s Position',
  url: 'Competitor\\u2019s URL',
  competition: 'Keyword\\u2019s Competition'
};
return msg;`
    })
    .then('9d5c02', 'Core.Vault.GetItem', 'Read Notion Token', {
      optCredentials: { vaultId: '_', itemId: '_' },
      outItem: Message('credentials')
    })
    .then('146fb8', 'Core.Programming.Function', 'Build Notion Headers', {
      func: `// The vault item holds the Notion internal integration token.
msg.notion_headers = {
  Authorization: 'Bearer ' + msg.credentials.password,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
};
return msg;`
    })
    .then('be3097', 'Robomotion.DataForSEO.Labs.RankedKeywords', 'Get My Ranked Keywords', {
      inTarget: Message('my_target'),
      inLocation: Message('location_name'),
      inLanguage: Message('language_name'),
      optLimit: Message('limit'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('05a7e1', 'Core.Programming.Function', 'Index My Keywords', {
      func: `// Only the phrases matter for the comparison, so reduce to a lookup set.
var mine = {};
var items = msg.items || [];

for (var i = 0; i < items.length; i++) {
  var kw = (items[i].keyword_data || {}).keyword;
  if (kw) mine[kw] = true;
}

msg.my_keywords = mine;
return msg;`
    })
    .then('81c4d6', 'Robomotion.DataForSEO.Labs.RankedKeywords', 'Get Competitor Keywords', {
      inTarget: Message('competitor_target'),
      inLocation: Message('location_name'),
      inLanguage: Message('language_name'),
      optLimit: Message('limit'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('27eb50', 'Core.Programming.Function', 'Find The Gaps', {
      func: `// A gap is a keyword the competitor ranks for and we do not.
var gaps = [];
var items = msg.items || [];

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var kd = item.keyword_data || {};
  var info = kd.keyword_info || {};
  var serp = (item.ranked_serp_element && item.ranked_serp_element.serp_item) || {};

  if (!kd.keyword || msg.my_keywords[kd.keyword]) continue;

  gaps.push({
    keyword: kd.keyword,
    search_volume: info.search_volume || 0,
    competition: info.competition || 0,
    position: serp.rank_group || 0,
    url: serp.url || ''
  });
}

msg.gaps = gaps;
msg.gap_count = gaps.length;
return msg;`
    });

  f.node('4b8f13', 'Core.Flow.Comment', 'Log to Notion', {
    optText: '#### Log to Notion\nThe page is created over the Notion REST API rather than through the package node, because the database needs typed number and url properties that `Pages.Create` does not expose.'
  });

  // Label is a jump target only - the first pass enters through the ForEach.
  f.node('a370c9', 'Core.Flow.Label', 'Next Gap', {});

  f.node('6e1d84', 'Core.Programming.ForEach', 'For Each Gap', {
    optInput: Message('gaps'),
    optOutput: Message('gap')
  });
  f.edge('27eb50', 0, '6e1d84', 0);
  f.edge('a370c9', 0, '6e1d84', 0);

  f.node('d92a75', 'Core.Programming.Function', 'Build Notion Page', {
    func: `var p = msg.notion_props;
var properties = {};

properties[p.keyword] = { title: [{ text: { content: msg.gap.keyword } }] };
properties[p.search_volume] = { number: msg.gap.search_volume };
properties[p.position] = { number: msg.gap.position };
properties[p.competition] = { number: msg.gap.competition };
if (msg.gap.url) properties[p.url] = { url: msg.gap.url };

msg.notion_page = {
  parent: { database_id: msg.notion_database_id },
  properties: properties
};
return msg;`
  })
    .then('f5b038', 'Core.Net.HttpRequest', 'Create Notion Page', {
      optMethod: 'post',
      optUrl: Custom('https://api.notion.com/v1/pages'),
      inHeaders: Message('notion_headers'),
      inBody: Message('notion_page'),
      outBody: Message('notion_response'),
      outStatus: Message('notion_status'),
      continueOnError: true
    })
    .then('0c67ba', 'Core.Flow.GoTo', 'Next', {
      optNodes: { ids: ['a370c9'], type: 'goto', all: false }
    });
  f.edge('6e1d84', 0, 'd92a75', 0);

  f.node('72fd41', 'Core.Flow.Stop', 'Stop', {});
  f.edge('6e1d84', 1, '72fd41', 0);
}).start();
