import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('x5y6z7', 'Extract Tools Keyword Future Tools', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Future Tools search URL (e.g. https://www.futuretools.io/?search=writing)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-tools-keyword-future-tools.csv';
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
    .then('555555', 'Core.Browser.WaitElement', 'Wait Tool Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/tool")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Tools', {
      inPageId: Message('page_id'),
      func: `
        var links = document.querySelectorAll('a[href*="/tool"]');
        var columns = ['Position','Tool Name','Description','Category','Upvotes','Image'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var href = link.href.split('?')[0];
          if (seen[href]) continue;
          seen[href] = true;
          var card = link.parentElement;
          if (!card) continue;
          var lines = (card.innerText || '').split('\\n').filter(function(l) { return l.trim(); });
          if (lines.length < 3) continue;
          var name = lines[1] || '';
          if (!name || name.length < 2) continue;
          var desc = lines[2] || '';
          var category = '';
          var upvotes = '';
          for (var j = 3; j < lines.length; j++) {
            var l = lines[j].trim();
            if (/^[0-9]+$/.test(l) && !upvotes) upvotes = l;
            else if (l.length > 2 && l.indexOf('Paid') < 0 && l.indexOf('Free') < 0 && l.indexOf('Open') < 0 && !category) category = l;
          }
          var img = card.querySelector('img');
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Tool Name': name,
            'Description': desc.substring(0, 200),
            'Category': category,
            'Upvotes': upvotes,
            'Image': img ? img.src.substring(0, 100) : ''
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
