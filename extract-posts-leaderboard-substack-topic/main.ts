import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('s1u2b3a', 'Extract Posts Leaderboard Substack Topic', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Topic URL', {
      inText: Custom('Enter Substack topic URL (e.g. https://substack.com/browse/technology)'),
      outText: Message('topic_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-posts-leaderboard-substack-topic.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Topic Page', {
      inBrowserId: Message('browser_id'), inUrl: Message('topic_url'),
      optStealthMode: true, outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Posts', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/p/")]'),
      optTimeout: Custom('30')
    })
    .then('666666', 'Core.Browser.RunScript', 'Scroll And Extract', {
      inPageId: Message('page_id'),
      func: `
        return new Promise(function(resolve){
          var scrolls = 0;
          var iv = setInterval(function(){
            window.scrollTo(0, document.body.scrollHeight);
            scrolls++;
            if (scrolls >= 4) {
              clearInterval(iv);
              setTimeout(function(){
                var posts = document.querySelectorAll('a[href*="/p/"]');
                var seen = {};
                var rows = [];
                var pos = 0;
                for (var i = 0; i < posts.length; i++) {
                  var pl = posts[i];
                  var href = pl.href;
                  if (href.indexOf('selection=') > -1) continue;
                  if (seen[href]) continue;
                  seen[href] = true;
                  var card = pl;
                  for (var j = 0; j < 4 && card; j++) card = card.parentElement;
                  if (!card) continue;
                  var rawLines = (card.innerText || '').split('\\n');
                  var lines = [];
                  for (var k = 0; k < rawLines.length; k++) {
                    var t = rawLines[k].replace(/^\\s+|\\s+$/g, '');
                    if (t.length > 0) lines.push(t);
                  }
                  if (lines.length < 4) continue;
                  var author = lines[0];
                  var timeText = '';
                  for (var m = 1; m < Math.min(4, lines.length); m++) {
                    if (/^(\\d+[hdmy]|[A-Z][a-z]{2}\\s+\\d+|Just now)/.test(lines[m])) {
                      timeText = lines[m];
                      break;
                    }
                  }
                  var endIdx = lines.length - 1;
                  while (endIdx >= 0 && /^[\\d.]+[KMB]?$/.test(lines[endIdx])) endIdx--;
                  var publication = endIdx >= 0 ? lines[endIdx] : '';
                  var title = '';
                  var description = '';
                  var h = pl.querySelector('h1,h2,h3,h4,h5,h6');
                  var linkLines = (pl.innerText || '').split('\\n');
                  if (h) {
                    title = h.innerText.replace(/^\\s+|\\s+$/g, '');
                    for (var L = 0; L < linkLines.length; L++) {
                      if (linkLines[L].replace(/^\\s+|\\s+$/g, '') === title && L + 1 < linkLines.length) {
                        description = linkLines[L+1].replace(/^\\s+|\\s+$/g, '');
                        break;
                      }
                    }
                  } else {
                    var l0 = (linkLines[0] || '').replace(/^\\s+|\\s+$/g, '');
                    var l1 = (linkLines[1] || '').replace(/^\\s+|\\s+$/g, '');
                    if (l1) { publication = l0; title = l1; }
                    else { title = l0; }
                  }
                  if (!title) continue;
                  pos++;
                  rows.push({
                    'Position': '#' + pos,
                    'Publication Name': publication,
                    'Article Title': title,
                    'Article Description': description,
                    'Author Info': author,
                    'Time': timeText,
                    'Article Link': href
                  });
                }
                var columns = ['Position','Publication Name','Article Title','Article Description','Author Info','Time','Article Link'];
                resolve(JSON.stringify({columns:columns,rows:rows}));
              }, 2000);
            }
          }, 1500);
        });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'), inTable: Message('table'),
      optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
