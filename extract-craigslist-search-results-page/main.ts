import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('w4x5y6', 'Extract Craigslist Search Results Page', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Craigslist search URL (e.g. https://sfbay.craigslist.org/search/apa)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-craigslist-search-results-page.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Craigslist Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Listings', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"gallery-card")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Listings', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('div.gallery-card');
        var columns = ['Position','Image','Title','Link','Date','Location','Bedrooms'];
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var link = item.querySelector('a[href*="/apa/d/"], a[href*="craigslist.org"], a.main');
          if (!link) continue;
          var titleEl = item.querySelector('a[title]');
          var title = titleEl ? titleEl.getAttribute('title') || titleEl.innerText.trim() : '';
          if (!title) {
            var lines = (item.innerText||'').split('\\n').filter(function(l) { return l.trim() && l.trim() !== '•' && l.trim().length > 3; });
            title = lines[0] || '';
          }
          if (!title || title.length < 5) continue;
          var lines2 = (item.innerText||'').split('\\n').filter(function(l) { return l.trim() && l.trim() !== '•' && l.trim().length > 2; });
          var date = lines2[1] || '';
          var bedsInfo = lines2[2] || '';
          var location = lines2[3] || '';
          var bedrooms = '';
          var bedsM = bedsInfo.match(/([0-9]+)br/);
          if (bedsM) bedrooms = bedsM[1];
          var priceEl = item.querySelector('[class*="price"]');
          var img = item.querySelector('img[src]:not([src*="base64"])');
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Image': img ? img.src : '',
            'Title': title.substring(0, 200),
            'Link': link.href,
            'Date': date,
            'Location': location,
            'Bedrooms': bedrooms
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
