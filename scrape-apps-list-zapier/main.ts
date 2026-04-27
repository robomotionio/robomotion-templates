import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('c0d1e2f', 'Scrape Apps List Zapier', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.page_url = 'https://zapier.com/apps';
        msg.csv_path = global.get('$Home$') + '/scrape-apps-list-zapier.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Zapier Apps', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('page_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait App Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[@data-testid and contains(@class,"css-")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Apps', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[data-testid*="app"], [class*="css-ttsy6z"]');
        var columns = ['Position','Name','Link','Logo'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var lines = (card.innerText || '').split('\\n').filter(function(l) { return l.trim(); });
          var name = lines[0] || '';
          if (!name || name.length < 2) continue;
          var linkEl = card.querySelector('a') || card.closest('a');
          var link = linkEl ? linkEl.href : '';
          var img = card.querySelector('img');
          rows.push({ 'Position': '#' + (rows.length+1), 'Name': name, 'Link': link, 'Logo': img ? img.src : '' });
        }
        return JSON.stringify({ columns: columns, rows: rows });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
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
