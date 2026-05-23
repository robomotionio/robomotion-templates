import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('q8r9s0', 'Extract Product Listings Trendyol', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Trendyol search or category URL (e.g. https://www.trendyol.com/sr?q=ceramic+mug)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-product-listings-trendyol.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Search Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Products', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@class,"product-card")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Products', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('a[class*="product-card"]');
        var columns = ['Position','Name','Price','Rating','Link','Image'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var nameEl = card.querySelector('[class*="pname"]');
          var name = nameEl ? nameEl.innerText.trim() : '';
          if (!name) {
            var lines = (card.innerText || '').split('\\n').filter(function(l) { return l.trim(); });
            for (var j = 0; j < lines.length; j++) {
              var l = lines[j].trim();
              if (l.length > 15 && !/^[0-9]/.test(l) && l.indexOf('TL') < 0 && l.indexOf('Sepet') < 0) { name = l; break; }
            }
          }
          if (!name) continue;
          var priceEl = card.querySelector('[class*="prc-box-dscntd"]') || card.querySelector('[class*="prc-box-sllng"]');
          var price = priceEl ? priceEl.innerText.trim().split('\\n')[0] : '';
          if (!price) {
            var spans = card.querySelectorAll('span');
            for (var k=0;k<spans.length;k++) { var st=spans[k].innerText.trim(); if (/[0-9]+[.,][0-9]+ TL/.test(st)) { price=st; break; } }
          }
          var ratingEl = card.querySelector('[class*="rating"]');
          var rating = ratingEl ? ratingEl.innerText.trim() : '';
          var img = card.querySelector('img');
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Name': name,
            'Price': price,
            'Rating': rating,
            'Link': card.href,
            'Image': img ? img.src : ''
          });
        }
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
