import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('g1p2t3l', 'Extract GPTs List GPTsApp Search', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter GPTs directory URL (e.g. https://allgpts.co/categories/programming)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-gpts-list-gptsapp-search.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Search Page', {
      inBrowserId: Message('browser_id'), inUrl: Message('search_url'),
      optStealthMode: true, outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h3[contains(@class,"directory-01__title") or contains(@class,"features-09__title")]'),
      optTimeout: Custom('30')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract GPTs', {
      inPageId: Message('page_id'),
      func: `
        // Prefer directory-01 (category/search filter results); fall back to features-09 (homepage list)
        var heads = document.querySelectorAll('h3.directory-01__title');
        if (heads.length < 5) heads = document.querySelectorAll('h3.features-09__title');
        var rows = [];
        var seen = {};
        // Derive category from URL path or page title
        var category = '';
        var pm = location.pathname.match(/categories\\/([^\\/?]+)/);
        if (pm) {
          category = pm[1].replace(/-/g, ' ');
          category = category.charAt(0).toUpperCase() + category.slice(1);
        } else {
          var titleM = (document.title || '').match(/All GPTs for (.+)/);
          if (titleM) category = titleM[1];
        }
        for (var i = 0; i < heads.length; i++) {
          var h = heads[i];
          var name = (h.innerText || '').replace(/^\\s+|\\s+$/g, '');
          if (!name || seen[name]) continue;
          seen[name] = true;
          var anchor = h;
          while (anchor && anchor.tagName !== 'A') anchor = anchor.parentElement;
          var card = h.parentElement.parentElement;
          var raw = (card.innerText || '');
          var lines = [];
          var rl = raw.split('\\n');
          for (var k = 0; k < rl.length; k++) {
            var t = rl[k].replace(/^\\s+|\\s+$/g, '');
            if (t.length > 0) lines.push(t);
          }
          var description = '';
          for (var m = 0; m < lines.length; m++) {
            if (lines[m] === name && m + 2 < lines.length) {
              description = lines[m + 2];
              break;
            }
            if (lines[m].indexOf(name) === 0 && m + 1 < lines.length && /^\\d+$/.test(lines[m+1].replace(/^\\s+|\\s+$/g, ''))) {
              description = m + 2 < lines.length ? lines[m+2] : '';
              break;
            }
          }
          rows.push({
            'GPT Name': name,
            'Description': description,
            'Category': category,
            'Creator': '',
            'Rating': ''
          });
        }
        var columns = ['GPT Name','Description','Category','Creator','Rating'];
        return JSON.stringify({columns:columns,rows:rows});
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
