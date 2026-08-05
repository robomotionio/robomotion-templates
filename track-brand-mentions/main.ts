import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('95b7d310-c8a1-431c-c69e-54a0d1f79866', 'Track Brand Mentions', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleDocs', '1.6.0');
  f.addDependency('Robomotion.Slack', '0.7.0');

  f.node('a4610d', 'Core.Flow.Comment', 'About', {
    optText: '### Track brand mentions\nEvery evening, search the web for pages that mentioned your brand in the last 24 hours, classify each mention as positive, negative or neutral, write them all into a dated Google Doc, and post a Slack summary with the sentiment split and a link to the doc.\n\nThe sentiment counts in the Slack message are the point: three positive mentions is a good day, three negative ones is something to look at tonight. The doc is there for when the number surprises you.\n\nA day with no mentions posts nothing and creates no document.'
  });

  f.node('7cd82b', 'Core.Flow.Comment', 'Search', {
    optText: '#### Search\nThe keyword is quoted so Content Analysis matches the phrase rather than the words in it, and a `fetch_time` filter keeps the result set to the last day.'
  });

  f.node('20e953', 'Core.Trigger.Inject', 'Daily', {
    optOnce: false,
    optRepeat: 86400,
    optOnceDelay: 10
  })
    .then('c58f04', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.keyword = 'Robomotion';
msg.slack_channel = '#brand-mentions';

// Quoting the keyword makes Content Analysis match the exact phrase; without the
// quotes a two-word brand matches pages containing either word.
msg.search_keyword = '"' + msg.keyword + '"';

var since = new Date(Date.now() - 24 * 60 * 60 * 1000);
msg.since_label = since.toISOString().slice(0, 19).replace('T', ' ') + ' +00:00';
msg.filters = [['fetch_time', '>', msg.since_label]];
msg.order_by = ['fetch_time,desc'];
return msg;`
    })
    .then('e37a19', 'Robomotion.DataForSEO.ContentAnalysis.Search', 'Find Mentions', {
      inKeyword: Message('search_keyword'),
      inFilters: Message('filters'),
      inOrderBy: Message('order_by'),
      optSearchMode: 'as_is',
      optLimit: Custom('1000'),
      outItems: Message('items'),
      outCost: Message('cost'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('b902c6', 'Core.Programming.Function', 'Classify Mentions', {
      outputs: 2,
      func: `// Port 0: mentions found. Port 1: a quiet day - no doc, no message.
var items = msg.items || [];
var lines = [];
var positive = 0;
var negative = 0;
var neutral = 0;

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var info = item.content_info || {};
  var tones = info.connotation_types || {};

  var pos = tones.positive || 0;
  var neg = tones.negative || 0;
  var neu = tones.neutral || 0;

  // Whichever connotation scores highest wins the mention.
  var sentiment;
  if (pos >= neg && pos >= neu) { sentiment = 'positive'; positive++; }
  else if (neg >= neu) { sentiment = 'negative'; negative++; }
  else { sentiment = 'neutral'; neutral++; }

  lines.push(
    'Fetch time: ' + (item.fetch_time || '') + '\\n' +
    'Sentiment: ' + sentiment + '\\n' +
    'Domain: ' + (item.domain || '') + '\\n' +
    'URL: ' + (item.url || '') + '\\n' +
    'Page title: ' + (info.main_title || '') + '\\n' +
    'Result: ' + (info.title || '') + '\\n' +
    'Snippet: ' + (info.snippet || '') + '\\n' +
    'Author: ' + (info.author || '') + '\\n');
}

msg.today = new Date().toISOString().slice(0, 10);
msg.mention_count = lines.length;
msg.positive = positive;
msg.negative = negative;
msg.neutral = neutral;

if (lines.length === 0) return [null, msg];

msg.doc_title = 'Brand Mentions (' + msg.keyword + ') - ' + msg.today;
msg.doc_heading = 'New mentions found today\\n' + msg.keyword + ' (' + msg.today + ')\\n\\n';
msg.doc_body = lines.join('\\n');
return [msg, null];`
    });

  f.node('16fa73', 'Core.Flow.Comment', 'Record and announce', {
    optText: '#### Record and announce\nOne Google Doc per day holds the full text of every mention; Slack gets the counts and the link.'
  });

  f.node('4b0e28', 'Robomotion.GoogleDocs.CreateDocument', 'Create Mentions Doc', {
    inTitle: Message('doc_title'),
    outDocumentId: Message('document_id'),
    optCredentials: { vaultId: '_', itemId: '_' }
  })
    .then('d729c5', 'Robomotion.GoogleDocs.InsertText', 'Write Heading', {
      inDocumentId: Message('document_id'),
      inText: Message('doc_heading'),
      inFontSize: Custom('16'),
      optBold: true,
      optAlign: 'CENTER'
    })
    .then('80af31', 'Robomotion.GoogleDocs.InsertText', 'Write Mentions', {
      inDocumentId: Message('document_id'),
      inText: Message('doc_body'),
      inFontSize: Custom('11')
    })
    .then('c1d604', 'Core.Programming.Function', 'Compose Slack Summary', {
      func: `msg.doc_url = 'https://docs.google.com/document/d/' + msg.document_id;
msg.announcement = msg.mention_count + ' new mention(s) of ' + msg.keyword + ' today - ' +
  msg.positive + ' positive, ' + msg.negative + ' negative, ' + msg.neutral + ' neutral.\\n' +
  msg.doc_url;
return msg;`
    })
    .then('39e7b0', 'Robomotion.Slack.SendMessage', 'Post Summary', {
      inChannelName: Message('slack_channel'),
      inMessage: Message('announcement'),
      optToken: { vaultId: '_', itemId: '_' }
    })
    .then('f5028a', 'Core.Flow.Stop', 'Stop', {});
  f.edge('b902c6', 0, '4b0e28', 0);

  f.node('6ac417', 'Core.Flow.Log', 'No Mentions Today', {
    inText: JS('"No new mentions of " + msg.keyword + " in the last 24 hours."')
  });
  f.edge('b902c6', 1, '6ac417', 0);
}).start();
