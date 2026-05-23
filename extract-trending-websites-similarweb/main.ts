import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('s2w3t4r', 'Extract Trending Websites Similarweb', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.target_url = 'https://www.similarweb.com/top-websites/trending/'; msg.csv_path = global.get('$Home$') + '/extract-trending-websites-similarweb.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Trending Page', {
      inBrowserId: Message('browser_id'), inUrl: Message('target_url'),
      optStealthMode: true, outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Table', {
      inPageId: Message('page_id'),
      inSelector: Custom('//table//a[contains(@href,"/website/")]'),
      optTimeout: Custom('30')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Trending Up', {
      inPageId: Message('page_id'),
      func: `
        var tables = document.querySelectorAll('table');
        if (tables.length === 0) return JSON.stringify({columns:[],rows:[]});
        var rows = tables[0].querySelectorAll('tbody tr');
        var out = [];
        var pos = 0;
        for (var i = 0; i < rows.length; i++) {
          var cells = rows[i].querySelectorAll('td');
          if (cells.length < 3) continue;
          var rank = (cells[0].innerText || '').replace(/^\\s+|\\s+$/g, '');
          var siteAnchor = cells[1].querySelector('a');
          var domain = '';
          var siteLink = '';
          if (siteAnchor) {
            domain = (siteAnchor.innerText || '').replace(/^\\s+|\\s+$/g, '');
            siteLink = siteAnchor.href;
          }
          var faviconImg = cells[1].querySelector('img');
          var faviconUrl = faviconImg ? faviconImg.src : '';
          var change = (cells[2].innerText || '').replace(/^\\s+|\\s+$/g, '');
          if (!domain) continue;
          pos++;
          out.push({
            'Position': '#' + pos,
            'Trending Up Rank': rank,
            'Trending Up Domain': domain,
            'Trending Up Change': '+' + change,
            'Trending Up Website Link': siteLink,
            'Trending Up Favicon': faviconUrl
          });
        }
        var columns = ['Position','Trending Up Rank','Trending Up Domain','Trending Up Change','Trending Up Website Link','Trending Up Favicon'];
        return JSON.stringify({columns:columns,rows:out});
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
