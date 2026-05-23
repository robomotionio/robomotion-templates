import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2c8', 'Extract Experts Ghost', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.experts_url = 'https://ghost.org/experts/';
        msg.csv_path = global.get('$Home$') + '/extract-experts-ghost.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Experts', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('experts_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@class,"gh-theme-card-link")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Experts', {
      inPageId: Message('page_id'),
      func: `
        var anchors = document.querySelectorAll('a.gh-theme-card-link');
        var rows = [];
        for (var i = 0; i < anchors.length; i++) {
          var a = anchors[i];
          var img = a.querySelector('img');
          var card = a.parentElement;
          var nameText = card ? card.innerText.split('\\n')[0].trim() : a.innerText.split('\\n')[0].trim();
          var imgUrl = '';
          if (img) {
            if (img.src.indexOf('http') === 0) imgUrl = img.src;
            else imgUrl = 'https://ghost.org' + img.getAttribute('src');
          }
          rows.push({
            'Position': '#' + (i + 1),
            'Name': nameText,
            'Image URL': imgUrl,
            'Link': a.href
          });
        }
        var columns = ['Position','Name','Image URL','Link'];
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
