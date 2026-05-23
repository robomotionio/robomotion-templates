import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d9', 'Scrape Products List AppSumo', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.browse_url = 'https://appsumo.com/browse/';
        msg.csv_path = global.get('$Home$') + '/scrape-products-list-appsumo.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open AppSumo Browse', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('browse_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/products/")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Products', {
      inPageId: Message('page_id'),
      func: `
        var anchors = document.querySelectorAll('a[href^="/products/"]');
        var seen = {};
        var rows = [];
        var pos = 0;
        for (var i = 0; i < anchors.length; i++) {
          var a = anchors[i];
          var href = a.href;
          if (seen[href]) continue;
          var nameEl = a.querySelector('span.sr-only');
          if (!nameEl) continue;
          seen[href] = true;
          // Get the card container
          var card = a.parentElement;
          var category = card.querySelector('a[href*="/software/"]');
          var allText = card.innerText || '';
          var priceMatches = allText.match(/\\$[\\d,]+(?:\\.\\d+)?/g) || [];
          var discounted = priceMatches[0] || '';
          var original = priceMatches[1] || '';
          pos++;
          rows.push({
            'Position': '#' + pos,
            'Product Name': nameEl.innerText.trim(),
            'Category': category ? category.innerText.trim() : '',
            'Discounted Price': discounted,
            'Original Price': original
          });
        }
        var columns = ['Position','Product Name','Category','Discounted Price','Original Price'];
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
