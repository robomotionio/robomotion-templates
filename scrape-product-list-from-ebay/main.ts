import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('u2v3w4', 'Scrape Product List From eBay', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter eBay search URL (e.g. https://www.ebay.com/sch/i.html?_nkw=laptop)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-product-list-from-ebay.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open eBay Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Products', {
      inPageId: Message('page_id'),
      inSelector: Custom('//li[contains(@class,"s-card")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Products', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('li.s-card, li[class*="s-card"]');
        var columns = ['Position','Title','Image','Sale Price','Link'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var link = card.querySelector('a[href*="itm/"], a[href*="ebay.com/itm"]');
          if (!link) continue;
          var lines = (card.innerText || '').split('\\n').filter(function(l) { return l.trim() && l.trim().length > 3; });
          var title = lines[0] || '';
          if (title.length < 5 || title.indexOf('Shop on eBay') >= 0) {
            title = lines.length > 1 ? lines[1] : '';
          }
          if (!title || title.length < 5) continue;
          var price = '';
          for (var j = 0; j < lines.length; j++) {
            if (/^\\$[0-9,.]+/.test(lines[j].trim())) { price = lines[j].trim(); break; }
          }
          var img = card.querySelector('img[src*="ebayimg"]');
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Title': title.substring(0, 200),
            'Image': img ? img.src : '',
            'Sale Price': price,
            'Link': link.href
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
