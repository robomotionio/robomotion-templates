import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('d4e5f6', 'Extract Questions AppSumo Product', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Product URL', {
      inText: Custom('Enter the AppSumo product page URL (e.g. https://appsumo.com/products/tidycal/)'),
      outText: Message('product_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-questions-appsumo-product.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Product Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('product_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Questions Tab', {
      inPageId: Message('page_id'),
      inSelector: Custom('//button[text()="Questions"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Click Questions Tab', {
      inPageId: Message('page_id'),
      func: `
        var btn = document.querySelector('button[data-tab="questions"]');
        if (!btn) {
          var btns = document.querySelectorAll('button');
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].innerText.trim() === 'Questions') { btn = btns[i]; break; }
          }
        }
        if (btn) btn.click();
        return JSON.stringify({ clicked: !!btn });
      `,
      outResult: Message('click_result')
    })
    .then('777777', 'Core.Browser.WaitElement', 'Wait Question Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[@data-testid="questions-card-wrapper"]'),
      optTimeout: Custom('10')
    })
    .then('888888', 'Core.Browser.RunScript', 'Extract Questions', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[data-testid="questions-card-wrapper"]');
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var titleEl = card.querySelector('[data-testid="discussion-question-title"]');
          var question = titleEl ? titleEl.innerText.trim() : '';
          var userEl = card.querySelector('a[href*="/profile/"]');
          var user = userEl ? userEl.innerText.trim() : '';
          var linkEl = card.querySelector('a[href*="/questions/"]');
          var link = linkEl ? linkEl.href : '';
          var spans = card.querySelectorAll('span');
          var date = '';
          for (var j = 0; j < spans.length; j++) {
            if (/^[A-Z][a-z]+ [0-9]+, [0-9]{4}$/.test(spans[j].innerText.trim())) {
              date = spans[j].innerText.trim();
              break;
            }
          }
          rows.push({
            'Position': '#' + (i + 1),
            'Question': question,
            'User': user,
            'Date': date,
            'Link': link
          });
        }
        var columns = ['Position', 'Question', 'User', 'Date', 'Link'];
        return JSON.stringify({ columns: columns, rows: rows });
      `,
      outResult: Message('table_json')
    })
    .then('999999', 'Core.Programming.Function', 'Parse Table', {
      func: `
        msg.table = JSON.parse(msg.table_json);
        return msg;
      `
    })
    .then('aaaaaa', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('bbbbbb', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('cccccc', 'Core.Flow.Stop', 'Stop', {});
}).start();
