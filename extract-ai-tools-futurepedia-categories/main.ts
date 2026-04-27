import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('b9c0d1', 'Extract AI Tools Futurepedia Categories', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Category URL', {
      inText: Custom('Enter Futurepedia category URL (e.g. https://www.futurepedia.io/)'),
      outText: Message('cat_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-ai-tools-futurepedia-categories.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('cat_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(@class,"shadow-card")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Tools by Category', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[class*="shadow-card"]');
        var columns = ['Position','Tool Name','Description','Votes','Category Tags','Link'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var linkEl = card.querySelector('a[href*="/tool/"]');
          var lines = (card.innerText || '').split('\\n').filter(function(l) { return l.trim(); });
          if (lines.length < 2) continue;
          var name = lines[0] || '';
          if (!name || name.length < 2) continue;
          var desc = lines[1] || '';
          var votes = '';
          var tags = [];
          for (var j = 2; j < lines.length; j++) {
            var l = lines[j].trim();
            if (/^[0-9]+$/.test(l) && !votes) votes = l;
            else if (l.startsWith('#')) tags.push(l);
          }
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Tool Name': name,
            'Description': desc.substring(0, 200),
            'Votes': votes,
            'Category Tags': tags.join(', '),
            'Link': linkEl ? linkEl.href : ''
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
