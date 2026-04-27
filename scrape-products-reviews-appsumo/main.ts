import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('f7a9b1', 'Scrape Products Reviews AppSumo', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Product URL', {
      inText: Custom('Enter the AppSumo product page URL (e.g. https://appsumo.com/products/tidycal/)'),
      outText: Message('product_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-products-reviews-appsumo.csv';
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
    .then('555555', 'Core.Browser.WaitElement', 'Wait Reviews', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[@data-testid="review-card-wrapper"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Reviews', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('div[data-testid="review-card-wrapper"]');
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var userEl = card.querySelector('a.flex.truncate');
          var userName = userEl ? userEl.innerText.trim() : '';
          var ratingImg = card.querySelector('img[alt*="stars"]');
          var rating = '';
          if (ratingImg) {
            var m = ratingImg.getAttribute('alt').match(/([0-9]+)/);
            if (m) rating = m[1];
          }
          var infoEl = card.querySelector('div[data-testid="discussion-review-info"]');
          var date = '';
          var title = '';
          var reviewText = '';
          if (infoEl) {
            var dateEl = infoEl.querySelector('span');
            date = dateEl ? dateEl.innerText.trim() : '';
            var titleEl = infoEl.querySelector('p.mt-2');
            title = titleEl ? titleEl.innerText.trim() : '';
            var textEls = infoEl.querySelectorAll('p.break-words');
            var parts = [];
            for (var j = 0; j < textEls.length; j++) {
              parts.push(textEls[j].innerText.trim());
            }
            reviewText = parts.join(' ');
          }
          rows.push({
            'Position': '#' + (i + 1),
            'User Name': userName,
            'Date': date,
            'Title': title,
            'Rating': rating,
            'Review': reviewText
          });
        }
        var columns = ['Position', 'User Name', 'Date', 'Title', 'Rating', 'Review'];
        return JSON.stringify({ columns: columns, rows: rows });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `
        msg.table = JSON.parse(msg.table_json);
        return msg;
      `
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
