import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2c9', 'Extract Themes Ghost Marketplace', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.marketplace_url = 'https://ghost.org/marketplace/';
        msg.csv_path = global.get('$Home$') + '/extract-themes-ghost-marketplace.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Marketplace', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('marketplace_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//article[contains(@class,"gh-theme-card")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Themes', {
      inPageId: Message('page_id'),
      func: `
        var arts = document.querySelectorAll('article.gh-theme-card');
        var rows = [];
        for (var i = 0; i < arts.length; i++) {
          var art = arts[i];
          var a = art.querySelector('a.gh-theme-card-link');
          var img = art.querySelector('img');
          var titleEl = art.querySelector('.gh-theme-title');
          var catEl = art.querySelector('.gh-theme-category');
          var priceEl = art.querySelector('.gh-theme-price');
          var classes = art.className;
          var type = classes.indexOf('paid') !== -1 ? 'Paid' : (classes.indexOf('free') !== -1 ? 'Free' : '');
          var imgUrl = '';
          if (img) {
            if (img.src && img.src.indexOf('http') === 0) imgUrl = img.src;
            else if (img.getAttribute('src')) imgUrl = 'https://ghost.org' + img.getAttribute('src');
          }
          rows.push({
            'Position': '#' + (i + 1),
            'Name': titleEl ? titleEl.innerText.trim() : '',
            'Brand': catEl ? catEl.innerText.trim() : '',
            'Price': priceEl ? priceEl.innerText.trim() : '',
            'Type': type,
            'Image URL': imgUrl,
            'Link': a ? a.href : ''
          });
        }
        var columns = ['Position','Name','Brand','Price','Type','Image URL','Link'];
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
