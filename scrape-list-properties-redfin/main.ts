import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('h8i9j0', 'Scrape List Properties Redfin', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Redfin search results URL (e.g. https://www.redfin.com/city/17420/NY/New-York)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-list-properties-redfin.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Redfin Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Property Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(@class,"HomeCardContainer")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Properties', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[class*="HomeCardContainer"]');
        var columns = ['Position','Price','Beds','Baths','Area (Sq. Ft.)','Location','Image','Link'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var addrEl = card.querySelector('a[class*="Homecard__Address"], a[class*="address"]');
          var location = addrEl ? addrEl.innerText.trim() : '';
          var link = addrEl ? addrEl.href : (card.querySelector('a[href*="/home/"]') ? card.querySelector('a[href*="/home/"]').href : '');
          if (!location && !link) continue;
          var spans = card.querySelectorAll('span');
          var price = '';
          var beds = '';
          var baths = '';
          var area = '';
          for (var j = 0; j < spans.length; j++) {
            var t = spans[j].innerText.trim();
            if (/^\\$[\\d,]+$/.test(t) && !price) price = t;
            else if (/^[0-9\\.]+\\s*beds?$/.test(t) && !beds) beds = t.replace(/\s*beds?/,'');
            else if (/^[0-9\\.]+\\s*baths?$/.test(t) && !baths) baths = t.replace(/\s*baths?/,'');
            else if (/^[\\d,]+\\s*sq ft$/.test(t) && !area) area = t.replace(/\s*sq ft/,'').replace(/,/g,'');
          }
          var img = card.querySelector('img');
          var imgSrc = img ? img.src : '';
          if (!price && !beds) continue;
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Price': price,
            'Beds': beds,
            'Baths': baths,
            'Area (Sq. Ft.)': area,
            'Location': location,
            'Image': imgSrc,
            'Link': link
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
